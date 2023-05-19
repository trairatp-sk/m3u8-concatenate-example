import React, { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useActiveCues } from "@/hooks/useVtt";

const formatTime = (input: number) => {
  const minutes = Math.floor(input / 60);
  const remainingSeconds = Math.floor(input % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
};

const VideoInfoHeader = ({
  activeChapter,
  seekTo,
  isActive,
}: {
  isActive: boolean;
  activeChapter?: string;
  seekTo(a: number): void;
}) => {
  const chapters = ["007", "008", "009", "010", "011"];
  const timestamps = [0, 260, 542, 862, 1633];
  return (
    <div className={`video-info-header ${isActive ? "" : "hide"}`}>
      <div className="title">เฉลยการบ้าน ความถี่เชิงมุมของการเคลื่อนที่</div>
      <div className="chapter-container">
        <div className="chapter-info">กำลังเล่น</div>
        {chapters.map((chapter, idx) => (
          <div
            key={chapter}
            className={`chapter-chip ${
              activeChapter === chapter ? "active" : ""
            }`}
            onClick={() => {
              seekTo(timestamps[idx]);
            }}
          >
            Solution ข้อ {+chapter}
          </div>
        ))}
      </div>
    </div>
  );
};

const getEventOffsetXPercentageFromMouseEvent = (
  elementRef: React.MutableRefObject<HTMLDivElement | null>,
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
): number | null => {
  if (!elementRef.current) {
    return null;
  }
  const ne = event.nativeEvent;
  const progressBar = elementRef.current;
  const percentage = (ne.offsetX / progressBar.clientWidth) * 100;
  // console.log({
  //   x: ne.offsetX,
  //   y: ne.offsetY,
  //   width: progressBar.clientWidth,
  //   height: progressBar.clientHeight,
  //   percentage,
  // });
  return percentage;
};

const VideoController = ({
  isActive,
  currentTime,
  totalDurationSec,
  seekTo,
  isPlaying,
  play,
  pause,
}: {
  isActive: boolean;
  currentTime: number;
  totalDurationSec: number;
  seekTo(a: number): void;
  play(): void;
  pause(): void;
  isPlaying: boolean;
}) => {
  const progressPercentage = (currentTime / totalDurationSec) * 100;
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [hoverPercentage, setHoverPercentage] = useState<number | null>(null);
  const hoverTimestamp =
    hoverPercentage !== null
      ? formatTime((hoverPercentage * totalDurationSec) / 100)
      : null;
  return (
    <div className={`video-controller ${isActive ? "" : "hide"}`}>
      <div className="progress-container">
        <div className="timestamp">{formatTime(currentTime)}</div>
        <div
          ref={progressBarRef}
          className="progress-bar"
          onClick={(e) => {
            const percentage = getEventOffsetXPercentageFromMouseEvent(
              progressBarRef,
              e
            );
            if (!percentage) {
              return;
            }
            // console.log((totalDurationSec * percentage) / 100);
            seekTo((totalDurationSec * percentage) / 100);
          }}
          onMouseOut={() => {
            setHoverPercentage(null);
          }}
          onMouseMove={(e) => {
            const percentage = getEventOffsetXPercentageFromMouseEvent(
              progressBarRef,
              e
            );
            setHoverPercentage(percentage);
          }}
        >
          <div className="left" style={{ flex: progressPercentage }}>
            {/* <div className="cursor"></div> */}
          </div>
          <div
            className="right"
            style={{ flex: 100 - progressPercentage }}
          ></div>
          {hoverPercentage !== null && (
            <div
              className="hover-preview"
              style={{ left: `${hoverPercentage}%` }}
            >
              <div className="preview-timestamp">{hoverTimestamp}</div>
            </div>
          )}
        </div>
        <div className="timestamp">{formatTime(totalDurationSec)}</div>
      </div>
      <div className="control-container">
        <div className="play-pause-seek">
          <img
            className="control"
            src="/icons/back-10s.svg"
            onClick={() => seekTo(currentTime - 10)}
          ></img>
          {isPlaying ? (
            <img
              className="control"
              src="/icons/pause.svg"
              onClick={() => pause()}
            ></img>
          ) : (
            <img
              className="control"
              src="/icons/play.svg"
              onClick={() => play()}
            ></img>
          )}
          <img
            className="control"
            src="/icons/forward-10s.svg"
            onClick={() => seekTo(currentTime + 10)}
          ></img>
        </div>
      </div>
    </div>
  );
};

const HeaderOverlay = ({
  title,
  problemNo,
  pageNo,
}: {
  title: string;
  pageNo: string;
  problemNo: string;
}) => {
  return (
    <div className="overlay-container" id="overlay">
      <img className="header-bg" src="/phy-overlay-01.png"></img>
      <div className="title">{title}</div>
      <div className="problem-no">ข้อที่ {problemNo}</div>
      <div className="page-no">หน้าที่ {pageNo}</div>
    </div>
  );
};

const TransitionOverlay = ({
  problemNo,
  pageNo,
  timeLeftSec,
}: {
  title: string;
  pageNo: string;
  problemNo: string;
  timeLeftSec: number;
}) => {
  return (
    <div className="transition-overlay-container" id="overlay">
      <div className="title">{`เปิดไปหน้าที่ ${pageNo} ข้อที่ ${problemNo}`}</div>
      <div className="time-left">กำลังไปต่อในอีก {timeLeftSec} วินาที</div>
    </div>
  );
};

const PopupOverlay = ({ text, title }: { title: string; text: string }) => {
  return (
    <div className="popup-overlay-container" id="overlay">
      <div className="title">{title}</div>
      <div className="text">{text}</div>
    </div>
  );
};

const VideoPlayerWithOverlay = ({
  videoSrc,
  vttSrc,
}: {
  videoSrc: string;
  vttSrc: string;
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const videoSrcRef = React.useRef<HTMLSourceElement>(null);
  const trackRef = React.useRef<HTMLTrackElement>(null);
  const [pausedUntil, setPausedUntil] = React.useState<Date>();
  const [timeLeftSec, setTimeLeftSec] = React.useState<number>(0);
  // const [src, setSrc] = React.useState("/vids/lams/demo.m3u8");
  const [transitionCue, setTransitionCue] =
    React.useState<Record<string, string>>();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalDurationSec, setTotalDurationSec] = useState(1855);
  const { activeCue, activeCues, activeChapter, activePopUpCue } =
    useActiveCues("/overlay.vtt", currentTime);

  // console.log(webvtt);

  // console.log("activeCue", { activeCue });

  React.useEffect(() => {
    if (!pausedUntil) return;
    const video = videoRef.current;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= pausedUntil.getTime()) {
        video?.play();
        setPausedUntil(undefined);
        setTransitionCue(undefined);
        setTimeLeftSec(0);
      } else {
        setTimeLeftSec(Math.floor((pausedUntil.getTime() - now) / 1000));
      }
    }, 100);
    return () => {
      clearInterval(interval);
    };
  }, [pausedUntil]);

  const handleTransitionCue = (cue: Record<string, string>) => {
    const pauseDuration = +cue.pauseDuration;
    const video = videoRef.current;
    video?.pause();
    setTransitionCue(cue);
    setPausedUntil(new Date(Date.now() + pauseDuration));
  };

  const [isControlActive, setIsControlActive] = useState(true);
  const timeoutIdRef = React.useRef<any>(null);

  const activateControl = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, delay = 3000) => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      setIsControlActive(true);
      timeoutIdRef.current = setTimeout(() => {
        setIsControlActive(false);
        timeoutIdRef.current = null;
      }, delay);
      e.stopPropagation();
    },
    [setIsControlActive]
  );

  const seekTo = useCallback((seekToSec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seekToSec;
    }
  }, []);

  const attachEventListeners = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      const onTimeUpdate = (e: Event) => {
        setCurrentTime(video?.currentTime ?? 0);
      };
      const onPlay = (e: Event) => {
        setIsPlaying(true);
      };
      const onPause = (e: Event) => {
        setIsPlaying(false);
      };
      console.log("duration", video.duration);
      video.addEventListener("timeupdate", onTimeUpdate);
      video.addEventListener("play", onPlay);
      video.addEventListener("pause", onPause);
      return () => {
        video.removeEventListener("timeupdate", onTimeUpdate);
      };
    }
  }, []);

  useEffect(() => {
    attachEventListeners();
  }, [attachEventListeners]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // video.controls = true;
    let hls: Hls;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // This will run in safari, where HLS is supported natively
      video.src = videoSrc;
    } else if (Hls.isSupported()) {
      console.log("Hls is supported");
      // This will run in all other modern browsers
      hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
    } else {
      console.error(
        "This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API"
      );
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoSrc, videoRef, attachEventListeners]);

  return (
    <div className="video-with-overlay-container" onMouseOver={activateControl}>
      <div className="video-wrapper">
        <video ref={videoRef} muted autoPlay>
          <source ref={videoSrcRef} type="video/mp4" />
          <track
            default
            kind="metadata"
            src={vttSrc}
            // label="English"
            ref={trackRef}
          />
          <div>test</div>
        </video>
        {activeCue?.data.type === "solution" && (
          <HeaderOverlay
            title={activeCue.data.title}
            pageNo={activeCue.data.pageNo}
            problemNo={activeCue.data.problemNo}
          />
        )}
        {activePopUpCue && (
          <PopupOverlay
            title={activePopUpCue.data.title}
            text={activePopUpCue.data.text}
          />
        )}
        {transitionCue && (
          <TransitionOverlay
            title={transitionCue.title}
            pageNo={transitionCue.pageNo}
            problemNo={transitionCue.problemNo}
            timeLeftSec={timeLeftSec}
          />
        )}
      </div>
      <VideoInfoHeader
        isActive={isControlActive}
        activeChapter={activeChapter}
        seekTo={seekTo}
      />
      <VideoController
        isActive={isControlActive}
        currentTime={currentTime}
        totalDurationSec={totalDurationSec}
        seekTo={seekTo}
        isPlaying={isPlaying}
        play={() => {
          videoRef.current?.play();
        }}
        pause={() => {
          videoRef.current?.pause();
        }}
      />
    </div>
  );
};

export default VideoPlayerWithOverlay;

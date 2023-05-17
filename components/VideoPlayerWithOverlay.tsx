import React, { useCallback, useEffect, useState } from "react";
import Hls from "hls.js";

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

const VideoController = ({
  isActive,
  currentTime,
  totalDurationSec,
  seekTo,
}: {
  isActive: boolean;
  currentTime: number;
  totalDurationSec: number;
  seekTo(a: number): void;
}) => {
  const progressPercentage = (currentTime / totalDurationSec) * 100;
  return (
    <div className={`video-controller ${isActive ? "" : "hide"}`}>
      <div className="progress-container">
        <div className="timestamp">{formatTime(currentTime)}</div>
        <div
          className="progress-bar"
          onClick={(e) => {
            console.log(
              e.clientX,
              e.clientY,
              (e.target as any).getBoundingClientRect()
            );
            const rect = (e.target as any).getBoundingClientRect();
            // const width = e.
            const x = e.clientX - rect.left; //x position within the element.
            const y = e.clientY - rect.top; //y position within the element.
            const percentage = console.log(
              "Left? : " + x + " ; Top? : " + y + "."
            );
          }}
        >
          <div className="left" style={{ flex: progressPercentage }}>
            {/* <div className="cursor"></div> */}
          </div>
          <div
            className="right"
            style={{ flex: 100 - progressPercentage }}
          ></div>
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
          <img className="control" src="/icons/pause.svg"></img>
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
  // const [src, setSrc] = React.useState("/vids/lams/demo.m3u8");
  const [pausedUntil, setPausedUntil] = React.useState<Date>();
  const [timeLeftSec, setTimeLeftSec] = React.useState<number>(0);
  const [transitionCue, setTransitionCue] =
    React.useState<Record<string, string>>();
  const [activeCues, setActiveCues] = React.useState<
    Array<Record<string, string>>
  >([]);
  const [src, setSrc] = React.useState("/vids/lams/demo.m3u8");
  const [activeChapter, setActiveChapter] = useState<string>();

  const [activePopUpCue, setActivePopUpCue] =
    React.useState<Record<string, string>>();

  const activeCue = activeCues[0];

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

  React.useEffect(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const textTrack = track.track;
    const handleCueChange = (event: Event) => {
      console.log(event);
      if (!event.currentTarget || !(event.currentTarget instanceof TextTrack)) {
        return;
      }
      const textTrack: TextTrack = event.currentTarget;
      const activeCues = Array.from(textTrack.activeCues ?? []);
      setActivePopUpCue(undefined);
      const textCues = [];
      for (const cue of activeCues) {
        const cueText = JSON.parse((cue as any).text);
        if (cueText.type === "transition") {
          handleTransitionCue(cueText);
        } else if (cueText.type === "popup") {
          setActivePopUpCue(cueText);
        } else {
          textCues.push(cueText);
        }
      }
      setActiveCues(textCues);
      const firstCue = textCues[0];
      if (firstCue) {
        setActiveChapter(firstCue.problemNo ?? undefined);
      }
    };
    textTrack.addEventListener("cuechange", handleCueChange);
    return () => {
      textTrack.removeEventListener("cuechange", handleCueChange);
    };
  }, [trackRef]);

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

  const [currentTime, setCurrentTime] = useState(0);
  const [totalDurationSec, setTotalDurationSec] = useState(1855);

  useEffect(() => {
    if (videoRef.current) {
      const onTimeUpdate = (e: Event) => {
        setCurrentTime(videoRef.current?.currentTime ?? 0);
      };
      videoRef.current.addEventListener("timeupdate", onTimeUpdate);
      return () => {
        videoRef.current?.removeEventListener("timeupdate", onTimeUpdate);
      };
    }
  }, [videoRef.current]);

  // console.log({ currentTime });

  // React.useEffect(() => {
  //   const video = videoRef.current;
  //   if (!video) return;

  //   video.controls = true;
  //   let hls: Hls;

  //   if (video.canPlayType("application/vnd.apple.mpegurl")) {
  //     // This will run in safari, where HLS is supported natively
  //     video.src = src;
  //   } else if (Hls.isSupported()) {
  //     console.log("Hls is supported");
  //     // This will run in all other modern browsers
  //     hls = new Hls();
  //     hls.loadSource(src);
  //     hls.attachMedia(video);
  //   } else {
  //     console.error(
  //       "This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API"
  //     );
  //   }

  //   return () => {
  //     if (hls) {
  //       hls.destroy();
  //     }
  //   };
  // }, [src, videoRef]);

  return (
    <div className="video-with-overlay-container" onMouseOver={activateControl}>
      <div className="video-wrapper">
        <video ref={videoRef} muted autoPlay>
          <source ref={videoSrcRef} src={videoSrc} type="video/mp4" />
          <track
            default
            kind="metadata"
            src={vttSrc}
            label="English"
            ref={trackRef}
          />
          <div>test</div>
        </video>
        {activeCue?.type === "solution" && (
          <HeaderOverlay
            title={activeCue.title}
            pageNo={activeCue.pageNo}
            problemNo={activeCue.problemNo}
          />
        )}
        {activePopUpCue && (
          <PopupOverlay
            title={activePopUpCue.title}
            text={activePopUpCue.text}
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
      />
    </div>
  );
};

export default VideoPlayerWithOverlay;

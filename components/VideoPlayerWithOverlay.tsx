import React from "react";
import Hls from "hls.js";

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
      <div className="problem-no">ข้อที่{problemNo}</div>
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

  const [activePopUpCue, setActivePopUpCue] =
    React.useState<Record<string, string>>();

  const activeCue = activeCues[0];

  console.log("activeCue", { activeCue });

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
    };
    textTrack.addEventListener("cuechange", handleCueChange);
    return () => {
      textTrack.removeEventListener("cuechange", handleCueChange);
    };
  }, [trackRef]);

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
    <div className="video-wrapper">
      <video ref={videoRef} muted autoPlay controls>
        <source ref={videoSrcRef} src={videoSrc} type="video/mp4" />
        <track
          default
          kind="metadata"
          src={vttSrc}
          label="English"
          ref={trackRef}
        />
      </video>
      {activeCue?.type === "solution" && (
        <HeaderOverlay
          title={activeCue.title}
          pageNo={activeCue.pageNo}
          problemNo={activeCue.problemNo}
        />
      )}
      {activePopUpCue && (
        <PopupOverlay title={activePopUpCue.title} text={activePopUpCue.text} />
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
  );
};

export default VideoPlayerWithOverlay;

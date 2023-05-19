import React, { useCallback, useEffect, useState } from "react";

import videojs from "video.js";
import type Player from "video.js/dist/types/player";

import VJSPlayer from "./VJSPlayer";

const VideoInfoHeader = ({
  activeChapter,
  setSeekToSec,
  isActive,
}: {
  isActive: boolean;
  activeChapter?: string;
  setSeekToSec(a: number): void;
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
              setSeekToSec(timestamps[idx]);
            }}
          >
            Solution ข้อ {+chapter}
          </div>
        ))}
      </div>
    </div>
  );
};

const VideoControl = ({
  isActive,
  activeChapter,
  setSeekToSec,
}: {
  isActive: boolean;
  activeChapter?: string;
  setSeekToSec(a: number): void;
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
              setSeekToSec(timestamps[idx]);
            }}
          >
            Solution ข้อ {+chapter}
          </div>
        ))}
      </div>
    </div>
  );
};

const VJSPlayerWithOverlay = ({
  videoSrc,
  vttSrc,
}: {
  videoSrc: string;
  vttSrc: string;
  //   seekToSec?: number;
  //   setActiveChapter(v: string): void;
}) => {
  const playerRef = React.useRef<Player | null>(null);
  const [activeChapter, setActiveChapter] = useState<string>();
  const [seekToSec, setSeekToSec] = useState<number>();

  const videoJsOptions = {
    preload: "auto",
    autoplay: false,
    controls: true,
    muted: true,
    playbackRates: [0.5, 1.0, 1.5, 2.0],
    controlBar: {
      children: [
        "playToggle",
        "volumePanel",
        "currentTimeDisplay",
        "timeDivider",
        "durationDisplay",
        "progressControl",
        // 'liveDisplay',
        "remainingTimeDisplay",
        "customControlSpacer",
        "playbackRateMenuButton",
        // 'chaptersButton',
        // 'descriptionsButton',
        // 'subtitlesButton',
        // 'captionsButton',
        // 'audioTrackButton',
        // 'fullscreenToggle',
      ],
      volumePanel: {
        vertical: true,
        inline: false,
      },
    },
    sources: [
      {
        src: videoSrc,
        type: "video/mp4",
      },
    ],
  };

  const handlePlayerReady = (player: Player) => {
    // playerRef.current = player;
    // // You can handle player events here, for example:
    // player.on("waiting", () => {
    //   videojs.log("player is waiting");
    // });
    // player.on("dispose", () => {
    //   videojs.log("player will dispose");
    // });
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

  console.log({ isControlActive });
  return (
    <div className="video-with-overlay-container" onMouseOver={activateControl}>
      <VJSPlayer
        options={videoJsOptions}
        onReady={handlePlayerReady}
      ></VJSPlayer>
      <VideoInfoHeader
        isActive={isControlActive}
        activeChapter={activeChapter}
        setSeekToSec={setSeekToSec}
      ></VideoInfoHeader>
    </div>
  );
};

export default VJSPlayerWithOverlay;

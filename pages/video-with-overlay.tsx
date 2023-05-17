import { useState } from "react";
import VideoPlayerWithOverlay from "components/VideoPlayerWithOverlay";

export default function VideoWithOverlay() {
  return (
    <VideoPlayerWithOverlay
      videoSrc="/vids/lams/output.mp4"
      vttSrc="/overlay.vtt"
    ></VideoPlayerWithOverlay>
  );
}

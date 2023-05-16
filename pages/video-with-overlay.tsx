import { useState } from "react";
import VJSPlayerWithOverlay from "components/VJSPlayerWithOverlay";

export default function VideoWithOverlay() {
  return (
    <VJSPlayerWithOverlay
      videoSrc="/vids/lams/output.mp4"
      vttSrc="/overlay.vtt"
    ></VJSPlayerWithOverlay>
  );
}

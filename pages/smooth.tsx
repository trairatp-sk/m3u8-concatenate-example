import VideoPlayerWithOverlay from "components/VideoPlayerWithOverlay";

export default function VideoWithOverlay() {
  return (
    <VideoPlayerWithOverlay
      videoSrc="https://pub-a745e3b4cca7460d96493738dbfc72f8.r2.dev/output.m3u8"
      vttSrc="/overlay.vtt"
    ></VideoPlayerWithOverlay>
  );
}

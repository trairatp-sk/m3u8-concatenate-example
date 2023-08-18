import VideoPlayerWithOverlay from "components/VideoPlayerWithOverlay";

export default function VideoWithOverlay() {
  return (
    <VideoPlayerWithOverlay
      videoSrc="/vids/byteark/index.m3u8"
      vttSrc="/overlay.vtt"
    ></VideoPlayerWithOverlay>
  );
}

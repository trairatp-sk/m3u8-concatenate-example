import VideoPlayerWithOverlay from "components/VideoPlayerWithOverlay";

export default function VideoWithOverlay() {
  return (
    <VideoPlayerWithOverlay
      videoSrc="https://storage.googleapis.com/lc-smooth-playlist-poc/usability-test-2/main.m3u8"
      vttSrc="/overlay.vtt"
    ></VideoPlayerWithOverlay>
  );
}

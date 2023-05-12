import { Inter } from "@next/font/google";
import VideoPlayerWithOverlay from "@/components/VideoPlayerWithOverlay";

const inter = Inter({ subsets: ["latin"] });

export default function VideoWithOverlay() {
  return (
    <div className="video-with-overlay-container">
      <VideoPlayerWithOverlay
        videoSrc="/vids/lams/output.mp4"
        vttSrc="/overlay.vtt"
      ></VideoPlayerWithOverlay>
    </div>
  );
}

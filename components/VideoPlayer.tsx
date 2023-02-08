import { ReactEventHandler, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function VideoPlayer({
  src,
  poster,
  onVideoEnded,
}: {
  src: string;
  poster?: string;
  onVideoEnded?: ReactEventHandler<HTMLVideoElement>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    setEnded(false);
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.controls = true;
    let hls: Hls;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // This will run in safari, where HLS is supported natively
      video.src = src;
    } else if (Hls.isSupported()) {
      // This will run in all other modern browsers
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      console.error(
        'This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API',
      );
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src, videoRef]);

  const onProgress: ReactEventHandler<HTMLVideoElement> = (e) => {
    if (e !== null) {
      const currentTime = (e?.target as any)?.currentTime;
      const duration = (e?.target as any)?.duration;
      const progress = (currentTime / duration) * 100;
      setEnded((prev) => {
        if (!prev && progress >= 95) {
          if (onVideoEnded) {
            onVideoEnded(e);
          }
          return true;
        }
        return prev;
      });
    }
  };

  return (
      <video
        ref={videoRef}
        poster={poster}
        onTimeUpdate={onProgress}
        autoPlay={true}
        onClick={(e) => {
          e.stopPropagation();
        }}
      />
  );
}

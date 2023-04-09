import { Composition, getOutputFilename } from "remotion";
import type { NextApiRequest, NextApiResponse } from "next";
import React from "react";
import { AbsoluteFill, VideoConfig } from "remotion";

const MyVideo = ({
  title,
  backgroundColor,
}: {
  title: string;
  backgroundColor: string;
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "3rem",
          fontWeight: "bold",
          color: "white",
        }}
      >
        {title}
      </div>
    </AbsoluteFill>
  );
};

type Data = {
  url: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const inputProps = {
    title: "Hello, Remotion!",
    backgroundColor: "#282c34",
  };

  render(
    <Composition
      id="my-video"
      component={MyVideo}
      durationInFrames={30 * 5} // 5 seconds at 30 FPS
      fps={30}
      width={1280}
      height={720}
      defaultProps={inputProps}
    />,
    getOutputFilename("my-video")
  );
  res.json({ url: "/public/test" });
}

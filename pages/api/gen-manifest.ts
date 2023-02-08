// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import HLS from "hls-parser";
import fs from "fs/promises";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const rawManifests = await Promise.all([
    fs.readFile("public/vids/vid-01/vid-01.m3u8", "utf-8"),
    fs.readFile("public/vids/vid-02/vid-02.m3u8", "utf-8"),
    fs.readFile("public/vids/vid-03/vid-03.m3u8", "utf-8"),
  ]);
  const seq = [1, 2, 1, 2, 0];
  const manifests = rawManifests.map((rm) => HLS.parse(rm));
  console.log(manifests);
  const { MediaPlaylist, Segment } = HLS.types;
  const segments = seq
    .map((s) => manifests[s])
    
    .map((manifest, idx) => {
      if (manifest.isMasterPlaylist) {
        return null;
      }
      return new Segment({
        uri: manifest.segments[0].uri,
        duration: manifest.segments[0].duration,
        discontinuity: true,
        discontinuitySequence: 1,
        mediaSequenceNumber: 0,
      });
    }).filter((manifest) => !!manifest) as HLS.types.Segment[];
  const targetDuration = segments.reduce((prev, curr) => prev + curr.duration, 0);
  const obj = new MediaPlaylist({
    targetDuration,
    playlistType: "VOD",
    segments,
    endlist: true,
  });
  res.status(200).send(HLS.stringify(obj) as any);
  //   res.status(200).send(
  // `#EXTM3U
  // #EXT-X-VERSION:3
  // #EXT-X-TARGETDURATION:14
  // #EXT-X-MEDIA-SEQUENCE:0
  // #EXTINF:6.473133,
  // /vids/vid-01/vid-010.ts
  // #EXT-X-DISCONTINUITY
  // #EXTINF:2.333333,
  // /vids/vid-02/vid-020.ts
  // #EXT-X-DISCONTINUITY
  // #EXTINF:5.600000,
  // /vids/vid-03/vid-030.ts
  // #EXT-X-ENDLIST`
  //   )
}

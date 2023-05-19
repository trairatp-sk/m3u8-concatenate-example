import { useState, useEffect } from "react";
import axios from "axios";
import { WebVTTParser } from "webvtt-parser";

const useWebVTT = (url: string) => {
  const [cues, setCues] = useState([]);

  useEffect(() => {
    const fetchAndParseWebVTT = async () => {
      try {
        const response = await axios.get(url);
        const parser = new WebVTTParser();
        const parsedVTT = parser.parse(response.data, "metadata");
        setCues(parsedVTT.cues);
      } catch (error) {
        console.error("Failed to fetch and parse WebVTT:", error);
      }
    };

    fetchAndParseWebVTT();
  }, [url]);

  return cues;
};

type Cue = {
  startTime: number;
  endTime: number;
  data: Record<string, string>;
};

const useActiveCues = (url: string, currentTimestampSec: number) => {
  const [cues, setCues] = useState<Cue[]>([]);

  useEffect(() => {
    const fetchAndParseWebVTT = async () => {
      try {
        const response = await axios.get(url);
        const parser = new WebVTTParser();
        const parsedVTT = parser.parse(response.data, "metadata");
        const mappedCues: Cue[] = parsedVTT.cues.map((cue: any) => {
          return {
            startTime: cue.startTime,
            endTime: cue.endTime,
            data: JSON.parse(cue.text),
          };
        });
        setCues(mappedCues);
      } catch (error) {
        console.error("Failed to fetch and parse WebVTT:", error);
      }
    };

    fetchAndParseWebVTT();
  }, [url]);

  const activeCues = cues.filter(
    (cue) =>
      cue.startTime <= currentTimestampSec && cue.endTime >= currentTimestampSec
  );

  const activeOverlayCues = activeCues.filter(
    (cue) => cue.data.type === "solution"
  );
  const activePopUpCue = activeCues.find((cue) => cue.data.type === "popup");
  const activeChapter = activeOverlayCues[0]?.data.problemNo;

  return {
    activeCues,
    activePopUpCue,
    activeCue: activeCues[0],
    activeChapter,
  };
};

export { useWebVTT, useActiveCues };

import type { ProbeResult } from "./ffprobe";

export type TranscodePlan = {
  mode: "copy" | "transcode";
  args: string[];
};

function getFirstVideoCodec(probe: ProbeResult): string | undefined {
  return probe.streams?.find((s) => s.codec_type === "video")?.codec_name;
}

function getFirstAudioCodec(probe: ProbeResult): string | undefined {
  return probe.streams?.find((s) => s.codec_type === "audio")?.codec_name;
}

function canCopyToMp4(probe: ProbeResult): boolean {
  const video = getFirstVideoCodec(probe);
  const audio = getFirstAudioCodec(probe);

  const videoOk = video === "h264";
  const audioOk = !audio || audio === "aac";

  return videoOk && audioOk;
}

export function buildMp4Plan(inputPath: string, outputPath: string, probe: ProbeResult): TranscodePlan {
  if (canCopyToMp4(probe)) {
    return {
      mode: "copy",
      args: [
        "-y",
        "-i",
        inputPath,
        "-map",
        "0:v:0",
        "-map",
        "0:a?",
        "-c:v",
        "copy",
        "-c:a",
        "copy",
        "-movflags",
        "+faststart",
        outputPath,
      ],
    };
  }

  return {
    mode: "transcode",
    args: [
      "-y",
      "-i",
      inputPath,
      "-map",
      "0:v:0",
      "-map",
      "0:a?",
      "-c:v",
      "libx264",
      "-preset",
      "slower",
      "-crf",
      "18",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      "-b:a",
      "320k",
      "-movflags",
      "+faststart",
      outputPath,
    ],
  };
}
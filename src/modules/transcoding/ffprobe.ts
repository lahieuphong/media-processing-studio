import { spawn } from "node:child_process";

export type ProbeStream = {
  codec_type?: string;
  codec_name?: string;
};

export type ProbeResult = {
  streams?: ProbeStream[];
  format?: {
    format_name?: string;
    duration?: string;
  };
};

export async function probeMedia(inputPath: string): Promise<ProbeResult> {
  return new Promise((resolve, reject) => {
    const args = [
      "-v",
      "error",
      "-print_format",
      "json",
      "-show_streams",
      "-show_format",
      inputPath,
    ];

    const child = spawn("ffprobe", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffprobe failed: ${stderr}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout) as ProbeResult);
      } catch (error) {
        reject(error);
      }
    });
  });
}
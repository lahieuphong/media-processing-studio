import { spawn } from "node:child_process";
import { probeMedia } from "./ffprobe";
import { buildMp4Plan } from "./profiles";

export async function convertMovToMp4(inputPath: string, outputPath: string): Promise<{
  mode: "copy" | "transcode";
}> {
  const probe = await probeMedia(inputPath);
  const plan = buildMp4Plan(inputPath, outputPath, probe);

  await new Promise<void>((resolve, reject) => {
    const child = spawn("ffmpeg", plan.args, {
      stdio: ["ignore", "ignore", "pipe"],
    });

    let stderr = "";

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;

      // You can parse progress here later.
      process.stdout.write(text);
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ffmpeg failed: ${stderr}`));
        return;
      }

      resolve();
    });
  });

  return { mode: plan.mode };
}
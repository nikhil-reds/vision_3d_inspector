const CANDIDATES_PER_FRAME = 3;
const SHARPNESS_WIDTH = 240;
const MIN_DURATION_SEC = 3;

function waitFor(video: HTMLVideoElement, event: "loadeddata" | "seeked") {
  return new Promise<void>((resolve, reject) => {
    const done = () => {
      video.removeEventListener(event, done);
      video.removeEventListener("error", fail);
      resolve();
    };
    const fail = () => {
      video.removeEventListener(event, done);
      reject(new Error("Your browser can't decode this video. Try an MP4 (H.264) file."));
    };
    video.addEventListener(event, done);
    video.addEventListener("error", fail);
  });
}

async function seek(video: HTMLVideoElement, t: number) {
  const seeked = waitFor(video, "seeked");
  video.currentTime = t;
  await seeked;
}

/** Mean squared gradient of a downscaled grayscale frame; motion-blurred frames score low. */
function sharpness(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const px = ctx.getImageData(0, 0, w, h).data;
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) gray[i] = px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114;
  let sum = 0;
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const i = y * w + x;
      const gx = gray[i + 1] - gray[i];
      const gy = gray[i + w] - gray[i];
      sum += gx * gx + gy * gy;
    }
  }
  return sum / ((w - 1) * (h - 1));
}

/**
 * Pick `count` frames spread evenly over a walk-around video. Each frame is the sharpest of a
 * few candidates from its time slot, so camera shake doesn't hand the pipeline a blurred view.
 */
export async function extractVideoFrames(
  file: File,
  count: number,
  maxSide: number,
  onProgress?: (done: number) => void
): Promise<string[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  try {
    const loaded = waitFor(video, "loadeddata");
    video.src = url;
    await loaded;

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration < MIN_DURATION_SEC) {
      throw new Error(`The video must be at least ${MIN_DURATION_SEC} seconds long.`);
    }
    const { videoWidth: vw, videoHeight: vh } = video;
    if (!vw || !vh) throw new Error("The video has no picture track.");

    const scale = Math.min(1, maxSide / Math.max(vw, vh));
    const out = document.createElement("canvas");
    out.width = Math.round(vw * scale);
    out.height = Math.round(vh * scale);
    const outCtx = out.getContext("2d");
    const probe = document.createElement("canvas");
    probe.width = SHARPNESS_WIDTH;
    probe.height = Math.round((SHARPNESS_WIDTH * vh) / vw);
    const probeCtx = probe.getContext("2d", { willReadFrequently: true });
    if (!outCtx || !probeCtx) throw new Error("Could not create a canvas to read the video.");

    const slot = duration / count;
    const frames: string[] = [];
    for (let i = 0; i < count; i++) {
      let best = { score: -1, t: 0 };
      for (let c = 0; c < CANDIDATES_PER_FRAME; c++) {
        const t = i * slot + ((c + 0.5) / CANDIDATES_PER_FRAME) * slot;
        await seek(video, t);
        probeCtx.drawImage(video, 0, 0, probe.width, probe.height);
        const score = sharpness(probeCtx, probe.width, probe.height);
        if (score > best.score) best = { score, t };
      }
      if (video.currentTime !== best.t) await seek(video, best.t);
      outCtx.drawImage(video, 0, 0, out.width, out.height);
      frames.push(out.toDataURL("image/jpeg", 0.92));
      onProgress?.(i + 1);
    }
    return frames;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}

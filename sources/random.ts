import {
  AudioFrame,
  SendInstance,
  VideoColourSpace,
  VideoFrame,
  VideoFramerate,
} from "ndi.js";

import ProgressBar from "progress";

export interface RandomSignalOptions {
  video: boolean;
  width: number;
  height: number;
  frames: number;

  audio: boolean;
  channels: number;
  sampleRate: number;
}

const sineWaveFLTAudioFrame = (frequency = 440, sampleRate = 48000) =>
  Float32Array.from(
    Array(sampleRate),
    (_, i) => 0.01 * Math.sin((8 * (Math.PI * i)) / frequency)
  );

const randomRGBAVideoFrame = (width: number, height: number) =>
  Buffer.from(
    Array.from(Array(height * width * 4), (_, k) =>
      k % 4 < 3 ? Math.round(255 * Math.random()) : 255
    )
  );

const getFrameRate = (fps: number) =>
  ({
    24: VideoFramerate.F24,
    24.98: VideoFramerate.F2498,
    25: VideoFramerate.F25,
    29.97: VideoFramerate.F2997,
    30: VideoFramerate.F30,
    50: VideoFramerate.F50,
    59.94: VideoFramerate.F5994,
    60: VideoFramerate.F60,
  }[fps]);

async function buildVideoframes(options: RandomSignalOptions) {
  const fps = Number(options?.frames);
  const width = Number(options?.width);
  const height = Number(options?.height);

  console.log("Creating video frames");
  const videoProgressBar = new ProgressBar(":bar :current/:total", {
    total: fps,
  });
  videoProgressBar.render();

  const videoFrames = Array.from(Array(fps), () => {
    const frame = randomRGBAVideoFrame(height, width);
    videoProgressBar.tick(1);
    return frame;
  });

  videoProgressBar.terminate();

  return videoFrames;
}

async function buildAudioFrames(options: RandomSignalOptions) {
  const channels = Number(options?.channels);
  const sampleRate = Number(options?.sampleRate);
  const fps = options.video ? Number(options?.frames) : 1;

  console.log("Creating audio frames");

  const samplesInFrame = Math.ceil(sampleRate / fps);
  const sFrame = sineWaveFLTAudioFrame(options.video ? samplesInFrame : 440, sampleRate);

  const audioProgressBar = new ProgressBar(":bar :current/:total", {
    total: fps,
  });
  audioProgressBar.render();

  const audioFrames = Array.from(Array(fps), (_, frame) => {
    audioProgressBar.tick(1);

    return Array.from(Array(channels), (_, ch) =>
      sFrame
        .slice(frame * samplesInFrame, (frame + 1) * samplesInFrame)
        .map((k) => k * (-1) ** ch)
    );
  });

  audioProgressBar.terminate();

  return audioFrames;
}

export default async function randomSignalTest(
  sendInstance: SendInstance,
  options: RandomSignalOptions,
  timeout: number = 5,
) {
  // Setup random video data
  let videoFrames: Buffer[] = [];
  if (options.video) {
    videoFrames = await buildVideoframes(options);
  }

  // Setup random audio data
  let audioFrames: Float32Array[][] = [];
  if (options.audio) {
    audioFrames = await buildAudioFrames(options);
  }

  // Start broadcasting
  const fps = options.video ? Number(options.frames) : 1;
  const start = Date.now();

  const videoFrameTemplate: Partial<VideoFrame> = {
    width: Number(options.width),
    height: Number(options.height),
    colourSpace: VideoColourSpace.RGBX,
    framerate: getFrameRate(Number(fps)),
  };

  const audioFrameTemplate: Partial<AudioFrame> = {
    sampleRate: Number(options.sampleRate),
  };

  let count = 0;
  while (count < Number(timeout)) {
    const start = Date.now();
    sendInstance.send(
      Array.from(Array(fps), (_, idx) => ({
        ...(options.audio
          ? {
              audio: {
                ...audioFrameTemplate,
                channels: audioFrames[idx],
              } as AudioFrame,
            }
          : {}),
        ...(options.video
          ? {
              video: {
                ...videoFrameTemplate,
                data: videoFrames[idx],
              } as VideoFrame,
            }
          : {}),
      }))
    );
    console.log(
      `Sent ${fps} frames of ${[
        options.video ? "video" : undefined,
        options.audio ? "audio" : undefined,
      ]
        .filter((x) => x !== undefined)
        .join("/")} in ${Date.now() - start}ms`
    );

    count++;
  }

  console.log(`\nSent ${timeout} seconds of signal in ${Date.now() - start}ms`);
}

import { SendInstance, VideoColourSpace, VideoFramerate } from "ndi.js";

import { VideoCapture } from "camera-capture";
import sharp from "sharp";

export default async function webcamSignalTest(sendInstance: SendInstance) {
  const capture = new VideoCapture({
    width: 1280,
    height: 720,
    fps: 30,
    mime: "image/jpeg",
    puppeteerOptions: {
      args: ["--disable-dev-shm-usage"],
    },
  });

  await capture.initialize();

  let start = Date.now();
  capture.addFrameListener(async ({ width, height, data }) => {
    sendInstance.send([
      {
        video: {
          width,
          height,
          colourSpace: VideoColourSpace.RGBA,
          framerate: VideoFramerate.F30,
          data: await sharp(data).raw().toBuffer(),
        },
      },
    ]);

    console.log(`Sent 1 frame in ${Date.now() - start}ms`);
    start = Date.now();
  });

  await capture.start();
}

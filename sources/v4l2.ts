import { SendInstance, VideoColourSpace, VideoFramerate } from "ndi.js";

import v4l2camera from "v4l2camera-pr48";

const { Camera } = v4l2camera;

export default async function v4l2SignalTest(
  sendInstance: SendInstance,
  _: { audio: boolean },
  devicePath: string
) {
  const start = Date.now();

  const width = 1280;
  const height = 720;

  try {
    const camera = new Camera(devicePath);

    camera.configSet({
      width,
      height,
      interval: {
        numerator: 1,
        denominator: 30,
      },
    });

    console.log(camera.configGet());

    camera.start();

    function capture() {
      return camera.capture((success) => {
        if (!success) {
          console.log("Stopping camera...");
          return camera.stop();
        }

        const frame: Uint8Array = camera.frameRaw();

        if (frame.length > 0) {
          sendInstance.send([
            {
              video: {
                colourSpace: VideoColourSpace.UYVY,
                width,
                height,
                framerate: VideoFramerate.F30,
                data: frame.map((_, i, x) => {
                  if (i % 4) {
                    return _;
                  }

                  const [y, u, y2, v] = [x[i], x[i + 1], x[i + 2], x[i + 3]];
                  
                  x[i] = u;
                  x[i + 1] = y;
                  x[i + 2] = v;
                  x[i + 3] = y2;

                  return x[i];
                }),
              },
            },
          ]);
        }

        capture();
      });
    }

    capture();
  } catch (error) {
    console.error(error);
  } finally {
    console.log(`Executed in ${((Date.now() - start) / 1000).toFixed(3)}ms`);
  }
}

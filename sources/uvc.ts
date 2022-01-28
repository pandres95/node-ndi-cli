import { SendInstance } from "ndi.js";
import UVC from "uvc";
import callback from "callback-stream";
import prompts from "prompts";

const { Context, Controls, FrameStreamer, LibUvc } = UVC;

export default async function uvcSignalTest(sendInstance: SendInstance) {
  const libuvc = new LibUvc();
  await libuvc.initialize();

  const context = new Context(libuvc);
  await context.initialize();

  const devices = await context.getDeviceList();

  if (!devices.length) {
    return;
  }

  const { device } = await prompts({
    type: "select",
    name: "device",
    choices: await Promise.all(
      devices.map(async (device) => ({
        title: await device.getDescriptor().then(async (d) => {
          await d.initialize();
          return d.productName;
        }),
        value: device,
      }))
    ),
    message: "Select the device:",
  });

  await device.initialize();

  const deviceHandle = await device.open();
  await deviceHandle.initialize();

  const controls = new Controls(libuvc, deviceHandle);
  await controls.initialize();

  const UVC_AUTO_EXPOSURE_MODE_AUTO = 2;
  const UVC_AUTO_EXPOSURE_MODE_APERTURE_PRIORITY = 8;

  try {
    await controls.ae_mode.set(UVC_AUTO_EXPOSURE_MODE_AUTO);
  } catch (error) {
    if (error.code === "UVC_ERROR_PIPE") {
      await controls.ae_mode.set(UVC_AUTO_EXPOSURE_MODE_APERTURE_PRIORITY);
    } else {
      throw error;
    }
  }

  const frameStreamer = new FrameStreamer(
    libuvc,
    deviceHandle,
    libuvc.constants.uvc_frame_format.UVC_FRAME_FORMAT_MJPEG,
    1280,
    720,
    30
  );
  const frameStream = await frameStreamer.initialize();

  frameStream.pipe(
    callback((error, data) => {
      if (error) {
        return;
      }

      debugger;
    })
  );
}

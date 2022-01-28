#!/usr/bin/env node --loader ts-node/esm --experimental-modules --es-module-specifier-resolution=node

import commander, { Command } from "commander";

import { SendInstance } from "ndi.js";
import fileSignalTest from "./sources/file";
import randomSignalTest from "./sources/random";
import uvcSignalTest from "./sources/uvc";
import webcamSignalTest from "./sources/webcam";

const { createCommand, program } = commander;

async function main() {
  const processAction =
    (
      action: (sendInstance: SendInstance, options: any, ...args: any[]) => void
    ) =>
    (...args: any[]) => {
      
      const options = args.find(arg => typeof arg === 'object');
      const command = args.find(arg => typeof arg === 'object' && arg.constructor === Command);
      
      const optionsIndex = args.findIndex(arg => typeof arg === 'object');
      const commandArgs = args.slice(0, optionsIndex);
      
      let sendInstance = new SendInstance();
      sendInstance.initialize({
        name: options.sourceName ?? `ndi.js ${command.name()}`,
        ...(!options.video ? { clockAudio: true, clockVideo: false } : {}),
      });

      action(sendInstance, options, ...commandArgs);
    };

  await program
    .version("0.0.1")
    .option("-s, --source-name", "video source name")
    .addCommand(
      createCommand("random")
        .description("Sends a random video signal")
        .argument(
          "[seconds]",
          "The number of seconds to send out the signal",
          "5"
        )
        .option("-v, --video", "Include video", true)
        .option("-f, --frames <frames>", "Number of frames per second", "60")
        .option("-w, --width <width>", "Width of video sample", "1920")
        .option("-h, --height <height>", "Height of video sample", "1080")
        .option("-V, --no-video", "Disable video")
        .option("-a, --audio", "Include audio", true)
        .option("-c, --channels <channels>", "Number of channels", "2")
        .option("-r, --sample-rate <sampleRate>", "Number of channels", "48000")
        .option("-A, --no-audio", "Disable audio")
        .action(processAction(randomSignalTest))
    )
    .addCommand(createCommand("webcam").action(processAction(webcamSignalTest)))
    .addCommand(
      createCommand("uvc")
        .action(processAction(uvcSignalTest))
        .description("Sends a UVC device stream")
        .option("-A, --no-audio", "Disable audio")
    )
    .addCommand(
      createCommand("file")
        .description("Sends a signal based on a video file")
        .argument("<path>", "The path to the file")
        .action(processAction(fileSignalTest))
    )
    .parseAsync();
}

main();

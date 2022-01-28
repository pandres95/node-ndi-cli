import { isAbsolute, resolve } from "path";

import { SendInstance } from "ndi.js";
import { cwd } from "process";

export default async function fileSignalTest(
  sendInstance: SendInstance,
  inputPath: string
) {
  const path = isAbsolute(inputPath) ? inputPath : resolve(cwd(), inputPath);
}

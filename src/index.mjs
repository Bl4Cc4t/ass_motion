import minimist from "minimist"

import { main } from "./main"
import { logger } from "./logger"
import { version } from "../package.json"

const usage = `ass_motion v${version}
Usage
  $ ass_motion [options] <file.ass>

Options
  --outputDir    -o    Specify the output directory
  --outputSuffix -s    Specify the suffix with which the output should be saved
  --keyframeDir  -k    Specify where to search for the keyframe files
  --keyPrefix    -p    Specify the prefix of to-be-transformed lines

Example
  $ ass_motion -o "~/Documents/my_cool_stuff" -p "nge_21" path/to/subtitle/sub.ass`

let args = minimist(process.argv.slice(2), {
  string: [
    "outputDir",
    "outputSuffix",
    "keyframeDir",
    "effectPrefix"
  ],
  boolean: [
    "help",
    "version"
  ],
  alias: {
    h: "help",
    v: "version",
    o: "outputDir",
    s: "outputSuffix",
    k: "keyframeDir",
    e: "effectPrefix"
  },
  default: {
    outputDir: ".",
    outputSuffix: "_tracked",
    keyframeDir: "../mocha/",
    effectPrefix: ""

  }
})

if (args.help) {
  logger.info(usage)
} else if (args.version) {
  logger.info(`ass_motion v${version}`)
} else if (args._[0]) {
  main(args)
} else {
  logger.info(usage)
}

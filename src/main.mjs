import assc from "ass-compiler"
import fs from "fs"
import path from "path"
import _ from "underscore"
import _s from "underscore.string"

import { apply } from "./apply"
import { compile2ass } from "./compile_to_ass"
import { parseKeyframeData } from "./keyframe_parser"
import { logger } from "./logger"
import { findFile, getEffectStrings } from "./util"

export function main(flags) {

  // test flags for debugging
  // flags = flags || {
  //   _: [
  //     "test/sub/test.ass"
  //   ],
  //   keyPrefix:    "",
  //   outputSuffix: "_tracked",
  //   outputDir:    ".",
  //   keyframeDir:  "../mocha/"
  // }

  let assFile = flags._[0]
  // get absolute paths to directories
  let assDir  = assFile.match(/(.*)[\/\\]/)[1]
  let workDir = _s.startsWith(assFile, "/")           ? assDir            : path.join(process.cwd(), assDir)
  let keyDir  = _s.startsWith(flags.keyframeDir, "/") ? flags.keyframeDir : path.join(workDir, flags.keyframeDir)
  let outDir  = _s.startsWith(flags.outputDir, "/")   ? flags.outputDir   : path.join(workDir, flags.outputDir)

  fs.readFile(assFile, "utf8", function(err, data) {
    if (err) {
      logger.error(`Couldn’t open ${assFile}.`)
    } else {
      // create the ass object using ass-compiler
      let ass = assc.compile(data)

      // loop over all keyframe files specified in the ass
      let effectPromises = _.map(getEffectStrings(ass, flags.effectPrefix), function(effectString) {
        let e = effectString.split("~")
        e[1] = e[1] || ""
        let out = {
          raw: effectString,
          name: e[0],
          // create options from the effect string
          options: {
            reverse: e[1].match(/[rR]/) ? true : false
          }
        }
        return new Promise(function(resolve, reject) {
          findFile(keyDir, `${out.name}.txt`, function(err, keyFile) {
            if (err) {
              logger.error(`No matching keyframe file found for ${out.name}.`)
              process.exit()
            } else {
              fs.readFile(keyFile, "utf8", function(err, data) {
                // parse the keyframe file
                out.parsed = parseKeyframeData(data)
                resolve(out)
              }) // end readFile
            }
          }) // end findFile
        }) // end Promise
      })

      Promise.all(effectPromises).then(function(effects) {
        // apply the tracking onto the ass object
        effects.forEach(function(effect) {
          logger.info(`Applying ${effect.name}`)
          ass = apply(ass, effect, flags.fps)
        })
        if (effects.length) {
          // compile the ass object back and write to file
          fs.writeFile(path.join(outDir, `${path.basename(assFile, ".ass")}${flags.outputSuffix}.ass`), compile2ass(ass), "utf8", function(err) {
            if (err) {
              logger.error("An error occurred while writing.")
            } else {
              logger.info("Your .ass was saved.")
            }
          }) // end writeFile
        } else {
          logger.error("Nothing to do ¯\\_(ツ)_/¯")
        }
      }) // end Promise
    }
  }) // end readFile
}

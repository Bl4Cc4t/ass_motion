import _ from "underscore"

import { logger } from "./logger"
import { posMath, round2X } from "./math"
import { fad2fade, frameFromMs, getPosition, msFromFrame, rect2VectClip } from "./util"

export function apply(ass, effect) {
  // apply the motion instructions onto the .ass object

  let key             = effect.parsed
  let opt             = effect.options
  let baseAss         = JSON.parse(JSON.stringify(ass))
  let insertPosition  = 1

  // get lines
  for (let nr in baseAss.dialogues) {
    let line = baseAss.dialogues[nr]
    if (line.effect == effect.raw && !line.isComment) {
      // get times
      let start = frameFromMs(line.start)
      let end   = frameFromMs(line.end)
      let len   = end-start+1
      let lenMs = msFromFrame(len)

      // check if the inputs are equally long
      if (len == key.info.size) {
        let pos = getPosition(ass, line)

        // set current reference frame
        // if the reverse option is enabled, use the last frame
        let refFrm = opt.reverse ? len - 1 : 0

        // loop over all frames
        for (let frm = 0; frm < len; frm++) {

          // current state
          let cs = {
            // reference position
            refPos: {
              x: key.pos[refFrm].x,
              y: key.pos[refFrm].y
            },
            pos: {
              x: key.pos[frm].x,
              y: key.pos[frm].y
            },
            scaleRatio: {
              x: key.scale[frm].x / key.scale[refFrm].x,
              y: key.scale[frm].y / key.scale[refFrm].y
            },
            rotDiff: key.rot[frm] - key.rot[refFrm]
          }

          // clone original line
          let newLine = JSON.parse(JSON.stringify(line))

          // set new start/end
          newLine.start = Math.round(msFromFrame(start) + (msFromFrame(frm-1) + msFromFrame(frm)) / 2)
          newLine.end   = Math.round(msFromFrame(start) + (msFromFrame(frm) + msFromFrame(frm+1)) / 2)

          // delete move instruction if applicable
          if (line.move) {
            _.omit(line, "move")
          }
          // handle new position
          newLine.pos   = newLine.pos || {}
          newLine.pos = posMath(pos, cs)

          // handle org
          if (line.org) {
            newLine.org = posMath(line.org, cs)
          }

          // handle fade
          if (line.fade) {
            let newFade = JSON.parse(JSON.stringify(line.fade))
            if (line.fade.type == "fad") {
              newFade = fad2fade(line.fade, lenMs)
            }
            for (let i = 1; i <= 4; i++) {
              newFade[`t${i}`] -= msFromFrame(frm)
            }
            newLine.fade = newFade
          }

          // handle clip
          if (line.clip) {
            let newClip = JSON.parse(JSON.stringify(line.clip))
            // convert to vector clip
            if (line.clip.dots) {
              newClip = rect2VectClip(line.clip)
            }
            newClip.drawing.instructions = _.map(line.clip.drawing.instructions, function(instr) {
              return {
                type: instr.type,
                points: _.map(instr.points, function(point) {
                          return posMath(point, cs)
                        })
              }
            })
            newLine.clip = newClip
          }

          // handle fragments
          newLine.slices[0].fragments = _.map(newLine.slices[0].fragments, function(newFrag, i) {
            let frag = line.slices[0].fragments[i]

            function getDefaultVal(tag) {
              return frag.tag[tag] || ass.styles[line.slices[0].style].tag[tag]
            }

            // scaling
            if (cs.scaleRatio.x) {
              newFrag.tag.fscx  = round2X(getDefaultVal("fscx")  * cs.scaleRatio.x, 3)
              newFrag.tag.xbord = round2X(getDefaultVal("xbord") * cs.scaleRatio.x, 3)
              newFrag.tag.xshad = round2X(getDefaultVal("xshad") * cs.scaleRatio.x, 3)
            }
            if (cs.scaleRatio.y) {
              newFrag.tag.fscy  = round2X(getDefaultVal("fscy")  * cs.scaleRatio.y, 3)
              newFrag.tag.ybord = round2X(getDefaultVal("ybord") * cs.scaleRatio.y, 3)
              newFrag.tag.yshad = round2X(getDefaultVal("yshad") * cs.scaleRatio.y, 3)
            }
            if (frag.tag.blur && (cs.scaleRatio.x || cs.scaleRatio.y)) {
              newFrag.tag.blur = round2X(frag.tag.blur * (cs.scaleRatio.x + cs.scaleRatio.y) / 2, 3)
            }

            // rotation
            if (cs.rotDiff) {
              newFrag.tag.frz  = round2X(frag.tag.frz || 0 + cs.rotDiff, 3)
            }

            // transforms
            if (frag.tag.t) {
              for (let t of newFrag.tag.t) {
                t.t1 -= msFromFrame(frm)
                t.t2 -= msFromFrame(frm)
              }
            }
            return newFrag
          })

          // insert new line
          ass.dialogues.splice(insertPosition, 0, newLine)
          insertPosition++
        }
        // set original line as comment
        ass.dialogues[nr].isComment = true
      } else {
        logger.error(`Invalid line length @ line ${nr}! Expected ${key.info.size}, got ${len}`)
      }
    }
    insertPosition++
  }
  return ass
}

import fs from "fs"
import path from "path"
import _ from "underscore"
import _s from "underscore.string"

import { logger } from "./logger"

export function ms2assTime(ms) {
  function pp(d) {
    return d<=9 ? `0${d}` : d
  }
  let d = new Date(ms)
  return `${d.getHours()-1}:${pp(d.getMinutes())}:${pp(d.getSeconds())}.${pp(Math.round(d.getMilliseconds() * 0.1))}`
}

export function decompileInlineTags(tag, data) {
  // handle transform array
  if (tag == "t") {
    let out = ""
    _.each(data, function(t) {
      out += `\\t(${t.t1},${t.t2},${t.accel},`
      for (let i in t.tag) {
        out += decompileInlineTags(i, t.tag[i])
      }
      out += ")"
    })
    return out
  // normal tags
  } else {
    let colorTags = [ "alpha", "a1", "a2", "a3", "a4", "c1", "c2", "c3", "c4" ]
    // reverse color tags (a1 -> 1a, etc.) and add &Hxxxxxx& style if applicable
    return `\\${tag.match(/\d+/g) ? _s.reverse(tag) : tag}${colorTags.includes(tag) ? `&H${data}&` : data}`
  }
}

export function getDrawingString(d) {
  let out = ""
  for (let i of d.instructions) {
    out += ` ${i.type.toLowerCase()}`
    for (let p of i.points) {
      out += ` ${p.x} ${p.y}`
    }
  }
  return out.slice(1)
}

export function frameFromMs(fps, ms) {
  // fps = fps || 23.976
  return Math.round(ms/(1000/fps))
}

export function msFromFrame(fps, f) {
  f = f > 0 ? f : 0
  // fps = fps || 23.976
  return Math.round((1000/fps)*f)
}

export function getPosition(ass, line) {
  let x, y
  if (line.pos) {
    x = line.pos.x
    y = line.pos.y
  } else if (line.move) {
    x = line.move.x1
    y = line.move.y1
  } else {
    let w = ass.width
    let h = ass.height
    let m = ass.info.margin
    let a = line.alignment

    if ([ 1, 4, 7 ].includes(a)) {
      x = m.left
    } else if ([ 2, 5, 8 ].includes(a)) {
      x = w/2
    } else if ([ 3, 6, 9 ].includes(a)) {
      x = w-m.right
    }
    if ([ 7, 8, 9 ].includes(a)) {
      y = m.vertical
    } else if ([ 4, 5, 6 ].includes(a)) {
      y = h/2
    } else if ([ 1, 2, 3 ].includes(a)) {
      y = h-m.vertical
    }
  }
  return { x, y }
}

export function fad2fade(fad, len) {
  return {
    type: "fade",
    a1:   255,
    a2:   0,
    a3:   255,
    t1:   0,
    t2:   fad.t1,
    t3:   len - fad.t2,
    t4:   len
  }
}

export function getEffectStrings(ass, prefix) {
  let effects = []
  _.each(ass.dialogues, function(line) {
    if (line.effect && !effects.includes(line.effect) && _s.startsWith(line.effect, prefix) && !line.isComment) {
      effects.push(line.effect)
    }
  })
  return effects
}

export function findFile(base, name, callback, files) {
  // https://gist.github.com/victorsollozzo/4134793
  files = files || fs.readdirSync(base)
  let found = false

  files.forEach(function (file) {
    let newbase = path.join(base, file)
    if (fs.statSync(newbase).isDirectory()) {
      recFindByExt(newbase, name, callback, fs.readdirSync(newbase))
    } else {
      if (file == name) {
        callback(false, newbase)
        found = true
      }
    }
  })
  if (!found) {
    callback(true)
  }
}

export function rect2VectClip(clip) {
  clip.drawing = {
    instructions: [{
      type: "M",
      points: [{
        x: clip.x1,
        y: clip.y1
      }]
    }, {
      type: "L",
      points: [{
        x: clip.x2,
        y: clip.y1
      }, {
        x: clip.x2,
        y: clip.y2
      }, {
        x: clip.x1,
        y: clip.y2
      }]
    }],
    d: `M${clip.x1},${clip.y1}L${clip.x2},${clip.y1},${clip.x2},${clip.y2},${clip.x1},${clip.y2}`,
    minX: clip.x1,
    minY: clip.y1,
    width: clip.x2 - clip.x1,
    height: clip.y2 - clip.y1
  }
  clip.dots = null
  return clip
}

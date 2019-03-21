export function parseKeyframeData(data) {
  let lines = data.split(/\r?\n/)
  if (lines[0] != "Adobe After Effects 6.0 Keyframe Data") {
    return null
  }
  function pn(l, n) {
    // parse number
    n = n || 0
    return parseFloat(l.match(/[\d\.]+/g)[n])
  }
  let out = {
    info: {
      fps:    pn(lines[2]),
      width:  pn(lines[3]),
      height: pn(lines[4]),
      aspectRatio:  {
        source: pn(lines[5]),
        comp:   pn(lines[6]),
      }
    },
    pos: [],
    scale: [],
    rot: []
  }
  let section = ""
  for (let line of lines) {
    line = line.trim()
    if ([ "Position", "Scale", "Rotation"].includes(line)) {
      section = line
    } else {
      if (line.charAt(0).match(/(\d)/)) {
        switch (section) {
          case "Position":
            out.pos.push({
              x: pn(line, 1),
              y: pn(line, 2),
              z: pn(line, 3),
            })
            break
          case "Scale":
            out.scale.push({
              x: pn(line, 1),
              y: pn(line, 2),
              z: pn(line, 3),
            })
            break
          case "Rotation":
            out.rot.push(-pn(line, 1))
            break
        }
      }
    }
  }
  out.info.size = out.pos.length
  return out
}

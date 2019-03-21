export function round2X(num, x) {
  //https://stackoverflow.com/a/18358056/7889988
  return +(Math.round(num+`e+${x}`)+`e-${x}`)
}

export function deg(rad) {
  // http://cwestblog.com/2012/11/12/javascript-degree-and-radian-conversion/
  return rad * 180 / Math.PI
}

export function rad(deg) {
  return deg * Math.PI / 180
}

export function dCos(r) {
  return Math.cos(rad(r))
}

export function dSin(r) {
  return Math.sin(rad(r))
}

export function dAtan(x, y) {
  return deg(Math.atan2(x, y))
}

export function posMath(pos, cs) {
  // MotionHandler.moon#252
  let x = (pos.x - cs.refPos.x) * cs.scaleRatio.x
  let y = (pos.y - cs.refPos.y) * cs.scaleRatio.y

  let radius = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  let alpha = dAtan(y, x)

  return {
    x: round2X(cs.pos.x + radius * dCos(alpha - cs.rotDiff), 3),
    y: round2X(cs.pos.y + radius * dSin(alpha - cs.rotDiff), 3)
  }

}

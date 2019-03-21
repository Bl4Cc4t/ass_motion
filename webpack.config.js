const path = require("path")
const webpack = require("webpack")

module.exports = {
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "ass_motion.js",
    libraryTarget: "commonjs2"
  },
  target: "node",
  // optimization: {
  //   minimize: false
  // },
}

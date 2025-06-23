const path = require("path");

module.exports = {
  entry: "./netlify/functions/server.js",
  target: "node",
  output: {
    path: path.resolve(__dirname, "functions-build"),
    filename: "server.js",
    libraryTarget: "commonjs2"
  },
  mode: "production",
};

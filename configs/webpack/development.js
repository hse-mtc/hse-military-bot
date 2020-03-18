const merge = require("webpack-merge");
const commonConfig = require("./common");

module.exports = merge(commonConfig, {
    mode: "development",
    debug: true,
    devtool: "inline-source-map",
    entry: ["./bin/starter.ts"],
});

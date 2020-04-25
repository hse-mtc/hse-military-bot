const Probe = require("pmx").probe();

Probe.metric({
    name: "ENV",
    value: () => {
        return process.env.ENV;
    },
});

module.exports = {
    apps: [
        {
            name: "hse-military-bot",
            script: "./dist/server.min.js",
            instances: 1,
        },
    ],
};

const fs = require("fs");

const generateTSConfig = (stagedFilenames) => {
    const tsconfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));
    tsconfig.include = stagedFilenames;
    fs.writeFileSync("tsconfig.ts-check.json", JSON.stringify(tsconfig));
    return "tsc --noEmit -p tsconfig.ts-check.json";
};

module.exports = {
    "*.{js,ts}": [
        "eslint --ext .js,.ts --fix --ignore-pattern '!<relative/path/to/filename>'",
        generateTSConfig,
        "npm run type-check",
        "npm run prettier:check",
        "npm run lint",
        "npm run test:coverage -- --passWithNoTests",
        "npm audit fix",
        "git add .",
    ],
};

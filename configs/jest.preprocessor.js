/* eslint-disable @typescript-eslint/no-var-requires */
const tsc = require("typescript");
const tsConfig = require("../tsconfig.json");

module.exports = {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    process(src, path) {
        const isTs = path.endsWith(".ts");
        const isTsx = path.endsWith(".tsx");
        const isTypescriptFile = isTs || isTsx;

        if (isTypescriptFile) {
            return tsc.transpileModule(src, {
                compilerOptions: tsConfig.compilerOptions,
                fileName: path,
            }).outputText;
        }

        return src;
    },
};

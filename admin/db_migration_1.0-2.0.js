const { writeFileSync } = require("fs");
const baseJson = require("./db-export.json");

const usersJson = baseJson.users;

const isEmpty = (obj) => {
    for (const _ in obj) {
        return false;
    }
    return true;
};

const cleanJson = Object.entries(usersJson).reduce(
    (accumulator, [key, object]) => {
        const { platoon, platoonType, ...rest } = object;

        if (isEmpty(rest)) {
            return accumulator;
        }

        return {
            ...accumulator,
            [key]: rest,
        };
    },
    {},
);

const restructuredJson = { users: cleanJson };
console.log(restructuredJson);

writeFileSync(
    "./hse-military-bot-users-2.0",
    JSON.stringify(restructuredJson, null, 2),
    "utf8",
);

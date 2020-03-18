import { resolveFirebaseConfigSync } from "@/resolvers/config";

import AbstractFirebase from ".";

class FirebaseSchedule extends AbstractFirebase {
    constructor() {
        super();
    }

    public setup() {
        this._init(resolveFirebaseConfigSync("users"));
    }
}

export default new FirebaseSchedule();

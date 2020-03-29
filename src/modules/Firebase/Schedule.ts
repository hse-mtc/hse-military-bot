import { resolveFirebaseConfigSync } from "@/resolvers/config";

import AbstractFirebase from ".";

class FirebaseSchedule extends AbstractFirebase {
    constructor() {
        super();
    }

    public setup(): void {
        this._init(resolveFirebaseConfigSync("schedule"));
    }
}

export default new FirebaseSchedule();

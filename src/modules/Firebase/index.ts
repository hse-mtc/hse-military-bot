import Firebase from "firebase-admin";

import createError from "@/helpers/createError";
import { TFirebaseConfig } from "@/resolvers/config";

export default abstract class AbstractFirebase {
    private _instance: Firebase.app.App;

    get instance() {
        return this._instance;
    }

    public FirebaseInitError = createError({
        name: "FirebaseInitError",
        message: "Cannot initialize Firebase",
    });

    protected _init({
        databaseURL,
        projectId,
        clientEmail,
        privateKey,
    }: TFirebaseConfig) {
        try {
            this._instance = Firebase.initializeApp({
                credential: Firebase.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
                databaseURL,
            });
        } catch (exception) {
            throw new this.FirebaseInitError();
        }
    }
}

export { default as FirebaseUsers } from "./Users";
export { default as FirebaseSchedule } from "./Schedule";

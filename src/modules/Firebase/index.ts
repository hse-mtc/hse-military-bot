import Firebase from "firebase-admin";

import BaseError from "@/modules/BaseError";
import { TFirebaseConfig } from "@/resolvers/config";

const FirebaseError = BaseError.createErrorGenerator("FirebaseInitError");

// TODO: добавить везде возвращаемые типы (прогнать ts по всем ворнингам)
export default abstract class AbstractFirebase {
    private _instance: Firebase.app.App;

    get instance(): Firebase.app.App {
        return this._instance;
    }

    protected _init({
        databaseURL,
        projectId,
        clientEmail,
        privateKey,
    }: TFirebaseConfig): void {
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
            throw FirebaseError("Cannot initialize Firebase");
        }
    }
}

export { default as FirebaseUsers } from "./Users";
export { default as FirebaseSchedule } from "./Schedule";

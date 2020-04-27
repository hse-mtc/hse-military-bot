import * as firebase from "firebase-admin";

import BaseError from "@/modules/BaseError";
import { TFirebaseConfig } from "@/resolvers/config";

const FirebaseError = BaseError.createErrorGenerator("FirebaseInitError");

export default abstract class AbstractFirebase {
    private _instance: firebase.database.Database;

    get instance(): firebase.database.Database {
        return this._instance;
    }

    protected _init({
        databaseURL,
        projectId,
        clientEmail,
        privateKey,
    }: TFirebaseConfig): void {
        try {
            this._instance = firebase
                .initializeApp({
                    credential: firebase.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                    databaseURL,
                })
                .database();
        } catch (exception) {
            throw FirebaseError("Cannot initialize Firebase");
        }
    }
}

export { default as FirebaseUsers } from "./Users";
export { default as FirebaseSchedule } from "./Schedule";

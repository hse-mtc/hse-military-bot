import createError from "@/helpers/createError";
import { FirebaseUsers } from "@/modules/Firebase";

const FirebaseUsersReadResolverError = createError({
    name: "FirebaseUsersReadResolverError",
    message: "Error occurred in resolveReadUserSelection resolver",
});

const FirebaseUsersWriteResolverError = createError({
    name: "FirebaseUsersWriteResolverError",
    message: "Error occurred in resolveWriteUserSelection resolver",
});

export async function resolveReadUserSelection(fromId: number, field: string) {
    const firebaseUsersInstance = FirebaseUsers.instance;

    try {
        return firebaseUsersInstance
            .database()
            .ref(`/users/${fromId}`)
            .once("value")
            .then(({ val }) => val()[field]);
    } catch (exception) {
        throw new FirebaseUsersReadResolverError();
    }
}

export async function resolveWriteUserSelection(
    chatId: number,
    field: string,
    value: string,
) {
    const firebaseUsersInstance = FirebaseUsers.instance;

    try {
        return await firebaseUsersInstance
            .database()
            .ref(`/users/${chatId}/${field}`)
            .set(value);
    } catch (exception) {
        throw new FirebaseUsersWriteResolverError();
    }
}

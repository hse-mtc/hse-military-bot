import BaseError from "@/modules/BaseError";
import { FirebaseUsers } from "@/modules/Firebase";

const FirebaseUsersResolverError = BaseError.createErrorGenerator(
    "FirebaseUsersResolverError",
);

export async function resolveReadUserSelection(
    fromId: number,
    field: string,
): Promise<string> {
    try {
        return FirebaseUsers.instance
            .ref(`/users/${fromId}`)
            .once("value")
            .then((snapshot) => snapshot.val()[field]);
    } catch (exception) {
        throw FirebaseUsersResolverError(
            "Error occurred in resolveReadUserSelection resolver",
        );
    }
}

export async function resolveWriteUserSelection(
    chatId: number,
    field: string,
    value: string,
): Promise<void> {
    try {
        return await FirebaseUsers.instance
            .ref(`/users/${chatId}/${field}`)
            .set(value);
    } catch (exception) {
        throw FirebaseUsersResolverError(
            "Error occurred in resolveWriteUserSelection resolver",
        );
    }
}

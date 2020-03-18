import createError from "@/helpers/createError";
import { FirebaseSchedule } from "@/modules/Firebase";

const FirebaseScheduleWriteResolverError = createError({
    name: "FirebaseScheduleWriteResolverError",
    message: "Error occurred in resolveWriteScheduleSelection resolver",
});

export const resolveWriteScheduleSelection = async (
    category: string,
    data: string,
) => {
    const firebaseScheduleInstance = FirebaseSchedule.instance;

    try {
        await firebaseScheduleInstance.database().ref(`/${category}`).set(data);
    } catch (err) {
        throw new FirebaseScheduleWriteResolverError();
    }
};

import makeError from "make-error";
import { FirebaseSchedule } from "@/modules/Firebase";

const FirebaseScheduleWriteResolverError = makeError(
    "FirebaseScheduleWriteResolverError",
);

export const resolveWriteScheduleSelection = async (
    category: string,
    data: string,
): Promise<void> => {
    try {
        await FirebaseSchedule.instance.ref(`/${category}`).set(data);
    } catch (err) {
        throw new FirebaseScheduleWriteResolverError(
            "Error occurred in resolveWriteScheduleSelection resolver",
        );
    }
};

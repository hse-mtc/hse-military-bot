import BaseError from "@/modules/BaseError";
import { FirebaseSchedule } from "@/modules/Firebase";

const FirebaseScheduleWriteResolverError = BaseError.createErrorGenerator(
    "FirebaseScheduleWriteResolverError",
);

export const resolveWriteScheduleSelection = async (
    category: string,
    data: string,
): Promise<void> => {
    try {
        await FirebaseSchedule.instance.ref(`/${category}`).set(data);
    } catch (err) {
        throw FirebaseScheduleWriteResolverError(
            "Error occurred in resolveWriteScheduleSelection resolver",
        );
    }
};

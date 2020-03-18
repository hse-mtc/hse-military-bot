type ErrorParams = {
    name: string;
    message: string;
};

export default function createError({ name, message }: ErrorParams) {
    return class BaseError extends Error {
        constructor() {
            super(message);

            this.name = name;

            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, BaseError);
            }
        }
    };
}

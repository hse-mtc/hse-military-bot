export default class BaseError extends Error {
    constructor(name: string, message: string) {
        super(message);

        this.name = name;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BaseError);
        }
    }

    static createErrorGenerator(name: string) {
        return (message: string): BaseError => {
            return new BaseError(name, message);
        };
    }
}

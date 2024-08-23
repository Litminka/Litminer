export default class BaseError extends Error {
    constructor(message: any) {
        super(message);
    }
}
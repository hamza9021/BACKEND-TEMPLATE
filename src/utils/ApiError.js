class ApiError extends Error {
    constructor(statusCode, message = "Something Went Wrong", errors = [] ) {
        super();
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.message = message;
        this.errors = errors;
    }
}

export { ApiError };

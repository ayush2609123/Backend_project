// Custom error class extending the built-in Error class
class ApiError extends Error {
    /**
     * Constructor to initialize the ApiError instance.
     * @param {number} statusCode - HTTP status code for the error (e.g., 404, 500).
     * @param {string} [message="Something went wrong"] - A human-readable error message.
     * @param {Array} [errors=[]] - An array of additional error details (optional).
     * @param {string} [stack=""] - The stack trace for the error (optional).
     */
    constructor( 
        statusCode,                // HTTP status code
        message = "Something went wrong", // Default error message
        errors = [],               // Additional error details
        stack = ""                 // Optional stack trace
    ) {
        super(message); // Call the parent Error class constructor with the error message
        this.statusCode = statusCode; // HTTP status code for the error
        this.data = null; // Placeholder for additional error-related data
        this.message = message; // Error message
        this.success = false; // Indicates the operation was unsuccessful
        this.errors = errors; // Stores additional error details
        
        // If a custom stack trace is provided, use it; otherwise, capture the current stack trace
        if (stack) {
            this.stack = stack; 
        } else {
            Error.captureStackTrace(this, this.constructor); 
        }
    }
}

// Export the ApiError class for use in other modules
export { ApiError };

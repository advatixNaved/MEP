export enum ApiMethods {
    GET = 'GET',
    POST = 'POST',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
    PUT = 'PUT'
};

export enum Operations {
    EDIT = 'edit',
    ADD = 'add',
    DELETE = 'delete',
    CANCELLED = 'cancelled',
    CANCEL = 'cancel',
};

export enum ToasterType {
    SUCCESS = 'success',
    WARNING = 'warning',
    INFO = 'information',
    ERROR = 'error',
    REQUIRED = 'required',
};

export enum ToasterTitle {
    SUCCESS = 'Success',
    WARNING = 'Warning',
    INFO = 'Information',
    ERROR = 'Error',
    REQUIRED = 'Required',
};

export const ERROR_MESSAGE = 'Something Went Wrong.';
export const SESSION_EXPIRED = 'The Session has Expired. Please Login Again.';
export const SOMETHING_WENT_WRONG_TRY_AGAIN = 'Something went wrong. Please try again.';
export const REQUIRED_FIELDS = "Please fill all the required fields.";
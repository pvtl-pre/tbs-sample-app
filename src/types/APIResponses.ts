export type ErrorResponse = {
    errors: string[];
};

export type FilepathListResponse = {
    paths: string[];
};

export type SecretCreatedResponse = {
    ref: string;
    url: string;
};

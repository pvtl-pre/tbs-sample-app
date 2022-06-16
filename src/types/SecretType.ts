type LooseSecretTypeAttributes = {
    choices?: string[];
    elementLabel?: string;
    elementName?: string;
    name: string;
    pattern?: string;
    placeholder?: string;
    type?: string;
};

export type LooseSecretType = {
    attributes: LooseSecretTypeAttributes[];
    id: number;
    getUri: string;
    label: string;
    postUri: string;
};

export type StrictSecretType = {
    attributes: StrictSecretTypeAttributes[];
    id: number;
    getUri: string;
    label: string;
    postUri: string;
};

export type StrictSecretTypeAttributes = {
    choices: string[];
    elementLabel: string;
    elementName: string;
    name: string;
    pattern: string;
    placeholder: string;
    type: string;
};

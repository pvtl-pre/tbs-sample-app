import {
    LooseSecretType,
    StrictSecretType,
    StrictSecretTypeAttributes
} from "../src/types/SecretType";
import { FilepathListResponse } from "../src/types/APIResponses";

export default function getSecretTypeOptions(secretTypes: LooseSecretType[]): StrictSecretType[] {
    return secretTypes.map((secretType) => {
        // Add optional attributes
        let attributes = secretType.attributes.map((attribute) => {
            let lowerCaseName = attribute.name.toLowerCase();

            let mergeAttrs = {
                elementLabel:
                    attribute.elementLabel ||
                    attribute.name.charAt(0).toUpperCase() + lowerCaseName.slice(1),
                elementName: "secret-" + lowerCaseName,
                type: attribute.type || "text"
            };

            let newAttrs: StrictSecretTypeAttributes = Object.assign(
                attribute,
                mergeAttrs
            ) as StrictSecretTypeAttributes;

            return newAttrs;
        });

        return {
            id: secretType.id,
            label: secretType.label,
            getUri: secretType.getUri,
            postUri: secretType.postUri,
            attributes: attributes
        };
    });
}

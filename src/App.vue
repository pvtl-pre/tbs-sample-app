<script setup lang="ts">
import { inject, reactive, ref } from "vue";
import getSecretTypeOptions from "../utils/inputs";
import TextInput from "./components/TextInput.vue";
import { StrictSecretType } from "./types/SecretType";
import { ErrorResponse, SecretCreatedResponse } from "./types/APIResponses";

// Set Window title
window.document.title = "Kryptowrite";

const createToast = inject("createToast");
const destinationFolder = ref<string>("");
const destinationFolders = ref<string[]>([]);
const form = ref<HTMLInputElement | null>(null);
const isLoadingFolders = ref<boolean>(true);
const isLoadingResponse = ref<boolean>(false);
const pullRequestUrl = ref<string>("");
const secretName = ref<string>("");

const footerItems = reactive([
    {
        btntype: "primary",
        key: "submit",
        label: "Submit Pull Request",
        onClick: () => {
            submitForm();
        },
        outline: false,
        spin: isLoadingResponse,
        type: "submit"
    }
]);

// Change to true once more views are added
const leftNavAlwaysOpen: boolean = false;
const leftnavItems = [
    { key: "kubernetes", label: "Kubernetes" }
    // { key: "spring", label: "Spring Cloud Config" }
];
const secretTypeDefault = {
    id: 0,
    label: "fake",
    attributes: [],
    getUri: "/",
    postUri: "/"
};

const secretType = ref<StrictSecretType>(secretTypeDefault);
const secretTypeOptions: StrictSecretType[] = getSecretTypeOptions([
    {
        id: 1,
        label: "Jenkins - Basic Auth Credential",
        attributes: [
            { name: "description" },
            { name: "username", pattern: "^[a-zA-Z0-9@_.\/-]+$" },
            { name: "password", type: "password" }
        ],
        getUri: "/api/jenkins/paths",
        postUri: "/api/jenkins/basic"
    }
]);

async function getSecretTypePaths(event: Event): Promise<void> {
    isLoadingFolders.value = true;

    destinationFolders.value = [];

    try {
        // @ts-ignore
        const response = await fetch(window.location.origin + event.getUri, {
            headers: { Accept: "application/json" }
        });

        if (response.status == 200) {
            const body = await response.json();

            destinationFolders.value = body.paths.map((path: string, index: number) => {
                return { id: index, label: path };
            });
        }

        if (response.status != 200) {
            // @ts-ignore
            await createToast({
                alerttype: "danger",
                msg: `Failed to get paths from API server. Error was: ${response.status} ${response.statusText}`,
                timer: 3000
            });
        }
    } catch (e) {
        console.log(e);
    } finally {
        isLoadingFolders.value = false;
    }
}

async function submitForm() {
    // @ts-ignore
    if (form.value.validate()) {
        isLoadingResponse.value = true;

        // @ts-ignore
        const formValues = form.value.getValues();

        const secretValues = Object.keys(formValues).reduce((accumulator, inputKey) => {
            if (inputKey.startsWith("secret-") && inputKey !== "secret-type-select") {
                // @ts-ignore
                accumulator[inputKey.split(/^secret-/)[1]] = formValues[inputKey];
            }
            return accumulator;
        }, {});

        secretName.value = formValues["secret-name"];
        const requestBody = {
            message: "Updated by Kryptowrite",
            path: `${formValues["destination-folder-select"]}/${secretName.value}.yaml`,
            secret: secretValues
        };

        // @ts-ignore
        const requestUri: string = secretTypeOptions.find((s) => {
            return s.label === formValues["secret-type-select"];
        }).postUri;

        let alertType: "success" | "danger" = "danger";
        let msg: string = "";

        try {
            const response = await fetch(window.location.origin + requestUri, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (response.status == 201) {
                let data: SecretCreatedResponse = await response.json();

                alertType = "success";
                msg = `Pull request submitted`;

                pullRequestUrl.value = data.url;
            }

            if (response.status == 403) {
                let data: ErrorResponse = await response.json();

                msg = `Secret generation failed. Error(s) was: ${data.errors}`;
            }

            if (![201, 403].includes(response.status)) {
                console.log(response);
                msg = `An unexpected error has occurred! Error was: ${response.status} ${response.statusText}`;
            }
        } catch (e) {
            console.log(e);
            // @ts-ignore
            msg = `An unknown error has occurred. Error was: ${e.message}`;
        }

        // @ts-ignore
        await createToast({
            alerttype: alertType,
            msg: msg,
            timer: 3000
        });

        if (alertType !== "danger") {
            // @ts-ignore
            await form.value.clear();
            secretType.value = secretTypeDefault;
            destinationFolders.value = [];
        }

        isLoadingResponse.value = false;
    }
}
</script>

<template>
    <div class="main">
        <orv-header title="Kryptowrite"></orv-header>
        <orv-leftnav
            active="kubernetes"
            :items="leftnavItems"
            :alwaysopen="leftNavAlwaysOpen"
            v-if="leftNavAlwaysOpen === true"
        />
        <orv-container :fluid="!leftNavAlwaysOpen">
            <orv-row :form="true">
                <orv-col :lg="5">
                    <orv-alert
                        v-if="pullRequestUrl !== ''"
                        alerttype="info"
                        :dismissible="true"
                        :showhr="false"
                    >
                        <a :href="pullRequestUrl">Click here</a>
                        to view the pull request for secret `{{ secretName }}`.
                    </orv-alert>
                </orv-col>
            </orv-row>
            <orv-form ref="form">
                <orv-row :form="true">
                    <orv-col col :lg="2">
                        <label for="secret-name">Secret Name</label>
                        <span class="required-symbol">*</span>
                        <orv-input
                            id="secret-name"
                            name="secret-name"
                            placeholder="my-secret"
                            pattern="^[a-z0-9-]+$"
                            required
                        />
                    </orv-col>
                    <orv-col col :lg="3">
                        <label for="secret-type-select">Secret Type</label>
                        <span class="required-symbol">*</span>
                        <orv-input
                            id="secret-type-select"
                            name="secret-type-select"
                            :setdata="secretTypeOptions"
                            v-model:setvalue="secretType"
                            v-on:change="getSecretTypePaths"
                            required
                        />
                    </orv-col>
                </orv-row>
                <div v-if="secretType.id !== 0">
                    <orv-row :form="true">
                        <orv-col col :lg="5">
                            <label for="destination-folder-select">Destination Folder</label>
                            <span class="required-symbol">*</span>
                            <orv-overlay :show="isLoadingFolders">
                                <orv-input
                                    id="destination-folder-select"
                                    name="destination-folder-select"
                                    :setdata="destinationFolders"
                                    v-model:setvalue="destinationFolder"
                                    required
                                />
                            </orv-overlay>
                        </orv-col>
                    </orv-row>
                    <orv-row :form="true" v-for="(attribute, index) in secretType.attributes">
                        <TextInput
                            :key="index"
                            :label="attribute.elementLabel"
                            :lg="5"
                            :name="attribute.elementName"
                            :pattern="attribute.pattern"
                            :placeholder="attribute.placeholder"
                            :type="attribute.type"
                            required
                        />
                    </orv-row>
                </div>
            </orv-form>
            <orv-col :lg="5" v-if="secretType.id !== 0">
                <orv-footer :items="footerItems" styles="align: right"></orv-footer>
                <orv-toast-manager></orv-toast-manager>
            </orv-col>
        </orv-container>
    </div>
</template>

<style>
.main {
    width: 100%;
    padding: 1rem 1rem 0 5rem;
    margin-right: auto;
    margin-left: auto;
    box-sizing: border-box;
}
h3 {
    font-size: 1.75rem;
    font-weight: 500;
    margin-top: 0;
    margin-bottom: 0.5rem;
}
label {
    font-weight: bold;
    display: inline-block;
    margin-bottom: 0.5rem;
}
.success-alert {
    margin-bottom: 1rem;
}
.date-time-row {
    display: grid;
    grid-template-columns: 33% 33%;
    column-gap: 1rem;
    margin-bottom: 2rem;
}
.submit-row {
    display: block;
}
.submit-row .orv-button-root {
    margin-top: 1rem;
    width: 25%;
}
.required-symbol {
    color: red;
}
.tool-tip {
    cursor: pointer;
}
.tool-tip .orv-icon-svg {
    display: flex;
    stroke-width: 1.5;
}
.orv-timepicker-helpmsg,
.orv-datepicker-helpmsg {
    font-size: 15px;
}
.orv-row,
.orv-form-row {
    display: grid;
    grid-template-columns: repeat(3, 33%);
    margin-bottom: 1.5rem;
}
</style>

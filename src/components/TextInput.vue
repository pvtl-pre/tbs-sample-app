<script setup lang="ts">
import { defineProps, PropType } from "vue";

const props = defineProps({
    label: {
        required: true,
        type: String
    },
    lg: {
        default: 4,
        type: Number as PropType<Number>
    },
    name: {
        required: true,
        type: String
    },
    pattern: {
        default: ".*",
        type: String
    },
    placeholder: {
        default: "",
        type: String
    },
    required: {
        default: false,
        type: Boolean as PropType<Boolean>
    },
    type: {
        default: "text",
        type: String,
        validator(value: string) {
            return [
                "color",
                "email",
                "file",
                "hidden",
                "image",
                "number",
                "password",
                "range",
                "tel",
                "text"
            ].includes(value);
        }
    }
});
</script>

<template>
    <orv-col col :lg="lg">
        <label :for="name">{{ label }}</label>
        <span v-if="required" class="required-symbol">*</span>
        <orv-input
            :id="name"
            :name="name"
            :placeholder="placeholder"
            :required="required"
            :pattern="pattern"
            :type="type"
        />
    </orv-col>
</template>

<style scoped>
/*
.orv-col {
    margin-bottom: 1.5rem;
}
*/
</style>

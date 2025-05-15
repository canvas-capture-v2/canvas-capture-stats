import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";


export default defineConfig([
    {
        files: ['**/*.{js}'],
        ignores: ['!src/*'],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            },
        },
        plugins: { js },
        extends: [
            'js/recommended',
        ]
    }
]);

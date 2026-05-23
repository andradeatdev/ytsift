import { defineConfig } from "eslint/config";
import userscripts from "eslint-plugin-userscripts";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default defineConfig([
	{
		extends: compat.extends(
			"eslint:recommended",
			"plugin:userscripts/recommended",
		),

		plugins: {
			userscripts,
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.greasemonkey,
				URLPattern: "readonly",
			},

			ecmaVersion: "latest",
			sourceType: "script",
		},

		rules: {
			"no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
				},
			],

			"no-undef": "error",
		},
	},
]);

import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      // Disable react-in-jsx-scope for React 17+ with new JSX transform
      "react/react-in-jsx-scope": "off",
      // reconfigure unescaped entities rule because it blocks " and ' by default
      // and those are commonly used
      "react/no-unescaped-entities": ["error", { "forbid": [">", "}"] }],
    }
  },
  globalIgnores([".output", ".wxt"])
]);

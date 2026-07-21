// ESLint flat config — Phase 0 baseline.
// Triết lý: `error` chỉ dành cho lỗi thật sự (chặn CI); nợ kỹ thuật hiện có
// (any, unused vars...) đặt ở `warn` để NHÌN THẤY được và siết dần ở các phase sau.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "android/**",
      "ios/**",
      "attached_assets/**",
      ".local/**",
      "migrations/**",
      "client/src/components/ui/**", // shadcn generated — không lint
      "**/*.config.{js,ts}",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["client/src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    rules: {
      // Nợ kỹ thuật baseline — warn để đo lường, siết ở Phase 3-4
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-empty": "warn",
      "prefer-const": "warn",
      "no-useless-escape": "warn",
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
);

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // El catálogo está escrito en español y usa comillas y apóstrofes en el texto
      // visible ("pro", ¿un ratio "crítico"?). React los renderiza tal cual y escapa
      // el contenido por su cuenta, así que avisar de ellos no corrige ningún defecto:
      // solo sepultaba el resto del lint bajo miles de líneas de ruido.
      // Se mantiene la vigilancia sobre `>` y `}`, los únicos que sí crean ambigüedad
      // con la sintaxis JSX.
      "react/no-unescaped-entities": ["error", { forbid: [">", "}"] }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

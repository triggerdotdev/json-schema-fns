import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import pkg from "./package.json";

export default [
  // CommonJS
  {
    input: "src/index.ts",
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
      commonjs(),
      nodeResolve({
        extensions: [".ts"],
      }),
      typescript(),
    ],
    output: [{ file: pkg.main, format: "cjs" }],
  },
  // ES
  {
    input: "src/index.ts",
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
      nodeResolve({
        extensions: [".ts"],
      }),
      typescript(),
    ],
    output: [{ file: pkg.module, format: "es" }],
  },
  {
    input: "src/2020.ts",
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
      commonjs(),
      nodeResolve({
        extensions: [".ts"],
      }),
      typescript(),
    ],
    output: [{ file: "lib/2020.js", format: "cjs" }],
  },
  // ES
  {
    input: "src/2020.ts",
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [
      nodeResolve({
        extensions: [".ts"],
      }),
      typescript(),
    ],
    output: [{ file: "lib/2020.mjs", format: "es" }],
  },
];

import { exec } from 'child_process';

await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist/src",
    target: "bun",
    format: "esm",
    minify: true
});

exec("tsc");
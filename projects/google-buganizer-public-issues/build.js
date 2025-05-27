import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";

const outdir = "dist";
const sourceRoot = "src";

await esbuild.build({
	entryPoints: ["./src/index.ts"],
	bundle: true,
	outdir,
	sourceRoot,
	target: "es2015",
	platform: "node",
	format: "iife",
	plugins: [],
	inject: ["polyfill.js"],
	minify: false,
	banner: { js: "// Generated code DO NOT EDIT\n" },
	entryNames: "zzz_bundle_[name]",
	chunkNames: "zzz_chunk_[name]",
	// See mocks in https://github.com/mjmlio/mjml/tree/master/packages/mjml-browser
});

// // copy index.html from prerendered output of SvelteKit application
// await fs.promises.copyFile(
// 	path.join(".svelte-kit", "output", "prerendered", "pages", "index.html"),
// 	path.join(outdir, "index.html"),
// );

const passThroughFiles = ["main.js", "appsscript.json"];

await Promise.all(
	passThroughFiles.map(async (file) =>
		fs.promises.copyFile(path.join(sourceRoot, file), path.join(outdir, file)),
	),
);

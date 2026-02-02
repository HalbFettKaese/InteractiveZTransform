import type { UserConfig } from "vite";

export default {
    root: "src",
    build: {
        outDir: "../build",
        emptyOutDir: true
    },
    base: "/InteractiveZTransform/"
} satisfies UserConfig;

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const BANNER = readFileSync(resolve(root, "src/meta.js"), "utf-8").trim();

// Dependency order — modules listed before their dependents.
// Each entry is relative to the project root.
const FILES = [
    "src/config.js",
    "src/ui/style-manager.js",
    "src/filters/base.js",
    "src/filters/text.js",
    "src/filters/watched.js",
    "src/filters/duration.js",
    "src/filters/views.js",
    "src/filters/age.js",
    "src/core/state.js",
    "src/parsers/language-rules.js",
    "src/dom/renderer.js",
    "src/parsers/duration.js",
    "src/parsers/views.js",
    "src/parsers/age.js",
    "src/dom/resolver.js",
    "src/ui/popover-manager.js",
    "src/core/filter-engine.js",
    "src/queue/queue-manager.js",
    "src/core/fetch-interceptor.js",
    "src/ui/builder.js",
    "src/core/app-observer.js",
    "src/index.js",
];

/**
 * Strips import/export statements that are only used for IDE support.
 * - `import ... from "..."` → removed entirely
 * - `export const/class/function/let` → `const/class/function/let`
 */
function stripModuleSyntax(source) {
    return source
        .replace(/^import .+$/gm, "")
        .replace(/^export (const|class|function|let)/gm, "$1")
        .replace(/^\n{2,}/gm, "\n")
        .trim();
}

const modules = FILES.map((file) => {
    const filePath = resolve(root, file);
    if (!existsSync(filePath)) return "";
    const raw = readFileSync(filePath, "utf-8");
    return stripModuleSyntax(raw);
}).filter((content) => content.length > 0);

const output = BANNER + "\n\n" + modules.join("\n\n") + "\n";

writeFileSync(resolve(root, "ytsift.user.js"), output);
console.log(`✓ Built ytsift.user.js (${output.length.toLocaleString()} bytes, ${FILES.length} modules)`);

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

/**
 * Compares the local package.json version against origin/main.
 * Exits with code 1 (blocking push) if the version was not bumped.
 */
function checkVersionBump() {
    const localPkg = JSON.parse(
        readFileSync(resolve(root, "package.json"), "utf-8"),
    );
    const localVersion = localPkg.version;

    let remoteVersion;
    try {
        const remotePkg = execSync("git show origin/main:package.json", {
            cwd: root,
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"],
        });
        remoteVersion = JSON.parse(remotePkg).version;
    } catch {
        // origin/main doesn't exist or package.json not found — first push, skip check
        console.log("⏭  No remote version found, skipping version check.");
        process.exit(0);
    }

    if (localVersion === remoteVersion) {
        console.error(
            `\n❌ Version not bumped! Local and remote are both ${localVersion}.`,
        );
        console.error(
            "   Update the version in package.json before pushing.\n",
        );
        process.exit(1);
    }

    console.log(
        `✓ Version bumped: ${remoteVersion} → ${localVersion}`,
    );
}

checkVersionBump();

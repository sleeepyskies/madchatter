import ky from "ky";

/**
 * In dev mode, we can assume the port and host from the environment are correct.
 * Thus for dev mode, we simply read these values.
 * In production mode, we cannot trust the port, as it can be chosen by the OS.
 * In this case however, we know that we are running a PyInstaller binary. This
 * will open the browser with the correct host and port in the URL, so we simply
 * read from there.
 */
function resolveBaseUrl(): string {
    const address = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
    const port = process.env.NEXT_PUBLIC_SERVER_PORT;

    if (address && port) {
        return new URL(`http://${address}:${port}/api`).toString();
    }

    if (typeof window !== "undefined") {
        return new URL("/api", window.location.origin).toString();
    }

    // dummy url, cannot throw here as then the build fails
    return "http://localhost/api/";
}

export const client = ky.create({
    prefix: resolveBaseUrl(),
    timeout: 100_000,
    retry: 1,
});

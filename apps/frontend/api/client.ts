import ky from "ky";

const address = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
const port = process.env.NEXT_PUBLIC_SERVER_PORT;

if (!address || !port) {
  throw new Error("Could not read server port or address from environment.");
}

export const serverOrigin = `http://${address}:${port}`;

const baseUrl = `${serverOrigin}/api`;

export const client = ky.create({
  prefix: baseUrl,
  timeout: 100_000,
  retry: 1,
});

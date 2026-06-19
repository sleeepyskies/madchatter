import ky from "ky";

const address = process.env.ADDRESS ?? "127.0.0.1";
const port = process.env.PORT ?? "8000";

if (!address) {
  throw new Error("Can not init api, server address is undefined");
}

if (!port) {
  throw new Error("Can not init api, server port is undefined");
}

const baseUrl = new URL(`http://${address}:${port}/api`).toString();

export const client = ky.create({
  prefix: baseUrl,
  timeout: 10_000,
  retry: 1,
});

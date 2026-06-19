import ky from "ky";

const address = process.env.ADDRESS;
const port = process.env.PORT;

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

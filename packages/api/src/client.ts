import ky from "ky";

const baseUrl = new URL(
    `http://${process.env.ADDRESS ?? "127.0.0.1"}:${process.env.SERVER_PORT ?? "8000"}/api`
).toString();

export const client = ky.create({
    prefix: baseUrl,
    timeout: 10_000,
    retry: 1,
});

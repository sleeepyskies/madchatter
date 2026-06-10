import ky from "ky";

const backendPort = process.env.SERVER_PORT || "8000";
const address = process.env.ADDRESS || "127.0.0.1";
const client = ky.create({prefix: `http://${address}:${backendPort}/api`});

export default client;

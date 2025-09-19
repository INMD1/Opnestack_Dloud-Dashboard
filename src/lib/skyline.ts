import createClient from "openapi-fetch";
import { paths } from "./skyline-api";

export function getSkylineClient(token: string) {
  return createClient<paths>({
    baseUrl: process.env.SKYLINE_API_URL,
    headers: {
      "Content-Type": "application/json",
      "Authorization": token,
    },
  });
}

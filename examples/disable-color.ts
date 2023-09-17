import { loggerMiddleware } from "../src/index";
import { Elysia } from "elysia";

new Elysia()
  .use(loggerMiddleware({ colorful: false }))
  .get("/", () => {})
  .listen(3000);

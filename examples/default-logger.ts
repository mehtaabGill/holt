import { loggerMiddleware } from "../src/index";
import { Elysia } from "elysia";

new Elysia()
  .use(loggerMiddleware())
  .get("/", () => {})
  .listen(3000);

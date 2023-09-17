import { loggerMiddleware } from "../src/index";
import { Elysia } from "elysia";

new Elysia()
  .use(loggerMiddleware({ format: 'Request Method: :method | Request Path: :path | Response Status: :status | User Agent: :header[user-agent]' }))
  .get("/", () => {})
  .listen(3000);

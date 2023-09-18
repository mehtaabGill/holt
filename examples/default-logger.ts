import { HoltLogger } from "../src/index";
import { Elysia } from "elysia";

new Elysia()
  .use(new HoltLogger().getLogger())
  .get("/", () => {})
  .listen(3000);

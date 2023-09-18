import { HoltLogger } from "../src/index";
import { Elysia } from "elysia";

new Elysia()
  .use(new HoltLogger({ colorful: false }).getLogger())
  .get("/", () => {})
  .listen(3000);

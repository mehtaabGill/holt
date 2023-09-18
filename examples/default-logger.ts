import { HoltLogger } from "../src/index";
import { Elysia } from "elysia";

new Elysia()
  .use(new HoltLogger().getLogger())
  .get("/healthy", ({ set }) => { set.status = 200 })
  .get("/redirect-somewhere", ({ set }) => { set.status = 304 })
  .get("/client-error", ({ set }) => { set.status = 400 })
  .get("/server-error", ({ set }) => { set.status = 503 })
  .listen(3000);

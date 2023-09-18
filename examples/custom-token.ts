import { HoltLogger } from "../src/index";
import { Elysia } from "elysia";

new Elysia()
  .use(
    new HoltLogger({
      format: ":method :path | :is-cached",
    })
      .token("is-cached", (ctx) => {
        return ctx.query["cache"] === "1"
          ? "Cached Request"
          : "Un-cached Request";
      })
      .getLogger()
  )
  .get("/", () => {})
  .listen(3000);

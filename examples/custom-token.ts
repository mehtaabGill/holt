import { HoltLogger } from "../src/index";
import { Elysia } from "elysia";

new Elysia()
  .use(
    new HoltLogger({
      format: ":method :path | :is-admin",
    })
      .token("is-admin", ({ headers }) => {
        return headers["x-admin-api-key"] === "admin-api-key-here"
          ? "Admin Request"
          : "User Request";
      })
      .getLogger()
  )
  .get("/", () => {})
  .listen(3000);

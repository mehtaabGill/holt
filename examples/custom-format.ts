import { HoltLogger } from "../src/index";
import { Elysia } from "elysia";

new Elysia()
  .use(
    new HoltLogger({
      format:
        "Request Method: :method | Request Path: :path | Response Status: :status | User Agent: :header[user-agent]",
    }).getLogger()
  )
  .get("/", () => {})
  .listen(3000);

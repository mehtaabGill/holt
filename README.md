# @tlscipher/holt

A highly configurable logger middleware for [ElysiaJS](https://elysiajs.com).

> Named after [Raymond Holt](https://en.wikipedia.org/wiki/List_of_Brooklyn_Nine-Nine_characters#Raymond_Holt) from Brooklyn Nine-Nine

![Demo Image](https://media.discordapp.net/attachments/1165434623988346910/1225669053725540402/image.png?ex=6621f842&is=660f8342&hm=5703cb4f7611629cbd3ce45604f3edece3d36d7fc329f6450255e33e29e0124b&=&format=webp&quality=lossless&width=1131&height=241)

## Installation
```bash
bun add @tlscipher/holt
```


## Usage
```ts
import { HoltLogger } from "@tlscipher/holt";
import { Elysia } from "elysia";

new Elysia()
  .use(new HoltLogger().getLogger())
  .get("/", () => {})
  .listen(3000);
```

## Configuration

### HoltLogger
The constructor for `HoltLogger` function accepts an optional parameter of type `HoltConfig`.
```ts
interface HoltConfig {
  format: string;
  colorful: boolean;
}
```
- `format` (Default: `":date | :method :path - :status (:request-duration ms)"`)
    - The `format` parameter allows you to customize the log output that is written to the console using tokens.

- `colorful` (Default: `true`)
    - The `colorful` parameter allows to specifiy a boolean value of wether or not you would like the logger output to be    color-coded based on the HTTP response status code.

### Possible Tokens for Format
- `:date` The time at which the response was sent.
    - Example output: `2023-09-16T21:15:04.516Z`
- `:method` The HTTP method that was used for the inbound request.
    - Example output: `GET`
- `:path` The path of the inbound HTTP request
    - Example output: `/health`
- `:request-duration` The difference in milliseconds from the time the request was received, to the time the response was sent
    - Example output: `4.28`

## Adding Headers to the Format
This package allows you to log any of the available incoming headers.
#### Format for header tokens:
- `:header[<header-key-here>]`

### Examples:
- `:header[user-agent]`
    - Example output: `PostmanRuntime/7.33.0`
- `:header[accept]`
    - Example output: `application/json`
- `:header[authorization]`
    - Example output: `Bearer auth_xxxxxx...`

## Custom Tokens
You can now add custom tokens to your logger using the `HoltLogger.token` function. The function accepts the following parameters:
- `token` (required string)
    - The string to be tokenized and used and the replacer in the format
- `extractFn` (required function)
    - The function will be given access to select properties of ELysia's context and must return the string value to replace the token in the format.

### Example Custom Token Usage
```ts
import { HoltLogger } from "@tlscipher/holt";
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
```

# @tlscipher/holt

A highly configurable logger middleware for [ElysiaJS](https://elysiajs.com).

> Named after [Raymond Holt](https://en.wikipedia.org/wiki/List_of_Brooklyn_Nine-Nine_characters#Raymond_Holt) from Brooklyn Nine-Nine
## Installation
```bash
bun add @tlscipher/holt
```

## Usage
```ts
import { Elysia } from "elysia";
import { loggerMiddleware } from '@tlscipher/holt';

const app = new Elysia()
    .use(loggerMiddleware())
    .get('/health', () => {
        return {
            healthy: true
        }
    })
    .listen(3000)
```

## Configuration

### HoltConfig
The `loggerMiddleware` function accepts an optional parameter of type `HoltConfig`.
```ts
interface HoltConfig {
  format: string;
  colorful: boolean;
}
```
- `format` (Default: `":date | :method :path - :status (:request-duration ms)"`)
    The `format` parameter allows you to customize the log output that is written to the console using tokens.

- `colorful` (Default: `true`)
    The `colorful` parameter allows to specifiy a boolean value of wether or not you would like the logger output to be    color-coded based on the HTTP response status code.

### Possible Tokens for Format
- `:date` - The time at which the response was sent.
    - Example output: `2023-09-16T21:15:04.516Z`
- `:method` - The HTTP method that was used for the inbound request.
    - Example output: `GET`
- `:path` - The path of the inbound HTTP request
    - Example output: `/health`
- `:request-duration` - The difference in milliseconds from the time the request was received, to the time the response was sent
    - Example output:

### Adding Headers to the Format
This package allows you to log any of the available incoming headers.
- Format for header tokens:
`:header[<header-key-here>]`
- Examples:
`:header[user-agent]` - Example output: `PostmanRuntime/7.33.0`
`:header[accept]` - Example output: `application/json`
`:header[authorization]` - Example output: `Bearer auth_xxxxxx...`
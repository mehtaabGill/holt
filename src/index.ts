import { Elysia } from "elysia";
import chalk from "chalk";
import process from "process";

export interface HoltConfig {
  format: string;
  colorful: boolean;
}

interface HeaderMatchPair {
  rawMatch: string;
  headerKey: string;
}

function defaultConfig(): HoltConfig {
  return {
    format:
      ":date | :method :path - :status (:request-duration ms) | :header[user-agent]",
    colorful: true,
  };
}

function extractHeaderKeysFromFormat(format: string): HeaderMatchPair[] {
  const regex = /:header\[(.*?)\]/g;

  const matches = format.match(regex);

  return matches
    ? matches.map((match) => {
        return {
          rawMatch: match,
          headerKey: match.match(/:header\[(.*?)\]/)![1],
        };
      })
    : [];
}

function getColorByConfig(config: HoltConfig, status?: number): Function {
  return config.colorful && status
    ? status >= 500
      ? chalk.red
      : status >= 400
      ? chalk.yellow
      : status >= 300
      ? chalk.cyan
      : status >= 200
      ? chalk.green
      : chalk.white
    : chalk.white;
}

export const loggerMiddleware = (config: HoltConfig = defaultConfig()) => {
  return new Elysia({ name: "holt" })
    .derive(async () => {
      return {
        _holtRequestStartTime: Date.now(),
      };
    })
    .onAfterHandle(({ request, path, set, _holtRequestStartTime }) => {
      let message = config.format
        .replaceAll(":date", new Date().toISOString())
        .replaceAll(":method", request.method)
        .replaceAll(":path", path)
        .replaceAll(
          ":status",
          set.status ? set.status.toString() : "<unknown status>"
        )
        .replaceAll(":request-duration", `${Date.now() - _holtRequestStartTime}`);

      for (const headerPair of extractHeaderKeysFromFormat(config.format)) {
        message = message.replaceAll(
          headerPair.rawMatch,
          request.headers.get(headerPair.headerKey) ?? "-"
        );
      }

      const colorFn = getColorByConfig(config, set.status);

      console.log(colorFn(message));
    });
};

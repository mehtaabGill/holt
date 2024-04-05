 import { Context } from "elysia";
 import chalk, { ChalkInstance } from "chalk";
import { Elysia } from "elysia";
import { StatusMap } from "./types";

type ExtractFn = (
  context: Pick<Context, "request" | "headers" | "body" | "path" | "set">
) => string;

export interface HoltConfig {
  format: string;
  colorful: boolean;
}

export interface HeaderMatchPair {
  rawMatch: string;
  headerKey: string;
}

export interface CustomToken {
  token: string;
  extractFn: ExtractFn;
}

export class HoltLogger {
  private static readonly DEFAULT_FORMAT =
    ":date | :method :path - :status (:request-duration ms)";
  private config: HoltConfig;
  private tokens: CustomToken[] = [];

  constructor(partialConfig: Partial<HoltConfig> = {}) {
    this.config = HoltLogger.configFromPartial(partialConfig);
  }

  public getLogger() {
    return new Elysia({ name: "@tlscipher/holt" })
      .derive({ as: 'global' }, async () => {
        return {
          _holtRequestStartTime: Date.now(),
        };
      })
      .onResponse({ as: 'global' }, ({ request, set, path, headers, body, _holtRequestStartTime }) => {
        let message = this.config.format
          .replaceAll(":date", new Date().toISOString())
          .replaceAll(":method", request.method)
          .replaceAll(":path", path)
          .replaceAll(
            ":status",
            set.status ? set.status.toString() : "<unknown status>"
          )
          .replaceAll(
            ":request-duration",
            `${Date.now() - _holtRequestStartTime}`
          );

        for (const token of this.tokens) {
          message = message.replaceAll(
            HoltLogger.tokenize(token.token),
            token.extractFn({
              request,
              headers,
              set,
              path,
              body,
            })
          );
        }

        for (const headerPair of HoltLogger.extractHeaderKeysFromFormat(
          this.config.format
        )) {
          message = message.replaceAll(
            headerPair.rawMatch,
            request.headers.get(headerPair.headerKey) ?? "-"
          );
        }

        if (!this.config.colorful || !set.status) {
          console.log(message);
        } else {
          const colorFn = HoltLogger.getColorByConfig(set.status);
          console.log(colorFn(message));
        }
      });
  }

  public token(token: string, extractFn: ExtractFn): HoltLogger {
    this.tokens.push({
      token,
      extractFn,
    });

    return this;
  }

  private static tokenize(token: string): string {
    return `:${token}`;
  }

  private static configFromPartial(
    partialConfig: Partial<HoltConfig>
  ): HoltConfig {
    const colorful = partialConfig.colorful === undefined ? true : false;
    const format =
      partialConfig.format === undefined
        ? HoltLogger.DEFAULT_FORMAT
        : partialConfig.format;

    return {
      format,
      colorful,
    };
  }

  private static extractHeaderKeysFromFormat(
    format: string
  ): HeaderMatchPair[] {
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

  private static getColorByConfig(
    status: number | keyof typeof StatusMap
  ): ChalkInstance {
    const intStatus = typeof status === "number" ? status : StatusMap[status];
    switch (true) {
      case intStatus >= 500:
        return chalk.red;
      case intStatus >= 400:
        return chalk.yellow;
      case intStatus >= 300:
        return chalk.cyan;
      case intStatus >= 200:
        return chalk.green;
      default:
        return chalk.white;
    }
  }
}

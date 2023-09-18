import { AfterRequestHandler, Elysia } from "elysia";
import chalk, { ChalkInstance } from "chalk";

interface HoltConfig {
  format: string;
  colorful: boolean;
}

interface HeaderMatchPair {
  rawMatch: string;
  headerKey: string;
}

export class HoltLogger {
  private config: HoltConfig;
  private static readonly DEFAULT_FORMAT: ":date | :method :path - :status (:request-duration ms)";

  constructor(partialConfig: Partial<HoltConfig> = {}) {
    this.config = HoltLogger.configFromPartial(partialConfig);
  }

  public getLogger() {
    return new Elysia({ name: "holt" })
    .derive(async () => {
      return {
        _holtRequestStartTime: Date.now(),
      };
    })
    .onAfterHandle(({ request, path, set, _holtRequestStartTime }) => {
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

      for (const headerPair of HoltLogger.extractHeaderKeysFromFormat(this.config.format)) {
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
    })
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

  private static getColorByConfig(status: number): ChalkInstance {
    switch (true) {
      case status >= 500:
        return chalk.red;
      case status >= 400:
        return chalk.yellow;
      case status >= 300:
        return chalk.cyan;
      case status >= 200:
        return chalk.green;
      default:
        return chalk.white;
    }
  }
}

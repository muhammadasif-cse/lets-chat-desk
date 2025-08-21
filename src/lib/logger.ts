type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
    };

    this.logs.push(entry);

    if (import.meta.env.DEV) {
      const method = level === "debug" ? "log" : level;
      console[method](`[${level.toUpperCase()}] ${message}`, data || "");
    }

    if (import.meta.env.PROD && (level === "error" || level === "warn")) {
      console[level](`[${level.toUpperCase()}] ${message}`, data || "");
      // TODO: Send to external logging service
    }

    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data);
  }

  info(message: string, data?: any) {
    this.log("info", message, data);
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  error(message: string, data?: any) {
    this.log("error", message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();
export default Logger;

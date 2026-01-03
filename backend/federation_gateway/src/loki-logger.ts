interface LokiStream {
  stream: Record<string, string>;
  values: Array<[string, string]>;
}

export class LokiLogger {
  private lokiUrl: string;
  private labels: Record<string, string>;
  private buffer: Array<[string, string, string]> = [];
  private flushInterval: NodeJS.Timeout;

  constructor(serviceName: string, lokiUrl?: string) {
    this.lokiUrl = lokiUrl || process.env.LOKI_URL || 'https://devplayfitloki.azurewebsites.net';
    this.labels = {
      job: 'playfit',
      service: serviceName,
      env: process.env.NODE_ENV || 'production',
    };

    // Flush logs every 5 seconds
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }

  log(message: any, context?: string) {
    this.addLog('info', message, context);
    console.log(`[${context || 'LOG'}] ${message}`);
  }

  error(message: any, trace?: string, context?: string) {
    this.addLog('error', `${message} ${trace || ''}`, context);
    console.error(`[${context || 'ERROR'}] ${message}`, trace);
  }

  warn(message: any, context?: string) {
    this.addLog('warn', message, context);
    console.warn(`[${context || 'WARN'}] ${message}`);
  }

  debug(message: any, context?: string) {
    this.addLog('debug', message, context);
    console.debug(`[${context || 'DEBUG'}] ${message}`);
  }

  verbose(message: any, context?: string) {
    this.addLog('verbose', message, context);
    console.log(`[${context || 'VERBOSE'}] ${message}`);
  }

  private addLog(level: string, message: any, context?: string) {
    const timestamp = Date.now() * 1000000; // Nanoseconds
    const logMessage = typeof message === 'object' ? JSON.stringify(message) : String(message);
    const logLine = JSON.stringify({
      level,
      message: logMessage,
      context: context || 'Application',
      timestamp: new Date().toISOString(),
    });

    this.buffer.push([String(timestamp), logLine, level]);

    // Flush immediately if buffer is large
    if (this.buffer.length >= 100) {
      this.flush();
    }
  }

  private async flush() {
    if (this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    try {
      const streams: LokiStream[] = [{
        stream: { ...this.labels },
        values: logs.map(([ts, msg]) => [ts, msg]),
      }];

      const response = await fetch(`${this.lokiUrl}/loki/api/v1/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ streams }),
      });

      if (!response.ok) {
        console.error(`Failed to push logs to Loki: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error pushing logs to Loki:', error);
      // Put logs back in buffer if they failed to send
      this.buffer.unshift(...logs);
      // Keep buffer size reasonable
      if (this.buffer.length > 1000) {
        this.buffer = this.buffer.slice(-1000);
      }
    }
  }

  async onApplicationShutdown() {
    clearInterval(this.flushInterval);
    await this.flush();
  }
}

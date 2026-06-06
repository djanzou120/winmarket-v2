// Health endpoint service pour monitoring externe
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { logger } from './logger';
import { performHealthCheck } from './health';

export class HealthEndpointService {
  private server?: ReturnType<typeof createServer>;
  private port: number;

  constructor(port: number = 4001) {
    this.port = port;
  }

  async start(): Promise<void> {
    this.server = createServer(this.handleRequest.bind(this));

    return new Promise((resolve, reject) => {
      this.server!.listen(this.port, (err?: Error) => {
        if (err) {
          reject(err);
        } else {
          logger.info(`🔍 Health endpoint listening on http://localhost:${this.port}/health`);
          resolve();
        }
      });
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          logger.info('✅ Health endpoint stopped');
          resolve();
        });
      });
    }
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = req.url;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    try {
      switch (url) {
        case '/health':
          await this.handleHealthCheck(res);
          break;
        case '/ready':
          await this.handleReadinessCheck(res);
          break;
        case '/live':
          await this.handleLivenessCheck(res);
          break;
        default:
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Not found',
            availableEndpoints: ['/health', '/ready', '/live']
          }));
      }
    } catch (error) {
      logger.error('Health endpoint error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal server error',
        status: 'unhealthy'
      }));
    }
  }

  private async handleHealthCheck(res: ServerResponse): Promise<void> {
    const healthReport = await performHealthCheck();
    const statusCode = healthReport.status === 'healthy' ? 200 :
                      healthReport.status === 'degraded' ? 200 : 503;

    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: healthReport.status,
      timestamp: healthReport.timestamp,
      uptime: process.uptime(),
      services: healthReport.services,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }));
  }

  private async handleReadinessCheck(res: ServerResponse): Promise<void> {
    const healthReport = await performHealthCheck();

    // Readiness check - all critical services must be healthy
    const criticalServices = ['database'];
    const criticalHealthy = healthReport.services
      .filter(s => criticalServices.includes(s.service))
      .every(s => s.status === 'healthy');

    const statusCode = criticalHealthy ? 200 : 503;

    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ready: criticalHealthy,
      timestamp: healthReport.timestamp,
      criticalServices: healthReport.services.filter(s => criticalServices.includes(s.service))
    }));
  }

  private async handleLivenessCheck(res: ServerResponse): Promise<void> {
    // Liveness check - basic process health
    const isAlive = process.uptime() > 0;

    res.writeHead(isAlive ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      alive: isAlive,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid
    }));
  }
}
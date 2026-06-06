import { logger } from "./logger";
import { checkDatabaseHealth } from "./database/connection";
import { cache } from "./cache";
import { storage } from "./storage";

export interface HealthCheck {
  service: string;
  status: "healthy" | "unhealthy";
  message?: string;
  responseTime?: number;
  timestamp: string;
}

export interface HealthReport {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  services: HealthCheck[];
  version: string;
}

// Health check functions
async function checkService(
  name: string,
  checkFn: () => Promise<boolean>
): Promise<HealthCheck> {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  try {
    const isHealthy = await checkFn();
    const responseTime = Date.now() - start;

    return {
      service: name,
      status: isHealthy ? "healthy" : "unhealthy",
      message: isHealthy ? "OK" : "Service unavailable",
      responseTime,
      timestamp,
    };
  } catch (error) {
    const responseTime = Date.now() - start;
    logger.error(`Health check failed for ${name}:`, error);

    return {
      service: name,
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Unknown error",
      responseTime,
      timestamp,
    };
  }
}

// Comprehensive health check
export async function performHealthCheck(): Promise<HealthReport> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();
  const version = process.env.npm_package_version || "unknown";

  logger.info("Performing health check...");

  // Run all service health checks in parallel
  const serviceChecks = await Promise.all([
    checkService("database", checkDatabaseHealth),
    checkService("redis", () => cache.ping()),
    checkService("storage", () => storage.ping()),
  ]);

  // Determine overall status
  const unhealthyServices = serviceChecks.filter(check => check.status === "unhealthy");
  let overallStatus: "healthy" | "unhealthy" | "degraded";

  if (unhealthyServices.length === 0) {
    overallStatus = "healthy";
  } else if (unhealthyServices.length === serviceChecks.length) {
    overallStatus = "unhealthy";
  } else {
    overallStatus = "degraded";
  }

  const report: HealthReport = {
    status: overallStatus,
    timestamp,
    uptime,
    services: serviceChecks,
    version,
  };

  const checkDuration = Date.now() - startTime;
  logger.info(`Health check completed in ${checkDuration}ms - Status: ${overallStatus}`);

  return report;
}

// Quick liveness check (faster, less detailed)
export async function livenessCheck(): Promise<{ status: "ok" | "error", timestamp: string }> {
  try {
    // Just check if the process is running and responsive
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      timestamp: new Date().toISOString(),
    };
  }
}

// Readiness check (checks if service is ready to accept traffic)
export async function readinessCheck(): Promise<{ status: "ready" | "not-ready", services: string[] }> {
  const checks = await Promise.all([
    checkService("database", checkDatabaseHealth),
    checkService("redis", () => cache.ping()),
  ]);

  const failedServices = checks
    .filter(check => check.status === "unhealthy")
    .map(check => check.service);

  return {
    status: failedServices.length === 0 ? "ready" : "not-ready",
    services: failedServices,
  };
}

// System metrics
export function getSystemMetrics() {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return {
    memory: {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
    },
    cpu: cpuUsage,
    uptime: process.uptime(),
    pid: process.pid,
    platform: process.platform,
    nodeVersion: process.version,
  };
}

// Initialize monitoring
export async function initializeMonitoring() {
  try {
    logger.info("🔍 Initializing monitoring and health checks...");

    // Initial health check
    const healthReport = await performHealthCheck();
    logger.info(`✅ Initial health check completed - Status: ${healthReport.status}`);

    // Initialize storage bucket
    await storage.initializeBucket();

    // Set up periodic health checks (every 30 seconds in development)
    if (process.env.NODE_ENV === "development") {
      setInterval(async () => {
        try {
          const report = await performHealthCheck();
          if (report.status !== "healthy") {
            logger.warn("⚠️ Health check detected issues:", {
              status: report.status,
              issues: report.services.filter(s => s.status !== "healthy"),
            });
          }
        } catch (error) {
          logger.error("❌ Periodic health check failed:", error);
        }
      }, 30000); // 30 seconds

      logger.info("✅ Periodic health checks enabled (30s interval)");
    }

    logger.info("✅ Monitoring initialized successfully");
    return true;
  } catch (error) {
    logger.error("❌ Failed to initialize monitoring:", error);
    return false;
  }
}
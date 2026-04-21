export interface BurpEntry {
  id: number;
  statusCode: number;
  timestamp: number; // Raw timestamp
  relativeTime: number; // Seconds from start
  latency: number; // Response time in ms
  errorCount: number;
  timeoutCount: number;
}

export interface AttackStats {
  totalRequests: number;
  durationSeconds: number;
  averageRps: number;
  statusCodeCounts: Record<number, number>;
  totalErrors: number;
  totalTimeouts: number;
  startTime: number;
  endTime: number;
}


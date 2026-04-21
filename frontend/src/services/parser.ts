import { BurpEntry, AttackStats } from '../types';

export const parseCSV = async (file: File): Promise<{ entries: BurpEntry[]; stats: AttackStats }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        reject(new Error("Arquivo vazio"));
        return;
      }

      const lines = text.split(/\r?\n/);
      let entries: BurpEntry[] = [];
      
      // Heuristic Column Mapping based on previous interactions and standard formats
      // A (0): Request Number
      // C (2): Status Code
      // D (3): Timestamp (13-digit Unix)
      // E (4): Latency / Timer (Assumed based on user request for Latency chart)
      // G (6): Error
      // H (7): Timeout

      const delimiter = lines[0].includes('\t') ? '\t' : ',';

      let startIndex = 0;
      const firstLineCols = lines[0].split(delimiter).map(c => c.replace(/"/g, ''));
      if (isNaN(parseInt(firstLineCols[0]))) {
        startIndex = 1;
      }

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const cols = line.split(delimiter).map(c => c.trim().replace(/"/g, ''));

        if (cols.length < 4) continue;

        // User request: Ignore lines with empty payload (usually control lines)
        // This fixes the issue where the second line (control) causes parsing issues if payload is blank
        if (!cols[1] || cols[1].trim() === '') continue;

        const id = parseInt(cols[0]);
        const statusCode = parseInt(cols[2]);
        const timestamp = parseInt(cols[3]);
        
        // Attempt to parse latency from column 4 (E) or default to 0
        let latency = parseInt(cols[4]);
        if (isNaN(latency)) latency = 0;

        // Error/Timeout Logic (Not 'false' = 1)
        const rawError = cols[6] ? cols[6].toLowerCase() : 'false';
        const rawTimeout = cols[7] ? cols[7].toLowerCase() : 'false';
        const isError = rawError !== 'false' && rawError !== ''; 
        const isTimeout = rawTimeout !== 'false' && rawTimeout !== '';

        const isHttpError = !isNaN(statusCode) && statusCode >= 500 && statusCode < 600;
        const isHttpTimeout = statusCode === 504;
        const errorCount = (isError || isHttpError) ? 1 : 0;
        const timeoutCount = (isTimeout || isHttpTimeout) ? 1 : 0;

        // Filter valid rows
        if (!isNaN(id) && !isNaN(timestamp) && timestamp > 1000000000) { 
            entries.push({
                id,
                statusCode: isNaN(statusCode) ? 0 : statusCode,
                timestamp,
                relativeTime: 0,
                latency, 
                errorCount,
                timeoutCount
            });
        }
      }

      if (entries.length === 0) {
        reject(new Error("Nenhum dado válido encontrado. Verifique se o CSV é do Burp Intruder."));
        return;
      }

      // Sort by timestamp
      entries.sort((a, b) => a.timestamp - b.timestamp);
      
      const minTime = entries[0].timestamp;
      const maxTime = entries[entries.length - 1].timestamp;
      const durationSeconds = (maxTime - minTime) / 1000;

      // Calculate relative times
      entries.forEach(e => {
        e.relativeTime = (e.timestamp - minTime) / 1000;
      });

      const statusCodeCounts: Record<number, number> = {};
      let totalErrors = 0;
      let totalTimeouts = 0;

      entries.forEach(e => {
        statusCodeCounts[e.statusCode] = (statusCodeCounts[e.statusCode] || 0) + 1;
        totalErrors += e.errorCount;
        totalTimeouts += e.timeoutCount;
      });

      const stats: AttackStats = {
        totalRequests: entries.length,
        durationSeconds: durationSeconds > 0 ? durationSeconds : 0.1,
        averageRps: entries.length / (durationSeconds > 0 ? durationSeconds : 1),
        statusCodeCounts,
        totalErrors,
        totalTimeouts,
        startTime: minTime,
        endTime: maxTime
      };

      resolve({ entries, stats });
    };

    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsText(file, 'ISO-8859-1');
  });
};
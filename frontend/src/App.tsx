import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { FileUpload } from './components/FileUpload';
import { RpsGauge } from './components/RpsGauge';
import { TimeSeriesChart } from './components/TimeSeriesChart';
import { StatsBarChart } from './components/StatsBarChart';
import { parseCSV } from './services/parser';
import { BurpEntry, AttackStats } from './types';
import { ChartNoAxesCombined, Activity, Clock, AlertTriangle, Camera, Pencil, Check, } from 'lucide-react';

export default function App() {
  const [entries, setEntries] = useState<BurpEntry[] | null>(null);
  const [stats, setStats] = useState<AttackStats | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);
    setFilename(file.name);
    setProjectName(file.name);
    setIsEditingName(false);
    try {
      const { entries, stats } = await parseCSV(file);
      setEntries(entries);
      setStats(stats);
    } catch (e: any) {
      setError(e.message || "Erro ao processar arquivo");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setEntries(null);
    setStats(null);
    setError(null);
    setFilename(null);
    setProjectName(null);
    setIsEditingName(false);
  }

  const formatDuration = (totalSeconds: number) => {
    if (totalSeconds < 60) return `${totalSeconds.toFixed(1)}s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${minutes}m ${seconds}s`;
  };

  const handleExportImage = async () => {
    if (!dashboardRef.current) return;
    try {
        const canvas = await html2canvas(dashboardRef.current, {
            backgroundColor: '#020617',
            scale: 2,
            logging: false,
            useCORS: true,
            scrollX: 0,
            scrollY: 0,
            onclone: (_doc, el) => {
                el.style.padding = '24px';
                el.style.boxSizing = 'border-box';

                // Fix project name text so it wraps instead of being clipped
                const nameEl = _doc.querySelector('[data-export-name]') as HTMLElement | null;
                if (nameEl) {
                    nameEl.style.whiteSpace = 'normal';
                    nameEl.style.wordBreak = 'break-word';
                    nameEl.style.overflow = 'visible';
                }

                // Inject app header at the top of the exported image
                const header = _doc.createElement('div');
                header.style.cssText = 'display:flex;align-items:center;gap:12px;padding:0 0 20px 0;margin-bottom:4px;border-bottom:1px solid #1e293b;font-family:ui-sans-serif,system-ui,sans-serif;';
                header.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 16v5"/><path d="M16 14v7"/><path d="M20 10v11"/>
                        <path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15"/>
                        <path d="M4 18v3"/><path d="M8 14v7"/>
                    </svg>
                    <span style="font-size:18px;font-weight:700;color:#f1f5f9;letter-spacing:-0.025em;">
                        RATE<span style="color:#06b6d4;">WATCH</span>
                        <span style="color:#64748b;font-size:13px;font-weight:400;margin-left:8px;">DATA ANALYST</span>
                    </span>
                `;
                el.insertBefore(header, el.firstChild);
            }
        });
        const link = document.createElement('a');
        link.download = `burp-analise-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (err) {
        console.error("Failed to export image", err);
        setError("Falha ao gerar imagem. Tente novamente.");
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <header className="flex-none h-16 bg-slate-900 border-b border-slate-800 flex items-center px-6 justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <ChartNoAxesCombined className="w-8 h-8 text-cyan-500" />
          <h1 className="text-xl font-bold tracking-tight text-slate-100">
            RATE<span className="text-cyan-500">WATCH</span><span className="text-slate-500 text-sm ml-2 font-normal">Burp® Intruder Rate Limiting Analysis</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
            {stats && (
                <>
                <button 
                    onClick={handleExportImage}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition-colors shadow-sm"
                    title="Exportar Dashboard como Imagem"
                >
                    <Camera className="w-4 h-4" />
                    <span>Exportar Imagem</span>
                </button>
                <div className="h-6 w-px bg-slate-700 mx-1"></div>
                <button 
                    onClick={reset}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                    Carregar Novo Arquivo
                </button>
                </>
            )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 p-6">
        
        {/* State: No Data */}
        {!stats && (
          <div className="h-full flex flex-col items-center justify-center -mt-16">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-100 mb-2">Protocolo de Análise Inicial</h2>
                <p className="text-slate-400 max-w-md mx-auto">
                    Faça upload do seu export CSV do Burp Suite Intruder para visualizar comportamentos de Rate Limiting e WAF.
                </p>
            </div>
            <FileUpload onFileLoaded={handleFile} isLoading={loading} />
            {error && (
                <div className="mt-6 p-4 bg-red-900/30 border border-red-800 rounded text-red-300 max-w-xl w-full text-center">
                    {error}
                </div>
            )}
          </div>
        )}

        {/* State: Dashboard */}
        {entries && stats && (
          <div ref={dashboardRef} className="max-w-7xl mx-auto space-y-6 pb-10">
            
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Duration Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Duração Total</p>
                  <p className="text-2xl font-bold text-slate-100">{formatDuration(stats.durationSeconds)}</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-full">
                  <Clock className="w-6 h-6 text-cyan-500" />
                </div>
              </div>

              {/* Request Count Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Requisições</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.totalRequests.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-full">
                  <Activity className="w-6 h-6 text-indigo-500" />
                </div>
              </div>

               {/* Error Count Card */}
               <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Erros / Timeouts</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.totalErrors} <span className="text-slate-600">/</span> {stats.totalTimeouts}</p>
                </div>
                <div className="p-3 bg-slate-800 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              
              {/* Project Name Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="z-10 min-w-0 flex-1">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Arquivo Analisado</p>
                  {isEditingName ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        type="text"
                        value={projectName || ''}
                        onChange={e => setProjectName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                        className="text-slate-100 font-medium text-xs bg-slate-800 border border-slate-600 rounded px-1 py-0.5 w-full focus:outline-none focus:border-cyan-500"
                      />
                      <button onClick={() => setIsEditingName(false)} className="text-cyan-500 hover:text-cyan-400 flex-none">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 group min-w-0">
                      <p data-export-name className="text-slate-100 font-medium text-sm truncate" title={projectName || ''}>{projectName}</p>
                      <button onClick={() => setIsEditingName(true)} className="text-slate-600 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex-none">
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
              </div>

              {/* Date Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex items-center justify-between relative overflow-hidden">
                <div className="z-10">
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Data da Análise</p>
                  <p className="text-slate-100 font-medium text-sm">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
              </div>
            </div>

            {/* Main Viz Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
              
              {/* Gauge */}
              <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col relative overflow-hidden">
                <h3 className="text-slate-400 text-sm font-semibold uppercase mb-4">Throughput (RPS)</h3>
                <div className="flex-1 flex items-center justify-center">
                    <RpsGauge value={stats.averageRps} />
                </div>
              </div>

               {/* Bar Chart */}
               <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col">
                <h3 className="text-slate-400 text-sm font-semibold uppercase mb-4">Integridade da Resposta</h3>
                <div className="flex-1">
                    <StatsBarChart stats={stats} />
                </div>
              </div>
            </div>

            {/* Time Series */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-slate-400 text-sm font-semibold uppercase">Tempo de Resposta por Requisição (Latência)</h3>
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>2xx</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>3xx</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>429 (Throttle)</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>403 (Block)</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div>5xx</div>
                    </div>
                </div>
                <div className="flex-1">
                    <TimeSeriesChart data={entries} />
                </div>
            </div>

            {/* Dashboard Footer Credit */}
            <div className="text-center pt-2 pb-1 opacity-60">
                <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                    Developed by <span className="text-indigo-500/80 font-bold">Leforense (aka Le Fort)</span>
                </p>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
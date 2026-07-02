/* eslint-disable react/forbid-dom-props */
'use client';

import { useEffect, useState } from 'react';
import { solarService } from '../../../features/solar/solarService';
import { telemetryService, SolarSystem, TelemetryData } from '../../../features/solar/telemetryService';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { Zap, Battery, Activity, AlertCircle, RefreshCw, Sun, Power } from 'lucide-react';

interface SolarJob {
  $id: string;
  jobType: string;
  description: string;
  address: string;
  status: string;
  quotePrice: number;
  scheduledDate?: string;
  assignedTechnicians?: string[];
  siteImageUrls?: string[];
}

export default function SolarDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'monitoring' | 'installations'>('monitoring');
  
  // Job State
  const [jobs, setJobs] = useState<SolarJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Telemetry State
  const [systems, setSystems] = useState<SolarSystem[]>([]);
  const [activeSystemId, setActiveSystemId] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(true);

  useEffect(() => {
    if (user) {
      if (activeTab === 'installations') fetchJobs();
      if (activeTab === 'monitoring') fetchSystems();
    }
  }, [user, activeTab]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'monitoring' && activeSystemId) {
      fetchTelemetry(activeSystemId);
      // Poll every 5 seconds for live telemetry feel
      interval = setInterval(() => fetchTelemetry(activeSystemId), 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab, activeSystemId]);

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const data = await solarService.getMyJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch solar jobs:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchSystems = async () => {
    setTelemetryLoading(true);
    try {
      if (!user) return;
      const data = await telemetryService.getMySystems(user.$id);
      setSystems(data);
      if (data.length > 0 && !activeSystemId) {
        setActiveSystemId(data[0].$id);
      }
    } catch (err) {
      console.error('Failed to fetch systems:', err);
    } finally {
      setTelemetryLoading(false);
    }
  };

  const fetchTelemetry = async (systemId: string) => {
    try {
      const data = await telemetryService.getTelemetryData(systemId);
      setTelemetry(data);
    } catch (err) {
      console.error('Failed to fetch telemetry data:', err);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending-quote': return { label: 'Quote Pending', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' };
      case 'quoted': return { label: 'Quote Ready', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' };
      case 'paid': return { label: 'Paid - Scheduling', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30' };
      case 'in-progress': return { label: 'Installation In Progress', color: 'bg-indigo-500/20 text-indigo-500 border-indigo-500/30' };
      case 'completed': return { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' };
      case 'cancelled': return { label: 'Cancelled', color: 'bg-slate-500/20 text-slate-500 border-slate-500/30' };
      default: return { label: 'Unknown', color: 'bg-white/10 text-white border-white/20' };
    }
  };

  const renderTelemetryTab = () => {
    if (telemetryLoading && !telemetry) {
      return <div className="p-12 text-center text-slate-400">Connecting to telemetry servers...</div>;
    }

    if (systems.length === 0) {
      return (
        <div className="glass-panel border border-slate-800 rounded-xl p-12 text-center bg-slate-900/50">
          <Activity className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Active Systems Found</h3>
          <p className="text-slate-400 mb-6">You don't have any completed installations registered for live telemetry yet.</p>
          <button 
            onClick={() => setActiveTab('installations')}
            className="text-amber-500 hover:underline font-medium"
          >
            Check Installation Status &rarr;
          </button>
        </div>
      );
    }

    if (!telemetry) return null;

    const { metrics } = telemetry;
    const isGenerating = metrics.solarProductionKw > 0;

    return (
      <div className="space-y-6">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {systems.map(sys => (
            <button
              key={sys.$id}
              onClick={() => setActiveSystemId(sys.$id)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                activeSystemId === sys.$id 
                ? 'bg-amber-500/20 border-amber-500 text-amber-500' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {sys.name}
            </button>
          ))}
        </div>

        {/* Live Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">Solar Production</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  {metrics.solarProductionKw} <span className="text-base font-medium text-slate-500">kW</span>
                </h3>
              </div>
              <div className={`p-2 rounded-full ${isGenerating ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                <Sun className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">Current Load</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  {metrics.loadKw} <span className="text-base font-medium text-slate-500">kW</span>
                </h3>
              </div>
              <div className="p-2 rounded-full bg-blue-500/20 text-blue-500">
                <Power className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">Battery SoC</p>
                <h3 className="text-3xl font-bold text-white mt-1">
                  {metrics.batterySoC}%
                </h3>
              </div>
              <div className={`p-2 rounded-full ${
                metrics.batterySoC > 50 ? 'bg-emerald-500/20 text-emerald-500' : 
                metrics.batterySoC > 20 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-rose-500/20 text-rose-500'
              }`}>
                <Battery className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 w-full bg-slate-800 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${
                  metrics.batterySoC > 50 ? 'bg-emerald-500' : 
                  metrics.batterySoC > 20 ? 'bg-yellow-500' : 'bg-rose-500'
                }`} 
                style={{ width: `${metrics.batterySoC}%` }} // NOSONAR eslint-disable-line react/forbid-dom-props
              ></div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-400">Grid Status</p>
                <h3 className="text-xl font-bold text-white mt-2">
                  {metrics.gridStatus}
                </h3>
              </div>
              <div className={`p-2 rounded-full ${metrics.gridStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                <Zap className="h-5 w-5" />
              </div>
            </div>
            {metrics.gridStatus === 'Active' && (
              <p className="text-xs font-medium text-slate-500 mt-3">
                {metrics.gridImportKw > 0 ? `Importing ${metrics.gridImportKw} kW` : 
                 metrics.gridExportKw > 0 ? `Exporting ${metrics.gridExportKw} kW` : 'Balanced'}
              </p>
            )}
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              System Diagnostics
            </h3>
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
              <RefreshCw className="h-3 w-3 animate-spin-slow" />
              Live Sync
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Inverter Temp</p>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-semibold ${metrics.inverterTemp > 50 ? 'text-rose-400' : 'text-white'}`}>
                  {metrics.inverterTemp}°C
                </span>
                {metrics.inverterTemp > 50 && <AlertCircle className="h-4 w-4 text-rose-500" />}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Battery Voltage</p>
              <span className="text-lg font-semibold text-white">{metrics.batteryVoltage} V</span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Battery Health (SOH)</p>
              <span className="text-lg font-semibold text-emerald-400">{metrics.batteryHealth}%</span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">System Efficiency</p>
              <span className="text-lg font-semibold text-white">{metrics.efficiency}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInstallationsTab = () => {
    if (jobsLoading) return <div className="p-8 text-center text-slate-400">Loading Solar & Electrical Jobs...</div>;

    return (
      <div className="grid grid-cols-1 gap-6">
        {jobs.length === 0 ? (
          <div className="glass-panel border border-slate-800 rounded-xl p-12 text-center bg-slate-900/50">
            <div className="text-6xl mb-4">☀️</div>
            <h3 className="text-xl font-bold text-white mb-2">No active solar or electrical jobs</h3>
            <p className="text-slate-400 mb-6">Looking to go green or need an electrical repair? Request a quote from our expert engineers.</p>
            <Link 
              href="/maintenance/solar/new" 
              className="text-amber-500 hover:underline font-medium"
            >
              Get a Quote &rarr;
            </Link>
          </div>
        ) : (
          jobs.map(job => {
            const statusInfo = getStatusDisplay(job.status);
            return (
              <div key={job.$id} className="glass-panel border border-slate-800 rounded-xl p-6 hover:border-amber-500/30 transition-colors bg-slate-900/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{job.jobType.replace('-', ' ').toUpperCase()}</h3>
                    <div className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                      <span className="text-amber-500">📍</span> {job.address}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </div>
                </div>

                <p className="text-sm text-slate-300 mb-4 border-l-2 border-amber-500/20 pl-3">
                  {job.description}
                </p>

                {job.siteImageUrls && job.siteImageUrls.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {job.siteImageUrls.map((url, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Site attachment" className="object-cover w-full h-full" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center border-t border-slate-800 pt-4 mt-4">
                  <div className="text-sm">
                    <span className="block text-slate-500 text-xs mb-1">Scheduled Date</span>
                    <span className="font-medium text-white">
                      {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="block text-slate-500 text-xs mb-1">Assigned Techs</span>
                    <span className="font-medium text-white">
                      {job.assignedTechnicians && job.assignedTechnicians.length > 0 
                        ? job.assignedTechnicians.length 
                        : 'Unassigned'}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="block text-slate-500 text-xs mb-1">Quote Price</span>
                    <span className="font-semibold text-white">
                      {job.quotePrice > 0 ? `$${job.quotePrice.toLocaleString()}` : 'Pending'}
                    </span>
                  </div>

                  <div className="text-sm flex justify-end">
                    {job.status === 'quoted' && (
                      <Link 
                        href={`/checkout/solar_jobs/${job.$id}`}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md transition-colors text-sm text-center"
                      >
                        Pay & Book
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Solar & Electrical</h1>
          <p className="text-slate-400 mt-1 text-sm">Monitor your solar system telemetry in real-time or request new installations.</p>
        </div>
        <Link 
          href="/maintenance/solar/new" 
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-all shadow-[0_0_15px_rgba(217,119,6,0.4)]"
        >
          + Request Installation
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'monitoring' 
            ? 'bg-amber-500 text-white shadow-md' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="h-4 w-4" />
          System Monitoring
        </button>
        <button
          onClick={() => setActiveTab('installations')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'installations' 
            ? 'bg-amber-500 text-white shadow-md' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="h-4 w-4" />
          Installations & Repairs
        </button>
      </div>

      {activeTab === 'monitoring' ? renderTelemetryTab() : renderInstallationsTab()}

    </div>
  );
}

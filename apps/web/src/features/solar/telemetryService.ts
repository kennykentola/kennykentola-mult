import { getSessionJwt } from '../../lib/sessionJwt';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface SolarSystem {
  $id: string;
  name: string;
  address: string;
  installDate: string;
  capacity: string;
}

export interface TelemetryMetrics {
  solarProductionKw: number;
  loadKw: number;
  batterySoC: number;
  batteryVoltage: number;
  batteryHealth: number;
  gridStatus: 'Active' | 'Offline';
  gridImportKw: number;
  gridExportKw: number;
  inverterTemp: number;
  efficiency: number;
  status: 'Healthy' | 'Warning' | 'Offline';
}

export interface TelemetryData {
  systemId: string;
  timestamp: string;
  metrics: TelemetryMetrics;
}

export const telemetryService = {
  async getMySystems(clientId: string): Promise<SolarSystem[]> {
    const token = await getSessionJwt();
    const res = await fetch(`${API_URL}/telemetry/systems/${clientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch registered systems');
    }

    return res.json();
  },

  async getTelemetryData(systemId: string): Promise<TelemetryData> {
    const token = await getSessionJwt();
    const res = await fetch(`${API_URL}/telemetry/data/${systemId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch telemetry data');
    }

    return res.json();
  }
};

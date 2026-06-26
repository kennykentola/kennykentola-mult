import { Router, Request, Response } from 'express';
import { Query } from 'node-appwrite';
import { databases } from '../services/appwrite';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';

const router = Router();

const getSystemsSchema = z.object({
  params: z.object({
    clientId: z.string().min(1, 'Client ID is required')
  })
});

const getTelemetrySchema = z.object({
  params: z.object({
    systemId: z.string().min(1, 'System ID is required')
  })
});

// Simulated data generation function
const generateTelemetry = (systemId: string) => {
  const currentHour = new Date().getHours();
  
  // Base numbers that change during the day
  let solarProduction = 0;
  let batterySoC = 100;
  let loadKw = 1.2 + (Math.random() * 2); // 1.2kW - 3.2kW load
  let gridActive = true;

  if (currentHour >= 7 && currentHour <= 18) {
    // Daytime
    solarProduction = Math.max(0, Math.sin((currentHour - 6) * Math.PI / 12) * 5.0) + (Math.random() * 0.5); 
    batterySoC = 100; // Assuming fully charged during day
  } else {
    // Nighttime
    batterySoC = Math.max(20, 100 - ((currentHour > 18 ? currentHour - 18 : currentHour + 6) * 5)); // Drain battery
    if (Math.random() > 0.8) {
      gridActive = false; // Occasional grid failure simulated
    }
  }

  // Predictive maintenance metrics
  const inverterTemp = 35 + (solarProduction * 2) + Math.random();
  const batteryHealth = 96.5; // SOH
  const efficiencyLoss = inverterTemp > 45 ? 0.05 : 0.01;

  return {
    systemId,
    timestamp: new Date().toISOString(),
    metrics: {
      solarProductionKw: Number(solarProduction.toFixed(2)),
      loadKw: Number(loadKw.toFixed(2)),
      batterySoC: Number(batterySoC.toFixed(1)),
      batteryVoltage: Number((48 + (batterySoC / 100) * 4).toFixed(1)),
      batteryHealth: Number(batteryHealth.toFixed(1)),
      gridStatus: gridActive ? 'Active' : 'Offline',
      gridImportKw: gridActive && solarProduction < loadKw ? Number((loadKw - solarProduction).toFixed(2)) : 0,
      gridExportKw: gridActive && solarProduction > loadKw && batterySoC === 100 ? Number((solarProduction - loadKw).toFixed(2)) : 0,
      inverterTemp: Number(inverterTemp.toFixed(1)),
      efficiency: Number(((1 - efficiencyLoss) * 100).toFixed(1)),
      status: inverterTemp > 50 ? 'Warning' : 'Healthy'
    }
  };
};

router.get('/systems/:clientId', validateRequest(getSystemsSchema), async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    const dbId = process.env.APPWRITE_DATABASE_ID || 'multicompany';

    // Systems are just jobs that are marked as completed for this purpose, with a systemId assigned.
    // We'll query completed jobs.
    const jobs = await databases.listDocuments(dbId, 'solar_jobs', [
      Query.equal('clientId', clientId),
      Query.equal('status', 'completed')
    ]);

    // Format them as active systems
    const systems = jobs.documents.map((job: any) => ({
      $id: job.$id,
      name: job.jobType.replace('-', ' ').toUpperCase(),
      address: job.address,
      installDate: job.$updatedAt,
      capacity: '5kVA / 10kWh' // Mock capacity based on job type in real world
    }));

    res.json(systems);
  } catch (error: any) {
    console.error('Error fetching telemetry systems:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/data/:systemId', validateRequest(getTelemetrySchema), async (req: Request, res: Response) => {
  try {
    const { systemId } = req.params;
    // In a real app, this would query a time-series DB (like InfluxDB or AWS Timestream)
    const telemetry = generateTelemetry(systemId);
    res.json(telemetry);
  } catch (error: any) {
    console.error('Error fetching telemetry data:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

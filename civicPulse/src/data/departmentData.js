// Department-specific dummy data for all portals

// ELECTRICITY DEPARTMENT DATA
export const electricityIssues = [
  { id: 1, lat: 28.6139, lng: 77.2090, type: "ELEC", status: "current", date: "2025-10-20", description: "Power outage in sector 5", duration: 3.5 },
  { id: 2, lat: 28.6239, lng: 77.2190, type: "ELEC", status: "pending", date: "2025-10-18", description: "Transformer malfunction", duration: 2.0 },
  { id: 3, lat: 28.6039, lng: 77.1990, type: "ELEC", status: "critical", date: "2025-10-21", description: "Main line breakdown", duration: 6.5 },
  { id: 4, lat: 28.6189, lng: 77.2140, type: "ELEC", status: "resolved", date: "2025-10-19", description: "Street light repair", duration: 1.0 },
  { id: 5, lat: 28.6289, lng: 77.2240, type: "ELEC", status: "current", date: "2025-10-17", description: "Voltage fluctuation", duration: 4.2 },
  { id: 6, lat: 28.6089, lng: 77.2040, type: "ELEC", status: "critical", date: "2025-10-22", description: "Cable damage", duration: 5.0 },
  { id: 7, lat: 28.6339, lng: 77.2290, type: "ELEC", status: "resolved", date: "2025-10-16", description: "Meter replacement", duration: 0.5 },
  { id: 8, lat: 28.6219, lng: 77.2170, type: "ELEC", status: "pending", date: "2025-10-20", description: "Connection issue", duration: 2.5 },
];

export const electricityHistorical = [
  { date: "2025-10-16", issues: 5 },
  { date: "2025-10-17", issues: 8 },
  { date: "2025-10-18", issues: 6 },
  { date: "2025-10-19", issues: 9 },
  { date: "2025-10-20", issues: 12 },
  { date: "2025-10-21", issues: 7 },
  { date: "2025-10-22", issues: 10 },
  { date: "2025-10-23", issues: 8 },
];

export const crewDeploymentLogs = [
  { id: 1, crewName: "Team Alpha", area: "Sector 5", status: "deployed", issueId: 1, time: "10:30 AM", efficiency: 92, tasksCompleted: 45 },
  { id: 2, crewName: "Team Beta", area: "Sector 12", status: "available", issueId: null, time: "-", efficiency: 88, tasksCompleted: 38 },
  { id: 3, crewName: "Team Gamma", area: "Sector 8", status: "deployed", issueId: 3, time: "09:15 AM", efficiency: 95, tasksCompleted: 52 },
  { id: 4, crewName: "Team Delta", area: "Sector 15", status: "available", issueId: null, time: "-", efficiency: 85, tasksCompleted: 41 },
  { id: 5, crewName: "Team Echo", area: "Sector 3", status: "deployed", issueId: 5, time: "11:45 AM", efficiency: 90, tasksCompleted: 47 },
];

// Electricity Advanced Metrics
export const powerConsumptionData = [
  { hour: "00:00", consumption: 245, demand: 280 },
  { hour: "04:00", consumption: 180, demand: 200 },
  { hour: "08:00", consumption: 420, demand: 450 },
  { hour: "12:00", consumption: 580, demand: 600 },
  { hour: "16:00", consumption: 520, demand: 550 },
  { hour: "20:00", consumption: 680, demand: 700 },
  { hour: "23:00", consumption: 380, demand: 400 },
];

export const transformerStatus = [
  { id: "T-001", location: "Sector 5", capacity: "500 KVA", load: 78, health: "Good", lastMaintenance: "2025-09-15", temperature: 65 },
  { id: "T-002", location: "Sector 8", capacity: "750 KVA", load: 92, health: "Warning", lastMaintenance: "2025-08-20", temperature: 82 },
  { id: "T-003", location: "Sector 12", capacity: "500 KVA", load: 65, health: "Good", lastMaintenance: "2025-10-01", temperature: 58 },
  { id: "T-004", location: "Sector 15", capacity: "1000 KVA", load: 88, health: "Good", lastMaintenance: "2025-09-28", temperature: 72 },
  { id: "T-005", location: "Sector 3", capacity: "750 KVA", load: 95, health: "Critical", lastMaintenance: "2025-07-12", temperature: 89 },
];

export const gridHealthMetrics = {
  overallHealth: 87,
  voltageStability: 94,
  frequencyDeviation: 0.2,
  powerFactor: 0.95,
  uptime: 99.2,
  faultsToday: 3,
  peakLoad: 680,
  averageLoad: 420,
};

// WATER DEPARTMENT DATA
export const waterIssues = [
  { id: 1, lat: 28.6149, lng: 77.2100, type: "WATER", status: "current", date: "2025-10-20", description: "Pipe leak on main road", severity: 7, waterLoss: 500 },
  { id: 2, lat: 28.6249, lng: 77.2200, type: "WATER", status: "pending", date: "2025-10-18", description: "Low water pressure", severity: 4, waterLoss: 150 },
  { id: 3, lat: 28.6049, lng: 77.2000, type: "WATER", status: "critical", date: "2025-10-21", description: "Major pipeline burst", severity: 10, waterLoss: 2000 },
  { id: 4, lat: 28.6199, lng: 77.2150, type: "WATER", status: "resolved", date: "2025-10-19", description: "Valve replacement", severity: 3, waterLoss: 80 },
  { id: 5, lat: 28.6299, lng: 77.2250, type: "WATER", status: "current", date: "2025-10-17", description: "Underground seepage", severity: 6, waterLoss: 350 },
  { id: 6, lat: 28.6099, lng: 77.2050, type: "WATER", status: "critical", date: "2025-10-22", description: "Tank overflow", severity: 9, waterLoss: 1200 },
  { id: 7, lat: 28.6349, lng: 77.2300, type: "WATER", status: "resolved", date: "2025-10-16", description: "Meter reading error", severity: 2, waterLoss: 0 },
  { id: 8, lat: 28.6229, lng: 77.2180, type: "WATER", status: "pending", date: "2025-10-20", description: "Connection leak", severity: 5, waterLoss: 200 },
];

export const waterHistorical = [
  { date: "2025-10-16", issues: 4 },
  { date: "2025-10-17", issues: 7 },
  { date: "2025-10-18", issues: 5 },
  { date: "2025-10-19", issues: 8 },
  { date: "2025-10-20", issues: 11 },
  { date: "2025-10-21", issues: 6 },
  { date: "2025-10-22", issues: 9 },
  { date: "2025-10-23", issues: 7 },
];

// Water Advanced Metrics
export const waterQualityData = [
  { parameter: "pH Level", value: 7.2, standard: "6.5-8.5", status: "Normal" },
  { parameter: "Turbidity (NTU)", value: 0.8, standard: "< 1", status: "Normal" },
  { parameter: "Chlorine (mg/L)", value: 0.3, standard: "0.2-0.5", status: "Normal" },
  { parameter: "TDS (mg/L)", value: 180, standard: "< 500", status: "Normal" },
  { parameter: "Hardness (mg/L)", value: 85, standard: "< 200", status: "Normal" },
  { parameter: "Iron (mg/L)", value: 0.15, standard: "< 0.3", status: "Normal" },
];

export const waterSupplyDemand = [
  { zone: "Zone A", supply: 450, demand: 420, population: 15000 },
  { zone: "Zone B", supply: 380, demand: 410, population: 12500 },
  { zone: "Zone C", supply: 520, demand: 480, population: 18000 },
  { zone: "Zone D", supply: 410, demand: 440, population: 14000 },
  { zone: "Zone E", supply: 390, demand: 380, population: 13000 },
];

export const pipelineHealthData = [
  { id: "PL-001", length: "5.2 km", material: "PVC", age: 8, condition: "Good", leaksDetected: 0, pressure: 4.2 },
  { id: "PL-002", length: "3.8 km", material: "Cast Iron", age: 25, condition: "Fair", leaksDetected: 2, pressure: 3.8 },
  { id: "PL-003", length: "6.5 km", material: "HDPE", age: 5, condition: "Excellent", leaksDetected: 0, pressure: 4.5 },
  { id: "PL-004", length: "4.2 km", material: "Steel", age: 18, condition: "Poor", leaksDetected: 5, pressure: 3.2 },
  { id: "PL-005", length: "7.1 km", material: "PVC", age: 12, condition: "Good", leaksDetected: 1, pressure: 4.0 },
];

export const waterConsumptionPattern = [
  { time: "00:00", consumption: 120, wastage: 15 },
  { time: "06:00", consumption: 280, wastage: 25 },
  { time: "12:00", consumption: 450, wastage: 40 },
  { time: "18:00", consumption: 520, wastage: 50 },
  { time: "23:00", consumption: 200, wastage: 18 },
];

// ROAD DEPARTMENT DATA
export const roadIssues = [
  { id: 1, lat: 28.6159, lng: 77.2110, type: "ROAD", status: "current", date: "2025-10-20", description: "Pothole on highway", priority: 8, maintenanceType: "Emergency" },
  { id: 2, lat: 28.6259, lng: 77.2210, type: "ROAD", status: "pending", date: "2025-10-18", description: "Crack in pavement", priority: 5, maintenanceType: "Routine" },
  { id: 3, lat: 28.6059, lng: 77.2010, type: "ROAD", status: "critical", date: "2025-10-21", description: "Road collapse", priority: 10, maintenanceType: "Emergency" },
  { id: 4, lat: 28.6209, lng: 77.2160, type: "ROAD", status: "resolved", date: "2025-10-19", description: "Surface repair", priority: 4, maintenanceType: "Scheduled" },
  { id: 5, lat: 28.6309, lng: 77.2260, type: "ROAD", status: "current", date: "2025-10-17", description: "Uneven surface", priority: 6, maintenanceType: "Routine" },
  { id: 6, lat: 28.6109, lng: 77.2060, type: "ROAD", status: "critical", date: "2025-10-22", description: "Bridge damage", priority: 9, maintenanceType: "Emergency" },
  { id: 7, lat: 28.6359, lng: 77.2310, type: "ROAD", status: "resolved", date: "2025-10-16", description: "Road marking", priority: 2, maintenanceType: "Scheduled" },
  { id: 8, lat: 28.6239, lng: 77.2190, type: "ROAD", status: "pending", date: "2025-10-20", description: "Sidewalk repair", priority: 5, maintenanceType: "Routine" },
];

export const roadHistorical = [
  { date: "2025-10-16", issues: 6 },
  { date: "2025-10-17", issues: 9 },
  { date: "2025-10-18", issues: 7 },
  { date: "2025-10-19", issues: 10 },
  { date: "2025-10-20", issues: 13 },
  { date: "2025-10-21", issues: 8 },
  { date: "2025-10-22", issues: 11 },
  { date: "2025-10-23", issues: 9 },
];

export const maintenanceRequests = [
  { id: 1, location: "Highway 45", requestDate: "2025-10-18", priority: "High", status: "In Progress", estimatedCost: 250000, contractor: "ABC Constructions" },
  { id: 2, location: "Main Street", requestDate: "2025-10-20", priority: "Medium", status: "Pending", estimatedCost: 150000, contractor: "XYZ Builders" },
  { id: 3, location: "Bridge Rd", requestDate: "2025-10-21", priority: "Critical", status: "In Progress", estimatedCost: 500000, contractor: "PQR Infrastructure" },
  { id: 4, location: "Park Avenue", requestDate: "2025-10-17", priority: "Low", status: "Completed", estimatedCost: 80000, contractor: "ABC Constructions" },
  { id: 5, location: "Central Blvd", requestDate: "2025-10-19", priority: "High", status: "Pending", estimatedCost: 320000, contractor: "XYZ Builders" },
];

// Roads Advanced Metrics
export const roadConditionData = [
  { roadName: "Highway 45", length: "8.5 km", condition: 6.5, trafficDensity: "High", lastMaintenance: "2024-06-15", surfaceType: "Asphalt" },
  { roadName: "Main Street", length: "3.2 km", condition: 8.2, trafficDensity: "Medium", lastMaintenance: "2025-03-20", surfaceType: "Concrete" },
  { roadName: "Bridge Rd", length: "2.8 km", condition: 4.5, trafficDensity: "High", lastMaintenance: "2023-12-10", surfaceType: "Asphalt" },
  { roadName: "Park Avenue", length: "5.1 km", condition: 9.0, trafficDensity: "Low", lastMaintenance: "2025-08-05", surfaceType: "Concrete" },
  { roadName: "Central Blvd", length: "6.3 km", condition: 7.8, trafficDensity: "Medium", lastMaintenance: "2025-05-12", surfaceType: "Asphalt" },
];

export const budgetAllocation = [
  { category: "Emergency Repairs", allocated: 2500000, spent: 1850000, remaining: 650000 },
  { category: "Routine Maintenance", allocated: 1800000, spent: 1200000, remaining: 600000 },
  { category: "New Construction", allocated: 5000000, spent: 3200000, remaining: 1800000 },
  { category: "Equipment", allocated: 1200000, spent: 980000, remaining: 220000 },
  { category: "Signage & Markings", allocated: 500000, spent: 320000, remaining: 180000 },
];

export const equipmentTracking = [
  { id: "EQ-001", name: "Excavator", status: "In Use", location: "Highway 45", operator: "John Doe", fuelLevel: 75, lastService: "2025-10-10" },
  { id: "EQ-002", name: "Road Roller", status: "Available", location: "Depot", operator: "-", fuelLevel: 90, lastService: "2025-10-15" },
  { id: "EQ-003", name: "Asphalt Paver", status: "Maintenance", location: "Workshop", operator: "-", fuelLevel: 20, lastService: "2025-09-28" },
  { id: "EQ-004", name: "Dump Truck", status: "In Use", location: "Bridge Rd", operator: "Jane Smith", fuelLevel: 60, lastService: "2025-10-12" },
  { id: "EQ-005", name: "Concrete Mixer", status: "Available", location: "Depot", operator: "-", fuelLevel: 85, lastService: "2025-10-18" },
];

export const citizenFeedback = [
  { rating: 5, count: 145 },
  { rating: 4, count: 89 },
  { rating: 3, count: 34 },
  { rating: 2, count: 12 },
  { rating: 1, count: 8 },
];

// GARBAGE DEPARTMENT DATA
export const garbageIssues = [
  { id: 1, lat: 28.6169, lng: 77.2120, type: "GARB", status: "current", date: "2025-10-20", description: "Bin overflow at sector 7", binCapacity: 85 },
  { id: 2, lat: 28.6269, lng: 77.2220, type: "GARB", status: "pending", date: "2025-10-18", description: "Missed collection", binCapacity: 95 },
  { id: 3, lat: 28.6069, lng: 77.2020, type: "GARB", status: "critical", date: "2025-10-21", description: "Illegal dumping site", binCapacity: 100 },
  { id: 4, lat: 28.6219, lng: 77.2170, type: "GARB", status: "resolved", date: "2025-10-19", description: "Bin replacement", binCapacity: 45 },
  { id: 5, lat: 28.6319, lng: 77.2270, type: "GARB", status: "current", date: "2025-10-17", description: "Waste segregation issue", binCapacity: 70 },
  { id: 6, lat: 28.6119, lng: 77.2070, type: "GARB", status: "critical", date: "2025-10-22", description: "Collection truck breakdown", binCapacity: 90 },
  { id: 7, lat: 28.6369, lng: 77.2320, type: "GARB", status: "resolved", date: "2025-10-16", description: "Scheduled cleaning", binCapacity: 30 },
  { id: 8, lat: 28.6249, lng: 77.2200, type: "GARB", status: "pending", date: "2025-10-20", description: "Broken bin lid", binCapacity: 60 },
];

export const garbageHistorical = [
  { date: "2025-10-16", issues: 5 },
  { date: "2025-10-17", issues: 8 },
  { date: "2025-10-18", issues: 6 },
  { date: "2025-10-19", issues: 9 },
  { date: "2025-10-20", issues: 12 },
  { date: "2025-10-21", issues: 7 },
  { date: "2025-10-22", issues: 10 },
  { date: "2025-10-23", issues: 8 },
];

export const wasteTruckStatus = [
  { id: 1, truckNumber: "TRK-001", area: "Zone A", status: "active", capacity: 75, lastUpdate: "10:30 AM" },
  { id: 2, truckNumber: "TRK-002", area: "Zone B", status: "active", capacity: 60, lastUpdate: "10:45 AM" },
  { id: 3, truckNumber: "TRK-003", area: "Zone C", status: "maintenance", capacity: 0, lastUpdate: "08:00 AM" },
  { id: 4, truckNumber: "TRK-004", area: "Zone D", status: "active", capacity: 90, lastUpdate: "11:00 AM" },
  { id: 5, truckNumber: "TRK-005", area: "Zone E", status: "idle", capacity: 20, lastUpdate: "09:30 AM" },
];

export const binCapacityData = [
  { zone: "Zone A", capacity: 75 },
  { zone: "Zone B", capacity: 85 },
  { zone: "Zone C", capacity: 60 },
  { zone: "Zone D", capacity: 95 },
  { zone: "Zone E", capacity: 70 },
];

// Garbage Advanced Metrics
export const wasteSegregationData = [
  { type: "Biodegradable", percentage: 45, weight: 2250, color: "#4CAF50" },
  { type: "Recyclable", percentage: 30, weight: 1500, color: "#2196F3" },
  { type: "Hazardous", percentage: 5, weight: 250, color: "#FF4444" },
  { type: "Non-Recyclable", percentage: 20, weight: 1000, color: "#9E9E9E" },
];

export const landfillData = {
  totalCapacity: 500000,
  currentUsage: 385000,
  remainingCapacity: 115000,
  estimatedDaysRemaining: 428,
  fillRate: 268,
};

export const recyclingStats = [
  { month: "Jun", recycled: 450, total: 1500 },
  { month: "Jul", recycled: 520, total: 1620 },
  { month: "Aug", recycled: 580, total: 1700 },
  { month: "Sep", recycled: 610, total: 1650 },
  { month: "Oct", recycled: 680, total: 1800 },
];

export const collectionEfficiency = [
  { route: "Route A", scheduled: 45, completed: 43, efficiency: 95.6, avgTime: "4.2 hrs" },
  { route: "Route B", scheduled: 38, completed: 38, efficiency: 100, avgTime: "3.8 hrs" },
  { route: "Route C", scheduled: 52, completed: 48, efficiency: 92.3, avgTime: "5.1 hrs" },
  { route: "Route D", scheduled: 41, completed: 39, efficiency: 95.1, avgTime: "4.5 hrs" },
  { route: "Route E", scheduled: 35, completed: 33, efficiency: 94.3, avgTime: "3.9 hrs" },
];

export const environmentalImpact = {
  co2Saved: 1250,
  treesEquivalent: 58,
  energySaved: 4500,
  waterSaved: 12000,
  recyclingRate: 38,
};

// Utility functions
export const getStatistics = (issues) => {
  // ===== DATABASE STATUS MAPPING =====
  // Database ComplaintStatus enum values are mapped as follows:
  // - PENDING/OPEN/NEW → 'pending' (transformed in api.js)
  // - IN_PROGRESS/ACTIVE/CURRENT → 'in-progress' (transformed in api.js)
  // - RESOLVED/CLOSED/COMPLETED → 'resolved' (transformed in api.js)
  // - REJECTED/DECLINED → 'rejected' (transformed in api.js)
  
  // Current Issues = All non-resolved, non-rejected complaints (pending + in-progress)
  const current = issues.filter(issue => 
    issue.status === "current" || 
    issue.status === "in-progress" || 
    issue.status === "in_progress" ||
    issue.status === "active" ||
    issue.status === "pending" ||
    issue.status === "open" ||
    issue.status === "new"
  ).length;
  
  // Pending Issues = All pending/open/new + in-progress complaints
  const pending = issues.filter(issue => 
    issue.status === "pending" || 
    issue.status === "open" ||
    issue.status === "new" ||
    issue.status === "in-progress" ||
    issue.status === "current" ||
    issue.status === "active"
  ).length;
  
  // Resolved Issues = All completed/closed complaints
  const resolved = issues.filter(issue => 
    issue.status === "resolved" || 
    issue.status === "closed" ||
    issue.status === "completed" ||
    issue.status === "done"
  ).length;
  
  // Critical Issues = Complaints with critical priority (from database isCritical field)
  const critical = issues.filter(issue => 
    issue.status === "critical" || 
    issue.priority === "critical" ||
    issue.priority === "high" ||
    issue.priority === "urgent"
  ).length;
  
  // Rejected Issues = Declined/dismissed complaints
  const rejected = issues.filter(issue =>
    issue.status === "rejected" ||
    issue.status === "declined" ||
    issue.status === "dismissed"
  ).length;

  return { current, pending, resolved, critical, rejected };
};

// Issue colors for map markers by department
export const departmentColors = {
  ELEC: "#FFD700",  // Gold for electricity
  WATER: "#1E90FF", // Blue for water
  ROAD: "#FF6B6B",  // Red for roads
  GARB: "#4CAF50",  // Green for garbage
};

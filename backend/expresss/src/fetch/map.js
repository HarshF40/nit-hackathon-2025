import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.get('/api/complaints/map', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Complaint')
      .select(`
        id,
        departmentType,
        description,
        address,
        imageUrl,
        complaintCount,
        isCritical,
        location,
        dateTime
      `);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('Raw data sample:', JSON.stringify(data[0], null, 2)); // Debug log

    // Transform the data
    const transformedData = data.map(complaint => {
      let latitude = null;
      let longitude = null;
      
      // Handle different cases
      if (complaint.location) {
        if (typeof complaint.location === 'string') {
          // If it's a string, parse it
          try {
            const locationObj = JSON.parse(complaint.location);
            latitude = locationObj.latitude;
            longitude = locationObj.longitude;
          } catch (e) {
            console.error(`Error parsing location string for complaint ${complaint.id}:`, e);
          }
        } else if (typeof complaint.location === 'object') {
          // If it's already an object
          latitude = complaint.location.latitude;
          longitude = complaint.location.longitude;
        }
      }

      return {
        id: complaint.id,
        latitude: latitude,
        longitude: longitude,
        departmentType: complaint.departmentType,
        description: complaint.description,
        address: complaint.address,
        imageUrl: complaint.imageUrl,
        complaintCount: complaint.complaintCount,
        isCritical: complaint.isCritical,
        dateTime: complaint.dateTime
      };
    });

    // Filter out complaints without valid coordinates
    const validComplaints = transformedData.filter(c => c.latitude && c.longitude);

    console.log(`Returning ${validComplaints.length} of ${data.length} complaints with valid locations`);
    res.json(validComplaints);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router

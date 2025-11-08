import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


router.post("/createComplaint", async (req, res) => {
  try {
    const {
      departmentType, // enum: 'ELEC', 'WATER', 'GARB', 'ROAD'
      departmentId,
      title,          // additional field, not stored but can be logged
      description,
      authorAadhar,
      location,       // { latitude: number, longitude: number }
      address,
      imageBase64,    // base64 string
      severity        // number from frontend
    } = req.body;

    // Validate required fields
    if (!departmentType || !description || !location || !address || severity === undefined) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    // Validate location format
    if (typeof location !== "object" || location.latitude === undefined || location.longitude === undefined) {
      return res.status(400).json({ error: "Location must be a JSON object with latitude and longitude" });
    }

    // Set initial status and isCritical
    const status = "PENDING";
    const isCritical = Number(severity) > 6;

    // Initialize image URL (null by default)
    let imageUrl = null;

    // Handle image upload if present
    if (imageBase64) {
      try {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const fileName = `${Date.now()}_complaint.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("complaint_bucket")
          .upload(fileName, buffer, {
            contentType: "image/jpeg",
            cacheControl: "3600",
          });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          return res.status(500).json({ error: "Error uploading image to Supabase" });
        }

        const { data: publicUrlData } = supabase.storage
          .from("complaint_bucket")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      } catch (imageError) {
        console.error("Image processing error:", imageError);
        return res.status(500).json({ error: "Error processing image" });
      }
    }

    // Insert complaint into the database
    const { data: newComplaint, error: insertError } = await supabase
      .from("Complaint")
      .insert([
        {
          departmentType,
          departmentId,
          description,
          authorAadhar,
          location,
          address,
          imageUrl,
          isCritical,
          status,
        },
      ])
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({ error: "Error inserting complaint into Supabase" });
    }

    res.status(201).json({
      message: "Complaint created successfully",
      complaint: newComplaint[0],
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.put('/resolveComp', async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid complaint ID' });
    }

    const complaintId = parseInt(id);

    const { data, error } = await supabase
      .from('Complaint')
      .update({ status: 'COMPLETED' })
      .eq('id', complaintId)
      .select();

    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ error: 'Failed to resolve complaint' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({ 
      message: 'Complaint resolved successfully',
      complaint: data[0] 
    });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/completedComplaints
router.get('/completedComplaints', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { data, error } = await supabase
      .from('Complaint')
      .select('*')
      .eq('posterId', parseInt(userId))
      .eq('status', 'COMPLETED')
      .order('dateTime', { ascending: false });

    if (error) {
      console.error('Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch completed complaints' });
    }

    res.json({ 
      message: 'Completed complaints retrieved successfully',
      complaints: data 
    });
  } catch (error) {
    console.error('Error fetching completed complaints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/rejectComp
router.put('/rejectComp', async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid complaint ID' });
    }

    const complaintId = parseInt(id);

    const { data, error } = await supabase
      .from('Complaint')
      .update({ status: 'REJECTED' })
      .eq('id', complaintId)
      .select();

    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ error: 'Failed to reject complaint' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({ 
      message: 'Complaint rejected successfully',
      complaint: data[0] 
    });
  } catch (error) {
    console.error('Error rejecting complaint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/rejectedComplaints
router.get('/rejectedComplaints', async (req, res) => {
  try {
    const { departmentId } = req.query;
    
    if (!departmentId || isNaN(parseInt(departmentId))) {
      return res.status(400).json({ error: 'Invalid department ID' });
    }

    const { data, error } = await supabase
      .from('Complaint')
      .select('*')
      .eq('departmentId', parseInt(departmentId))
      .eq('status', 'REJECTED')
      .order('dateTime', { ascending: false });

    if (error) {
      console.error('Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch rejected complaints' });
    }

    res.json({ 
      message: 'Rejected complaints retrieved successfully',
      complaints: data 
    });
  } catch (error) {
    console.error('Error fetching rejected complaints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/allComplaints
router.get('/allComplaints', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Complaint')
      .select('*')
      .order('dateTime', { ascending: false });

    if (error) {
      console.error('Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch complaints' });
    }

    res.json({ 
      message: 'All complaints retrieved successfully',
      complaints: data 
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch all complaints made by a user (Aadhar sent in request body)
router.post("/getComplaintsByAadhar", async (req, res) => {
  try {
    const { aadhar } = req.body;

    // Validate input
    if (!aadhar) {
      return res.status(400).json({ error: "Aadhar number is required in request body" });
    }

    // Fetch complaints from Supabase
    const { data: complaints, error } = await supabase
      .from("Complaint")
      .select("*")
      .eq("authorAadhar", aadhar)
      .order("dateTime", { ascending: false }); // latest first

    if (error) {
      console.error("Fetch error:", error);
      return res.status(500).json({ error: "Error fetching complaints from Supabase" });
    }

    // If no complaints exist
    if (!complaints || complaints.length === 0) {
      return res.status(200).json({
        message: "No complaints found for this Aadhar number.",
        complaints: [],
      });
    }

    // Return data
    return res.status(200).json({
      message: "Complaints fetched successfully",
      total: complaints.length,
      complaints,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Utility: Haversine distance between two geo-points (in km)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const toRad = deg => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Endpoint: fetch complaints within radius
router.post("/getComplaintsByRadius", async (req, res) => {
  try {
    const { latitude, longitude, radiusKm } = req.body;

    console.log("Called getComplaintsByRadius")

    // Validation
    if (!latitude || !longitude || !radiusKm) {
      return res.status(400).json({
        error: "latitude, longitude, and radiusKm are required"
      });
    }

    // Fetch all complaints (contains JSONB `location`)
    const { data: complaints, error } = await supabase
      .from("Complaint")
      .select("*");

    if (error) {
      console.error("Fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch complaints" });
    }

    // Filter complaints by radius
    const filtered = complaints.filter(c => {
      if (!c.location || !c.location.latitude || !c.location.longitude) return false;
      const dist = haversineDistance(
        latitude,
        longitude,
        c.location.latitude,
        c.location.longitude
      );
      return dist <= radiusKm;
    });

    // Respond with filtered results
    res.status(200).json({
      message: `Found ${filtered.length} complaints within ${radiusKm} km`,
      total: filtered.length,
      complaints: filtered
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router

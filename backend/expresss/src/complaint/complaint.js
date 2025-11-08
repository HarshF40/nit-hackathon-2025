import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

//router.post("/createComplaint", async (req, res) => {
//  try {
//    const { 
//      departmentType, 
//      departmentId, 
//      description, 
//      authorAadhar, 
//      location, 
//      address, 
//      imageBase64, 
//      isCritical, 
//      status 
//    } = req.body;
//
//    // Validate required fields
//    if (!departmentType || !description || !location || !address || isCritical === undefined || !status) {
//      return res.status(400).json({ error: "All required fields must be provided" });
//    }
//
//    // Validate status enum
//    const validStatuses = ['COMPLETED', 'INPROGRESS', 'PENDING', 'REJECTED'];
//    if (!validStatuses.includes(status)) {
//      return res.status(400).json({ error: "Invalid status. Must be one of: COMPLETED, INPROGRESS, PENDING, REJECTED" });
//    }
//
//    // Fetch all existing complaints
//    const { data: existingComplaints, error: fetchError } = await supabase
//      .from('Complaint')
//      .select('*');
//
//    if (fetchError) {
//      console.error('Fetch error:', fetchError);
//      return res.status(500).json({ error: 'Failed to fetch existing complaints' });
//    }
//
//    // Prepare text for AI duplicate detection
//    const complaintsText = `
//You are a complaint duplicate detection system. Analyze if the new complaint is similar to any existing complaint based on the description and location.
//
//EXISTING COMPLAINTS:
//${existingComplaints.map(c => `
//ID: ${c.id}
//Department: ${c.departmentType} (ID: ${c.departmentId})
//Description: ${c.description}
//Location: ${JSON.stringify(c.location)}
//Address: ${c.address}
//Critical: ${c.isCritical}
//Status: ${c.status}
//---
//`).join('\n')}
//
//NEW COMPLAINT TO CHECK:
//Department: ${departmentType} (ID: ${departmentId})
//Description: ${description}
//Location: ${JSON.stringify(location)}
//Address: ${address}
//Critical: ${isCritical}
//
//INSTRUCTIONS:
//1. Check if this new complaint describes the SAME ISSUE at a SIMILAR LOCATION as any existing complaint
//2. Consider complaints as duplicates if they are about the same problem within a reasonable proximity (same street, same building, nearby area)
//3. Respond ONLY in valid JSON format with NO additional text, markdown, or formatting
//
//RESPONSE FORMAT:
//{
//  "isDuplicate": true/false,
//  "duplicateId": number or null,
//  "reason": "brief explanation"
//}
//`;
//
//    // Send to AI for duplicate check
//    let aiResponse;
//    try {
//      const aiResult = await fetch('http://10.155.92.27:5000/receive', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ query: complaintsText }),
//      });
//
//      const aiData = await aiResult.json();
//      aiResponse = aiData.response.trim();
//      console.log('AI Raw Response:', aiResponse);
//
//      const cleanedResponse = aiResponse
//        .replace(/```json\s*/gi, '')
//        .replace(/```\s*/g, '')
//        .trim();
//
//      const parsedResponse = JSON.parse(cleanedResponse);
//      console.log('Parsed AI Response:', parsedResponse);
//
//      if (parsedResponse.isDuplicate && parsedResponse.duplicateId) {
//        const duplicateId = parsedResponse.duplicateId;
//
//        // Fetch duplicate for verification
//        const { data: duplicateComplaint, error: getError } = await supabase
//          .from('Complaint')
//          .select('*')
//          .eq('id', duplicateId)
//          .single();
//
//        if (getError) {
//          console.error('Error fetching duplicate complaint:', getError);
//          return res.status(500).json({ error: 'Failed to fetch duplicate complaint' });
//        }
//
//        return res.status(200).json({
//          message: 'Duplicate complaint detected.',
//          complaint: duplicateComplaint,
//          isDuplicate: true,
//          reason: parsedResponse.reason,
//        });
//      }
//    } catch (aiError) {
//      console.error('AI API error:', aiError);
//      console.log('AI check failed, continuing with new complaint creation');
//    }
//
//    // No duplicate found — create new complaint
//    let imageUrl = null;
//
//    // Handle image upload
//    if (imageBase64) {
//      try {
//        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
//        const buffer = Buffer.from(base64Data, 'base64');
//        const fileName = `${Date.now()}_complaint.jpg`;
//
//        const { error: uploadError } = await supabase.storage
//          .from("complaint_bucket")
//          .upload(fileName, buffer, {
//            contentType: "image/jpeg",
//            cacheControl: '3600',
//          });
//
//        if (uploadError) {
//          console.error("Upload error:", uploadError);
//          return res.status(500).json({ error: "Error uploading image to Supabase" });
//        }
//
//        const { data: publicUrlData } = supabase.storage
//          .from("complaint_bucket")
//          .getPublicUrl(fileName);
//
//        imageUrl = publicUrlData.publicUrl;
//      } catch (imageError) {
//        console.error("Image processing error:", imageError);
//        return res.status(500).json({ error: "Error processing image" });
//      }
//    }
//
//    // Insert new complaint
//    const { data: newComplaint, error: insertError } = await supabase
//      .from("Complaint")
//      .insert([{
//        departmentType,
//        departmentId,
//        description,
//        authorAadhar,
//        location,
//        address,
//        imageUrl,
//        isCritical,
//        status,
//      }])
//      .select();
//
//    if (insertError) {
//      console.error("Insert error:", insertError);
//      return res.status(500).json({ error: "Error creating complaint in Supabase" });
//    }
//
//    res.status(201).json({
//      message: "New complaint created successfully",
//      complaint: newComplaint[0],
//      isDuplicate: false,
//    });
//  } catch (err) {
//    console.error("Server error:", err);
//    res.status(500).json({ error: "Internal server error" });
//  }
//});


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

export default router

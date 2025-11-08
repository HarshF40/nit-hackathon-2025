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
//      posterId, 
//      location, 
//      address, 
//      imageBase64, 
//      isCritical, 
//      status,
//    } = req.body;
//
//    // Validate required fields
//    if (!departmentType || !departmentId || !description || !posterId || !location || !address || isCritical === undefined || !status) {
//      return res.status(400).json({ error: "All fields are required" });
//    }
//
//    // Validate status enum
//    const validStatuses = ['COMPLETED', 'INPROGRESS', 'PENDING', 'REJECTED'];
//    if (!validStatuses.includes(status)) {
//      return res.status(400).json({ error: "Invalid status. Must be one of: COMPLETED, INPROGRESS, PENDING, REJECTED" });
//    }
//
//    let imageUrl = null;
//
//    // Handle image upload if provided
//    if (imageBase64) {
//      try {
//        // Remove data:image/jpeg;base64, prefix
//        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
//        const buffer = Buffer.from(base64Data, 'base64');
//
//        // Generate unique filename
//        const fileName = `${Date.now()}_complaint.jpg`;
//
//        // Upload image to Supabase Storage bucket
//        const { error: uploadError } = await supabase.storage
//          .from("complaint_bucket")
//          .upload(fileName, buffer, { 
//            contentType: "image/jpeg",
//            cacheControl: '3600'
//          });
//
//        if (uploadError) {
//          console.error("Upload error:", uploadError);
//          return res.status(500).json({ error: "Error uploading image to Supabase" });
//        }
//
//        // Get public URL of uploaded image
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
//    // Insert new complaint into Supabase table
//    const { data: newComplaint, error: insertError } = await supabase
//      .from("Complaint")
//      .insert([{
//        departmentType,
//        departmentId,
//        description,
//        posterId,
//        // location: typeof location === 'string' ? JSON.parse(location) : location,
//        location: location,
//        address,
//        imageUrl,
//        complaintCount: 1,
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
//      message: "Complaint created successfully",
//      complaint: newComplaint[0],
//    });
//  } catch (err) {
//    console.error("Server error:", err);
//    res.status(500).json({ error: "Internal server error" });
//  }
//});

router.post("/createComplaint", async (req, res) => {
  try {
    const { 
      departmentType, 
      departmentId, 
      description, 
      posterId, 
      location, 
      address, 
      imageBase64, 
      isCritical, 
      status,
    } = req.body;

    // Validate required fields
    if (!departmentType || !departmentId || !description || !posterId || !location || !address || isCritical === undefined || !status) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate status enum
    const validStatuses = ['COMPLETED', 'INPROGRESS', 'PENDING', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be one of: COMPLETED, INPROGRESS, PENDING, REJECTED" });
    }

    // Fetch all existing complaints from the table
    const { data: existingComplaints, error: fetchError } = await supabase
      .from('Complaint')
      .select('*');

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch existing complaints' });
    }

    // Create a text blob of all existing complaints + new complaint data
    const complaintsText = `
You are a complaint duplicate detection system. Analyze if the new complaint is similar to any existing complaint based on the description and location.

EXISTING COMPLAINTS:
${existingComplaints.map(c => `
ID: ${c.id}
Department: ${c.departmentType} (ID: ${c.departmentId})
Description: ${c.description}
Location: ${JSON.stringify(c.location)}
Address: ${c.address}
Critical: ${c.isCritical}
Status: ${c.status}
Count: ${c.complaintCount}
---
`).join('\n')}

NEW COMPLAINT TO CHECK:
Department: ${departmentType} (ID: ${departmentId})
Description: ${description}
Location: ${JSON.stringify(location)}
Address: ${address}
Critical: ${isCritical}

INSTRUCTIONS:
1. Check if this new complaint describes the SAME ISSUE at a SIMILAR LOCATION as any existing complaint
2. Consider complaints as duplicates if they are about the same problem within a reasonable proximity (same street, same building, nearby area)
3. Respond ONLY in valid JSON format with NO additional text, markdown, or formatting

RESPONSE FORMAT (respond with ONLY this JSON, nothing else):
{
  "isDuplicate": true/false,
  "duplicateId": number or null,
  "reason": "brief explanation"
}

If duplicate found: {"isDuplicate": true, "duplicateId": <ID>, "reason": "explanation"}
If NO duplicate found: {"isDuplicate": false, "duplicateId": null, "reason": "explanation"}
`;

    // Send to AI endpoint for duplicate check
    let aiResponse;
    try {
      const aiResult = await fetch('http://10.170.100.212:5000/receive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: complaintsText
        })
      });

      const aiData = await aiResult.json();
      aiResponse = aiData.response.trim();
      console.log('AI Raw Response:', aiResponse);

      // Clean the response - remove ```json and ``` markers, and trim
      let cleanedResponse = aiResponse
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      // Parse the JSON response
      const parsedResponse = JSON.parse(cleanedResponse);
      console.log('Parsed AI Response:', parsedResponse);

      // Check if AI found a duplicate
      if (parsedResponse.isDuplicate && parsedResponse.duplicateId) {
        // Update existing complaint count
        const duplicateId = parsedResponse.duplicateId;
        
        const { data: existingComplaint, error: getError } = await supabase
          .from('Complaint')
          .select('complaintCount')
          .eq('id', duplicateId)
          .single();

        if (getError) {
          console.error('Error fetching duplicate:', getError);
          return res.status(500).json({ error: 'Failed to fetch duplicate complaint' });
        }

        const { data: updatedComplaint, error: updateError } = await supabase
          .from('Complaint')
          .update({ complaintCount: existingComplaint.complaintCount + 1 })
          .eq('id', duplicateId)
          .select();

        if (updateError) {
          console.error('Update error:', updateError);
          return res.status(500).json({ error: 'Failed to update complaint count' });
        }

        return res.status(200).json({
          message: 'Similar complaint found. Count increased.',
          complaint: updatedComplaint[0],
          isDuplicate: true,
          reason: parsedResponse.reason
        });
      }

    } catch (aiError) {
      console.error('AI API error:', aiError);
      // If AI fails, continue with creating new complaint as fallback
      console.log('AI check failed, creating new complaint as fallback');
    }

    // No duplicate found - create new complaint
    let imageUrl = null;

    // Handle image upload if provided
    if (imageBase64) {
      try {
        // Remove data:image/jpeg;base64, prefix
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const fileName = `${Date.now()}_complaint.jpg`;
        
        // Upload image to Supabase Storage bucket
        const { error: uploadError } = await supabase.storage
          .from("complaint_bucket")
          .upload(fileName, buffer, { 
            contentType: "image/jpeg",
            cacheControl: '3600'
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          return res.status(500).json({ error: "Error uploading image to Supabase" });
        }

        // Get public URL of uploaded image
        const { data: publicUrlData } = supabase.storage
          .from("complaint_bucket")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      } catch (imageError) {
        console.error("Image processing error:", imageError);
        return res.status(500).json({ error: "Error processing image" });
      }
    }

    // Insert new complaint into Supabase table
    const { data: newComplaint, error: insertError } = await supabase
      .from("Complaint")
      .insert([{
        departmentType,
        departmentId,
        description,
        posterId,
        location: location,
        address,
        imageUrl,
        complaintCount: 1,
        isCritical,
        status,
      }])
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({ error: "Error creating complaint in Supabase" });
    }

    res.status(201).json({
      message: "New complaint created successfully",
      complaint: newComplaint[0],
      isDuplicate: false
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//router.post("/createComplaint", async (req, res) => {
//  try {
//    const { 
//      departmentType, 
//      departmentId, 
//      description, 
//      posterId, 
//      location, 
//      address, 
//      imageBase64, 
//      isCritical, 
//      status,
//    } = req.body;
//
//    console.log('📝 New complaint request:', { departmentType, departmentId, description, address });
//
//    // Validate required fields
//    if (!departmentType || !departmentId || !description || !posterId || !location || !address || isCritical === undefined || !status) {
//      return res.status(400).json({ error: "All fields are required" });
//    }
//
//    // Validate status enum
//    const validStatuses = ['COMPLETED', 'INPROGRESS', 'PENDING', 'REJECTED'];
//    if (!validStatuses.includes(status)) {
//      return res.status(400).json({ error: "Invalid status. Must be one of: COMPLETED, INPROGRESS, PENDING, REJECTED" });
//    }
//
//    // Fetch all existing complaints from the table
//    console.log('🔍 Fetching existing complaints...');
//    const { data: existingComplaints, error: fetchError } = await supabase
//      .from('Complaint')
//      .select('*');
//
//    if (fetchError) {
//      console.error('❌ Fetch error:', fetchError);
//      return res.status(500).json({ error: 'Failed to fetch existing complaints' });
//    }
//
//    console.log(`✅ Found ${existingComplaints.length} existing complaints`);
//
//    // Create a comprehensive text blob comparing ALL fields
//    const complaintsText = `
//You are a complaint duplicate detection system. Analyze if the new complaint is similar to any existing complaint by comparing ALL the following fields:
//- Department Type and Department ID (must match exactly)
//- Description (semantic similarity - same issue/problem)
//- Location coordinates (geographic proximity)
//- Address (similar location/area)
//- Critical status (consider context)
//
//EXISTING COMPLAINTS:
//${existingComplaints.map(c => `
//ID: ${c.id}
//Department Type: ${c.departmentType}
//Department ID: ${c.departmentId}
//Description: ${c.description}
//Location: ${JSON.stringify(c.location)}
//Address: ${c.address}
//Is Critical: ${c.isCritical}
//Status: ${c.status}
//Complaint Count: ${c.complaintCount}
//Date/Time: ${c.dateTime}
//---
//`).join('\n')}
//
//NEW COMPLAINT TO CHECK:
//Department Type: ${departmentType}
//Department ID: ${departmentId}
//Description: ${description}
//Location: ${JSON.stringify(location)}
//Address: ${address}
//Is Critical: ${isCritical}
//
//SIMILARITY CRITERIA:
//1. Department Type and Department ID MUST match exactly
//2. Description must describe the SAME PROBLEM/ISSUE (not just similar words, but same underlying complaint)
//3. Location must be in close geographic proximity (within reasonable distance - same street/building/nearby area)
//4. Address should indicate the same general location
//5. Consider all fields together to determine if this is truly the same complaint reported again
//
//INSTRUCTIONS:
//Respond ONLY in valid JSON format with NO additional text, markdown, or formatting.
//
//RESPONSE FORMAT (respond with ONLY this JSON, nothing else):
//{
//  "isDuplicate": true/false,
//  "duplicateId": number or null,
//  "reason": "detailed explanation of why this is/isn't a duplicate, mentioning which fields matched"
//}
//
//If duplicate found: {"isDuplicate": true, "duplicateId": <ID>, "reason": "explanation"}
//If NO duplicate found: {"isDuplicate": false, "duplicateId": null, "reason": "explanation"}
//`;
//
//    // Send to AI endpoint for duplicate check
//    console.log('🤖 Sending to AI for duplicate check...');
//    let aiResponse;
//    try {
//      const aiResult = await fetch('http://10.170.100.212:5000/receive', {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/json',
//        },
//        body: JSON.stringify({
//          query: complaintsText
//        })
//      });
//
//      if (!aiResult.ok) {
//        throw new Error(`AI API returned status ${aiResult.status}`);
//      }
//
//      const aiData = await aiResult.json();
//      aiResponse = aiData.response.trim();
//      console.log('🤖 AI Raw Response:', aiResponse);
//
//      // Clean the response - remove ```json and ``` markers, and trim
//      let cleanedResponse = aiResponse
//        .replace(/```json\s*/gi, '')
//        .replace(/```\s*/g, '')
//        .trim();
//
//      console.log('🧹 Cleaned Response:', cleanedResponse);
//
//      // Parse the JSON response
//      const parsedResponse = JSON.parse(cleanedResponse);
//      console.log('✅ Parsed AI Response:', parsedResponse);
//
//      // Check if AI found a duplicate
//      if (parsedResponse.isDuplicate && parsedResponse.duplicateId) {
//        const duplicateId = parsedResponse.duplicateId;
//        console.log(`🔄 Duplicate detected! ID: ${duplicateId}`);
//        
//        // Fetch the current complaint to get its count
//        const { data: existingComplaint, error: getError } = await supabase
//          .from('Complaint')
//          .select('*')
//          .eq('id', duplicateId)
//          .single();
//
//        if (getError) {
//          console.error('❌ Error fetching duplicate:', getError);
//          return res.status(500).json({ error: 'Failed to fetch duplicate complaint' });
//        }
//
//        console.log(`📊 Current count for complaint ${duplicateId}: ${existingComplaint.complaintCount}`);
//
//        // Increment the complaint count
//        const newCount = existingComplaint.complaintCount + 1;
//        console.log(`➕ Incrementing count to: ${newCount}`);
//
//        const { data: updatedComplaint, error: updateError } = await supabase
//          .from('Complaint')
//          .update({ complaintCount: newCount })
//          .eq('id', duplicateId)
//          .select();
//
//        if (updateError) {
//          console.error('❌ Update error:', updateError);
//          return res.status(500).json({ error: 'Failed to update complaint count' });
//        }
//
//        console.log(`✅ Successfully increased count for complaint ID ${duplicateId} to ${newCount}`);
//        console.log('Updated complaint:', updatedComplaint[0]);
//
//        return res.status(200).json({
//          message: `Similar complaint found. Count increased from ${existingComplaint.complaintCount} to ${newCount}.`,
//          complaint: updatedComplaint[0],
//          isDuplicate: true,
//          reason: parsedResponse.reason
//        });
//      } else {
//        console.log('❌ No duplicate found, creating new complaint');
//      }
//
//    } catch (aiError) {
//      console.error('❌ AI API error:', aiError);
//      console.log('⚠️ AI check failed, creating new complaint as fallback');
//    }
//
//    // No duplicate found - create new complaint
//    let imageUrl = null;
//
//    // Handle image upload if provided
//    if (imageBase64) {
//      try {
//        console.log('📸 Processing image upload...');
//        // Remove data:image/jpeg;base64, prefix
//        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
//        const buffer = Buffer.from(base64Data, 'base64');
//        
//        // Generate unique filename
//        const fileName = `${Date.now()}_complaint.jpg`;
//        
//        // Upload image to Supabase Storage bucket
//        const { error: uploadError } = await supabase.storage
//          .from("complaint_bucket")
//          .upload(fileName, buffer, { 
//            contentType: "image/jpeg",
//            cacheControl: '3600'
//          });
//
//        if (uploadError) {
//          console.error("❌ Upload error:", uploadError);
//          return res.status(500).json({ error: "Error uploading image to Supabase" });
//        }
//
//        // Get public URL of uploaded image
//        const { data: publicUrlData } = supabase.storage
//          .from("complaint_bucket")
//          .getPublicUrl(fileName);
//
//        imageUrl = publicUrlData.publicUrl;
//        console.log('✅ Image uploaded:', imageUrl);
//      } catch (imageError) {
//        console.error("❌ Image processing error:", imageError);
//        return res.status(500).json({ error: "Error processing image" });
//      }
//    }
//
//    // Insert new complaint into Supabase table
//    console.log('➕ Creating new complaint...');
//    const { data: newComplaint, error: insertError } = await supabase
//      .from("Complaint")
//      .insert([{
//        departmentType,
//        departmentId,
//        description,
//        posterId,
//        location: location,
//        address,
//        imageUrl,
//        complaintCount: 1,
//        isCritical,
//        status,
//      }])
//      .select();
//
//    if (insertError) {
//      console.error("❌ Insert error:", insertError);
//      return res.status(500).json({ error: "Error creating complaint in Supabase" });
//    }
//
//    console.log(`✅ New complaint created with ID ${newComplaint[0].id}`);
//
//    res.status(201).json({
//      message: "New complaint created successfully",
//      complaint: newComplaint[0],
//      isDuplicate: false
//    });
//  } catch (err) {
//    console.error("❌ Server error:", err);
//    res.status(500).json({ error: "Internal server error" });
//  }
//});

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

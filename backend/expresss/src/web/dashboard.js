//import express from "express";
//import { createClient } from "@supabase/supabase-js";
//
//const router = express.Router();
//const supabase = createClient(
//  process.env.SUPABASE_URL,
//  process.env.SUPABASE_SERVICE_ROLE_KEY
//);
//
//router.post("/getDepartmentId", async (req, res) => {
//  try {
//    const { name } = req.body;
//
//    // Validate name
//    if (!name) {
//      return res.status(400).json({ error: "Department name is required" });
//    }
//
//    console.log(name)
//
//    // Fetch department by name
//    const { data: departments, error: fetchError } = await supabase
//      .from("Department")
//      .select("id")
//      .eq("name", name);
//
//    if (fetchError) {
//      console.error("Fetch error:", fetchError);
//      return res.status(500).json({ error: "Error fetching department from database" });
//    }
//
//    // Check if department exists
//    if (!departments || departments.length === 0) {
//      return res.status(404).json({ error: "Department not found with this name" });
//    }
//
//    res.status(200).json({
//      success: true,
//      departmentId: departments[0].id,
//    });
//  } catch (err) {
//    console.error("Server error:", err);
//    res.status(500).json({ error: "Internal server error" });
//  }
//});
//
////router.post("/getComplaintsByDepartment", async (req, res) => {
////  try {
////    const { departmentId } = req.body;
////
////    // Validate departmentId
////    if (!departmentId) {
////      return res.status(400).json({ error: "Department ID is required" });
////    }
////
////    // Fetch complaints by department ID with poster details
////    const { data: complaints, error: fetchError } = await supabase
////      .from("Complaint")
////      .select(`
////        *,
////        User:posterId (
////          id,
////          name,
////          aadharNumber,
////          profile_pic
////        ),
////        Department:departmentId (
////          id,
////          name,
////          type
////        )
////      `)
////      .eq("departmentId", departmentId)
////      .order('dateTime', { ascending: false }); // Latest complaints first
////
////    if (fetchError) {
////      console.error("Fetch error:", fetchError);
////      return res.status(500).json({ error: "Error fetching complaints from database" });
////    }
////
////    res.status(200).json({
////      success: true,
////      count: complaints.length,
////      complaints: complaints,
////    });
////  } catch (err) {
////    console.error("Server error:", err);
////    res.status(500).json({ error: "Internal server error" });
////  }
////});
//
//router.post("/getComplaintsByDepartment", async (req, res) => {
//  console.log("Called get complaints by id")
//  try {
//    const { departmentId } = req.body;
//
//    // Validate input
//    if (!departmentId) {
//      return res.status(400).json({ error: "departmentId is required" });
//    }
//
//<<<<<<< HEAD
//    // Fetch complaints for this department
//    const { data: complaints, error } = await supabase
//      .from("Complaint")
//      .select("*")
//      .eq("departmentId", departmentId)
//      .order("dateTime", { ascending: false }); // Latest first
//
//    if (error) {
//      console.error("Supabase fetch error:", error);
//      return res.status(500).json({ error: "Error fetching complaints" });
//=======
//    // Fetch all complaints for that department
//    const { data: complaints, error: fetchError } = await supabase
//      .from("Complaint")
//      .select("*")
//      .eq("departmentId", departmentId)
//      .order("dateTime", { ascending: false }); // Newest first
//
//    if (fetchError) {
//      console.error("Fetch error:", fetchError);
//      return res.status(500).json({ error: "Error fetching complaints from Supabase" });
//>>>>>>> 90e7d7d1358014dab215b4c6c8055073a3c811d0
//    }
//
//    // Send response
//    return res.status(200).json({
//      success: true,
//<<<<<<< HEAD
//      message: "Complaints fetched successfully",
//      complaints: complaints || [],
//=======
//      total: complaints.length,
//      complaints,
//>>>>>>> 90e7d7d1358014dab215b4c6c8055073a3c811d0
//    });
//  } catch (err) {
//    console.error("Server error:", err);
//    return res.status(500).json({ error: "Internal server error" });
//  }
//});
//
//
//router.post("/getAiSummary", async (req, res) => {
//  try {
//    const { imageBase64 } = req.body;
//    if (!imageBase64) {
//      return res.status(400).json({ error: "imageBase64 is required" });
//    }
//
//    // Compose the prompt for the AI
//    const query = `
//You are an information extraction system. Given an image and its context, extract ONLY the following complaint fields as a pure JSON object (no extra text, no explanation, no markdown):
//
//{
//  "title": "Short title for the complaint",
//  "category": "One of: ELEC, GARB, ROAD, WATER",
//  "description": "Short description for the image",
//  "severity": "Integer from 1 to 10 (1 = lowest, 10 = highest)"
//}
//
//Respond ONLY with the JSON object above, nothing else.
//`
//
//    // Send to Flask AI endpoint
//    const aiResponse = await fetch("http://localhost:5000/img", {
//      method: "POST",
//      headers: { "Content-Type": "application/json" },
//      body: JSON.stringify({
//        query,
//        image: imageBase64
//      })
//    });
//
//    const aiData = await aiResponse.json();
//    if (aiData.status !== "success") {
//      return res.status(500).json({ error: "AI summary failed", details: aiData.message });
//    }
//
//    // Clean and extract valid JSON substring
//    let rawText = aiData.response.trim();
//    const firstBrace = rawText.indexOf("{");
//    const lastBrace = rawText.lastIndexOf("}");
//    if (firstBrace === -1 || lastBrace === -1) {
//      return res.status(500).json({ error: "No valid JSON object found", details: rawText });
//    }
//
//    const jsonSubstring = rawText.slice(firstBrace, lastBrace + 1);
//
//    // Parse the cleaned JSON
//    let summary;
//    try {
//      summary = JSON.parse(jsonSubstring);
//      console.log(summary)
//    } catch (e) {
//      return res.status(500).json({ error: "Failed to parse cleaned AI JSON", details: jsonSubstring });
//    }
//
//    return res.status(200).json({ summary });
//  } catch (err) {
//    console.error("Server error:", err);
//    res.status(500).json({ error: "Internal server error" });
//  }
//});
//
//router.post("/createTeam", async (req, res) => {
//  try {
//    const { team_name, members } = req.body;
//
//    // Validation
//    if (!team_name || !Array.isArray(members) || members.length === 0) {
//      return res.status(400).json({
//        error: "Team name and members array are required",
//      });
//    }
//
//    // Insert into Supabase
//    const { data, error } = await supabase
//      .from("team")
//      .insert([
//        {
//          team_name,
//          members, // directly insert as text[]
//        },
//      ])
//      .select(); // return the inserted row
//
//    if (error) {
//      console.error("Insert error:", error);
//      return res.status(500).json({
//        error: "Error creating team in database",
//      });
//    }
//
//    // Respond with created team
//    return res.status(201).json({
//      message: "Team created successfully",
//      team: data[0],
//    });
//  } catch (err) {
//    console.error("Server error:", err);
//    return res.status(500).json({
//      error: "Internal server error",
//    });
//  }
//});
//
//router.get("/getAllTeams", async (req, res) => {
//  try {
//    // Fetch all teams
//    const { data: teams, error } = await supabase
//      .from("team")
//      .select("*")
//      .order("created_at", { ascending: false }); // newest first
//
//    if (error) {
//      console.error("Fetch error:", error);
//      return res.status(500).json({
//        error: "Error fetching teams from database",
//      });
//    }
//
//    return res.status(200).json({
//      message: "Teams fetched successfully",
//      count: teams.length,
//      teams,
//    });
//  } catch (err) {
//    console.error("Server error:", err);
//    return res.status(500).json({
//      error: "Internal server error",
//    });
//  }
//});
//
//export default router

import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// -----------------------------------------------------------------------------
// Get Department ID by name
// -----------------------------------------------------------------------------
router.post("/getDepartmentId", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Department name is required" });
    }

    console.log("Requested Department:", name);

    const { data: departments, error: fetchError } = await supabase
      .from("Department")
      .select("id")
      .eq("name", name);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({ error: "Error fetching department from database" });
    }

    if (!departments || departments.length === 0) {
      return res.status(404).json({ error: "Department not found with this name" });
    }

    res.status(200).json({
      success: true,
      departmentId: departments[0].id,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------------------------------
// Get Complaints by Department ID
// -----------------------------------------------------------------------------
router.post("/getComplaintsByDepartment", async (req, res) => {
  console.log("Called getComplaintsByDepartment");

  try {
    const { departmentId } = req.body;

    if (!departmentId) {
      return res.status(400).json({ error: "departmentId is required" });
    }

    const { data: complaints, error: fetchError } = await supabase
      .from("Complaint")
      .select("*")
      .eq("departmentId", departmentId)
      .order("dateTime", { ascending: false });

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({ error: "Error fetching complaints from Supabase" });
    }

    res.status(200).json({
      success: true,
      total: complaints.length,
      complaints,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------------------------------
// AI Summary Endpoint
// -----------------------------------------------------------------------------
router.post("/getAiSummary", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const query = `
You are an information extraction system. Given an image and its context, extract ONLY the following complaint fields as a pure JSON object (no extra text, no explanation, no markdown):

{
  "title": "Short title for the complaint",
  "category": "One of: ELEC, GARB, ROAD, WATER",
  "description": "Short description for the image",
  "severity": "Integer from 1 to 10 (1 = lowest, 10 = highest)"
}

Respond ONLY with the JSON object above, nothing else.
`;

    const aiResponse = await fetch("http://localhost:5000/img", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        image: imageBase64,
      }),
    });

    const aiData = await aiResponse.json();

    if (aiData.status !== "success") {
      return res.status(500).json({ error: "AI summary failed", details: aiData.message });
    }

    let rawText = aiData.response.trim();
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(500).json({ error: "No valid JSON object found", details: rawText });
    }

    const jsonSubstring = rawText.slice(firstBrace, lastBrace + 1);
    let summary;

    try {
      summary = JSON.parse(jsonSubstring);
      console.log(summary);
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse cleaned AI JSON", details: jsonSubstring });
    }

    res.status(200).json({ summary });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------------------------------------------------------
// Create Team Endpoint
// -----------------------------------------------------------------------------
router.post("/createTeam", async (req, res) => {
  try {
    const { team_name, members } = req.body;

    if (!team_name || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        error: "Team name and members array are required",
      });
    }

    const { data, error } = await supabase
      .from("team")
      .insert([{ team_name, members }])
      .select();

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({
        error: "Error creating team in database",
      });
    }

    res.status(201).json({
      message: "Team created successfully",
      team: data[0],
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

// -----------------------------------------------------------------------------
// Get All Teams
// -----------------------------------------------------------------------------
router.get("/getAllTeams", async (req, res) => {
  try {
    const { data: teams, error } = await supabase
      .from("team")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      return res.status(500).json({
        error: "Error fetching teams from database",
      });
    }

    res.status(200).json({
      message: "Teams fetched successfully",
      count: teams.length,
      teams,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});

export default router;

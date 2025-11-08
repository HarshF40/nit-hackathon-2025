import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/getDepartmentId", async (req, res) => {
  try {
    const { name } = req.body;

    // Validate name
    if (!name) {
      return res.status(400).json({ error: "Department name is required" });
    }

    console.log(name)

    // Fetch department by name
    const { data: departments, error: fetchError } = await supabase
      .from("Department")
      .select("id")
      .eq("name", name);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({ error: "Error fetching department from database" });
    }

    // Check if department exists
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

router.post("/getComplaintsByDepartment", async (req, res) => {
  try {
    const { departmentId } = req.body;

    // Validate departmentId
    if (!departmentId) {
      return res.status(400).json({ error: "Department ID is required" });
    }

    // Fetch complaints by department ID with poster details
    const { data: complaints, error: fetchError } = await supabase
      .from("Complaint")
      .select(`
        *,
        User:posterId (
          id,
          name,
          aadharNumber,
          profile_pic
        ),
        Department:departmentId (
          id,
          name,
          type
        )
      `)
      .eq("departmentId", departmentId)
      .order('dateTime', { ascending: false }); // Latest complaints first

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({ error: "Error fetching complaints from database" });
    }

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints: complaints,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router

import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.get("/getAllDepartments", async (req, res) => {
  try {
    // Fetch all departments from Supabase table (excluding password)
    const { data: departments, error: fetchError } = await supabase
      .from("Department")
      .select("id, type, name, address, location, registrationCopy");

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({ error: "Error fetching departments from database" });
    }

    res.status(200).json({
      success: true,
      count: departments.length,
      departments: departments,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router

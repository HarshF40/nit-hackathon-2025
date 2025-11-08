import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/getUserId", async (req, res) => {
  try {
    const { aadharNumber } = req.body;

    // Validate aadhar number
    if (!aadharNumber) {
      return res.status(400).json({ error: "Aadhar number is required" });
    }

    // Fetch user by aadhar number
    const { data: users, error: fetchError } = await supabase
      .from("User")
      .select("id")
      .eq("aadharNumber", aadharNumber);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({ error: "Error fetching user from database" });
    }

    // Check if user exists
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found with this Aadhar number" });
    }

    res.status(200).json({
      success: true,
      userId: users[0].id,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router

import express from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();
const router = express.Router();

// Supabase client using SERVICE ROLE key (server-side)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/regdep
router.post("/regdep", upload.single("registrationCopy"), async (req, res) => {
  try {
    const { type, name, address, location, password } = req.body; // include password
    const file = req.file;

    if (!file) return res.status(400).json({ error: "PDF file is required" });
    if (!password) return res.status(400).json({ error: "Password is required" });

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 salt rounds

    // Upload PDF to Supabase Storage bucket
    const fileName = `${Date.now()}_${file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from("regpdf")
      .upload(fileName, file.buffer, { contentType: "application/pdf" });

    if (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ error: "Error uploading file to Supabase" });
    }

    // Get public URL of uploaded PDF
    const { data: publicUrlData } = supabase.storage
      .from("regpdf")
      .getPublicUrl(fileName);

    const registrationCopyUrl = publicUrlData.publicUrl;

    // Insert new department into Supabase table
    const { data: newDepartment, error: insertError } = await supabase
      .from("Department")
      .insert([{
        type,
        name,
        address,
        location: JSON.parse(location),
        registrationCopy: registrationCopyUrl,
        password: hashedPassword, // store hashed password
      }])
      .select();

    if (insertError) {
      console.error(insertError);
      return res.status(500).json({ error: "Error creating department in Supabase" });
    }

    res.status(201).json({
      message: "Department registered successfully",
      department: newDepartment[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper to convert base64 to buffer
function base64ToBuffer(base64String) {
  const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid base64 string");
  }
  const buffer = Buffer.from(matches[2], "base64");
  return { buffer, mimeType: matches[1] };
}

// POST /api/registerUser
router.post("/registerUser", async (req, res) => {
  try {
    const { name, aadharNumber, permanentAddress, dob, profilePic } = req.body;

    if (!name || !aadharNumber || !permanentAddress || !dob) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let profilePicUrl = null;

    if (profilePic) {
      // Convert base64 to buffer
      const { buffer, mimeType } = base64ToBuffer(profilePic);

      const fileName = `${Date.now()}_profilePic.${mimeType.split("/")[1]}`;
      
      const { error: uploadError } = await supabase.storage
        .from("profilePic")
        .upload(fileName, buffer, { contentType: mimeType });

      if (uploadError) {
        console.error(uploadError);
        return res.status(500).json({ error: "Error uploading profile picture" });
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("profilePic")
        .getPublicUrl(fileName);

      profilePicUrl = publicUrlData.publicUrl;
    }

    // Insert new user into Supabase
    const { data: newUser, error: insertError } = await supabase
      .from("User")
      .insert([{
        name,
        aadharNumber,
        permanentAddress,
        dob: new Date(dob),
        profile_pic: profilePicUrl
      }])
      .select();

    if (insertError) {
      console.error(insertError);
      return res.status(500).json({ error: "Error creating user in Supabase" });
    }

    res.status(201).json({
      message: "User registered successfully",
      user: newUser[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

import bcrypt from "bcryptjs";
import express from "express";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/logindept", async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ error: "Name and password are required" });
    }

    console.log(name, password)

    // Fetch the department by name
    const { data: department, error } = await supabase
      .from("Department")
      .select("id, type, password")
      .eq("name", name)
      .single(); // single row expected

    if (error || !department) {
      return res.status(401).json({ error: "Invalid name or password" });
    }

    // Compare incoming password with hashed password
    const match = await bcrypt.compare(password, department.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Password matched, return department type
    res.json({ type: department.type });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//router.post("/registerUser", upload.single("profilePic"), async (req, res) => {
//  try {
//    const { name, aadharNumber, permanentAddress, dob } = req.body;
//    const file = req.file;
//
//    if (!name || !aadharNumber || !permanentAddress || !dob) {
//      return res.status(400).json({ error: "Missing required fields" });
//    }
//
//    let profilePicUrl = null;
//
//    if (file) {
//      const fileName = `${Date.now()}_${file.originalname}`;
//      const { error: uploadError } = await supabase.storage
//        .from("proflePic")
//        .upload(fileName, file.buffer, { contentType: file.mimetype });
//
//      if (uploadError) {
//        console.error(uploadError);
//        return res.status(500).json({ error: "Error uploading profile picture" });
//      }
//
//      // Get public URL
//      const { data: publicUrlData } = supabase.storage
//        .from("proflePic")
//        .getPublicUrl(fileName);
//
//      profilePicUrl = publicUrlData.publicUrl;
//    }
//
//    // Insert new user into Supabase
//    const { data: newUser, error: insertError } = await supabase
//      .from("User")
//      .insert([{
//        name,
//        aadharNumber,
//        permanentAddress,
//        dob: new Date(dob),
//        profile_pic: profilePicUrl
//      }])
//      .select();
//
//    if (insertError) {
//      console.error(insertError);
//      return res.status(500).json({ error: "Error creating user in Supabase" });
//    }
//
//    res.status(201).json({
//      message: "User registered successfully",
//      user: newUser[0],
//    });
//
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: "Internal server error" });
//  }
//});

//router.post("/registerUser", upload.single("profile_pic"), async (req, res) => {
//  try {
//    const { name, aadharNumber, permanentAddress, dob, password } = req.body;
//    const file = req.file;
//
//    // DEBUG: Check what's being received
//    console.log("Body:", req.body);
//    console.log("File:", req.file);
//    console.log("Headers:", req.headers);
//
//    // Validate required fields
//    if (!name || !aadharNumber || !permanentAddress || !dob) {
//      return res.status(400).json({ error: "All fields are required" });
//    }
//
//    console.log(name, aadharNumber, permanentAddress, dob, password)
//
//    if (!password) {
//      return res.status(400).json({ error: "Password is required" });
//    }
//
//    // Encrypt password
//    const hashedPassword = await bcrypt.hash(password, 10);
//
//    let profilePicUrl = null;
//
//    // Handle profile pic upload if provided
//    if (file) {
//      // Upload image to Supabase Storage bucket
//      const fileName = `${Date.now()}_${file.originalname}`;
//      const { error: uploadError } = await supabase.storage
//        .from("proflePic")
//        .upload(fileName, file.buffer, { contentType: "image/jpeg" });
//
//      if (uploadError) {
//        console.error(uploadError);
//        return res.status(500).json({ error: "Error uploading image to Supabase" });
//      }
//
//      // Get public URL of uploaded image
//      const { data: publicUrlData } = supabase.storage
//        .from("proflePic")
//        .getPublicUrl(fileName);
//
//      profilePicUrl = publicUrlData.publicUrl;
//    }
//
//    // Insert new user into Supabase table
//    const { data: newUser, error: insertError } = await supabase
//      .from("User")
//      .insert([{
//        name,
//        aadharNumber,
//        permanentAddress,
//        dob,
//        profile_pic: profilePicUrl,
//        password: hashedPassword,
//      }])
//      .select();
//
//    if (insertError) {
//      console.error(insertError);
//      
//      // Handle unique constraint violation (duplicate aadhar)
//      if (insertError.code === '23505') {
//        return res.status(409).json({ error: "Aadhar number already registered" });
//      }
//
//      return res.status(500).json({ error: "Error creating user in Supabase" });
//    }
//
//    res.status(201).json({
//      message: "User registered successfully",
//      user: {
//        id: newUser[0].id,
//        name: newUser[0].name,
//        aadharNumber: newUser[0].aadharNumber,
//        permanentAddress: newUser[0].permanentAddress,
//        dob: newUser[0].dob,
//        profile_pic: newUser[0].profile_pic,
//      },
//    });
//  } catch (err) {
//    console.error(err);
//    res.status(500).json({ error: "Internal server error" });
//  }
//});

router.post("/registerUser", async (req, res) => {
  try {
    const { name, aadharNumber, permanentAddress, dob, password, profilePicBase64 } = req.body;

    // DEBUG: Check what's being received
    console.log("Body received:", { name, aadharNumber, permanentAddress, dob, hasPassword: !!password, hasImage: !!profilePicBase64 });

    // Validate required fields
    if (!name || !aadharNumber || !permanentAddress || !dob) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    let profilePicUrl = null;

    // Handle profile pic upload if provided
    if (profilePicBase64) {
      try {
        // Remove data:image/jpeg;base64, prefix
        const base64Data = profilePicBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate unique filename
        const fileName = `${Date.now()}_profile.jpg`;

        // Upload image to Supabase Storage bucket
        const { error: uploadError } = await supabase.storage
          .from("proflePic")
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
          .from("proflePic")
          .getPublicUrl(fileName);

        profilePicUrl = publicUrlData.publicUrl;
        console.log("Image uploaded successfully:", profilePicUrl);
      } catch (imageError) {
        console.error("Image processing error:", imageError);
        return res.status(500).json({ error: "Error processing image" });
      }
    }

    // Insert new user into Supabase table
    const { data: newUser, error: insertError } = await supabase
      .from("User")
      .insert([{
        name,
        aadharNumber,
        permanentAddress,
        dob,
        profile_pic: profilePicUrl,
        password: hashedPassword,
      }])
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      
      // Handle unique constraint violation (duplicate aadhar)
      if (insertError.code === '23505') {
        return res.status(409).json({ error: "Aadhar number already registered" });
      }

      return res.status(500).json({ error: "Error creating user in Supabase" });
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        aadharNumber: newUser[0].aadharNumber,
        permanentAddress: newUser[0].permanentAddress,
        dob: newUser[0].dob,
        profile_pic: newUser[0].profile_pic,
      },
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/loginUser", async (req, res) => {
  try {
    const { aadharNumber, password } = req.body;

    // Validate required fields
    if (!aadharNumber || !password) {
      return res.status(400).json({ error: "Aadhar number and password are required" });
    }

    // Find user by aadhar number
    const { data: users, error: fetchError } = await supabase
      .from("User")
      .select("*")
      .eq("aadharNumber", aadharNumber);

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({ error: "Error fetching user from database" });
    }

    // Check if user exists
    if (!users || users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];

    // Compare password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Login successful
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        aadharNumber: user.aadharNumber,
        permanentAddress: user.permanentAddress,
        dob: user.dob,
        profile_pic: user.profile_pic,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router

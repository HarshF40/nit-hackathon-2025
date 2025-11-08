import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/createPost", async (req, res) => {
  try {
    const { description, location, imageBase64, aadharNumber } = req.body;

    console.log("Create post")
    
    // Validate required fields
    if (!description || !location || !aadharNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Get user ID from aadhar number
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

    const authorId = users[0].id;

    // Create current timestamp in ISO format (compatible with timestampz)
    const dateTime = new Date().toISOString();

    let imageUrl = null;

    // Handle image upload if provided
    if (imageBase64) {
      try {
        // Remove data:image/jpeg;base64, prefix
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Generate unique filename
        const fileName = `${Date.now()}_post.jpg`;

        // Upload image to Supabase Storage bucket
        const { error: uploadError } = await supabase.storage
          .from("postPic")
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
          .from("postPic")
          .getPublicUrl(fileName);

        imageUrl = publicUrlData.publicUrl;
      } catch (imageError) {
        console.error("Image processing error:", imageError);
        return res.status(500).json({ error: "Error processing image" });
      }
    }

    // Insert new post into Supabase table
    const { data: newPost, error: insertError } = await supabase
      .from("Post")
      .insert([{
        description,
        location: location, // Just store as text now
        dateTime,
        imageUrl,
        authorId,
        upvote: 0,
        downvote: 0,
      }])
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({ error: "Error creating post in Supabase" });
    }

    res.status(201).json({
      message: "Post created successfully",
      post: newPost[0],
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/createReply", async (req, res) => {
    console.log("Logging comment out")
  try {
    const { 
      comment, 
      parentCommentId, 
      postId,
      userId 
    } = req.body;

    console.log("Logging comment")

    // Validate required fields
    if (!comment || !parentCommentId || !userId) {
      return res.status(400).json({ error: "Comment, parentCommentId, and userId are required" });
    }

    // Insert new reply into Supabase table
    const { data: newReply, error: insertError } = await supabase
      .from("Comment")
      .insert([{
        comment,
        likes: 0,
        isReply: true,
        parentCommentId,
        postId: postId || null,
        userId,
      }])
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({ error: "Error creating reply in Supabase" });
    }

    res.status(201).json({
      message: "Reply created successfully",
      reply: newReply[0],
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router

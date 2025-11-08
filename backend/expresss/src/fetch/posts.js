import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.get("/getAllPosts", async (req, res) => {
  try {
    // Fetch all posts from Supabase table with author details
    const { data: posts, error: fetchError } = await supabase
      .from("Post")
      .select(`
        *,
        User:authorId (
          id,
          name,
          aadharNumber,
          profile_pic
        )
      `)
      .order('dateTime', { ascending: false }); // Latest posts first

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({ error: "Error fetching posts from database" });
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      posts: posts,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router

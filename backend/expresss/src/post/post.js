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

    console.log("Create post");

    // Validate required fields
    if (!description || !location || !aadharNumber) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Ensure location has both latitude and longitude
    if (
      typeof location !== "object" ||
      location.latitude === undefined ||
      location.longitude === undefined
    ) {
      return res.status(400).json({ error: "Location must include latitude and longitude" });
    }

    // Create current timestamp in ISO format (for timestampz)
    const dateTime = new Date().toISOString();

    let imageUrl = null;

    // Handle image upload if provided
    if (imageBase64) {
      try {
        // Remove base64 header prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Unique filename for the image
        const fileName = `${Date.now()}_post.jpg`;

        // Upload image to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from("postPic")
          .upload(fileName, buffer, {
            contentType: "image/jpeg",
            cacheControl: "3600",
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          return res.status(500).json({ error: "Error uploading image to Supabase" });
        }

        // Retrieve public URL for the uploaded image
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
      .insert([
        {
          description,
          location, // Directly store JSON object
          dateTime,
          imageUrl,
          upvote: 0,
          downvote: 0,
          authorAadhar: aadharNumber, // Store directly
        },
      ])
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

//router.post("/createReply", async (req, res) => {
//    console.log("Logging comment out")
//  try {
//    const { 
//      comment, 
//      parentCommentId, 
//      postId,
//      userId 
//    } = req.body;
//
//    console.log("Logging comment")
//
//    // Validate required fields
//    if (!comment || !parentCommentId || !userId) {
//      return res.status(400).json({ error: "Comment, parentCommentId, and userId are required" });
//    }
//
//    // Insert new reply into Supabase table
//    const { data: newReply, error: insertError } = await supabase
//      .from("Comment")
//      .insert([{
//        comment,
//        likes: 0,
//        isReply: true,
//        parentCommentId,
//        postId: postId || null,
//        userId,
//      }])
//      .select();
//
//    if (insertError) {
//      console.error("Insert error:", insertError);
//      return res.status(500).json({ error: "Error creating reply in Supabase" });
//    }
//
//    res.status(201).json({
//      message: "Reply created successfully",
//      reply: newReply[0],
//    });
//  } catch (err) {
//    console.error("Server error:", err);
//    res.status(500).json({ error: "Internal server error" });
//  }
//});

router.post("/createComment", async (req, res) => {
  try {
    const { comment, postId, authorAadhar } = req.body;

    console.log("Creating comment...");

    // Validate required fields
    if (!comment || !postId || !authorAadhar) {
      return res.status(400).json({ error: "comment, postId, and authorAadhar are required" });
    }

    // Insert new comment into Supabase
    const { data: newComment, error: insertError } = await supabase
      .from("Comment")
      .insert([
        {
          comment,
          postId,
          authorAadhar,
          likes: 0, // default
        },
      ])
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return res.status(500).json({ error: "Error creating comment in Supabase" });
    }

    res.status(201).json({
      message: "Comment created successfully",
      comment: newComment[0],
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/getComments", async (req, res) => {
  try {
    const { postId } = req.body;

    console.log("Fetching comments for post:", postId);

    // Validate input
    if (!postId) {
      return res.status(400).json({ error: "postId is required in request body" });
    }

    // Fetch all comments for the given post, newest first
    const { data: comments, error: fetchError } = await supabase
      .from("Comment")
      .select("*")
      .eq("postId", postId)
      .order("id", { ascending: false });

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({ error: "Error fetching comments from Supabase" });
    }

    res.status(200).json({
      message: "Comments fetched successfully",
      comments: comments || [],
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getPosts", async (req, res) => {
  try {
    console.log("Fetching all posts...");

    // Fetch all posts ordered by newest first
    const { data: posts, error: fetchError } = await supabase
      .from("Post")
      .select("*")
      .order("dateTime", { ascending: false });

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return res.status(500).json({ error: "Error fetching posts from Supabase" });
    }

    // Handle case when no posts found
    if (!posts || posts.length === 0) {
      return res.status(200).json({ message: "No posts found", posts: [] });
    }

    // Send response
    res.status(200).json({
      message: "Posts fetched successfully",
      posts: posts,
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/updateVote", async (req, res) => {
  try {
    const { postId, type } = req.body;

    console.log("Updating vote:", postId, type);

    // Validate input
    if (!postId || !type) {
      return res.status(400).json({ error: "postId and type are required" });
    }

    if (type !== "upvote" && type !== "downvote") {
      return res.status(400).json({ error: "Invalid vote type. Must be 'upvote' or 'downvote'" });
    }

    // Fetch current value first
    const { data: post, error: fetchError } = await supabase
      .from("Post")
      .select(type)
      .eq("id", postId)
      .single();

    if (fetchError || !post) {
      console.error("Fetch error:", fetchError);
      return res.status(404).json({ error: "Post not found" });
    }

    // Compute new vote count
    const newValue = (post[type] || 0) + 1;

    // Update the value in the database
    const { error: updateError } = await supabase
      .from("Post")
      .update({ [type]: newValue })
      .eq("id", postId);

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ error: "Error updating vote count" });
    }

    res.status(200).json({
      message: `${type} updated successfully`,
      postId,
      newValue,
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/likeComment", async (req, res) => {
  try {
    const { commentId } = req.body;

    console.log("Liking comment:", commentId);

    // Validate input
    if (!commentId) {
      return res.status(400).json({ error: "commentId is required in request body" });
    }

    // Fetch current likes for the comment
    const { data: comment, error: fetchError } = await supabase
      .from("Comment")
      .select("likes")
      .eq("id", commentId)
      .single();

    if (fetchError || !comment) {
      console.error("Fetch error:", fetchError);
      return res.status(404).json({ error: "Comment not found" });
    }

    // Increment the like count
    const newLikes = (comment.likes || 0) + 1;

    // Update likes in the database
    const { error: updateError } = await supabase
      .from("Comment")
      .update({ likes: newLikes })
      .eq("id", commentId);

    if (updateError) {
      console.error("Update error:", updateError);
      return res.status(500).json({ error: "Error updating likes" });
    }

    res.status(200).json({
      message: "Like added successfully",
      commentId,
      newLikes,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



export default router

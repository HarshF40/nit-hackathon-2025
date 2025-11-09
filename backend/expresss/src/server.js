import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import registrationRoutes from "./registration/registration.js";
import loginRoutes from "../src/login/login.js";
import postRoute from "../src/post/post.js"
import fetchPost from "../src/fetch/posts.js"
import fetchDept from "../src/fetch/department.js"
import complaintPost from "../src/complaint/complaint.js"
import getUserId from "../src/getId/getUserId.js"
import webFetch from "../src/web/dashboard.js"
import mapFetch from "../src/fetch/map.js"

dotenv.config();
const app = express();

app.use(cors({
  origin: "*", // or specify your frontend origin like "http://localhost:5173"
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ limit:'50mb', extended: true }));

// Register route modules
app.use("/api", registrationRoutes);
app.use("/", loginRoutes);
app.use("/", postRoute);
app.use("/fetch", fetchPost);
app.use("/fetch", fetchDept);
app.use("/", complaintPost);
app.use("/", getUserId);
app.use("/", webFetch);
app.use("/", mapFetch)

// Default route
app.get("/", (req, res) => {
  res.send("Server is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

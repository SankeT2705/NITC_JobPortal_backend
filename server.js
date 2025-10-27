import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import userRoutes from "./routes/userRoutes.js";



dotenv.config();
connectDB();

const app = express();

//Define allowed origins for both local & production
const allowedOrigins = [
  "http://localhost:3000",
  "https://nitc-job-portal.vercel.app",
  "https://nitc-job-portal-backend.vercel.app"
];


//CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked by CORS: ${origin}`);
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

//JSON body parser
app.use(express.json({ limit: "10mb" }));

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

//Default route
app.get("/", (req, res) => {
  res.send("🚀 NITC Job Portal Backend Running on Vercel + MongoDB Atlas!");
});

//Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

app.use("/api/superadmin", superAdminRoutes);

//Export app for Vercel serverless functions
export default app;

//For local development only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🌐 Local server running on http://localhost:${PORT}`)
  );
}

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./utils/db.js";

import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import aiRoute from "./routes/ai.route.js";
import adminRoute from "./routes/admin.route.js";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const envCandidates = [
  path.join(__dirname, ".env"),
  path.join(__dirname, "config", ".env"),
  path.join(__dirname, "..", ".env"),
];
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
dotenv.config(envPath ? { path: envPath } : undefined);
console.log("[ENV] GROQ API KEY loaded:", Boolean(process.env.GROQ_API_KEY));




const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/, "https://job-application-web-git-main-harshad660s-projects.vercel.app", /\.vercel\.app$/],
    credentials: true,
  })
);


app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/ai", aiRoute);
app.use("/api/v1/admin", adminRoute);
console.log("Routes loaded");

app.use((err, req, res, _next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ success: false, message: err?.message || "Internal server error" });
});

// Serve Static Files for Deployment
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
    res.sendFile(path.resolve(frontendPath, "index.html"));
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    connectDB();
    console.log(`🚀 Server running on port ${PORT}`);
});

export default app;

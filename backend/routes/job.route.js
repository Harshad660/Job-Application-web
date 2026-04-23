import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isRecruiter from "../middlewares/isRecruiter.js";

import {getAllJobs, getJobById, postJob,getAdminJobs} from "../controllers/job.controller.js";

const router = express.Router();
router.route("/post").post(isAuthenticated, isRecruiter, postJob);
// Public job browsing (students can view without logging in)
router.route("/get").get(getAllJobs);
router.route("/getadminjobs").get(isAuthenticated, isRecruiter, getAdminJobs);
router.route("/get/:id").get(getJobById);
export default router;
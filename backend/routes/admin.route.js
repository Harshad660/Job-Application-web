import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isAdmin from "../middlewares/isAdmin.js";
import { 
    getAllUsers, 
    deleteUser, 
    toggleBlockUser, 
    getAllRecruiters, 
    approveRecruiter, 
    getAllJobs, 
    deleteJobByAdmin, 
    getAllApplications, 
    getDashboardStats 
} from "../controllers/admin.controller.js";

const router = express.Router();

router.route("/stats").get(isAuthenticated, isAdmin, getDashboardStats);

router.route("/users").get(isAuthenticated, isAdmin, getAllUsers);
router.route("/users/:id").delete(isAuthenticated, isAdmin, deleteUser);
router.route("/users/block/:id").post(isAuthenticated, isAdmin, toggleBlockUser);

router.route("/recruiters").get(isAuthenticated, isAdmin, getAllRecruiters);
router.route("/recruiters/approve/:id").post(isAuthenticated, isAdmin, approveRecruiter);

router.route("/jobs").get(isAuthenticated, isAdmin, getAllJobs);
router.route("/jobs/:id").delete(isAuthenticated, isAdmin, deleteJobByAdmin);

router.route("/applications").get(isAuthenticated, isAdmin, getAllApplications);

export default router;

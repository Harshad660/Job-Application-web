import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Company } from "../models/company.model.js";
import { sendAdminEmail } from "../utils/sendEmail.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'student' }).sort({ createdAt: -1 });
        return res.status(200).json({
            users,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        return res.status(200).json({
            message: "User deleted successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const toggleBlockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { reason } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        if (user.isBlocked) {
            await sendAdminEmail(user.email, user.fullName, "Account Blocked", reason);
        } else {
            await sendAdminEmail(user.email, user.fullName, "Account Unblocked");
        }

        return res.status(200).json({
            message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const getAllRecruiters = async (req, res) => {
    try {
        const recruiters = await User.find({ role: 'recruiter' }).sort({ createdAt: -1 });
        return res.status(200).json({
            recruiters,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const approveRecruiter = async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body; // 'approve' or 'reject'
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "Recruiter not found.",
                success: false
            });
        }

        if (status === 'approve') {
            user.isApproved = true;
            await user.save();
            await sendAdminEmail(user.email, user.fullName, "Account Approved", "Your recruiter account has been approved. You can now post jobs.");
        } else {
            await User.findByIdAndDelete(userId);
            await sendAdminEmail(user.email, user.fullName, "Account Rejected", "Your recruiter account application was rejected and account removed.");
        }

        return res.status(200).json({
            message: `Recruiter ${status === 'approve' ? 'approved' : 'rejected'} successfully.`,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('company').sort({ createdAt: -1 });
        return res.status(200).json({
            jobs,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const deleteJobByAdmin = async (req, res) => {
    try {
        const jobId = req.params.id;
        await Job.findByIdAndDelete(jobId);
        return res.status(200).json({
            message: "Job deleted successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find()
            .populate('job')
            .populate('applicant')
            .sort({ createdAt: -1 });
        return res.status(200).json({
            applications,
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'student' });
        const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
        const totalJobs = await Job.countDocuments();
        const totalApplications = await Application.countDocuments();

        // Stats for chart
        const jobStats = await Job.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 7 }
        ]);

        const applicationStats = await Application.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            stats: {
                totalUsers,
                totalRecruiters,
                totalJobs,
                totalApplications,
                jobStats,
                applicationStats
            },
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

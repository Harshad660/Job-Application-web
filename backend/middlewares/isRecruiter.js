import { User } from "../models/user.model.js";

const isRecruiter = async (req, res, next) => {
    try {
        const user = await User.findById(req.id);
        if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
            return res.status(403).json({
                message: "Access denied. Recruiter only.",
                success: false
            });
        }
        next();
    } catch (error) {
        console.error("isRecruiter Middleware Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export default isRecruiter;

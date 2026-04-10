import { User } from "../models/user.model.js";

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                message: "Access denied. Admin only.",
                success: false
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

export default isAdmin;

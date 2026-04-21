import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
// REGISTER
export const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;
    console.log("Register:", fullName, email, phoneNumber, password, role);

    if (!fullName || !email || !phoneNumber || !role) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
        success: false,
      });
    }

    // Optional file upload
    let profilePhotoUrl = "";
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      profilePhotoUrl = cloudResponse.secure_url;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      profile: {
        profilePhoto: profilePhotoUrl,
      },
    });

    return res.status(201).json({
      message: "Account created successfully",
      success: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    if (user.role !== role) {
      return res.status(400).json({
        message: "Account doesn't exist with this role",
        success: false,
      });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
        success: false,
      });
    }

    // Check if recruiter is approved
    if (user.role === 'recruiter' && !user.isApproved) {
      return res.status(403).json({
        message: "Your recruiter account is pending approval. Please wait for an admin to approve your account.",
        success: false,
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      profile: user.profile,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict'
      })
      .json({
        message: `Welcome back ${user.fullName}`,
        user: userData,
        token: token, // Added token here for localStorage
        success: true,
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, bio, skills } = req.body;
    const userId = req.id; // from auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (bio) user.profile.bio = bio;
    
    if (skills) {
      if (Array.isArray(skills)) {
        user.profile.skills = skills;
      } else if (typeof skills === 'string') {
        user.profile.skills = skills.split(",").map(skill => skill.trim()).filter(skill => skill !== "");
      }
    }

    if (req.file) {
      try {
        const fileUri = getDataUri(req.file);
        if (fileUri && fileUri.content) {
          const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
          // If it's an image, maybe it's a profile photo? 
          // The previous code was setting it to 'resume'. 
          // Let's keep it as resume for now as per original code, but check file type.
          if (req.file.mimetype.includes('image')) {
            user.profile.profilePhoto = cloudResponse.secure_url;
          } else {
            user.profile.resume = cloudResponse.secure_url;
            user.profile.resumeOriginalName = req.file.originalname;
          }
        }
      } catch (cloudinaryError) {
        console.error("Cloudinary Upload Error:", cloudinaryError);
        // Don't crash the whole update if only upload fails, but let's at least log it
      }
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
      },
      success: true,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

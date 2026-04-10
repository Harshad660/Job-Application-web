import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true, // ✅ remove extra spaces
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    requirements: [
      {
        type: String,
        trim: true,
      },
    ],

    salary: {
      type: Number,
      required: true,
      min: 0, // ✅ validation
    },

    experienceLevel: {
      type: Number,
      required: true,
      min: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    jobType: {
      type: String,
      required: true,
      enum: ["Full-time", "Part-time", "Internship", "Contract"], // ✅ restrict values
    },

    position: {
      type: Number,
      required: true,
      min: 1,
    },

    // ✅ RELATION WITH COMPANY (VERY IMPORTANT)
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // ✅ ADMIN USER
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ APPLICATIONS ARRAY
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
  },
  {
    timestamps: true, // ✅ adds createdAt, updatedAt
  }
);

export const Job = mongoose.model("Job", jobSchema);
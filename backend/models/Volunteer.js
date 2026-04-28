const mongoose = require("mongoose");

const volunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    skills: {
      type: [String],
      required: true,
      default: [],
      set: (skills) => skills.map((skill) => skill.trim()).filter(Boolean)
    },
    availability: {
      type: String,
      enum: ["available", "on_task"],
      required: true,
      default: "available"
    },
    assignedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Volunteer", volunteerSchema);

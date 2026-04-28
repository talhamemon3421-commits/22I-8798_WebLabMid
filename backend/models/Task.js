const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    priority: {
      type: String,
      enum: ["critical", "high", "medium"],
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed"],
      required: true,
      default: "pending"
    },
    minVolunteers: {
      type: Number,
      required: true,
      min: 1
    },
    requiredSkills: {
      type: [String],
      required: true,
      default: [],
      set: (skills) => skills.map((skill) => skill.trim()).filter(Boolean)
    },
    assignedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Volunteer"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Task", taskSchema);

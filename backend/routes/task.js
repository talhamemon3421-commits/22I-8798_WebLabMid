const express = require("express");
const Task = require("../models/Task");
const Volunteer = require("../models/Volunteer");

const router = express.Router();

router.get("/", async (_req, res) => {
  const tasks = await Task.find()
    .populate("assignedVolunteers")
    .sort({ createdAt: -1 });

  res.json(tasks);
});

router.post("/", async (req, res) => {
  const task = await Task.create(req.body);
  const populatedTask = await task.populate("assignedVolunteers");
  res.status(201).json(populatedTask);
});

router.patch("/:id/status", async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  ).populate("assignedVolunteers");

  res.json(task);
});

router.patch("/:id/assign", async (req, res) => {
  const { volunteerId } = req.body;

  const task = await Task.findById(req.params.id);
  const volunteer = await Volunteer.findById(volunteerId);

  if (!task || !volunteer) {
    return res.status(404).json({ message: "Task or volunteer not found" });
  }

  if (volunteer.availability !== "available") {
    return res.status(400).json({ message: "Volunteer is not available" });
  }

  if (!task.assignedVolunteers.some((id) => String(id) === volunteerId)) {
    task.assignedVolunteers.unshift(volunteer._id);
  }

  volunteer.assignedTask = task._id;
  volunteer.availability = "on_task";

  await Promise.all([task.save(), volunteer.save()]);

  const populatedTask = await Task.findById(task._id).populate("assignedVolunteers");
  res.json(populatedTask);
});

router.delete("/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  await Volunteer.updateMany(
    { _id: { $in: task.assignedVolunteers } },
    { $set: { availability: "available", assignedTask: null } }
  );

  await task.deleteOne();

  res.status(204).send();
});

module.exports = router;

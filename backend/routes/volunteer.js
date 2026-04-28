const express = require("express");
const Volunteer = require("../models/Volunteer");

const router = express.Router();

router.get("/", async (_req, res) => {
  const volunteers = await Volunteer.find().sort({ createdAt: -1 });
  res.json(volunteers);
});

router.post("/", async (req, res) => {
  const volunteer = await Volunteer.create(req.body);
  res.status(201).json(volunteer);
});

module.exports = router;

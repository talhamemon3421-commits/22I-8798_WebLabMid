const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const taskRoutes = require("./routes/task");
const volunteerRoutes = require("./routes/volunteer");
const getPortalStats = require("./stats.aggregate");

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb+srv://talhamemon:Talha123@cluster0.ezesr3f.mongodb.net/nexthire?retryWrites=true&w=majority";

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "ResQLink backend is running" });
});

app.get("/api/stats", async (_req, res) => {
  const stats = await getPortalStats();
  res.json(stats);
});

app.use("/api/tasks", taskRoutes);
app.use("/api/volunteers", volunteerRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

mongoose
  .connect(MONGO_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

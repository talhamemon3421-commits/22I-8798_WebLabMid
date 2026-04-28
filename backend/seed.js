const mongoose = require("mongoose");
const Task = require("./models/Task");
const Volunteer = require("./models/Volunteer");

const MONGO_URL =
  process.env.MONGO_URL ||
  "mongodb+srv://talhamemon:Talha123@cluster0.ezesr3f.mongodb.net/nexthire?retryWrites=true&w=majority";

async function seed() {
  await mongoose.connect(MONGO_URL);

  await Promise.all([Task.deleteMany({}), Volunteer.deleteMany({})]);

  const [ahmed, sara, bilal] = await Volunteer.create([
    {
      name: "Ahmed K.",
      email: "ahmed.k@resqlink.org",
      skills: ["first aid", "logistics"],
      availability: "available"
    },
    {
      name: "Sara M.",
      email: "sara.m@resqlink.org",
      skills: ["medical", "search and rescue"],
      availability: "on_task"
    },
    {
      name: "Bilal R.",
      email: "bilal.r@resqlink.org",
      skills: ["engineering", "logistics"],
      availability: "available"
    }
  ]);

  const [medicalTask, shelterTask, waterTask] = await Task.create([
    {
      title: "Medical Supply Distribution",
      description: "Distribute first-response kits to families in Sector 4.",
      priority: "critical",
      status: "active",
      minVolunteers: 2,
      requiredSkills: ["medical", "logistics"],
      assignedVolunteers: []
    },
    {
      title: "Shelter Infrastructure Zone B",
      description: "Reinforce temporary shelters and inspect structural safety.",
      priority: "high",
      status: "active",
      minVolunteers: 3,
      requiredSkills: ["engineering", "logistics", "search and rescue"],
      assignedVolunteers: [ahmed._id, sara._id, bilal._id]
    },
    {
      title: "Water Purification",
      description: "Set up purification points for displaced communities.",
      priority: "medium",
      status: "pending",
      minVolunteers: 2,
      requiredSkills: ["engineering", "logistics"],
      assignedVolunteers: []
    }
  ]);

  ahmed.assignedTask = shelterTask._id;
  ahmed.availability = "on_task";
  sara.assignedTask = shelterTask._id;
  sara.availability = "on_task";
  bilal.assignedTask = shelterTask._id;
  bilal.availability = "on_task";

  await Promise.all([ahmed.save(), sara.save(), bilal.save()]);

  console.log("seeded successfully");

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});

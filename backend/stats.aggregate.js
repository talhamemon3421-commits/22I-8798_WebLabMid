const Task = require("./models/Task");
const Volunteer = require("./models/Volunteer");

async function getPortalStats() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [taskStats] = await Task.aggregate([
    {
      $group: {
        _id: null,
        totalActive: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0]
          }
        },
        totalCritical: {
          $sum: {
            $cond: [{ $eq: ["$priority", "critical"] }, 1, 0]
          }
        },
        completedToday: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "completed"] },
                  { $gte: ["$updatedAt", startOfToday] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalActive: 1,
        totalCritical: 1,
        completedToday: 1
      }
    }
  ]);

  const totalVolunteers = await Volunteer.countDocuments();

  return {
    totalActive: taskStats?.totalActive || 0,
    totalCritical: taskStats?.totalCritical || 0,
    completedToday: taskStats?.completedToday || 0,
    totalVolunteers
  };
}

module.exports = getPortalStats;

const statusCycle = ["pending", "active", "completed"];

let volunteers = [
  {
    id: crypto.randomUUID(),
    name: "Ahmed K.",
    email: "ahmed.k@resqlink.org",
    skills: ["first aid", "logistics"],
    availability: "on_task",
    assignedTaskId: "task-2"
  },
  {
    id: crypto.randomUUID(),
    name: "Sara M.",
    email: "sara.m@resqlink.org",
    skills: ["medical", "search and rescue"],
    availability: "on_task",
    assignedTaskId: "task-2"
  },
  {
    id: crypto.randomUUID(),
    name: "Bilal R.",
    email: "bilal.r@resqlink.org",
    skills: ["engineering", "logistics"],
    availability: "on_task",
    assignedTaskId: "task-2"
  },
  {
    id: crypto.randomUUID(),
    name: "Ayesha N.",
    email: "ayesha.n@resqlink.org",
    skills: ["logistics", "community support"],
    availability: "available",
    assignedTaskId: null
  }
];

const volunteerByName = Object.fromEntries(volunteers.map((volunteer) => [volunteer.name, volunteer.id]));

let tasks = [
  {
    id: "task-1",
    title: "Medical Supply Distribution",
    description: "Deliver trauma kits and medicine crates to the east-side field clinic.",
    priority: "critical",
    status: "active",
    minVolunteers: 2,
    requiredSkills: ["medical", "logistics"],
    assignedVolunteers: [],
    createdAt: new Date().toISOString(),
    completedAt: null
  },
  {
    id: "task-2",
    title: "Shelter Infrastructure Zone B",
    description: "Reinforce temporary shelters and repair damaged weatherproofing.",
    priority: "high",
    status: "active",
    minVolunteers: 3,
    requiredSkills: ["engineering", "logistics", "search and rescue"],
    assignedVolunteers: [
      volunteerByName["Ahmed K."],
      volunteerByName["Sara M."],
      volunteerByName["Bilal R."]
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    completedAt: null
  },
  {
    id: "task-3",
    title: "Water Purification",
    description: "Install purification stations and test water access points for safety.",
    priority: "medium",
    status: "pending",
    minVolunteers: 2,
    requiredSkills: ["engineering", "logistics"],
    assignedVolunteers: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    completedAt: null
  }
];

const state = {
  statusFilter: "all",
  priorityFilters: new Set(["all"])
};

const taskGrid = document.getElementById("taskGrid");
const availableVolunteerList = document.getElementById("availableVolunteerList");
const activeTasksCount = document.getElementById("activeTasksCount");
const criticalTasksCount = document.getElementById("criticalTasksCount");
const volunteerCount = document.getElementById("volunteerCount");
const completedTodayCount = document.getElementById("completedTodayCount");
const taskModal = document.getElementById("taskModal");
const volunteerModal = document.getElementById("volunteerModal");
const taskForm = document.getElementById("taskForm");
const volunteerForm = document.getElementById("volunteerForm");

function isToday(value) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  const today = new Date();

  return date.toDateString() === today.toDateString();
}

function getVolunteerById(id) {
  return volunteers.find((volunteer) => volunteer.id === id);
}

function getAvailableVolunteers() {
  return volunteers.filter((volunteer) => volunteer.availability === "available");
}

function getFilteredTasks() {
  const selectedPriorities = state.priorityFilters.has("all")
    ? []
    : Array.from(state.priorityFilters);

  return tasks.filter((task) => {
    const statusMatches = state.statusFilter === "all" || task.status === state.statusFilter;
    const priorityMatches =
      selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);

    return statusMatches && priorityMatches;
  });
}

function updateStats() {
  activeTasksCount.textContent = tasks.filter((task) => task.status === "active").length;
  criticalTasksCount.textContent = tasks.filter((task) => task.priority === "critical").length;
  volunteerCount.textContent = volunteers.length;
  completedTodayCount.textContent = tasks.filter(
    (task) => task.status === "completed" && isToday(task.completedAt)
  ).length;
}

function renderVolunteerSidebar() {
  const availableVolunteers = getAvailableVolunteers();

  if (!availableVolunteers.length) {
    availableVolunteerList.innerHTML =
      '<div class="empty-state">No volunteers are currently available for assignment.</div>';
    return;
  }

  availableVolunteerList.innerHTML = availableVolunteers
    .map(
      (volunteer) => `
        <article class="volunteer-item">
          <div class="volunteer-meta">
            <h3>${volunteer.name}</h3>
            <span class="availability-badge ${volunteer.availability}">
              ${volunteer.availability.replace("_", " ")}
            </span>
          </div>
          <p>${volunteer.email}</p>
          <div class="skills-row">
            ${volunteer.skills.map((skill) => `<span class="skill-tag">${skill}</span>`).join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function createAssignOptions(task) {
  const options = getAvailableVolunteers()
    .filter(
      (volunteer) =>
        !task.assignedVolunteers.includes(volunteer.id) &&
        volunteer.skills.some((skill) => task.requiredSkills.includes(skill))
    )
    .map((volunteer) => `<option value="${volunteer.id}">${volunteer.name}</option>`)
    .join("");

  return `<option value="">Assign available volunteer</option>${options}`;
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();

  if (!filteredTasks.length) {
    taskGrid.innerHTML =
      '<div class="empty-state">No tasks match the selected status and priority filters.</div>';
    return;
  }

  taskGrid.innerHTML = filteredTasks
    .map((task) => {
      const assignedNames = task.assignedVolunteers
        .map((volunteerId) => getVolunteerById(volunteerId)?.name)
        .filter(Boolean);

      return `
        <article class="task-card" data-task-id="${task.id}">
          <div class="task-top">
            <div>
              <h3>${task.title}</h3>
              <p>${task.description}</p>
            </div>
            <span class="badge priority-${task.priority}">${task.priority}</span>
          </div>

          <div class="task-meta">
            <div>
              <div class="muted-label">Status</div>
              <button class="status-btn status-${task.status}" data-action="cycle-status" data-task-id="${task.id}">
                ${task.status}
              </button>
            </div>
            <div>
              <div class="muted-label">Minimum Volunteers</div>
              <strong>${task.minVolunteers}</strong>
            </div>
            <div>
              <div class="muted-label">Assigned</div>
              <strong>${task.assignedVolunteers.length}</strong>
            </div>
          </div>

          <div class="skills-row">
            ${task.requiredSkills.map((skill) => `<span class="skill-tag">${skill}</span>`).join("")}
          </div>

          <div class="assigned-row">
            ${
              assignedNames.length
                ? assignedNames.map((name) => `<span class="badge status-completed">${name}</span>`).join("")
                : '<span class="muted-label">No volunteers assigned yet</span>'
            }
          </div>

          <div class="task-actions">
            <div class="assign-stack">
              <div class="muted-label">Assign Task</div>
              <div class="assign-row">
                <select data-assign-select="${task.id}">
                  ${createAssignOptions(task)}
                </select>
                <button class="assign-btn" data-action="assign-task" data-task-id="${task.id}">
                  Assign Task
                </button>
              </div>
            </div>
            <button class="delete-btn" data-action="delete-task" data-task-id="${task.id}">
              Delete
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function render() {
  updateStats();
  renderTasks();
  renderVolunteerSidebar();
}

function openModal(modal) {
  modal.classList.remove("hidden");
}

function closeModal(modal) {
  modal.classList.add("hidden");
}

function resetTaskFilters() {
  document.querySelectorAll("#statusTabs .tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.status === state.statusFilter);
  });

  document.querySelectorAll("#priorityTabs .chip").forEach((button) => {
    button.classList.toggle("active", state.priorityFilters.has(button.dataset.priority));
  });
}

function addTask(formData) {
  const status = formData.get("status");
  const task = {
    id: crypto.randomUUID(),
    title: formData.get("title").trim(),
    description: formData.get("description").trim(),
    priority: formData.get("priority"),
    status,
    minVolunteers: Number(formData.get("minVolunteers")),
    requiredSkills: formData
      .get("requiredSkills")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
    assignedVolunteers: [],
    createdAt: new Date().toISOString(),
    completedAt: status === "completed" ? new Date().toISOString() : null
  };

  tasks.unshift(task);
  render();
}

function registerVolunteer(formData) {
  volunteers.unshift({
    id: crypto.randomUUID(),
    name: formData.get("name").trim(),
    email: formData.get("email").trim(),
    skills: formData
      .get("skills")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
    availability: formData.get("availability"),
    assignedTaskId: null
  });

  render();
}

function cycleTaskStatus(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) {
    return;
  }

  const nextStatus = statusCycle[(statusCycle.indexOf(task.status) + 1) % statusCycle.length];
  task.status = nextStatus;
  task.completedAt = nextStatus === "completed" ? new Date().toISOString() : null;
  render();
}

function assignVolunteer(taskId) {
  const select = document.querySelector(`[data-assign-select="${taskId}"]`);
  const volunteerId = select?.value;
  const task = tasks.find((item) => item.id === taskId);
  const volunteer = getVolunteerById(volunteerId);

  if (!task || !volunteer || volunteer.availability !== "available") {
    return;
  }

  task.assignedVolunteers.unshift(volunteerId);
  volunteer.availability = "on_task";
  volunteer.assignedTaskId = taskId;

  render();
}

function deleteTask(taskId) {
  const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
  const taskIndex = tasks.findIndex((task) => task.id === taskId);

  if (!taskCard || taskIndex === -1) {
    return;
  }

  taskCard.classList.add("removing");

  taskCard.addEventListener(
    "transitionend",
    () => {
      const [removedTask] = tasks.splice(taskIndex, 1);

      volunteers = volunteers.map((volunteer) =>
        removedTask.assignedVolunteers.includes(volunteer.id)
          ? { ...volunteer, availability: "available", assignedTaskId: null }
          : volunteer
      );

      render();
    },
    { once: true }
  );
}

document.getElementById("openTaskModalBtn").addEventListener("click", () => openModal(taskModal));
document
  .getElementById("openTaskModalBtnSecondary")
  .addEventListener("click", () => openModal(taskModal));
document
  .getElementById("openVolunteerModalBtn")
  .addEventListener("click", () => openModal(volunteerModal));

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => closeModal(document.getElementById(button.dataset.close)));
});

window.addEventListener("click", (event) => {
  if (event.target.classList.contains("modal")) {
    closeModal(event.target);
  }
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(new FormData(taskForm));
  taskForm.reset();
  taskForm.elements.status.value = "pending";
  closeModal(taskModal);
});

volunteerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  registerVolunteer(new FormData(volunteerForm));
  volunteerForm.reset();
  volunteerForm.elements.availability.value = "available";
  closeModal(volunteerModal);
});

document.getElementById("statusTabs").addEventListener("click", (event) => {
  const button = event.target.closest(".tab");
  if (!button) {
    return;
  }

  state.statusFilter = button.dataset.status;
  resetTaskFilters();
  renderTasks();
});

document.getElementById("priorityTabs").addEventListener("click", (event) => {
  const button = event.target.closest(".chip");
  if (!button) {
    return;
  }

  const { priority } = button.dataset;

  if (priority === "all") {
    state.priorityFilters = new Set(["all"]);
  } else {
    state.priorityFilters.delete("all");

    if (state.priorityFilters.has(priority)) {
      state.priorityFilters.delete(priority);
    } else {
      state.priorityFilters.add(priority);
    }

    if (!state.priorityFilters.size) {
      state.priorityFilters.add("all");
    }
  }

  resetTaskFilters();
  renderTasks();
});

taskGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const { action, taskId } = button.dataset;

  if (action === "cycle-status") {
    cycleTaskStatus(taskId);
  }

  if (action === "assign-task") {
    assignVolunteer(taskId);
  }

  if (action === "delete-task") {
    deleteTask(taskId);
  }
});

resetTaskFilters();
render();

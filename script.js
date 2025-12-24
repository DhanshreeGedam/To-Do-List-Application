console.log("script loaded");
// Keys
const STORAGE_KEY = "todo_list_tasks";

// DOM elements
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const message = document.getElementById("message");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".filter-btn");
const priorityInput = document.getElementById("priority-input");
const dueDateInput = document.getElementById("due-date-input");
const categoryInput = document.getElementById("category-input");


// State
let tasks = [];
let currentFilter = "all";

// Load tasks on start
document.addEventListener("DOMContentLoaded", () => {
  loadTasksFromStorage();
  renderTasks();
});

// Form submit: add task
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();;

  const text = taskInput.value.trim();

  if (!text) {
    showMessage("Task cannot be empty.", "error");
    return;
  }

  const isDuplicate = tasks.some(
    task => task.text.toLowerCase() === text.toLowerCase()
  );

  if (isDuplicate) {
    showMessage("Task already exists.", "alert");
    return;
  }

  const newTask = {
  id: Date.now().toString(),
  text,
  completed: false,
  priority: priorityInput.value,
  dueDate: dueDateInput.value,
  category: categoryInput.value
};

  tasks.push(newTask);
  saveTasksToStorage();
  renderTasks();

  taskInput.value = "";
  priorityInput.value = "low";
  dueDateInput.value = "";
  categoryInput.value = "Work";
  showMessage("Task added successfully.", "success");

  setTimeout(() => {
    addBtn.disabled = false;
  }, 200);
});

// Filter buttons
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Show message
function showMessage(text, type) {
  message.textContent = text;
  message.className = "message " + (type || "");
  if (text) {
    setTimeout(() => {
      message.textContent = "";
      message.className = "message";
    }, 2000);
  }
}

// Local storage helpers
function saveTasksToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasksFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    tasks = stored ? JSON.parse(stored) : [];
  } catch (error) {
    tasks = [];
    console.error("Failed to load tasks from storage", error);
  }
}

// Render tasks
function renderTasks() {
  taskList.innerHTML = "";

  let filteredTasks = tasks;
  if (currentFilter === "active") {
    filteredTasks = tasks.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((t) => t.completed);
  }

  if (filteredTasks.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.textContent = "No tasks to show.";
    emptyLi.style.textAlign = "center";
    emptyLi.style.color = "#6b7280";
    emptyLi.style.fontSize = "0.9rem";
    taskList.appendChild(emptyLi);
    return;
  }

  filteredTasks.forEach((task) => {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.id = task.id;

  const mainDiv = document.createElement("div");
  mainDiv.className = "task-main";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", () => toggleTaskCompleted(task.id));

  const textSpan = document.createElement("span");
  textSpan.className = "task-text";
  textSpan.textContent = task.text;

  if (task.completed) {
    textSpan.classList.add("completed");
  }

  // META INFO (Priority, Category, Due Date)
  const metaDiv = document.createElement("div");
  metaDiv.className = "task-meta";

  const prioritySpan = document.createElement("span");
  prioritySpan.className = `badge priority-${task.priority}`;
  prioritySpan.textContent = task.priority.toUpperCase();

  const categorySpan = document.createElement("span");
  categorySpan.className = "badge category";
  categorySpan.textContent = task.category;

  const dueDateSpan = document.createElement("span");
  dueDateSpan.className = "badge due-date";
  dueDateSpan.textContent = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : "No due date";

  metaDiv.append(prioritySpan, categorySpan, dueDateSpan);

  mainDiv.appendChild(checkbox);
  mainDiv.appendChild(textSpan);
  mainDiv.appendChild(metaDiv);

  // Actions
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.className = "icon-btn edit-btn";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => editTask(task.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "icon-btn delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  actionsDiv.append(editBtn, deleteBtn);

  li.appendChild(mainDiv);
  li.appendChild(actionsDiv);

  taskList.appendChild(li);
});

}

// Toggle completed
function toggleTaskCompleted(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasksToStorage();
  renderTasks();
}

// Edit task
function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const newText = prompt("Edit task:", task.text);
  if (newText === null) return; // cancel

  const trimmed = newText.trim();
  if (!trimmed) {
    showMessage("Task cannot be empty.", "error");
    return;
  }

  task.text = trimmed;
  saveTasksToStorage();
  renderTasks();
  showMessage("Task updated.", "success");
}

// Delete task
function deleteTask(id) {
  const confirmDelete = confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;

  tasks = tasks.filter((t) => t.id !== id);
  saveTasksToStorage();
  renderTasks();
  showMessage("Task deleted.", "alert");
}
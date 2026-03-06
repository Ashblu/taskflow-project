const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const categoryInput = document.querySelector("#category-input");
const priorityInput = document.querySelector("#priority-input");
const taskList = document.querySelector("#task-list");

let tasks = [];

// Cargar tasks
const savedTasks = localStorage.getItem("tasks");

if (savedTasks) {
  tasks = JSON.parse(savedTasks);
  tasks.forEach(addTaskToDOM);
}

// Guardar tasks
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Crear tasks
function addTaskToDOM(task) {

  const article = document.createElement("article");
article.className =
  "flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm";

const checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.checked = task.completed;
checkbox.className = "h-4 w-4 accent-slate-600";

checkbox.addEventListener("change", () => {
  task.completed = checkbox.checked;
  updateTaskStyle();
  saveTasks();
});

  const title = document.createElement("span");
  title.className = "font-medium text-slate-900";
  title.textContent = task.title;

  const category = document.createElement("span");
  category.className = "text-sm text-slate-500";
  category.textContent = task.category;

const badge = document.createElement("span");

let badgeColor = "";

if (task.priority === "alta") {
  badgeColor = "bg-red-100 text-red-700";
} else if (task.priority === "media") {
  badgeColor = "bg-yellow-100 text-yellow-700";
} else {
  badgeColor = "bg-green-100 text-green-700";
}

badge.className =
  "rounded-full px-2 py-1 text-xs font-semibold " + badgeColor;

badge.textContent =
  task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "✖";
  deleteBtn.className =
  "text-red-500 hover:text-red-700 transition text-sm";

  function updateTaskStyle() {
  if (task.completed) {
    article.className =
      "flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 shadow-sm opacity-70";
    title.className = "font-medium text-slate-500 line-through";
    category.className = "text-sm text-slate-400 line-through";
  } else {
    article.className =
      "flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm";
    title.className = "font-medium text-slate-900";
    category.className = "text-sm text-slate-500";
  }
}

  deleteBtn.addEventListener("click", () => {
    article.remove();

    tasks = tasks.filter(t => t !== task);
    saveTasks();
  });

  article.append(checkbox, title, category, badge, deleteBtn);

  taskList.prepend(article);
}

// *****
form.addEventListener("submit", (e) => {

  e.preventDefault();

  const title = taskInput.value.trim();
  const category = categoryInput.value.trim();
  const priority = priorityInput.value;

  if (!title || !category) return;

 const newTask = {
  title: title,
  category: category,
  priority: priority,
  completed: false
};

  tasks.push(newTask);

  saveTasks();

  addTaskToDOM(newTask);

  taskInput.value = "";
  categoryInput.value = "";
  priorityInput.value = "alta";
});
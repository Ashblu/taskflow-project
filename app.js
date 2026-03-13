const form = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const categoryInput = document.querySelector("#category-input");
const priorityInput = document.querySelector("#priority-input");
const taskList = document.querySelector("#task-list");
const themeToggle = document.querySelector("#theme-toggle");
const navHome = document.querySelector("#nav-home");
const navOpenTasks = document.querySelector("#nav-open-tasks");
const navClosedTasks = document.querySelector("#nav-closed-tasks");
const asideLinks = document.querySelectorAll(".aside-link");

const MOON_ICON = "\u263E";
const SUN_ICON = "\u2600\uFE0F";

let tasks = [];
const taskElements = new WeakMap();
let currentFilter = "all";

function updateThemeButton(isDark) {
  themeToggle.textContent = isDark ? SUN_ICON : MOON_ICON;
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Activar modo claro" : "Activar modo oscuro"
  );
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

function setActiveNav(link) {
  if (!link) return;

  asideLinks.forEach((item) => {
    item.classList.remove("bg-slate-100", "dark:bg-slate-700", "font-semibold");
    item.setAttribute("aria-pressed", "false");
  });

  link.classList.add("bg-slate-100", "dark:bg-slate-700", "font-semibold");
  link.setAttribute("aria-pressed", "true");
}

function applyFilter() {
  tasks.forEach((task) => {
    const elements = taskElements.get(task);
    if (!elements) return;

    let visible = true;
    if (currentFilter === "open") {
      visible = !task.completed;
    } else if (currentFilter === "closed") {
      visible = task.completed;
    }

    elements.article.style.display = visible ? "" : "none";
  });
}

const savedTheme = localStorage.getItem("theme");
const isDarkTheme = savedTheme === "dark";

if (isDarkTheme) {
  document.body.classList.add("dark");
}

updateThemeButton(isDarkTheme);

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeButton(isDark);
});

const savedTasks = localStorage.getItem("tasks");

if (savedTasks) {
  try {
    tasks = JSON.parse(savedTasks);
    tasks.forEach(addTaskToDOM);
  } catch (error) {
    console.error("No se pudieron recuperar las tareas guardadas:", error);
    localStorage.removeItem("tasks");
  }
}

function saveTasks() {
  try {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  } catch (error) {
    console.error("Error al guardar las tareas en localStorage:", error);
    alert(
      "No se pudo guardar la tarea. Puede que el almacenamiento local este desactivado o lleno."
    );
  }
}

function getPriorityClasses(priority) {
  if (priority === "alta") {
    return "bg-red-100 text-red-700";
  }
  if (priority === "media") {
    return "bg-yellow-100 text-yellow-700";
  }
  return "bg-green-100 text-green-700";
}

function createTaskElement(task) {
  const article = document.createElement("article");
  article.setAttribute("role", "listitem");
  article.className =
    "flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.className = "h-4 w-4 accent-slate-600";
  checkbox.setAttribute("aria-label", `Marcar tarea ${task.title} como completada`);

  const title = document.createElement("span");
  title.className = "font-medium text-slate-900 dark:text-slate-100";
  title.textContent = task.title;

  const category = document.createElement("span");
  category.className = "text-sm text-slate-500 dark:text-slate-300";
  category.textContent = task.category;

  const badge = document.createElement("span");
  badge.className =
    "rounded-full px-2 py-1 text-xs font-semibold " +
    getPriorityClasses(task.priority);
  badge.textContent =
    task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.textContent = "\u00D7";
  deleteBtn.className =
    "ml-2 cursor-pointer border-0 bg-transparent text-sm text-gray-400 transition-colors hover:text-red-500";
  deleteBtn.setAttribute("aria-label", `Eliminar tarea ${task.title}`);

  article.append(checkbox, title, category, badge, deleteBtn);

  return { article, checkbox, title, category, badge, deleteBtn };
}

function updateTaskStyle(task, elements) {
  const { article, title, category } = elements;

  const baseArticleClasses = [
    "flex",
    "items-center",
    "justify-between",
    "gap-3",
    "rounded-lg",
    "border",
    "mb-3",
    "px-3",
    "py-2",
    "shadow-sm",
    "transition-transform",
    "hover:-translate-y-[2px]",
    "hover:shadow-lg"
  ];

  const completedArticleClasses = [
    ...baseArticleClasses,
    "border-slate-200",
    "bg-slate-100",
    "dark:bg-slate-700",
    "dark:border-slate-600",
    "opacity-70"
  ].join(" ");

  const activeArticleClasses = [
    ...baseArticleClasses,
    "border-slate-200",
    "bg-white",
    "dark:bg-slate-800",
    "dark:border-slate-700"
  ].join(" ");

  const completedTitleClasses =
    "font-medium text-slate-500 dark:text-slate-400 line-through";
  const activeTitleClasses =
    "font-medium text-slate-900 dark:text-slate-100";
  const completedCategoryClasses =
    "text-sm text-slate-400 dark:text-slate-500 line-through";
  const activeCategoryClasses =
    "text-sm text-slate-500 dark:text-slate-300";

  if (task.completed) {
    article.className = completedArticleClasses;
    title.className = completedTitleClasses;
    category.className = completedCategoryClasses;
  } else {
    article.className = activeArticleClasses;
    title.className = activeTitleClasses;
    category.className = activeCategoryClasses;
  }
}

function attachTaskEventHandlers(task, elements) {
  const { article, checkbox, deleteBtn } = elements;

  checkbox.addEventListener("change", () => {
    task.completed = checkbox.checked;
    updateTaskStyle(task, elements);
    saveTasks();
    applyFilter();
  });

  deleteBtn.addEventListener("click", () => {
    article.remove();
    tasks = tasks.filter((t) => t !== task);
    saveTasks();
    applyFilter();
  });
}

function addTaskToDOM(task) {
  const elements = createTaskElement(task);

  updateTaskStyle(task, elements);
  taskElements.set(task, elements);
  attachTaskEventHandlers(task, elements);
  taskList.prepend(elements.article);
  applyFilter();
}

if (navHome) {
  navHome.addEventListener("click", () => {
    currentFilter = "all";
    applyFilter();
    setActiveNav(navHome);
  });
}

if (navOpenTasks) {
  navOpenTasks.addEventListener("click", () => {
    currentFilter = "open";
    applyFilter();
    setActiveNav(navOpenTasks);
  });
}

if (navClosedTasks) {
  navClosedTasks.addEventListener("click", () => {
    currentFilter = "closed";
    applyFilter();
    setActiveNav(navClosedTasks);
  });
}

setActiveNav(navHome);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  const category = categoryInput.value.trim();
  const priority = priorityInput.value;

  if (!title || !category) return;

  const newTask = {
    title,
    category,
    priority,
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  addTaskToDOM(newTask);

  taskInput.value = "";
  categoryInput.value = "";
  priorityInput.value = "alta";
  taskInput.focus();
});

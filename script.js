document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTOS
  const modeToggle = document.getElementById("modeToggle");
  const themeButtons = document.querySelectorAll(".theme-pill");

  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");
  const monthLabel = document.getElementById("month-label");
  const calendarGrid = document.getElementById("calendar-grid");

  const statTotalEl = document.getElementById("stat-total");
  const statCompletedEl = document.getElementById("stat-completed");
  const statProgressEl = document.getElementById("stat-progress");

  const taskForm = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const prioritySelect = document.getElementById("priority-select");
  const taskList = document.getElementById("taskList");
  const filterButtons = document.querySelectorAll(".filter-pill");
  const clearCompletedBtn = document.getElementById("clearCompleted");

  // ESTADO
  let currentMonth = new Date();
  let selectedDate = new Date().toISOString().slice(0, 10);
  let tasks = [];
  let tasksFilter = "all";

  // tema inicial
  document.body.classList.add("theme-classico");

  // MODO CLARO/ESCURO
  modeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    if (document.body.classList.contains("dark-theme")) {
      modeToggle.textContent = "🌙";
    } else {
      modeToggle.textContent = "☀️";
    }
  });

  // TEMAS (CLÁSSICO / MINIMALISTA / RETRÔ)
  themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      themeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const theme = btn.dataset.theme;
      let accent = "#7c3aed";
      let accent2 = "#ec4899";

      // remove classes anteriores de tema
      document.body.classList.remove(
        "theme-classico",
        "theme-minimalista",
        "theme-retro"
      );
      document.body.classList.add("theme-" + theme);

      if (theme === "minimalista") {
        // tons mais neutros
        accent = "#111827";
        accent2 = "#4b5563";
      } else if (theme === "retro") {
        accent = "#f97316";
        accent2 = "#ea580c";
      }

      document.documentElement.style.setProperty("--accent", accent);
      document.documentElement.style.setProperty("--accent-2", accent2);
    });
  });

  // CALENDÁRIO
  function updateMonthLabel() {
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    monthLabel.textContent = `${meses[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  }

  function buildCalendar() {
    calendarGrid.innerHTML = "";
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    // Cabeçalho dos dias
    const dayNames = ["D", "S", "T", "Q", "Q", "S", "S"];
    dayNames.forEach((d) => {
      const span = document.createElement("span");
      span.className = "day-name";
      span.textContent = d;
      calendarGrid.appendChild(span);
    });

    // Espaços vazios
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("span");
      empty.className = "day-cell empty";
      calendarGrid.appendChild(empty);
    }

    const today = new Date().toISOString().slice(0, 10);

    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      const span = document.createElement("span");
      span.className = "day-cell";
      span.textContent = d;

      if (dateStr === today) span.classList.add("today");
      if (dateStr === selectedDate) span.classList.add("selected");

      span.addEventListener("click", () => {
        selectedDate = dateStr;
        buildCalendar();
        renderTasks();
      });

      calendarGrid.appendChild(span);
    }
  }

  prevMonthBtn.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    updateMonthLabel();
    buildCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    updateMonthLabel();
    buildCalendar();
  });

  // TAREFAS
  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const priority = prioritySelect.value;

    if (!text) return;

    const newTask = {
      id: Date.now(),
      text,
      priority,
      completed: false,
      date: selectedDate,
    };

    tasks.push(newTask);
    taskInput.value = "";
    renderTasks();
  });

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      tasksFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter((t) => !(t.date === selectedDate && t.completed));
    renderTasks();
  });

  function renderTasks() {
    taskList.innerHTML = "";
    const tasksForDay = tasks.filter((t) => t.date === selectedDate);

    let filtered = tasksForDay;
    if (tasksFilter === "pending") {
      filtered = tasksForDay.filter((t) => !t.completed);
    } else if (tasksFilter === "completed") {
      filtered = tasksForDay.filter((t) => t.completed);
    }

    if (filtered.length === 0) {
      // opcional: texto de vazio
      // você pode remover esse bloco se não quiser mensagem
    }

    filtered.forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item";

      const left = document.createElement("div");
      left.className = "task-main";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-checkbox";
      checkbox.checked = task.completed;

      checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        renderTasks();
      });

      const textSpan = document.createElement("span");
      textSpan.className = "task-text";
      textSpan.textContent = task.text;
      if (task.completed) textSpan.classList.add("completed");

      left.appendChild(checkbox);
      left.appendChild(textSpan);

      const tag = document.createElement("span");
      tag.className = "priority-tag priority-" + task.priority;
      tag.textContent =
        task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

      li.appendChild(left);
      li.appendChild(tag);
      taskList.appendChild(li);
    });

    // Estatísticas
    const total = tasksForDay.length;
    const completed = tasksForDay.filter((t) => t.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    statTotalEl.textContent = total;
    statCompletedEl.textContent = completed;
    statProgressEl.textContent = progress + "%";
  }

  // INICIALIZA
  updateMonthLabel();
  buildCalendar();
  renderTasks();
});

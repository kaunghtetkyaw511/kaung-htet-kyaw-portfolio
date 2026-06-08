const STORAGE_KEY = "clientflow-projects-v1";
const THEME_KEY = "clientflow-theme";

const statusMeta = {
  lead: { label: "Lead", color: "#3f73a8" },
  planning: { label: "Planning", color: "#dcae38" },
  progress: { label: "In progress", color: "#178f7b" },
  review: { label: "Review", color: "#d9634a" },
  done: { label: "Done", color: "#1d7754" },
};

const sampleProjects = [
  {
    id: crypto.randomUUID(),
    name: "Website redesign sprint",
    client: "Northstar Studio",
    owner: "Kaung",
    status: "progress",
    budget: 4200,
    due: offsetDate(7),
    priority: "High",
    progress: 68,
    notes: "Homepage direction approved. CMS templates are in progress.",
  },
  {
    id: crypto.randomUUID(),
    name: "Booking dashboard MVP",
    client: "Metro Clinics",
    owner: "Nora",
    status: "review",
    budget: 7600,
    due: offsetDate(3),
    priority: "High",
    progress: 86,
    notes: "QA feedback merged. Final walkthrough is scheduled.",
  },
  {
    id: crypto.randomUUID(),
    name: "Brand system kit",
    client: "Harvest & Co.",
    owner: "Maya",
    status: "planning",
    budget: 3100,
    due: offsetDate(16),
    priority: "Medium",
    progress: 34,
    notes: "Moodboards narrowed to two visual territories.",
  },
  {
    id: crypto.randomUUID(),
    name: "Investor update microsite",
    client: "SignalWorks",
    owner: "Kaung",
    status: "lead",
    budget: 5400,
    due: offsetDate(24),
    priority: "Medium",
    progress: 12,
    notes: "Scope call completed. Waiting on data room access.",
  },
  {
    id: crypto.randomUUID(),
    name: "Customer portal polish",
    client: "ArcBay Logistics",
    owner: "Jon",
    status: "done",
    budget: 2800,
    due: offsetDate(-4),
    priority: "Low",
    progress: 100,
    notes: "Delivered handoff notes and component inventory.",
  },
  {
    id: crypto.randomUUID(),
    name: "Product launch pages",
    client: "BloomCart",
    owner: "Maya",
    status: "progress",
    budget: 6600,
    due: offsetDate(11),
    priority: "High",
    progress: 52,
    notes: "Pricing section and checkout states need final copy.",
  },
];

let projects = loadProjects();
let activeDragId = null;

const els = {
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  themeToggle: document.querySelector("#themeToggle"),
  exportBtn: document.querySelector("#exportBtn"),
  resetBtn: document.querySelector("#resetBtn"),
  openProjectBtn: document.querySelector("#openProjectBtn"),
  activeCount: document.querySelector("#activeCount"),
  activeMeta: document.querySelector("#activeMeta"),
  totalBudget: document.querySelector("#totalBudget"),
  budgetMeta: document.querySelector("#budgetMeta"),
  dueSoonCount: document.querySelector("#dueSoonCount"),
  avgProgress: document.querySelector("#avgProgress"),
  progressMeta: document.querySelector("#progressMeta"),
  sidebarRevenue: document.querySelector("#sidebarRevenue"),
  budgetChart: document.querySelector("#budgetChart"),
  timelineList: document.querySelector("#timelineList"),
  boardColumns: document.querySelector("#boardColumns"),
  projectRows: document.querySelector("#projectRows"),
  resultCount: document.querySelector("#resultCount"),
  dialog: document.querySelector("#projectDialog"),
  form: document.querySelector("#projectForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  cancelDialogBtn: document.querySelector("#cancelDialogBtn"),
  deleteProjectBtn: document.querySelector("#deleteProjectBtn"),
  projectId: document.querySelector("#projectId"),
  projectName: document.querySelector("#projectName"),
  clientName: document.querySelector("#clientName"),
  ownerName: document.querySelector("#ownerName"),
  projectStatus: document.querySelector("#projectStatus"),
  projectBudget: document.querySelector("#projectBudget"),
  projectDue: document.querySelector("#projectDue"),
  projectPriority: document.querySelector("#projectPriority"),
  projectProgress: document.querySelector("#projectProgress"),
  progressValue: document.querySelector("#progressValue"),
  projectNotes: document.querySelector("#projectNotes"),
};

init();

function init() {
  document.documentElement.dataset.theme = localStorage.getItem(THEME_KEY) || "light";
  bindEvents();
  render();
}

function bindEvents() {
  els.searchInput.addEventListener("input", render);
  els.statusFilter.addEventListener("change", render);
  els.openProjectBtn.addEventListener("click", () => openProjectDialog());
  els.closeDialogBtn.addEventListener("click", closeDialog);
  els.cancelDialogBtn.addEventListener("click", closeDialog);
  els.projectProgress.addEventListener("input", updateProgressLabel);
  els.form.addEventListener("submit", handleSubmit);
  els.deleteProjectBtn.addEventListener("click", handleDelete);
  els.exportBtn.addEventListener("click", exportProjects);
  els.resetBtn.addEventListener("click", resetDemo);
  els.themeToggle.addEventListener("click", toggleTheme);
  window.addEventListener("resize", () => drawBudgetChart(getVisibleProjects()));
}

function render() {
  const visibleProjects = getVisibleProjects();
  renderMetrics();
  renderTimeline();
  renderBoard(visibleProjects);
  renderTable(visibleProjects);
  drawBudgetChart(visibleProjects);
  refreshIcons();
}

function getVisibleProjects() {
  const query = els.searchInput.value.trim().toLowerCase();
  const status = els.statusFilter.value;

  return projects.filter((project) => {
    const matchesStatus = status === "all" || project.status === status;
    const haystack = [project.name, project.client, project.owner, project.notes].join(" ").toLowerCase();
    return matchesStatus && haystack.includes(query);
  });
}

function renderMetrics() {
  const active = projects.filter((project) => project.status !== "done");
  const totalBudget = projects.reduce((sum, project) => sum + Number(project.budget), 0);
  const dueSoon = projects.filter((project) => {
    const days = daysUntil(project.due);
    return days >= 0 && days <= 10 && project.status !== "done";
  });
  const avgProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + Number(project.progress), 0) / projects.length)
    : 0;

  els.activeCount.textContent = active.length;
  els.activeMeta.textContent = `${projects.length} total projects`;
  els.totalBudget.textContent = formatCurrency(totalBudget);
  els.budgetMeta.textContent = `${formatCurrency(monthlyProjection())} this month`;
  els.dueSoonCount.textContent = dueSoon.length;
  els.avgProgress.textContent = `${avgProgress}%`;
  els.progressMeta.textContent = avgProgress >= 70 ? "Healthy delivery pace" : "Needs attention";
  els.sidebarRevenue.textContent = formatCurrency(monthlyProjection());
}

function renderTimeline() {
  const upcoming = [...projects]
    .filter((project) => project.status !== "done")
    .sort((a, b) => new Date(a.due) - new Date(b.due))
    .slice(0, 5);

  els.timelineList.innerHTML = upcoming.length
    ? upcoming
        .map((project) => {
          const date = new Date(`${project.due}T12:00:00`);
          return `
            <div class="timeline-item">
              <div class="date-pill">
                <span>${date.toLocaleDateString("en-US", { month: "short" })}</span>
                <span>${date.getDate()}</span>
              </div>
              <div>
                <strong>${escapeHtml(project.name)}</strong>
                <span>${escapeHtml(project.client)} - ${statusMeta[project.status].label}</span>
              </div>
            </div>
          `;
        })
        .join("")
    : `<div class="empty-state">No upcoming deadlines</div>`;
}

function renderBoard(visibleProjects) {
  els.boardColumns.innerHTML = Object.entries(statusMeta)
    .map(([status, meta]) => {
      const columnProjects = visibleProjects.filter((project) => project.status === status);
      return `
        <section class="board-column" data-status="${status}" aria-label="${meta.label}">
          <div class="column-header">
            <h3>${meta.label}</h3>
            <span class="count-badge">${columnProjects.length}</span>
          </div>
          ${
            columnProjects.length
              ? columnProjects.map(renderProjectCard).join("")
              : `<div class="empty-state">No projects</div>`
          }
        </section>
      `;
    })
    .join("");

  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      activeDragId = event.currentTarget.dataset.id;
      event.currentTarget.classList.add("dragging");
    });

    card.addEventListener("dragend", (event) => {
      activeDragId = null;
      event.currentTarget.classList.remove("dragging");
      document.querySelectorAll(".drop-target").forEach((column) => column.classList.remove("drop-target"));
    });
  });

  document.querySelectorAll(".board-column").forEach((column) => {
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      column.classList.add("drop-target");
    });

    column.addEventListener("dragleave", () => column.classList.remove("drop-target"));

    column.addEventListener("drop", (event) => {
      event.preventDefault();
      const project = projects.find((item) => item.id === activeDragId);
      if (project) {
        project.status = column.dataset.status;
        project.progress = project.status === "done" ? 100 : project.progress;
        saveProjects();
        render();
      }
    });
  });

  document.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => openProjectDialog(button.dataset.edit));
  });

  document.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeProject(button.dataset.remove));
  });
}

function renderProjectCard(project) {
  return `
    <article class="project-card" draggable="true" data-id="${project.id}">
      <div class="card-top">
        <span class="priority-badge ${project.priority}">${project.priority}</span>
        <div class="project-actions">
          <button class="icon-button" type="button" data-edit="${project.id}" title="Edit">
            <i data-lucide="pencil"></i>
            <span class="sr-only">Edit</span>
          </button>
          <button class="icon-button" type="button" data-remove="${project.id}" title="Delete">
            <i data-lucide="trash-2"></i>
            <span class="sr-only">Delete</span>
          </button>
        </div>
      </div>
      <div>
        <h3 class="project-title">${escapeHtml(project.name)}</h3>
        <div class="client-name">${escapeHtml(project.client)} - ${escapeHtml(project.owner)}</div>
      </div>
      <p class="note-text">${escapeHtml(project.notes || "No notes added.")}</p>
      <div class="progress-track" aria-label="${project.progress}% complete">
        <div class="progress-fill" style="width: ${project.progress}%"></div>
      </div>
      <div class="card-footer">
        <strong>${formatCurrency(project.budget)}</strong>
        <span class="client-name">${formatDate(project.due)}</span>
      </div>
    </article>
  `;
}

function renderTable(visibleProjects) {
  els.resultCount.textContent = `${visibleProjects.length} ${visibleProjects.length === 1 ? "project" : "projects"}`;

  els.projectRows.innerHTML = visibleProjects.length
    ? visibleProjects
        .map(
          (project) => `
          <tr>
            <td data-label="Project">
              <div class="table-project">
                <strong>${escapeHtml(project.name)}</strong>
                <span class="client-name">${escapeHtml(project.owner)}</span>
              </div>
            </td>
            <td data-label="Client">${escapeHtml(project.client)}</td>
            <td data-label="Status"><span class="status-badge ${project.status}">${statusMeta[project.status].label}</span></td>
            <td data-label="Budget">${formatCurrency(project.budget)}</td>
            <td data-label="Due">${formatDate(project.due)}</td>
            <td data-label="Progress">
              <div class="mini-progress">
                <div class="progress-track"><div class="progress-fill" style="width: ${project.progress}%"></div></div>
                <span>${project.progress}%</span>
              </div>
            </td>
            <td data-label="Actions">
              <button class="icon-button" type="button" data-table-edit="${project.id}" title="Edit">
                <i data-lucide="pencil"></i>
                <span class="sr-only">Edit</span>
              </button>
            </td>
          </tr>
        `
        )
        .join("")
    : `<tr><td class="empty-cell" colspan="7"><div class="empty-state">No matching projects</div></td></tr>`;

  document.querySelectorAll("[data-table-edit]").forEach((button) => {
    button.addEventListener("click", () => openProjectDialog(button.dataset.tableEdit));
  });
}

function drawBudgetChart(visibleProjects) {
  const canvas = els.budgetChart;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = Math.max(rect.width, 320);
  const cssHeight = 260;

  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const values = Object.keys(statusMeta).map((status) => ({
    status,
    label: statusMeta[status].label,
    color: statusMeta[status].color,
    value: visibleProjects
      .filter((project) => project.status === status)
      .reduce((sum, project) => sum + Number(project.budget), 0),
  }));

  const maxValue = Math.max(...values.map((item) => item.value), 1);
  const chartLeft = 58;
  const chartRight = cssWidth - 18;
  const chartTop = 16;
  const chartBottom = 206;
  const slot = (chartRight - chartLeft) / values.length;
  const barWidth = Math.min(48, slot * 0.52);

  ctx.strokeStyle = getCss("--line");
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i += 1) {
    const y = chartTop + ((chartBottom - chartTop) / 4) * i;
    ctx.moveTo(chartLeft, y);
    ctx.lineTo(chartRight, y);
  }
  ctx.stroke();

  values.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * (chartBottom - chartTop - 18);
    const x = chartLeft + slot * index + (slot - barWidth) / 2;
    const y = chartBottom - barHeight;

    ctx.fillStyle = item.color;
    roundRect(ctx, x, y, barWidth, Math.max(barHeight, 4), 6);
    ctx.fill();

    ctx.fillStyle = getCss("--muted");
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(shortLabel(item.label), x + barWidth / 2, 232);

    ctx.fillStyle = getCss("--ink");
    ctx.font = "700 12px system-ui, sans-serif";
    ctx.fillText(formatCompactCurrency(item.value), x + barWidth / 2, Math.max(y - 8, 12));
  });
}

function openProjectDialog(id = null) {
  const project = projects.find((item) => item.id === id);
  els.form.reset();
  els.projectId.value = project?.id || "";
  els.dialogTitle.textContent = project ? "Edit project" : "New project";
  els.deleteProjectBtn.hidden = !project;
  els.projectName.value = project?.name || "";
  els.clientName.value = project?.client || "";
  els.ownerName.value = project?.owner || "Kaung";
  els.projectStatus.value = project?.status || "lead";
  els.projectBudget.value = project?.budget || 2500;
  els.projectDue.value = project?.due || offsetDate(14);
  els.projectPriority.value = project?.priority || "Medium";
  els.projectProgress.value = project?.progress ?? 35;
  els.projectNotes.value = project?.notes || "";
  updateProgressLabel();
  els.dialog.showModal();
  els.projectName.focus();
  refreshIcons();
}

function closeDialog() {
  els.dialog.close();
}

function handleSubmit(event) {
  event.preventDefault();
  const id = els.projectId.value || crypto.randomUUID();
  const payload = {
    id,
    name: els.projectName.value.trim(),
    client: els.clientName.value.trim(),
    owner: els.ownerName.value.trim(),
    status: els.projectStatus.value,
    budget: Number(els.projectBudget.value),
    due: els.projectDue.value,
    priority: els.projectPriority.value,
    progress: Number(els.projectProgress.value),
    notes: els.projectNotes.value.trim(),
  };

  const index = projects.findIndex((project) => project.id === id);
  if (index >= 0) {
    projects[index] = payload;
  } else {
    projects.unshift(payload);
  }

  saveProjects();
  closeDialog();
  render();
}

function handleDelete() {
  removeProject(els.projectId.value);
  closeDialog();
}

function removeProject(id) {
  projects = projects.filter((project) => project.id !== id);
  saveProjects();
  render();
}

function exportProjects() {
  const blob = new Blob([JSON.stringify(projects, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `clientflow-projects-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function resetDemo() {
  projects = cloneSeedProjects();
  els.searchInput.value = "";
  els.statusFilter.value = "all";
  saveProjects();
  render();
}

function toggleTheme() {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nextTheme;
  localStorage.setItem(THEME_KEY, nextTheme);
  render();
}

function loadProjects() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return Array.isArray(saved) && saved.length ? saved : cloneSeedProjects();
  } catch {
    return cloneSeedProjects();
  }
}

function cloneSeedProjects() {
  return sampleProjects.map((project) => ({ ...project, id: crypto.randomUUID() }));
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function updateProgressLabel() {
  els.progressValue.textContent = `${els.projectProgress.value}%`;
}

function monthlyProjection() {
  const now = new Date();
  return projects
    .filter((project) => {
      const due = new Date(`${project.due}T12:00:00`);
      return due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear();
    })
    .reduce((sum, project) => sum + Number(project.budget), 0);
}

function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${date}T00:00:00`);
  return Math.ceil((target - today) / 86400000);
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function shortLabel(label) {
  return label === "In progress" ? "Progress" : label;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCss(variable) {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

const updates = [
  {
    role: "Customer Support Specialist",
    sector: "Customer Operations",
    risk: "high",
    signal: "Automation",
    date: "Apr 30",
    summary:
      "More teams are routing tier-one questions through AI agents, while senior support roles are shifting toward escalation handling, quality review, and workflow design.",
    skills: ["AI supervision", "Knowledge base writing", "Escalation judgment"],
  },
  {
    role: "Junior Software Developer",
    sector: "Technology",
    risk: "medium",
    signal: "Skill shift",
    date: "Apr 29",
    summary:
      "Entry-level coding work is being reshaped by AI pair-programming tools. Hiring signals favor candidates who can test, review, integrate, and explain generated code.",
    skills: ["Code review", "Testing", "System design basics"],
  },
  {
    role: "Medical Records Technician",
    sector: "Healthcare",
    risk: "medium",
    signal: "Workflow change",
    date: "Apr 28",
    summary:
      "Clinical documentation tools are reducing manual transcription effort, but compliance, coding accuracy, and exception handling remain resilient work areas.",
    skills: ["Compliance", "Coding validation", "Clinical context"],
  },
  {
    role: "Paralegal",
    sector: "Legal",
    risk: "medium",
    signal: "Skill shift",
    date: "Apr 28",
    summary:
      "Document review and discovery workflows are seeing heavier AI assistance. Firms still need people who can verify citations, manage case context, and flag risk.",
    skills: ["Citation checking", "Matter context", "Risk review"],
  },
  {
    role: "Warehouse Coordinator",
    sector: "Logistics",
    risk: "low",
    signal: "Hiring",
    date: "Apr 27",
    summary:
      "Demand is holding for coordinators who can operate alongside forecasting and routing systems, especially in exception-heavy inventory environments.",
    skills: ["Inventory systems", "Exception handling", "Vendor coordination"],
  },
  {
    role: "Marketing Copywriter",
    sector: "Marketing",
    risk: "high",
    signal: "Automation",
    date: "Apr 26",
    summary:
      "Short-form copy production is increasingly automated. Differentiation is moving toward brand strategy, creative direction, editorial judgment, and campaign testing.",
    skills: ["Creative direction", "Brand systems", "Experiment design"],
  },
  {
    role: "Financial Analyst",
    sector: "Finance",
    risk: "medium",
    signal: "Workflow change",
    date: "Apr 25",
    summary:
      "AI-assisted reporting is compressing spreadsheet-heavy tasks. Analysts with business storytelling, scenario modeling, and data governance skills remain in demand.",
    skills: ["Scenario modeling", "Data governance", "Executive narrative"],
  },
  {
    role: "Electrician",
    sector: "Skilled Trades",
    risk: "low",
    signal: "Hiring",
    date: "Apr 24",
    summary:
      "Hands-on installation and repair work remains less exposed to AI automation, while smart-building systems are adding demand for diagnostic and controls knowledge.",
    skills: ["Controls systems", "Diagnostics", "Safety compliance"],
  },
];

const defaultWatchlist = ["Customer Support Specialist", "Financial Analyst"];

function loadWatchlist() {
  try {
    const saved = JSON.parse(localStorage.getItem("shiftSignalWatchlist"));
    return Array.isArray(saved) ? saved : defaultWatchlist;
  } catch {
    return defaultWatchlist;
  }
}

const state = {
  risk: "all",
  sector: "all",
  search: "",
  watchlist: loadWatchlist(),
};

const feed = document.querySelector("#feed");
const search = document.querySelector("#search");
const sectorFilter = document.querySelector("#sectorFilter");
const riskButtons = document.querySelectorAll("[data-risk]");
const resultCount = document.querySelector("#resultCount");
const watchForm = document.querySelector("#watchForm");
const watchInput = document.querySelector("#watchInput");
const watchlistItems = document.querySelector("#watchlistItems");
const signalBars = document.querySelector("#signalBars");

function normalize(value) {
  return value.toLowerCase().trim();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function matchesSearch(update) {
  const query = normalize(state.search);
  if (!query) return true;

  return [update.role, update.sector, update.signal, update.summary, ...update.skills]
    .map(normalize)
    .some((field) => field.includes(query));
}

function getFilteredUpdates() {
  return updates.filter((update) => {
    const riskMatch = state.risk === "all" || update.risk === state.risk;
    const sectorMatch = state.sector === "all" || update.sector === state.sector;
    return riskMatch && sectorMatch && matchesSearch(update);
  });
}

function renderFeed() {
  const filtered = getFilteredUpdates();
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "update" : "updates"}`;

  if (!filtered.length) {
    feed.innerHTML = '<div class="empty">No updates match those filters.</div>';
    return;
  }

  feed.innerHTML = filtered
    .map(
      (update) => `
        <article class="update-card">
          <div class="update-top">
            <span class="sector">${escapeHtml(update.sector)} &middot; ${escapeHtml(update.date)}</span>
            <span class="risk-pill risk-${update.risk}">${escapeHtml(update.risk)} exposure</span>
          </div>
          <h3>${escapeHtml(update.role)}</h3>
          <p>${escapeHtml(update.summary)}</p>
          <div class="tags">
            <span class="tag">${escapeHtml(update.signal)}</span>
            ${update.skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderSectors() {
  const sectors = [...new Set(updates.map((update) => update.sector))].sort();
  sectorFilter.innerHTML = [
    '<option value="all">All sectors</option>',
    ...sectors.map((sector) => `<option value="${escapeHtml(sector)}">${escapeHtml(sector)}</option>`),
  ].join("");
}

function renderMetrics() {
  const highCount = updates.filter((update) => update.risk === "high").length;
  const skillCount = updates.filter((update) => update.signal === "Skill shift").length;
  const hiringCount = updates.filter((update) => update.signal === "Hiring").length;
  const watchMatches = updates.filter((update) =>
    state.watchlist.some((role) => normalize(role) === normalize(update.role)),
  ).length;

  document.querySelector("#highCount").textContent = highCount;
  document.querySelector("#skillCount").textContent = skillCount;
  document.querySelector("#hiringCount").textContent = hiringCount;
  document.querySelector("#watchCount").textContent = watchMatches;
}

function renderWatchlist() {
  if (!state.watchlist.length) {
    watchlistItems.innerHTML = '<div class="empty">Add roles to monitor matching updates.</div>';
    renderMetrics();
    return;
  }

  localStorage.setItem("shiftSignalWatchlist", JSON.stringify(state.watchlist));

  watchlistItems.innerHTML = state.watchlist
    .map(
      (role, index) => `
        <span class="watch-chip">
          ${escapeHtml(role)}
          <button type="button" aria-label="Remove ${escapeHtml(role)}" data-remove-index="${index}">&times;</button>
        </span>
      `,
    )
    .join("");
  renderMetrics();
}

function renderSignals() {
  const totals = updates.reduce((acc, update) => {
    acc[update.signal] = (acc[update.signal] || 0) + 1;
    return acc;
  }, {});

  const max = Math.max(...Object.values(totals));
  signalBars.innerHTML = Object.entries(totals)
    .map(([signal, count]) => {
      const width = Math.round((count / max) * 100);
      return `
        <div class="bar-row">
          <div class="bar-label">
            <span>${escapeHtml(signal)}</span>
            <span>${count}</span>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width: ${width}%"></div></div>
        </div>
      `;
    })
    .join("");
}

riskButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.risk = button.dataset.risk;
    riskButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderFeed();
  });
});

sectorFilter.addEventListener("change", (event) => {
  state.sector = event.target.value;
  renderFeed();
});

search.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderFeed();
});

watchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const role = watchInput.value.trim();
  if (!role || state.watchlist.some((item) => normalize(item) === normalize(role))) return;
  state.watchlist.push(role);
  watchInput.value = "";
  renderWatchlist();
});

watchlistItems.addEventListener("click", (event) => {
  const index = Number(event.target.dataset.removeIndex);
  if (!Number.isInteger(index)) return;
  state.watchlist = state.watchlist.filter((_, itemIndex) => itemIndex !== index);
  renderWatchlist();
});

renderSectors();
renderMetrics();
renderFeed();
renderWatchlist();
renderSignals();

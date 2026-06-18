const STORAGE_KEY = "glass-crm-leads";

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const sampleLeads = [
  {
    id: createId(),
    name: "Avery Stone",
    company: "Northstar Labs",
    email: "avery@northstar.io",
    phone: "+1 415 555 0147",
    status: "Qualified",
    value: 28000,
    owner: "Maya Patel",
    source: "Web demo"
  },
  {
    id: createId(),
    name: "Jordan Lee",
    company: "Orbit Finance",
    email: "jordan@orbitfin.com",
    phone: "+1 212 555 0188",
    status: "Contacted",
    value: 17500,
    owner: "Noah Kim",
    source: "Referral"
  },
  {
    id: createId(),
    name: "Priya Nair",
    company: "Helio Retail",
    email: "priya@helioretail.com",
    phone: "+1 650 555 0199",
    status: "Won",
    value: 42000,
    owner: "Maya Patel",
    source: "Conference"
  },
  {
    id: createId(),
    name: "Marcus Chen",
    company: "Vertex Cloud",
    email: "marcus@vertexcloud.dev",
    phone: "+1 303 555 0131",
    status: "New",
    value: 12000,
    owner: "Elena Ross",
    source: "Newsletter"
  },
  {
    id: createId(),
    name: "Sofia Grant",
    company: "Kinetic Works",
    email: "sofia@kineticworks.co",
    phone: "+1 718 555 0106",
    status: "Lost",
    value: 9000,
    owner: "Noah Kim",
    source: "Outbound"
  }
];

const elements = {
  leadList: document.querySelector("#leadList"),
  emptyState: document.querySelector("#emptyState"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  openAddModal: document.querySelector("#openAddModal"),
  leadModal: document.querySelector("#leadModal"),
  leadForm: document.querySelector("#leadForm"),
  closeModal: document.querySelector("#closeModal"),
  cancelForm: document.querySelector("#cancelForm"),
  modalTitle: document.querySelector("#modalTitle"),
  formMode: document.querySelector("#formMode"),
  targetProgress: document.querySelector("#targetProgress"),
  targetBar: document.querySelector("#targetBar"),
  totalLeads: document.querySelector("#totalLeads"),
  qualifiedLeads: document.querySelector("#qualifiedLeads"),
  contactedLeads: document.querySelector("#contactedLeads"),
  convertedLeads: document.querySelector("#convertedLeads")
};

const fields = {
  id: document.querySelector("#leadId"),
  name: document.querySelector("#leadName"),
  company: document.querySelector("#leadCompany"),
  email: document.querySelector("#leadEmail"),
  phone: document.querySelector("#leadPhone"),
  status: document.querySelector("#leadStatus"),
  value: document.querySelector("#leadValue"),
  owner: document.querySelector("#leadOwner"),
  source: document.querySelector("#leadSource")
};

let leads = loadLeads();

function loadLeads() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleLeads));
    return sampleLeads;
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : sampleLeads;
  } catch {
    return sampleLeads;
  }
}

function saveLeads() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function normalizeStatus(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFilteredLeads() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const status = elements.statusFilter.value;

  return leads.filter((lead) => {
    const haystack = `${lead.name} ${lead.company} ${lead.email} ${lead.owner} ${lead.source}`.toLowerCase();
    const matchesSearch = haystack.includes(query);
    const matchesStatus = status === "All" || lead.status === status;
    return matchesSearch && matchesStatus;
  });
}

function renderStats() {
  const total = leads.length;
  const qualified = leads.filter((lead) => lead.status === "Qualified").length;
  const contacted = leads.filter((lead) => lead.status === "Contacted").length;
  const converted = leads.filter((lead) => lead.status === "Won").length;
  const target = total ? Math.min(Math.round((converted / total) * 100), 100) : 0;

  elements.totalLeads.textContent = total;
  elements.qualifiedLeads.textContent = qualified;
  elements.contactedLeads.textContent = contacted;
  elements.convertedLeads.textContent = converted;
  elements.targetProgress.textContent = `${target}%`;
  elements.targetBar.style.width = `${target}%`;
}

function renderLeads() {
  const filteredLeads = getFilteredLeads();
  elements.leadList.innerHTML = "";
  elements.emptyState.hidden = filteredLeads.length > 0;

  filteredLeads.forEach((lead) => {
    const row = document.createElement("article");
    row.className = "lead-row";
    row.innerHTML = `
      <div class="lead-main">
        <span class="avatar">${escapeHtml(getInitials(lead.name))}</span>
        <div class="lead-title">
          <strong>${escapeHtml(lead.name)}</strong>
          <span>${escapeHtml(lead.company)} - ${escapeHtml(lead.email)}</span>
        </div>
      </div>
      <div data-label="Status">
        <span class="status-pill status-${normalizeStatus(lead.status)}">${escapeHtml(lead.status)}</span>
      </div>
      <div data-label="Value"><strong>${formatCurrency(Number(lead.value))}</strong></div>
      <div class="muted" data-label="Owner">${escapeHtml(lead.owner)}</div>
      <div class="actions">
        <button class="action-button" type="button" data-action="edit" data-id="${escapeHtml(lead.id)}">Edit</button>
        <button class="action-button danger" type="button" data-action="delete" data-id="${escapeHtml(lead.id)}">Delete</button>
      </div>
    `;

    elements.leadList.appendChild(row);
  });
}

function render() {
  renderStats();
  renderLeads();
}

function resetForm() {
  elements.leadForm.reset();
  fields.id.value = "";
  fields.status.value = "New";
}

function openModal(mode = "add", lead = null) {
  resetForm();
  elements.modalTitle.textContent = mode === "edit" ? "Edit Lead" : "Add Lead";
  elements.formMode.textContent = mode === "edit" ? "Update record" : "New record";

  if (lead) {
    fields.id.value = lead.id;
    fields.name.value = lead.name;
    fields.company.value = lead.company;
    fields.email.value = lead.email;
    fields.phone.value = lead.phone;
    fields.status.value = lead.status;
    fields.value.value = lead.value;
    fields.owner.value = lead.owner;
    fields.source.value = lead.source;
  }

  elements.leadModal.hidden = false;
  fields.name.focus();
}

function closeModal() {
  elements.leadModal.hidden = true;
}

function upsertLead(event) {
  event.preventDefault();

  const lead = {
    id: fields.id.value || createId(),
    name: fields.name.value.trim(),
    company: fields.company.value.trim(),
    email: fields.email.value.trim(),
    phone: fields.phone.value.trim(),
    status: fields.status.value,
    value: Number(fields.value.value),
    owner: fields.owner.value.trim(),
    source: fields.source.value.trim()
  };

  if (fields.id.value) {
    leads = leads.map((item) => (item.id === lead.id ? lead : item));
  } else {
    leads = [lead, ...leads];
  }

  saveLeads();
  render();
  closeModal();
}

function handleLeadAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const lead = leads.find((item) => item.id === button.dataset.id);
  if (!lead) return;

  if (button.dataset.action === "edit") {
    openModal("edit", lead);
  }

  if (button.dataset.action === "delete") {
    const confirmed = confirm(`Delete ${lead.name} from the dashboard?`);
    if (!confirmed) return;

    leads = leads.filter((item) => item.id !== lead.id);
    saveLeads();
    render();
  }
}

elements.openAddModal.addEventListener("click", () => openModal());
elements.closeModal.addEventListener("click", closeModal);
elements.cancelForm.addEventListener("click", closeModal);
elements.leadForm.addEventListener("submit", upsertLead);
elements.leadList.addEventListener("click", handleLeadAction);
elements.searchInput.addEventListener("input", renderLeads);
elements.statusFilter.addEventListener("change", renderLeads);

elements.leadModal.addEventListener("click", (event) => {
  if (event.target === elements.leadModal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.leadModal.hidden) {
    closeModal();
  }
});

render();

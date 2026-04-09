const API = "/api/pasien";

// Elements
const form = document.getElementById("pasienForm");
const tbody = document.getElementById("tbody");
const idEl = document.getElementById("id");
const namaEl = document.getElementById("nama");
const umurEl = document.getElementById("umur");
const diagnosaEl = document.getElementById("diagnosa");
const batalBtn = document.getElementById("batalBtn");
const submitBtn = document.getElementById("submitBtn");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const refreshBtn = document.getElementById("refreshBtn");
const totalPasienSpan = document.getElementById("totalPasien");
const alertContainer = document.getElementById("alertContainer");
const loadingSpinner = document.getElementById("loadingSpinner");
const emptyState = document.getElementById("emptyState");
const tabelPasien = document.getElementById("tabelPasien");
const deleteModal = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const deleteMessage = document.getElementById("deleteMessage");

// State
let dataPasien = [];
let filteredData = [];
let deleteId = null;

// API Functions
async function loadData() {
  loadingSpinner.style.display = "flex";
  tabelPasien.style.display = "none";
  emptyState.classList.remove("show");
  
  try {
    const res = await fetch(API);
    const data = await res.json();
    
    if (data.success) {
      dataPasien = data.data || [];
      updateTotal();
      applyFiltersAndSort();
    } else {
      showAlert("Gagal memuat data: " + data.message, "error");
    }
  } catch (error) {
    console.error("Error loading data:", error);
    showAlert("Terjadi kesalahan saat memuat data", "error");
  } finally {
    loadingSpinner.style.display = "none";
    if (dataPasien.length === 0) {
      emptyState.classList.add("show");
    } else {
      tabelPasien.style.display = "table";
    }
  }
}

async function saveData(e) {
  e.preventDefault();

  const nama = namaEl.value.trim();
  const umur = Number(umurEl.value);
  const diagnosa = diagnosaEl.value.trim();

  if (!nama || !umur || !diagnosa) {
    showAlert("Semua field harus diisi", "error");
    return;
  }

  submitBtn.disabled = true;
  const payload = { nama, umur, diagnosa };
  const id = idEl.value;
  const isUpdate = !!id;
  const url = isUpdate ? `${API}/${id}` : API;
  const method = isUpdate ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (result.success) {
      showAlert(
        isUpdate 
          ? `Data pasien "${nama}" berhasil diperbarui` 
          : `Data pasien "${nama}" berhasil ditambahkan`,
        "success"
      );
      form.reset();
      idEl.value = "";
      batalBtn.style.display = "none";
      await loadData();
    } else {
      showAlert("Gagal menyimpan data: " + result.message, "error");
    }
  } catch (error) {
    console.error("Error saving data:", error);
    showAlert("Terjadi kesalahan saat menyimpan data", "error");
  } finally {
    submitBtn.disabled = false;
  }
}

function setEdit(id, nama, umur, diagnosa) {
  idEl.value = id;
  namaEl.value = nama;
  umurEl.value = umur;
  diagnosaEl.value = diagnosa;
  batalBtn.style.display = "inline-flex";
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  namaEl.focus();
}

function openDeleteModal(id, nama) {
  deleteId = id;
  deleteMessage.textContent = `Apakah Anda yakin ingin menghapus data pasien "${nama}"? Tindakan ini tidak dapat dibatalkan.`;
  deleteModal.style.display = "flex";
}

function closeDeleteModal() {
  deleteModal.style.display = "none";
  deleteId = null;
}

async function hapusData() {
  if (!deleteId) return;

  confirmDeleteBtn.disabled = true;

  try {
    const res = await fetch(`${API}/${deleteId}`, {
      method: "DELETE"
    });

    const result = await res.json();

    if (result.success) {
      showAlert("Data pasien berhasil dihapus", "success");
      closeDeleteModal();
      await loadData();
    } else {
      showAlert("Gagal menghapus data: " + result.message, "error");
    }
  } catch (error) {
    console.error("Error deleting data:", error);
    showAlert("Terjadi kesalahan saat menghapus data", "error");
  } finally {
    confirmDeleteBtn.disabled = false;
  }
}

// UI Functions
function showAlert(message, type = "success") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <span class="alert-icon">${type === "success" ? "✓" : type === "error" ? "✕" : "⚠"}</span>
    <span class="alert-message">${message}</span>
    <button class="alert-close">×</button>
  `;

  alertContainer.appendChild(alert);

  alert.querySelector(".alert-close").addEventListener("click", () => {
    alert.classList.add("hide");
    setTimeout(() => alert.remove(), 300);
  });

  setTimeout(() => {
    if (alertContainer.contains(alert)) {
      alert.classList.add("hide");
      setTimeout(() => alert.remove(), 300);
    }
  }, 3500);
}

function updateTotal() {
  totalPasienSpan.textContent = dataPasien.length;
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function renderTabel(data) {
  tbody.innerHTML = "";

  if (data.length === 0) {
    emptyState.classList.add("show");
    return;
  }

  emptyState.classList.remove("show");

  data.forEach((pasien, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="col-id" style="text-align: center;">${pasien.id}</td>
      <td class="col-nama">
        <strong>${escapeHtml(pasien.nama)}</strong>
      </td>
      <td class="col-umur" style="text-align: center;">${pasien.umur} tahun</td>
      <td class="col-diagnosa">${escapeHtml(pasien.diagnosa)}</td>
      <td class="col-aksi">
        <div class="table-actions">
          <button onclick="setEdit(${pasien.id}, '${escapeHtml(pasien.nama).replace(/'/g, "\\'")}', ${pasien.umur}, '${escapeHtml(pasien.diagnosa).replace(/'/g, "\\'")}')" class="btn btn-secondary btn-sm" title="Edit">
            <span class="btn-icon">✏️</span>
            <span class="btn-text">Edit</span>
          </button>
          <button onclick="openDeleteModal(${pasien.id}, '${escapeHtml(pasien.nama).replace(/'/g, "\\'")}')" class="btn btn-danger btn-sm" title="Hapus">
            <span class="btn-icon">🗑️</span>
            <span class="btn-text">Hapus</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function applyFiltersAndSort() {
  const searchQuery = searchInput.value.toLowerCase().trim();
  const sortBy = sortSelect.value;

  // Filter
  filteredData = dataPasien.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchQuery) ||
      p.diagnosa.toLowerCase().includes(searchQuery) ||
      p.umur.toString().includes(searchQuery)
  );

  // Sort
  if (sortBy === "nama-asc") {
    filteredData.sort((a, b) => a.nama.localeCompare(b.nama));
  } else if (sortBy === "nama-desc") {
    filteredData.sort((a, b) => b.nama.localeCompare(a.nama));
  } else if (sortBy === "umur-asc") {
    filteredData.sort((a, b) => a.umur - b.umur);
  } else if (sortBy === "umur-desc") {
    filteredData.sort((a, b) => b.umur - a.umur);
  } else if (sortBy === "terbaru") {
    filteredData.sort((a, b) => b.id - a.id);
  }

  renderTabel(filteredData);
}

// Event Listeners
form.addEventListener("submit", saveData);

batalBtn.addEventListener("click", () => {
  form.reset();
  idEl.value = "";
  batalBtn.style.display = "none";
  showAlert("Edit dibatalkan", "warning");
});

searchInput.addEventListener("input", applyFiltersAndSort);
sortSelect.addEventListener("change", applyFiltersAndSort);

refreshBtn.addEventListener("click", async () => {
  refreshBtn.disabled = true;
  await loadData();
  refreshBtn.disabled = false;
  showAlert("Data berhasil diperbarui", "success");
});

confirmDeleteBtn.addEventListener("click", hapusData);

// Initialize
loadData();
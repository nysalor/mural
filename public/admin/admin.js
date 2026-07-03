(function () {
  const DAYS    = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
  const API     = "/api/schedules";

  const form      = document.getElementById("schedule-form");
  const editId    = document.getElementById("edit-id");
  const formTitle = document.getElementById("form-title");
  const submitBtn = document.getElementById("submit-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const tbody     = document.getElementById("schedule-list");
  const emptyMsg  = document.getElementById("empty-msg");
  const dimRow    = document.getElementById("dim-level-row");
  const dimRange  = document.getElementById("dim_level");
  const dimLabel  = document.getElementById("dim-label");
  const actionSel = document.getElementById("action");

  // 暗さスライダーのラベル連動
  dimRange.addEventListener("input", () => { dimLabel.textContent = dimRange.value; });

  // アクション切替で dim_level 行を表示/非表示
  actionSel.addEventListener("change", () => {
    dimRow.style.display = actionSel.value === "dim" ? "" : "none";
  });

  // --- API ---
  async function api(method, path, body) {
    const opts = {
      method,
      headers: { "Content-Type": "application/json", "Accept": "application/json" }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(path, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err.errors || [res.statusText]).join(", "));
    }
    return res.status === 204 ? null : res.json();
  }

  // --- 一覧取得 ---
  async function loadSchedules() {
    const schedules = await api("GET", API);
    tbody.innerHTML = "";

    if (schedules.length === 0) {
      emptyMsg.style.display = "";
      return;
    }
    emptyMsg.style.display = "none";

    schedules.forEach(s => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${DAYS[s.day_of_week]}</td>
        <td>${s.start_time.slice(0, 5)}</td>
        <td>${s.end_time.slice(0, 5)}</td>
        <td><span class="badge badge-${s.action}">${s.action}</span></td>
        <td>${s.action === "dim" ? s.dim_level + "%" : "—"}</td>
        <td><span class="enabled-dot ${s.enabled ? "on" : "off"}"></span></td>
        <td>
          <button class="btn-edit" data-id="${s.id}">編集</button>
          <button class="btn-delete" data-id="${s.id}">削除</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", () => {
        const s = schedules.find(x => x.id == btn.dataset.id);
        startEdit(s);
      });
    });

    tbody.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", () => deleteSchedule(btn.dataset.id));
    });
  }

  // --- 編集モード ---
  function startEdit(s) {
    editId.value                                    = s.id;
    document.getElementById("day_of_week").value   = s.day_of_week;
    document.getElementById("start_time").value    = s.start_time.slice(0, 5);
    document.getElementById("end_time").value      = s.end_time.slice(0, 5);
    actionSel.value                                 = s.action;
    dimRange.value                                  = s.dim_level;
    dimLabel.textContent                            = s.dim_level;
    document.getElementById("enabled").checked     = s.enabled;
    dimRow.style.display = s.action === "dim" ? "" : "none";
    formTitle.textContent = "スケジュールを編集";
    submitBtn.textContent = "更新";
    cancelBtn.style.display = "";
    window.scrollTo(0, 0);
  }

  function cancelEdit() {
    editId.value = "";
    form.reset();
    dimRange.value = 80;
    dimLabel.textContent = 80;
    dimRow.style.display = "";
    formTitle.textContent = "スケジュールを追加";
    submitBtn.textContent = "追加";
    cancelBtn.style.display = "none";
  }

  cancelBtn.addEventListener("click", cancelEdit);

  // --- 送信 ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
      schedule: {
        day_of_week: parseInt(document.getElementById("day_of_week").value),
        start_time:  document.getElementById("start_time").value,
        end_time:    document.getElementById("end_time").value,
        action:      actionSel.value,
        dim_level:   parseInt(dimRange.value),
        enabled:     document.getElementById("enabled").checked
      }
    };

    try {
      if (editId.value) {
        await api("PUT", `${API}/${editId.value}`, body);
      } else {
        await api("POST", API, body);
      }
      cancelEdit();
      loadSchedules();
    } catch (err) {
      alert("エラー: " + err.message);
    }
  });

  // --- 削除 ---
  async function deleteSchedule(id) {
    if (!confirm("このスケジュールを削除しますか？")) return;
    try {
      await api("DELETE", `${API}/${id}`);
      loadSchedules();
    } catch (err) {
      alert("エラー: " + err.message);
    }
  }

  loadSchedules();
})();

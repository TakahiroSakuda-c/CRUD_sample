// 画面（DOM）と CRUD ロジック（js/userStore.js）をつなぐ層。
// データ操作そのものは UserStore 側に持たせている。
(function () {
    "use strict";

    const store = window.UserStore.createUserStore();

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const saveButton = document.getElementById("saveButton");
    const tbody = document.getElementById("userTableBody");

    function clearForm() {
        nameInput.value = "";
        emailInput.value = "";
    }

    function updateSaveButtonLabel() {
        saveButton.textContent = store.isEditing() ? "更新" : "登録";
    }

    function renderTable() {
        tbody.innerHTML = "";

        store.getUsers().forEach(user => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-action="edit" data-id="${user.id}">編集</button>
                    <button class="delete-btn" data-action="delete" data-id="${user.id}">削除</button>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    function saveUser() {
        const result = store.save(nameInput.value, emailInput.value);

        if (!result.ok) {
            alert(result.error);
            return;
        }

        clearForm();
        updateSaveButtonLabel();
        renderTable();
    }

    function editUser(id) {
        const user = store.startEdit(id);

        if (!user) {
            return;
        }

        nameInput.value = user.name;
        emailInput.value = user.email;

        updateSaveButtonLabel();
    }

    function deleteUser(id) {
        if (!confirm("削除しますか？")) {
            return;
        }

        const result = store.remove(id);

        if (result.editingCancelled) {
            clearForm();
            updateSaveButtonLabel();
        }

        renderTable();
    }

    saveButton.addEventListener("click", saveUser);

    // 一覧の編集・削除ボタンはイベント委譲で処理する
    tbody.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) {
            return;
        }

        const id = Number(button.dataset.id);

        if (button.dataset.action === "edit") {
            editUser(id);
        } else if (button.dataset.action === "delete") {
            deleteUser(id);
        }
    });

    renderTable();
})();

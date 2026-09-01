// 初期データ
let users = [
    {
        id: 1,
        name: "山田 太郎",
        email: "yamada@example.com"
    },
    {
        id: 2,
        name: "鈴木 花子",
        email: "suzuki@example.com"
    },
    {
        id: 3,
        name: "佐藤 次郎",
        email: "sato@example.com"
    },
    {
        id: 4,
        name: "高橋 美咲",
        email: "takahashi@example.com"
    },
    {
        id: 5,
        name: "伊藤 健",
        email: "ito@example.com"
    }
];

let nextId = 6;
let editingId = null;

function renderTable() {
    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = "";

    users.forEach(user => {
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
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !email) {
        alert("氏名とメールアドレスを入力してください。");
        return;
    }

    if (editingId === null) {
        users.push({
            id: nextId++,
            name: name,
            email: email
        });
    } else {
        const user = users.find(u => u.id === editingId);

        if (user) {
            user.name = name;
            user.email = email;
        }

        editingId = null;
        document.getElementById("saveButton").textContent = "登録";
    }

    nameInput.value = "";
    emailInput.value = "";

    renderTable();
}

function editUser(id) {
    const user = users.find(u => u.id === id);

    if (!user) {
        return;
    }

    document.getElementById("name").value = user.name;
    document.getElementById("email").value = user.email;

    editingId = id;
    document.getElementById("saveButton").textContent = "更新";
}

function deleteUser(id) {
    if (!confirm("削除しますか？")) {
        return;
    }

    users = users.filter(user => user.id !== id);

    if (editingId === id) {
        editingId = null;
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("saveButton").textContent = "登録";
    }

    renderTable();
}

document
    .getElementById("saveButton")
    .addEventListener("click", saveUser);

// 一覧の編集・削除ボタンはイベント委譲で処理する
document
    .getElementById("userTableBody")
    .addEventListener("click", event => {
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

// 社員データの CRUD ロジック。
// DOM に一切依存しないため、ブラウザからも Node.js のテストからも利用できる。
(function (global) {
    "use strict";

    // 初期データ
    const DEFAULT_USERS = [
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

    const REQUIRED_MESSAGE = "氏名とメールアドレスを入力してください。";

    function copyUser(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email
        };
    }

    // initialUsers を省略すると DEFAULT_USERS の複製から開始する。
    // 複製を持つことで、ストアを複数生成しても互いに影響しない。
    function createUserStore(initialUsers) {
        const source = initialUsers || DEFAULT_USERS;

        let users = source.map(copyUser);
        let nextId = users.reduce((max, user) => Math.max(max, user.id), 0) + 1;
        let editingId = null;

        function findUser(id) {
            return users.find(user => user.id === id) || null;
        }

        return {
            // 一覧を取得する（呼び出し側から内部状態を壊されないようコピーを返す）
            getUsers() {
                return users.map(copyUser);
            },

            // 指定 ID の社員を取得する。存在しない場合は null。
            getUser(id) {
                const user = findUser(id);

                return user ? copyUser(user) : null;
            },

            getEditingId() {
                return editingId;
            },

            isEditing() {
                return editingId !== null;
            },

            // 登録 / 更新を行う。編集モードかどうかで動作が変わる。
            save(name, email) {
                const trimmedName = String(name == null ? "" : name).trim();
                const trimmedEmail = String(email == null ? "" : email).trim();

                if (!trimmedName || !trimmedEmail) {
                    return {
                        ok: false,
                        error: REQUIRED_MESSAGE
                    };
                }

                if (editingId === null) {
                    const created = {
                        id: nextId++,
                        name: trimmedName,
                        email: trimmedEmail
                    };

                    users.push(created);

                    return {
                        ok: true,
                        mode: "create",
                        user: copyUser(created)
                    };
                }

                const user = findUser(editingId);

                if (user) {
                    user.name = trimmedName;
                    user.email = trimmedEmail;
                }

                editingId = null;

                return {
                    ok: true,
                    mode: "update",
                    user: user ? copyUser(user) : null
                };
            },

            // 編集モードに入る。対象が存在しない場合は null を返し、状態は変えない。
            startEdit(id) {
                const user = findUser(id);

                if (!user) {
                    return null;
                }

                editingId = id;

                return copyUser(user);
            },

            cancelEdit() {
                editingId = null;
            },

            // 削除する。編集中の社員を削除した場合は編集モードも解除する。
            remove(id) {
                const before = users.length;

                users = users.filter(user => user.id !== id);

                const removed = users.length !== before;
                const editingCancelled = editingId === id;

                if (editingCancelled) {
                    editingId = null;
                }

                return {
                    removed: removed,
                    editingCancelled: editingCancelled
                };
            }
        };
    }

    const api = {
        createUserStore: createUserStore,
        DEFAULT_USERS: DEFAULT_USERS,
        REQUIRED_MESSAGE: REQUIRED_MESSAGE
    };

    if (typeof module === "object" && module !== null && module.exports) {
        module.exports = api;
    } else {
        global.UserStore = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : this);

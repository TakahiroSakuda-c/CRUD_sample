"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { createUserStore, DEFAULT_USERS, REQUIRED_MESSAGE } = require("../js/userStore.js");

// テストごとに独立した状態を使いたいので、必要な分だけを持つストアを作るヘルパー
function createTestStore() {
    return createUserStore([
        { id: 1, name: "山田 太郎", email: "yamada@example.com" },
        { id: 2, name: "鈴木 花子", email: "suzuki@example.com" }
    ]);
}

test("Read（参照）", async t => {
    await t.test("初期データを取得できる", () => {
        const store = createUserStore();

        assert.equal(store.getUsers().length, DEFAULT_USERS.length);
        assert.deepEqual(store.getUsers()[0], DEFAULT_USERS[0]);
    });

    await t.test("ID を指定して取得できる", () => {
        const store = createTestStore();

        assert.deepEqual(store.getUser(2), {
            id: 2,
            name: "鈴木 花子",
            email: "suzuki@example.com"
        });
    });

    await t.test("存在しない ID を指定すると null を返す", () => {
        const store = createTestStore();

        assert.equal(store.getUser(999), null);
    });

    await t.test("getUsers() の戻り値を書き換えても内部状態は壊れない", () => {
        const store = createTestStore();

        const users = store.getUsers();
        users[0].name = "書き換え";
        users.push({ id: 99, name: "追加", email: "x@example.com" });

        assert.equal(store.getUsers().length, 2);
        assert.equal(store.getUser(1).name, "山田 太郎");
    });

    await t.test("ストアを複数作っても初期データは共有されない", () => {
        const first = createUserStore();
        const second = createUserStore();

        first.startEdit(1);
        first.save("変更後", "changed@example.com");

        assert.equal(second.getUser(1).name, DEFAULT_USERS[0].name);
        assert.equal(DEFAULT_USERS[0].name, "山田 太郎");
    });
});

test("Create（登録）", async t => {
    await t.test("新しい社員を追加できる", () => {
        const store = createTestStore();

        const result = store.save("新規 太郎", "shinki@example.com");

        assert.equal(result.ok, true);
        assert.equal(result.mode, "create");
        assert.deepEqual(result.user, {
            id: 3,
            name: "新規 太郎",
            email: "shinki@example.com"
        });
        assert.equal(store.getUsers().length, 3);
    });

    await t.test("ID は既存の最大値の次から連番で採番される", () => {
        const store = createUserStore([
            { id: 10, name: "既存", email: "a@example.com" }
        ]);

        assert.equal(store.save("1人目", "b@example.com").user.id, 11);
        assert.equal(store.save("2人目", "c@example.com").user.id, 12);
    });

    await t.test("削除後に登録しても ID は再利用されない", () => {
        const store = createTestStore();

        store.remove(2);

        assert.equal(store.save("新規", "new@example.com").user.id, 3);
    });

    await t.test("前後の空白は取り除かれる", () => {
        const store = createTestStore();

        const result = store.save("  空白 太郎  ", "  space@example.com  ");

        assert.equal(result.user.name, "空白 太郎");
        assert.equal(result.user.email, "space@example.com");
    });

    await t.test("氏名が未入力ならエラーになり追加されない", () => {
        const store = createTestStore();

        const result = store.save("", "only-email@example.com");

        assert.deepEqual(result, { ok: false, error: REQUIRED_MESSAGE });
        assert.equal(store.getUsers().length, 2);
    });

    await t.test("メールアドレスが未入力ならエラーになり追加されない", () => {
        const store = createTestStore();

        const result = store.save("氏名のみ", "");

        assert.equal(result.ok, false);
        assert.equal(store.getUsers().length, 2);
    });

    await t.test("空白のみの入力は未入力として扱う", () => {
        const store = createTestStore();

        assert.equal(store.save("   ", "   ").ok, false);
        assert.equal(store.getUsers().length, 2);
    });

    await t.test("null / undefined を渡してもエラーにならずバリデーションされる", () => {
        const store = createTestStore();

        assert.equal(store.save(null, undefined).ok, false);
        assert.equal(store.getUsers().length, 2);
    });
});

test("Update（更新）", async t => {
    await t.test("編集を開始すると対象データと編集状態が得られる", () => {
        const store = createTestStore();

        const user = store.startEdit(2);

        assert.equal(user.name, "鈴木 花子");
        assert.equal(store.isEditing(), true);
        assert.equal(store.getEditingId(), 2);
    });

    await t.test("編集中の保存は既存データを更新し、件数は増えない", () => {
        const store = createTestStore();

        store.startEdit(1);
        const result = store.save("山田 更新", "updated@example.com");

        assert.equal(result.mode, "update");
        assert.equal(store.getUsers().length, 2);
        assert.deepEqual(store.getUser(1), {
            id: 1,
            name: "山田 更新",
            email: "updated@example.com"
        });
    });

    await t.test("保存後は編集モードが解除される", () => {
        const store = createTestStore();

        store.startEdit(1);
        store.save("山田 更新", "updated@example.com");

        assert.equal(store.isEditing(), false);
        assert.equal(store.getEditingId(), null);
    });

    await t.test("編集解除後の保存は新規登録になる", () => {
        const store = createTestStore();

        store.startEdit(1);
        store.cancelEdit();

        assert.equal(store.isEditing(), false);
        assert.equal(store.save("新規 太郎", "new@example.com").mode, "create");
        assert.equal(store.getUsers().length, 3);
    });

    await t.test("存在しない ID の編集開始は null を返し、編集モードにならない", () => {
        const store = createTestStore();

        assert.equal(store.startEdit(999), null);
        assert.equal(store.isEditing(), false);
    });

    await t.test("編集中の入力が未入力ならエラーになり編集モードは維持される", () => {
        const store = createTestStore();

        store.startEdit(1);
        const result = store.save("", "");

        assert.equal(result.ok, false);
        assert.equal(store.isEditing(), true);
        assert.equal(store.getUser(1).name, "山田 太郎");
    });

    await t.test("他の社員のデータは書き換わらない", () => {
        const store = createTestStore();

        store.startEdit(1);
        store.save("山田 更新", "updated@example.com");

        assert.deepEqual(store.getUser(2), {
            id: 2,
            name: "鈴木 花子",
            email: "suzuki@example.com"
        });
    });
});

test("Delete（削除）", async t => {
    await t.test("指定した社員を削除できる", () => {
        const store = createTestStore();

        const result = store.remove(1);

        assert.equal(result.removed, true);
        assert.equal(store.getUser(1), null);
        assert.deepEqual(store.getUsers().map(user => user.id), [2]);
    });

    await t.test("存在しない ID の削除は removed=false で何も起きない", () => {
        const store = createTestStore();

        const result = store.remove(999);

        assert.equal(result.removed, false);
        assert.equal(store.getUsers().length, 2);
    });

    await t.test("編集中の社員を削除すると編集モードが解除される", () => {
        const store = createTestStore();

        store.startEdit(1);
        const result = store.remove(1);

        assert.equal(result.editingCancelled, true);
        assert.equal(store.isEditing(), false);
    });

    await t.test("編集中でない社員の削除では編集モードが維持される", () => {
        const store = createTestStore();

        store.startEdit(1);
        const result = store.remove(2);

        assert.equal(result.editingCancelled, false);
        assert.equal(store.getEditingId(), 1);
    });
});

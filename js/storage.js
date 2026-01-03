// js/storage.js
(() => {
    const KEY = "verblack_save_v1";

    function safeParse(str) {
        try { return JSON.parse(str); } catch { return null; }
    }

    function nowISO() {
        return new Date().toISOString();
    }

    const DEFAULT_STATE = {
        version: 1,
        at: "scene_001",
        stats: { hp: 7, luck: 3, sanity: 5 },
        flags: {},
        last3Beats: [],
        log: [],
        pending: {
            text: "안개가 얕게 깔린 새벽. 너(베르블랙)는 낯선 봉투 하나를 손에 쥐고 있었다. 빨간 봉랍, 그리고… 문양이 이상하게 익숙하다.",
            choices: [
                { id: "A", label: "봉투를 바로 뜯는다" },
                { id: "B", label: "일단 주변을 살핀다" },
                { id: "C", label: "봉투를 숨기고 나중에 확인한다" }
            ],
            mood: "neutral",
            beatTag: "letter"
        },
        meta: { updatedAt: nowISO(), createdAt: nowISO() }
    };

    function load() {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        return safeParse(raw);
    }

    function save(state) {
        const next = { ...state, meta: { ...(state.meta || {}), updatedAt: nowISO() } };
        localStorage.setItem(KEY, JSON.stringify(next));
        return next;
    }

    function reset() {
        localStorage.removeItem(KEY);
    }

    function getOrCreate() {
        const existing = load();
        if (existing && existing.version === 1) return existing;
        const created = save(DEFAULT_STATE);
        return created;
    }

    // 전역 노출(간단히)
    window.StorageKit = { KEY, DEFAULT_STATE, load, save, reset, getOrCreate };
})();

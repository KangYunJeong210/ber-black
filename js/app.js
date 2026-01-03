// js/app.js
(() => {
    const $ = (sel) => document.querySelector(sel);

    const el = {
        avatarImg: $("#avatarImg"),
        hp: $("#statHp"),
        luck: $("#statLuck"),
        sanity: $("#statSanity"),
        storyText: $("#storyText"),
        choiceBtns: Array.from(document.querySelectorAll(".choice-btn")),
        statusHint: $("#statusHint"),

        saveBtn: $("#saveBtn"),
        resetBtn: $("#resetBtn"),
        skipBtn: $("#skipBtn")
    };

    let state = null;
    let isBusy = false;

    function setHint(text) {
        if (!el.statusHint) return;
        el.statusHint.textContent = text;
    }

    function render(s) {
        // stats
        if (el.hp) el.hp.textContent = String(s.stats?.hp ?? 0);
        if (el.luck) el.luck.textContent = String(s.stats?.luck ?? 0);
        if (el.sanity) el.sanity.textContent = String(s.stats?.sanity ?? 0);

        // avatar
        const mood = s.pending?.mood || "neutral";
        if (el.avatarImg) el.avatarImg.src = `./img/berblack/${mood}.png`;

        // story
        if (el.storyText) el.storyText.textContent = s.pending?.text || "";

        // choices
        const choices = s.pending?.choices || [];
        el.choiceBtns.forEach((btn, idx) => {
            const c = choices[idx];
            if (!c) {
                btn.style.display = "none";
                return;
            }
            btn.style.display = "";
            btn.dataset.choice = c.id;
            const label = btn.querySelector(".choice-label");
            const key = btn.querySelector(".choice-key");
            if (label) label.textContent = c.label;
            if (key) key.textContent = c.id;

            const sceneChar = document.getElementById("sceneChar");
if (sceneChar) sceneChar.src = `./img/berblack/${mood}.png`;
            
        });
    }

    function disableChoices(disabled) {
        el.choiceBtns.forEach((b) => (b.disabled = !!disabled));
    }

    function pushBeat(beatTag) {
        if (!beatTag) return;
        const arr = Array.isArray(state.last3Beats) ? state.last3Beats.slice() : [];
        arr.push(beatTag);
        while (arr.length > 3) arr.shift();
        state.last3Beats = arr;
    }

    function applyServerPayload(payload, picked) {
        // payload 예시:
        // { sceneId, text, choices, stats, flags, mood, beatTag, isEnding }
        state.at = payload.sceneId || state.at;

        if (payload.stats) state.stats = payload.stats;
        if (payload.flags) state.flags = payload.flags;

        state.pending = {
            text: payload.text ?? state.pending.text,
            choices: payload.choices ?? state.pending.choices,
            mood: payload.mood ?? state.pending.mood,
            beatTag: payload.beatTag ?? state.pending.beatTag
        };

        if (payload.beatTag) pushBeat(payload.beatTag);

        state.log = Array.isArray(state.log) ? state.log : [];
        if (picked) state.log.push({ role: "choice", picked, at: new Date().toISOString() });
        state.log.push({ role: "narration", text: state.pending.text, at: new Date().toISOString() });
    }

    async function onPick(choiceId) {
        if (isBusy) return;
        isBusy = true;
        disableChoices(true);
        setHint("생각 중…");

        try {
            // 서버로 현재 state + 선택 전달
            const payload = await window.ApiKit.postStory(state, choiceId);

            applyServerPayload(payload, choiceId);
            state = window.StorageKit.save(state);

            render(state);
            setHint("자동 저장됨");
        } catch (err) {
            console.error(err);
            setHint("오류 발생(네트워크/서버). 다시 시도해줘.");
        } finally {
            disableChoices(false);
            isBusy = false;
        }
    }

    function bindChoices() {
        el.choiceBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                const choiceId = btn.dataset.choice;
                if (!choiceId) return;

                // ✅ 아직 백엔드 없으면: 임시로 로컬 진행(테스트용) 가능
                // 하지만 지금은 API 기반이 목표라서 그대로 호출.
                onPick(choiceId);
            });
        });
    }

    function bindMenuButtons() {
        if (el.saveBtn) {
            el.saveBtn.addEventListener("click", () => {
                state = window.StorageKit.save(state);
                setHint("저장 완료");
            });
        }

        if (el.resetBtn) {
            el.resetBtn.addEventListener("click", () => {
                window.StorageKit.reset();
                state = window.StorageKit.getOrCreate();
                render(state);
                setHint("처음부터 시작!");
                window.UIKit?.closeMenu?.();
            });
        }

        if (el.skipBtn) {
            el.skipBtn.addEventListener("click", () => {
                // 스킵 = 연출용 버튼(나중에 타자 효과 있을 때 유용)
                // 지금은 기능 없음
                setHint("스킵(연출 기능은 다음 단계에서 추가)");
            });
        }
    }

    function boot() {
        // theme
        window.UIKit.setTheme(window.UIKit.getTheme());
        window.UIKit.bindMenu();

        // load state
        state = window.StorageKit.getOrCreate();
        render(state);
        setHint("자동 저장됨");

        // bind
        bindChoices();
        bindMenuButtons();
    }

    document.addEventListener("DOMContentLoaded", boot);
})();


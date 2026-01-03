// js/api.js
(() => {
    // ✅ 여기만 바꾸면 됨:
    // - 로컬 테스트면 "http://localhost:3000"
    // - 배포면 "https://너의-vercel-도메인"


    const API_BASE = "https://vercel-api-ten-tau.vercel.app";
    // API_BASE를 빈 문자열로 두면, 같은 도메인에서 /api/story 호출 (Vercel과 같은 곳일 때)

    async function postStory(state, picked) {
        const res = await fetch(`${API_BASE}/api/story`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ state, picked })
        });

        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`API_ERROR ${res.status}: ${text || "failed"}`);
        }

        return res.json();
    }

    window.ApiKit = { postStory };
})();


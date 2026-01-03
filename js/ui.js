// js/ui.js
(() => {
    const THEME_KEY = "verblack_theme_v1";

    function setTheme(theme) {
        const t = theme === "dark" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", t === "dark" ? "dark" : "light");

        // 토글 UI 반영
        const toggle = document.getElementById("themeToggle");
        if (toggle) toggle.setAttribute("aria-pressed", t === "dark" ? "true" : "false");

        localStorage.setItem(THEME_KEY, t);
    }

    function getTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === "dark" || saved === "light") return saved;

        // 시스템 선호
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
    }

    function openMenu() {
        document.body.classList.add("menu-open");
        const btn = document.getElementById("menuBtn");
        const menu = document.getElementById("sideMenu");
        if (btn) btn.setAttribute("aria-expanded", "true");
        if (menu) menu.setAttribute("aria-hidden", "false");
    }

    function closeMenu() {
        document.body.classList.remove("menu-open");
        const btn = document.getElementById("menuBtn");
        const menu = document.getElementById("sideMenu");
        if (btn) btn.setAttribute("aria-expanded", "false");
        if (menu) menu.setAttribute("aria-hidden", "true");
    }

    function bindMenu() {
        const menuBtn = document.getElementById("menuBtn");
        const sideMenu = document.getElementById("sideMenu");
        const themeToggle = document.getElementById("themeToggle");

        if (menuBtn) {
            menuBtn.addEventListener("click", () => {
                const expanded = menuBtn.getAttribute("aria-expanded") === "true";
                expanded ? closeMenu() : openMenu();
            });
        }

        if (sideMenu) {
            // data-close 요소 클릭 시 닫기
            sideMenu.addEventListener("click", (e) => {
                const el = e.target.closest("[data-close]");
                if (el) closeMenu();
            });

            // ESC 닫기
            window.addEventListener("keydown", (e) => {
                if (e.key === "Escape") closeMenu();
            });
        }

        if (themeToggle) {
            themeToggle.addEventListener("click", () => {
                const pressed = themeToggle.getAttribute("aria-pressed") === "true";
                setTheme(pressed ? "light" : "dark");
            });
        }
    }

    window.UIKit = { setTheme, getTheme, openMenu, closeMenu, bindMenu };
})();

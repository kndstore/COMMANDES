/* ========================================
   THÈME CLAIR / SOMBRE
   - 1re visite : suit le réglage de l'appareil
   - ensuite : mémorise le choix du visiteur
   À charger dans le <head> (pour éviter le flash blanc).
   ======================================== */
(function () {
    const root = document.documentElement;
    const KEY = "theme";
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function getSaved() {
        try {
            return localStorage.getItem(KEY);
        } catch (e) {
            return null;
        }
    }

    function save(value) {
        try {
            localStorage.setItem(KEY, value);
        } catch (e) {
            /* stockage indisponible : le choix ne sera pas mémorisé */
        }
    }

    function apply(theme) {
        root.setAttribute("data-theme", theme);
    }

    /* Appliqué tout de suite, avant l'affichage de la page */
    apply(getSaved() || (media.matches ? "dark" : "light"));

    document.addEventListener("DOMContentLoaded", () => {
        const button = document.getElementById("themeToggle");

        if (!button) {
            return;
        }

        function render() {
            const isDark = root.getAttribute("data-theme") === "dark";
            const label = isDark ? "Passer en mode clair" : "Passer en mode sombre";

            button.textContent = isDark ? "☀️" : "🌙";
            button.setAttribute("aria-label", label);
            button.title = label;
        }

        button.addEventListener("click", () => {
            const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";

            apply(next);
            save(next);
            render();
        });

        /* Si le visiteur n'a rien choisi, on suit le système en direct */
        media.addEventListener("change", (event) => {
            if (!getSaved()) {
                apply(event.matches ? "dark" : "light");
                render();
            }
        });

        render();
    });
})();

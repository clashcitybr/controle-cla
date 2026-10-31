// ============================================================
// CONTADOR DE USO (anônimo)
// Avisa o servidor que uma página foi aberta, para o líder saber o
// que o pessoal usa. Manda só: nome da página, um código aleatório
// deste aparelho (não identifica ninguém) e se veio do app.
// A mesma página no mesmo aparelho conta no máximo 1 vez a cada 30 min.
// ============================================================
(function () {
    try {
        const p = location.pathname.toLowerCase();
        let pagina = null;
        if (p.startsWith('/liga')) pagina = 'liga';
        else if (/\/controle-cla\/(index\.html)?$/.test(p)) pagina = 'ranking';
        else if (p.startsWith('/controle-cla/')) {
            const m = p.match(/\/controle-cla\/([a-z-]+)\.html$/);
            if (m && ['membros', 'capital', 'ataques', 'historico', 'perfil', 'mapa', 'meu-painel'].includes(m[1])) pagina = m[1];
        } else if (p === '/' || p === '/index.html') pagina = 'home';
        if (!pagina) return;

        // Aberto pelo app da Play Store? (o app passa esse "referrer" na 1ª página)
        if (document.referrer.startsWith('android-app://')) sessionStorage.setItem('ccbr_app', '1');
        const noApp = sessionStorage.getItem('ccbr_app') === '1' ||
            (window.matchMedia && matchMedia('(display-mode: standalone)').matches);

        let aparelho = localStorage.getItem('ccbr_aparelho');
        if (!aparelho || !/^[a-z0-9]{8,32}$/.test(aparelho)) {
            aparelho = (Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 20);
            localStorage.setItem('ccbr_aparelho', aparelho);
        }

        const chave = 'ccbr_uso_' + pagina;
        if (Date.now() - (Number(localStorage.getItem(chave)) || 0) < 30 * 60 * 1000) return;
        localStorage.setItem(chave, String(Date.now()));

        const base = typeof BACKEND_URL !== 'undefined' ? BACKEND_URL : 'https://cork-dice-gala.ngrok-free.dev';
        setTimeout(() => {
            fetch(`${base}/uso`, {
                method: 'POST',
                keepalive: true,
                headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
                body: JSON.stringify({ pagina, aparelho, app: !!noApp })
            }).catch(() => {});
        }, 1500);
    } catch (_) { /* contador nunca pode atrapalhar a página */ }
})();

// ============================================================
// CONVITE PARA ATIVAR OS AVISOS
// Faixa discreta no rodapé da tela chamando para o Meu Painel,
// só para quem ainda não ligou os avisos. Fechou? Some por 14 dias.
// ============================================================
(function () {
    try {
        if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;
        if (Notification.permission === 'denied') return;
        if (localStorage.getItem('ccbr_avisos_ligados') === '1') return;
        const fechou = Number(localStorage.getItem('ccbr_convite_fechado')) || 0;
        if (Date.now() - fechou < 14 * 24 * 3600 * 1000) return;
    } catch (_) { return; }

    function mostrar() {
        const ico = n => (window.ic ? window.ic(n) : '');
        const faixa = document.createElement('div');
        faixa.className = 'convite-avisos';
        faixa.setAttribute('role', 'region');
        faixa.setAttribute('aria-label', 'Ativar avisos');
        faixa.innerHTML = `
            <span class="convite-ico">${ico('sino')}</span>
            <span class="convite-txt"><b>Não perca o prazo da guerra</b>O app te avisa 3h antes de acabar, se faltar ataque.</span>
            <a class="convite-btn" href="https://clashcitybr.github.io/controle-cla/meu-painel.html#cartaoAvisos">Ativar</a>
            <button type="button" class="convite-fechar" aria-label="Fechar">${ico('erro') || '×'}</button>`;
        faixa.querySelector('.convite-fechar').addEventListener('click', () => {
            try { localStorage.setItem('ccbr_convite_fechado', String(Date.now())); } catch (_) {}
            faixa.remove();
        });
        document.body.appendChild(faixa);
        requestAnimationFrame(() => faixa.classList.add('visivel'));
    }
    // Aparece depois de alguns segundos, sem atrapalhar a abertura da página
    // (o script é "defer": quando roda, a página já está montada)
    setTimeout(mostrar, 4000);
})();

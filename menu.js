// ============================================================
// MENU HAMBÚRGUER (celular) — usado pelas páginas do controle-cla e pela Liga
// No computador nada muda: os links continuam lado a lado.
// No celular a barra mostra só o nome da página + ☰, e os links abrem numa lista.
// ============================================================
(function () {
    const nav = document.querySelector('nav');
    if (!nav || nav.classList.contains('menu-pronto')) return;

    const LARGURA_CELULAR = 640;

    const estilo = document.createElement('style');
    estilo.textContent = `
        .menu-titulo, .menu-botao, .menu-fundo { display: none; }
        .menu-painel { display: contents; }

        @media (max-width: ${LARGURA_CELULAR}px) {
            nav.menu-pronto {
                height: 56px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: nowrap;
                gap: 12px;
                padding: 0 16px;
                overflow: visible;
                z-index: 2000;
            }
            nav.menu-pronto .menu-titulo {
                display: block;
                color: #f9d246;
                font-weight: 800;
                font-size: 0.95rem;
                letter-spacing: 0.6px;
                text-transform: uppercase;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                min-width: 0;
            }
            nav.menu-pronto .menu-botao {
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 5px;
                width: 42px;
                height: 42px;
                padding: 0 9px;
                margin-right: -6px;
                background: transparent;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                flex-shrink: 0;
            }
            nav.menu-pronto .menu-botao span {
                display: block;
                height: 2px;
                border-radius: 2px;
                background: #fff;
                transition: transform 0.25s, opacity 0.2s;
            }
            nav.menu-pronto.aberto .menu-botao span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
            nav.menu-pronto.aberto .menu-botao span:nth-child(2) { opacity: 0; }
            nav.menu-pronto.aberto .menu-botao span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

            nav.menu-pronto .menu-painel {
                display: flex;
                flex-direction: column;
                position: fixed;
                top: 56px;
                left: 0;
                right: 0;
                max-height: calc(100vh - 56px);
                overflow-y: auto;
                background: #11032c;
                padding: 6px 0 12px;
                box-shadow: 0 18px 30px rgba(0, 0, 0, 0.35);
                opacity: 0;
                transform: translateY(-10px);
                pointer-events: none;
                transition: opacity 0.2s, transform 0.2s;
            }
            nav.menu-pronto.aberto .menu-painel {
                opacity: 1;
                transform: none;
                pointer-events: auto;
            }
            nav.menu-pronto .menu-painel ul {
                display: flex;
                flex-direction: column;
                gap: 0;
                padding: 0;
                margin: 0;
                list-style: none;
            }
            nav.menu-pronto .menu-painel li { list-style: none; }
            nav.menu-pronto .menu-painel a {
                display: block;
                padding: 14px 22px;
                margin: 0;
                font-size: 0.92rem;
                letter-spacing: 0.6px;
                text-align: left;
                color: #fff;
                border: none;
                border-radius: 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                background: transparent;
                white-space: nowrap;
            }
            nav.menu-pronto .menu-painel a.ativo,
            nav.menu-pronto .menu-painel a.active {
                color: #f9d246;
                background: rgba(249, 210, 70, 0.08);
                box-shadow: inset 4px 0 0 #f9d246;
            }
            .menu-fundo {
                display: block;
                position: fixed;
                inset: 56px 0 0 0;
                background: rgba(0, 0, 0, 0.45);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
                z-index: 1999;
            }
            body.menu-aberto .menu-fundo { opacity: 1; pointer-events: auto; }

            /* Nos links o nome completo; o atalho "Ranking" não é mais necessário */
            nav.menu-pronto .nav-longo { display: inline !important; }
            nav.menu-pronto .nav-curto { display: none !important; }
        }
    `;
    document.head.appendChild(estilo);

    // Move os links (ou a <ul> da Liga) para dentro do painel
    const painel = document.createElement('div');
    painel.className = 'menu-painel';
    painel.id = 'menu-painel';
    while (nav.firstChild) painel.appendChild(nav.firstChild);

    const ativo = painel.querySelector('a.ativo, a.active');
    const titulo = document.createElement('span');
    titulo.className = 'menu-titulo';
    titulo.textContent = ativo ? (ativo.querySelector('.nav-longo') || ativo).textContent.trim() : (nav.dataset.titulo || 'Clash City BR');

    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'menu-botao';
    botao.setAttribute('aria-label', 'Abrir menu');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-controls', 'menu-painel');
    botao.innerHTML = '<span></span><span></span><span></span>';

    const fundo = document.createElement('div');
    fundo.className = 'menu-fundo';

    nav.append(titulo, botao, painel);
    nav.classList.add('menu-pronto');
    document.body.appendChild(fundo);

    function abrir(sim) {
        nav.classList.toggle('aberto', sim);
        document.body.classList.toggle('menu-aberto', sim);
        botao.setAttribute('aria-expanded', String(sim));
        botao.setAttribute('aria-label', sim ? 'Fechar menu' : 'Abrir menu');
    }

    botao.addEventListener('click', () => abrir(!nav.classList.contains('aberto')));
    fundo.addEventListener('click', () => abrir(false));
    painel.addEventListener('click', e => { if (e.target.closest('a')) abrir(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') abrir(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > LARGURA_CELULAR) abrir(false); });
})();

// ============================================================
// LAYOUT — GEOMETRIA (sem DOM: roda no navegador e nos testes em Node)
//
// Convenções da grade:
//   - Vila principal: 44 × 44 casas. (0,0) é o canto de CIMA do losango,
//     x cresce para o canto da DIREITA e y para o canto da ESQUERDA.
//   - Cada construção guarda a casa do seu canto de cima (x, y) e ocupa
//     tamanho × tamanho casas a partir dela.
//   - "Mundo" = pixels da foto (quando calibrada) ou de uma vista isométrica
//     padrão. A passagem grade → mundo é uma transformação afim, que é exata
//     para a câmera do jogo (projeção paralela, sem ponto de fuga).
// ============================================================
(function (raiz) {
    const TAMANHO_GRADE = 44;

    // Catálogo exclusivo do CV18 (tamanhos, máximos e fusões) vem de layout-cv18.js,
    // que precisa ser carregado antes deste arquivo na página.
    const CV18 = (typeof module !== 'undefined' && module.exports)
        ? require('./layout-cv18.js')
        : raiz.LayoutCV18;
    if (!CV18) throw new Error('layout-cv18.js precisa ser carregado antes de layout-geometria.js');

    const CATEGORIAS = {
        defesa:   { nome: 'Defesas',   cor: '#ef4444' },
        recurso:  { nome: 'Recursos',  cor: '#eab308' },
        exercito: { nome: 'Exército',  cor: '#3b82f6' },
        outro:    { nome: 'Outros',    cor: '#a855f7' },
        muro:     { nome: 'Muros',     cor: '#78716c' },
        armadilha:{ nome: 'Armadilhas',cor: '#f97316' }
    };

    const CATALOGO = CV18.CATALOGO;

    // ---------- transformação afim ----------
    // Recebe 3 pares (casa → ponto) e devolve {a,b,c,d,e,f} tal que
    //   X = a·gx + b·gy + c      Y = d·gx + e·gy + f
    function afimDe3Pontos(grade, mundo) {
        const [g0, g1, g2] = grade, [m0, m1, m2] = mundo;
        const det = (g1.x - g0.x) * (g2.y - g0.y) - (g2.x - g0.x) * (g1.y - g0.y);
        if (Math.abs(det) < 1e-9) throw new Error('Pontos de calibração alinhados');
        // Os pontos tocados também não podem estar alinhados (área do triângulo ~0)
        const areaMundo = (m1.x - m0.x) * (m2.y - m0.y) - (m2.x - m0.x) * (m1.y - m0.y);
        if (Math.abs(areaMundo) < 1) throw new Error('Pontos de calibração alinhados');
        const resolver = (v0, v1, v2) => {
            const p = ((v1 - v0) * (g2.y - g0.y) - (v2 - v0) * (g1.y - g0.y)) / det;
            const q = ((g1.x - g0.x) * (v2 - v0) - (g2.x - g0.x) * (v1 - v0)) / det;
            return [p, q, v0 - p * g0.x - q * g0.y];
        };
        const [a, b, c] = resolver(m0.x, m1.x, m2.x);
        const [d, e, f] = resolver(m0.y, m1.y, m2.y);
        return { a, b, c, d, e, f };
    }

    // Calibração por 3 cantos da área de 44×44: cima (0,0), direita (44,0), esquerda (0,44)
    function afimDosCantos(cima, direita, esquerda, n = TAMANHO_GRADE) {
        return afimDe3Pontos([{ x: 0, y: 0 }, { x: n, y: 0 }, { x: 0, y: n }], [cima, direita, esquerda]);
    }

    function gradeParaMundo(T, gx, gy) {
        return { x: T.a * gx + T.b * gy + T.c, y: T.d * gx + T.e * gy + T.f };
    }

    function mundoParaGrade(T, X, Y) {
        const det = T.a * T.e - T.b * T.d;
        if (Math.abs(det) < 1e-12) throw new Error('Transformação inválida');
        const x = X - T.c, y = Y - T.f;
        return { x: (T.e * x - T.b * y) / det, y: (-T.d * x + T.a * y) / det };
    }

    // Vista isométrica padrão (sem foto): losango 2:1 cabendo num retângulo
    function afimIsometricaPadrao(largura, n = TAMANHO_GRADE, margem = 20) {
        const meia = (largura - 2 * margem) / 2;   // meia largura do losango
        const cima = { x: largura / 2, y: margem };
        return afimDosCantos(cima, { x: cima.x + meia, y: cima.y + meia / 2 }, { x: cima.x - meia, y: cima.y + meia / 2 }, n);
    }

    // ---------- encaixe na grade ----------
    // Casa (fracionária) do toque → canto de cima da construção, centralizada no toque
    function encaixar(gx, gy, tam, n = TAMANHO_GRADE) {
        let x = Math.round(gx - tam / 2), y = Math.round(gy - tam / 2);
        x = Math.max(0, Math.min(n - tam, x));
        y = Math.max(0, Math.min(n - tam, y));
        return { x, y };
    }

    function dentroDaGrade(c, tam, n = TAMANHO_GRADE) {
        return c.x >= 0 && c.y >= 0 && c.x + tam <= n && c.y + tam <= n;
    }

    function seSobrepoem(a, ta, b, tb) {
        return a.x < b.x + tb && b.x < a.x + ta && a.y < b.y + tb && b.y < a.y + ta;
    }

    // Devolve o conjunto de ids em conflito (fora da grade ou sobrepostos).
    // Usa um mapa de casas: O(total de casas) em vez de comparar todos com todos.
    function conflitos(construcoes, catalogo = CATALOGO, n = TAMANHO_GRADE) {
        const ruins = new Set();
        const dono = new Map();
        for (const c of construcoes) {
            const tam = catalogo[c.tipo]?.tam || 1;
            if (!dentroDaGrade(c, tam, n)) { ruins.add(c.id); continue; }
            for (let i = 0; i < tam; i++) {
                for (let j = 0; j < tam; j++) {
                    const k = (c.x + i) * 100 + (c.y + j);
                    if (dono.has(k)) { ruins.add(c.id); ruins.add(dono.get(k)); }
                    else dono.set(k, c.id);
                }
            }
        }
        return ruins;
    }

    function construcaoNaCasa(construcoes, gx, gy, catalogo = CATALOGO) {
        // De trás pra frente: a última desenhada fica por cima
        for (let i = construcoes.length - 1; i >= 0; i--) {
            const c = construcoes[i];
            const tam = catalogo[c.tipo]?.tam || 1;
            if (gx >= c.x && gx < c.x + tam && gy >= c.y && gy < c.y + tam) return c;
        }
        return null;
    }

    // ---------- formato próprio de exportação ----------
    const VERSAO_FORMATO = 1;

    function validarLayout(dados, catalogo = CATALOGO) {
        const erros = [];
        if (!dados || typeof dados !== 'object') return { ok: false, erros: ['Arquivo não é um layout.'] };
        if (dados.formato !== 'clashcitybr-layout') erros.push('Formato desconhecido.');
        if (!Array.isArray(dados.construcoes)) erros.push('Lista de construções ausente.');
        const limpas = [];
        for (const c of dados.construcoes || []) {
            if (!catalogo[c.tipo]) { erros.push(`Tipo desconhecido: ${String(c.tipo).slice(0, 30)}`); continue; }
            if (!Number.isInteger(c.x) || !Number.isInteger(c.y)) { erros.push('Coordenada inválida.'); continue; }
            limpas.push({ id: limpas.length + 1, tipo: c.tipo, x: c.x, y: c.y });
        }
        return { ok: erros.length === 0, erros, construcoes: limpas };
    }

    function exportarLayout(nome, cv, construcoes) {
        return {
            formato: 'clashcitybr-layout',
            versao: VERSAO_FORMATO,
            nome: String(nome || 'Layout').slice(0, 60),
            cv: cv || CV18.CV,
            grade: TAMANHO_GRADE,
            criadoEm: new Date().toISOString(),
            construcoes: construcoes.map(c => ({ tipo: c.tipo, x: c.x, y: c.y }))
        };
    }

    const api = {
        TAMANHO_GRADE, CATEGORIAS, CATALOGO, CV18,
        afimDe3Pontos, afimDosCantos, afimIsometricaPadrao, gradeParaMundo, mundoParaGrade,
        encaixar, dentroDaGrade, seSobrepoem, conflitos, construcaoNaCasa,
        validarLayout, exportarLayout
    };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else raiz.LayoutGeo = api;
})(this);

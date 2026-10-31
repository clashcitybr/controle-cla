// Testes da geometria do Montador de Layout — rodar na pasta controle-cla com: node --test testes/layout-geometria.test.js
const test = require('node:test');
const assert = require('node:assert');
const G = require('../layout-geometria.js');

const perto = (a, b, tol = 1e-6) => assert.ok(Math.abs(a - b) < tol, `${a} ≠ ${b}`);

test('afim dos 3 cantos leva cada canto ao ponto certo', () => {
    const T = G.afimDosCantos({ x: 500, y: 100 }, { x: 900, y: 320 }, { x: 110, y: 300 });
    const cima = G.gradeParaMundo(T, 0, 0), dir = G.gradeParaMundo(T, 44, 0), esq = G.gradeParaMundo(T, 0, 44);
    perto(cima.x, 500); perto(cima.y, 100);
    perto(dir.x, 900); perto(dir.y, 320);
    perto(esq.x, 110); perto(esq.y, 300);
});

test('mundo → grade é o inverso de grade → mundo', () => {
    const T = G.afimDosCantos({ x: 512, y: 80 }, { x: 980, y: 340 }, { x: 40, y: 330 });
    for (const [gx, gy] of [[0, 0], [10.5, 3.25], [43.9, 22], [22, 44]]) {
        const m = G.gradeParaMundo(T, gx, gy);
        const g = G.mundoParaGrade(T, m.x, m.y);
        perto(g.x, gx); perto(g.y, gy);
    }
});

test('pontos alinhados não calibram', () => {
    assert.throws(() => G.afimDosCantos({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 20 }));
});

test('vista padrão: losango 2:1 dentro da largura', () => {
    const T = G.afimIsometricaPadrao(400);
    const dir = G.gradeParaMundo(T, 44, 0), esq = G.gradeParaMundo(T, 0, 44), baixo = G.gradeParaMundo(T, 44, 44);
    perto(dir.x, 380); perto(esq.x, 20);
    perto(baixo.y - 20, (dir.x - esq.x) / 2);   // altura = metade da largura
});

test('encaixar centraliza no toque e não sai da grade', () => {
    assert.deepStrictEqual(G.encaixar(10.2, 10.7, 3), { x: 9, y: 9 });
    assert.deepStrictEqual(G.encaixar(0.3, 0.3, 4), { x: 0, y: 0 });
    assert.deepStrictEqual(G.encaixar(43.9, 43.9, 3), { x: 41, y: 41 });
});

test('conflitos: sobreposição e fora da grade', () => {
    const lista = [
        { id: 1, tipo: 'centro_vila', x: 20, y: 20 },   // 4×4: 20..23
        { id: 2, tipo: 'canhao', x: 23, y: 23 },        // encosta na casa 23,23 → conflito
        { id: 3, tipo: 'canhao', x: 30, y: 30 },        // livre
        { id: 4, tipo: 'muro', x: 44, y: 0 },           // fora
        { id: 5, tipo: 'muro', x: 24, y: 20 }           // vizinho do CV, sem conflito
    ];
    const r = G.conflitos(lista);
    assert.deepStrictEqual([...r].sort(), [1, 2, 4]);
});

test('construção na casa devolve a de cima', () => {
    const lista = [{ id: 1, tipo: 'canhao', x: 5, y: 5 }, { id: 2, tipo: 'muro', x: 6, y: 6 }];
    assert.strictEqual(G.construcaoNaCasa(lista, 6, 6).id, 2);
    assert.strictEqual(G.construcaoNaCasa(lista, 5, 7).id, 1);
    assert.strictEqual(G.construcaoNaCasa(lista, 9, 9), null);
});

test('exportar e validar fazem ida e volta', () => {
    const dados = G.exportarLayout('Guerra CV16', 16, [{ id: 7, tipo: 'canhao', x: 1, y: 2 }]);
    const v = G.validarLayout(JSON.parse(JSON.stringify(dados)));
    assert.ok(v.ok);
    assert.deepStrictEqual(v.construcoes, [{ id: 1, tipo: 'canhao', x: 1, y: 2 }]);
});

test('validar rejeita arquivo estranho e tipo desconhecido', () => {
    assert.strictEqual(G.validarLayout(null).ok, false);
    const v = G.validarLayout({ formato: 'clashcitybr-layout', construcoes: [{ tipo: 'nave_espacial', x: 1, y: 1 }, { tipo: 'muro', x: 1.5, y: 2 }] });
    assert.strictEqual(v.ok, false);
    assert.strictEqual(v.construcoes.length, 0);
});

test('catálogo: todo tipo tem tamanho e categoria válidos', () => {
    for (const [k, c] of Object.entries(G.CATALOGO)) {
        assert.ok([1, 2, 3, 4].includes(c.tam), k);
        assert.ok(G.CATEGORIAS[c.cat], k);
    }
});

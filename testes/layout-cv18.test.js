// Testes das regras do CV18 — rodar na pasta controle-cla com: node --test testes/layout-cv18.test.js
const test = require('node:test');
const assert = require('node:assert');
const CV = require('../layout-cv18.js');
const G = require('../layout-geometria.js');

let id = 0;
const varios = (tipo, n) => Array.from({ length: n }, () => ({ id: ++id, tipo, x: 0, y: 0 }));
const codigos = r => r.problemas.map(p => p.codigo).sort();

// ---------- catálogo ----------
test('catálogo: todo item tem nome, categoria, tamanho, máximo e status', () => {
    for (const [k, i] of Object.entries(CV.CATALOGO)) {
        assert.ok(i.nome && i.sigla !== undefined, k);
        assert.ok(G.CATEGORIAS[i.cat], `${k}: categoria`);
        assert.ok([1, 2, 3, 4].includes(i.tam), `${k}: tamanho`);
        assert.ok(Number.isInteger(i.max) && i.max >= 1, `${k}: máximo`);
        assert.ok(['confirmado', 'catalogo', 'pendente'].includes(i.tamStatus), `${k}: status`);
        if (i.tamStatus === 'confirmado' && i.fonteTam) assert.ok(CV.FONTES[i.fonteTam], `${k}: fonte`);
    }
});

test('catálogo: quantidades máximas do CV18', () => {
    const esperado = {
        centro_vila: 1, castelo_cla: 1, cabana_construtor: 5,
        canhao: 7, torre_arqueiras: 9, morteiro: 4, defesa_aerea: 4, torre_mago: 6, super_torre_mago: 2,
        vassoura_aerea: 2, tesla: 5, torre_bombas: 2, x_besta: 4, torre_inferno: 3, artilharia_aguia: 1,
        artilharia_inferno: 1, dispersora: 2, torre_feiticos: 2, monolito: 1, canhao_ricochete: 3,
        multi_arqueira: 3, cuspidor: 2, torre_multiengrenagem: 1, torre_vinganca: 1,
        coletor_ouro: 7, coletor_elixir: 7, broca_negro: 3, deposito_ouro: 4, deposito_elixir: 4, deposito_negro: 1,
        acampamento: 4, muro: 325,
        bomba: 8, mola: 9, bomba_aerea: 8, bomba_gigante: 8, mina_aerea: 9, armadilha_esqueleto: 4,
        armadilha_tornado: 1, giga_bomba: 1
    };
    for (const [k, max] of Object.entries(esperado)) assert.strictEqual(CV.CATALOGO[k].max, max, k);
});

test('catálogo: todas as 44 chaves da fase 1 continuam existindo (layouts antigos abrem)', () => {
    const antigas = ['centro_vila', 'castelo_cla', 'cabana_construtor', 'canhao', 'torre_arqueiras', 'morteiro',
        'defesa_aerea', 'torre_mago', 'vassoura_aerea', 'tesla', 'torre_bombas', 'x_besta', 'torre_inferno',
        'artilharia_aguia', 'dispersora', 'torre_feiticos', 'monolito', 'canhao_ricochete', 'multi_arqueira',
        'cuspidor', 'coletor_ouro', 'coletor_elixir', 'broca_negro', 'deposito_ouro', 'deposito_elixir',
        'deposito_negro', 'acampamento', 'quartel', 'quartel_negro', 'laboratorio', 'fabrica_feiticos',
        'fabrica_sombria', 'oficina', 'ferreiro', 'casa_mascotes', 'salao_herois', 'muro', 'bomba', 'mola',
        'bomba_aerea', 'bomba_gigante', 'mina_aerea', 'armadilha_esqueleto', 'armadilha_tornado'];
    for (const k of antigas) assert.ok(CV.CATALOGO[k], k);
    assert.strictEqual(G.CATALOGO, CV.CATALOGO);   // a geometria usa o mesmo catálogo
});

// ---------- dimensões ----------
test('dimensões confirmadas nesta fase', () => {
    const conf = { torre_vinganca: 3, super_torre_mago: 3, cuspidor: 3, artilharia_inferno: 4, giga_bomba: 2, acampamento: 4 };
    for (const [k, tam] of Object.entries(conf)) {
        assert.strictEqual(CV.CATALOGO[k].tam, tam, k);
        assert.strictEqual(CV.CATALOGO[k].tamStatus, 'confirmado', k);
    }
});

test('dimensões não confirmadas ficam marcadas como pendentes', () => {
    assert.deepStrictEqual(CV.pendentes().sort(),
        ['cabana_auxiliar', 'cabana_bob', 'estacao_criacao', 'salao_herois', 'torre_multiengrenagem'].sort());
});

test('aviso de tamanho pendente não conta como erro', () => {
    const r = CV.validarCV18(varios('torre_multiengrenagem', 1));
    assert.deepStrictEqual(codigos(r), ['tam_pendente']);
    assert.strictEqual(r.erros, 0);
    assert.strictEqual(r.destaque.size, 0);
});

// ---------- limites ----------
test('dentro do limite: nenhum problema', () => {
    const r = CV.validarCV18([...varios('morteiro', 4), ...varios('muro', 325), ...varios('bomba', 8)]);
    assert.strictEqual(r.problemas.length, 0);
});

test('acima do limite: só as excedentes (as últimas) ficam destacadas', () => {
    const lista = varios('morteiro', 6);
    const r = CV.validarCV18(lista);
    assert.strictEqual(r.erros, 1);
    assert.deepStrictEqual(r.problemas[0].ids, [lista[4].id, lista[5].id]);
    assert.match(r.problemas[0].msg, /6\/4/);
    assert.ok(!r.destaque.has(lista[0].id));
});

test('validar nunca altera a lista', () => {
    const lista = varios('morteiro', 9);
    const copia = JSON.stringify(lista);
    CV.validarCV18(lista);
    assert.strictEqual(JSON.stringify(lista), copia);
});

test('muros: 326 passa do limite', () => {
    const r = CV.validarCV18(varios('muro', 326));
    assert.deepStrictEqual(codigos(r), ['excesso']);
});

test('restantes respeita o máximo do tipo', () => {
    assert.strictEqual(CV.restantes('morteiro', {}), 4);
    assert.strictEqual(CV.restantes('morteiro', { morteiro: 4 }), 0);
    assert.strictEqual(CV.restantes('morteiro', { morteiro: 7 }), 0);   // nunca negativo
    assert.strictEqual(CV.restantes('nave', {}), 0);
});

// ---------- fusões ----------
test('fusão do canhão: 3 Ricochete + 1 Multiengrenagem usam as 7 vagas', () => {
    const ok = CV.validarCV18([...varios('canhao_ricochete', 3), ...varios('torre_multiengrenagem', 1)]);
    assert.strictEqual(ok.erros, 0);
    assert.strictEqual(CV.restantes('canhao', ok.contagem), 0);
    const ruim = CV.validarCV18([...varios('canhao_ricochete', 3), ...varios('torre_multiengrenagem', 1), ...varios('canhao', 1)]);
    assert.deepStrictEqual(codigos(ruim).filter(c => c !== 'tam_pendente'), ['fusao']);
    assert.strictEqual(ruim.problemas.find(p => p.codigo === 'fusao').regra, 'vagas_canhao');
});

test('fusão do canhão: 7 canhões simples é válido, mas não sobra vaga pra Ricochete', () => {
    const r = CV.validarCV18(varios('canhao', 7));
    assert.strictEqual(r.erros, 0);
    assert.strictEqual(CV.restantes('canhao_ricochete', r.contagem), 0);
    assert.strictEqual(CV.restantes('canhao_ricochete', { canhao: 5 }), 1);
});

test('fusão da torre de arqueiras: 3 Multiarqueira + 1 Multiengrenagem + 2 torres = 9', () => {
    const base = [...varios('multi_arqueira', 3), ...varios('torre_multiengrenagem', 1)];
    assert.strictEqual(CV.validarCV18([...base, ...varios('torre_arqueiras', 2)]).erros, 0);
    const r = CV.validarCV18([...base, ...varios('torre_arqueiras', 3)]);
    assert.ok(r.problemas.some(p => p.regra === 'vagas_arqueira'));
});

test('fusão do mago: 2 Super + 2 torres de mago = 6; uma torre a mais é inválido', () => {
    assert.strictEqual(CV.validarCV18([...varios('super_torre_mago', 2), ...varios('torre_mago', 2)]).erros, 0);
    const lista = [...varios('super_torre_mago', 2), ...varios('torre_mago', 3)];
    const r = CV.validarCV18(lista);
    const p = r.problemas.find(x => x.regra === 'vagas_mago');
    assert.ok(p);
    assert.strictEqual(p.ids.length, 5);   // todas as envolvidas ficam destacadas
    assert.match(p.msg, /7\/6/);
});

test('Águia e Artilharia Inferno juntas é inválido', () => {
    const r = CV.validarCV18([...varios('artilharia_aguia', 1), ...varios('artilharia_inferno', 1)]);
    assert.ok(r.problemas.some(p => p.regra === 'vagas_aguia' && p.nivel === 'erro'));
});

test('Águia sozinha no CV18 só gera aviso', () => {
    const r = CV.validarCV18(varios('artilharia_aguia', 1));
    assert.deepStrictEqual(codigos(r), ['aguia_cv18']);
    assert.strictEqual(r.erros, 0);
    assert.strictEqual(r.avisos, 1);
    assert.strictEqual([...r.destaque.values()][0], 'aviso');
});

test('erro tem prioridade sobre aviso no destaque', () => {
    const lista = varios('artilharia_aguia', 2);   // excesso (erro) + aviso de CV18
    const r = CV.validarCV18(lista);
    assert.strictEqual(r.destaque.get(lista[1].id), 'erro');
});

// ---------- compatibilidade com o editor atual ----------
test('layout antigo (fase 1, cv null) importa com as mesmas construções', () => {
    const antigo = {
        formato: 'clashcitybr-layout', versao: 1, nome: 'Guerra', cv: null, grade: 44,
        construcoes: [{ tipo: 'centro_vila', x: 20, y: 20 }, { tipo: 'canhao', x: 5, y: 5 }, { tipo: 'muro', x: 1, y: 1 }]
    };
    const v = G.validarLayout(JSON.parse(JSON.stringify(antigo)));
    assert.ok(v.ok);
    assert.strictEqual(v.construcoes.length, 3);
    assert.strictEqual(G.conflitos(v.construcoes).size, 0);
});

test('exportar marca cv 18 e volta igual', () => {
    const dados = G.exportarLayout('Guerra CV18', null, [{ id: 3, tipo: 'torre_vinganca', x: 10, y: 10 }]);
    assert.strictEqual(dados.cv, 18);
    const v = G.validarLayout(JSON.parse(JSON.stringify(dados)));
    assert.ok(v.ok);
    assert.deepStrictEqual(v.construcoes, [{ id: 1, tipo: 'torre_vinganca', x: 10, y: 10 }]);
});

test('conflitos usam o tamanho das construções novas', () => {
    // Artilharia Inferno 4×4 em (10,10) ocupa até a casa 13; Vingança 3×3 em (13,13) encosta → conflito
    const lista = [{ id: 1, tipo: 'artilharia_inferno', x: 10, y: 10 }, { id: 2, tipo: 'torre_vinganca', x: 13, y: 13 },
                   { id: 3, tipo: 'giga_bomba', x: 14, y: 10 }];
    assert.deepStrictEqual([...G.conflitos(lista)].sort(), [1, 2]);
    assert.deepStrictEqual(G.encaixar(43, 43, CV.tamanho('artilharia_inferno')), { x: 40, y: 40 });
});

// ============================================================
// LAYOUT — REGRAS DO CV18 (sem DOM: roda no navegador e nos testes em Node)
//
// O montador é exclusivo para Centro de Vila 18. Aqui ficam:
//   - o catálogo do CV18 (nome, categoria, tamanho na grade, quantidade máxima);
//   - de onde veio cada dado e se ele já está confirmado;
//   - as regras de fusão (duas construções viram uma);
//   - validarCV18(): aponta excessos e combinações inválidas. NUNCA apaga nada.
//
// Status do tamanho (campo tamStatus):
//   'confirmado' → conferido em fonte nesta fase (ver FONTES)
//   'catalogo'   → construção antiga, tamanho do catálogo da fase 1 (padrão conhecido do jogo)
//   'pendente'   → NÃO confirmado. O valor de tam é provisório, só para poder desenhar.
//                  Precisa ser validado num print real antes de virar definitivo.
// ============================================================
(function (raiz) {
    const CV = 18;

    const FONTES = {
        clashclock: 'ClashClock — Town Hall 18 (quantidades e níveis)',
        clashninja: 'Clash Ninja — "Town Hall 18 is here" (17/11/2025)',
        wiki: 'Clash of Clans Wiki (página da construção)',
        cocmap: 'cocmap.com (página da construção)',
        supercell: 'Supercell — blog "Building merging" (TH16)',
        wiki1337: '1337wiki — guia do TH18',
        fase1: 'Catálogo da fase 1 do montador'
    };

    // max = quantidade máxima no CV18 (antes de descontar fusões; ver REGRAS_FUSAO)
    const CATALOGO = {
        // ---------- outros ----------
        centro_vila:        { nome: 'Centro de Vila',          sigla: 'CV',  tam: 4, cat: 'outro', max: 1,   tamStatus: 'catalogo' },
        castelo_cla:        { nome: 'Castelo do Clã',          sigla: 'CC',  tam: 3, cat: 'outro', max: 1,   tamStatus: 'catalogo' },
        cabana_construtor:  { nome: 'Cabana do Construtor',    sigla: 'CAB', tam: 2, cat: 'outro', max: 5,   tamStatus: 'catalogo' },
        cabana_bob:         { nome: 'Cabana do B.O.B',         sigla: 'BOB', tam: 2, cat: 'outro', max: 1,   tamStatus: 'pendente', novo: true },
        cabana_auxiliar:    { nome: 'Cabana dos Ajudantes',    sigla: 'AJU', tam: 2, cat: 'outro', max: 1,   tamStatus: 'pendente', novo: true },
        estacao_criacao:    { nome: 'Estação de Criação',      sigla: 'EST', tam: 3, cat: 'outro', max: 1,   tamStatus: 'pendente', novo: true },

        // ---------- defesas ----------
        canhao:             { nome: 'Canhão',                  sigla: 'CN',  tam: 3, cat: 'defesa', max: 7, tamStatus: 'catalogo' },
        torre_arqueiras:    { nome: 'Torre de Arqueiras',      sigla: 'TA',  tam: 3, cat: 'defesa', max: 9, tamStatus: 'catalogo' },
        morteiro:           { nome: 'Morteiro',                sigla: 'MT',  tam: 3, cat: 'defesa', max: 4, tamStatus: 'catalogo' },
        defesa_aerea:       { nome: 'Defesa Aérea',            sigla: 'DA',  tam: 3, cat: 'defesa', max: 4, tamStatus: 'catalogo' },
        torre_mago:         { nome: 'Torre de Mago',           sigla: 'TM',  tam: 3, cat: 'defesa', max: 6, tamStatus: 'catalogo' },
        super_torre_mago:   { nome: 'Super Torre de Mago',     sigla: 'STM', tam: 3, cat: 'defesa', max: 2, tamStatus: 'confirmado', fonteTam: 'wiki', novo: true },
        vassoura_aerea:     { nome: 'Vassoura Aérea',          sigla: 'VA',  tam: 2, cat: 'defesa', max: 2, tamStatus: 'catalogo' },
        tesla:              { nome: 'Tesla Oculta',            sigla: 'TS',  tam: 2, cat: 'defesa', max: 5, tamStatus: 'catalogo' },
        torre_bombas:       { nome: 'Torre de Bombas',         sigla: 'TB',  tam: 3, cat: 'defesa', max: 2, tamStatus: 'catalogo' },
        x_besta:            { nome: 'X-Besta',                 sigla: 'XB',  tam: 3, cat: 'defesa', max: 4, tamStatus: 'catalogo' },
        torre_inferno:      { nome: 'Torre Inferno',           sigla: 'INF', tam: 2, cat: 'defesa', max: 3, tamStatus: 'catalogo' },
        artilharia_aguia:   { nome: 'Artilharia Águia',        sigla: 'AG',  tam: 4, cat: 'defesa', max: 1, tamStatus: 'catalogo' },
        artilharia_inferno: { nome: 'Artilharia Inferno',      sigla: 'AI',  tam: 4, cat: 'defesa', max: 1, tamStatus: 'confirmado', fonteTam: 'cocmap', novo: true },
        dispersora:         { nome: 'Dispersora',              sigla: 'DSP', tam: 3, cat: 'defesa', max: 2, tamStatus: 'catalogo' },
        torre_feiticos:     { nome: 'Torre de Feitiços',       sigla: 'TF',  tam: 2, cat: 'defesa', max: 2, tamStatus: 'catalogo' },
        monolito:           { nome: 'Monólito',                sigla: 'MON', tam: 3, cat: 'defesa', max: 1, tamStatus: 'catalogo' },
        canhao_ricochete:   { nome: 'Canhão Ricochete',        sigla: 'RIC', tam: 3, cat: 'defesa', max: 3, tamStatus: 'catalogo' },
        multi_arqueira:     { nome: 'Torre Multiarqueira',     sigla: 'MA',  tam: 3, cat: 'defesa', max: 3, tamStatus: 'catalogo' },
        cuspidor:           { nome: 'Cuspidor de Fogo',        sigla: 'CF',  tam: 3, cat: 'defesa', max: 2, tamStatus: 'confirmado', fonteTam: 'wiki', novo: true },
        torre_multiengrenagem: { nome: 'Torre Multiengrenagem', sigla: 'MEG', tam: 3, cat: 'defesa', max: 1, tamStatus: 'pendente', novo: true },
        torre_vinganca:     { nome: 'Torre da Vingança',       sigla: 'VIN', tam: 3, cat: 'defesa', max: 1, tamStatus: 'confirmado', fonteTam: 'wiki', novo: true },

        // ---------- recursos ----------
        coletor_ouro:       { nome: 'Mina de Ouro',            sigla: 'MO',  tam: 3, cat: 'recurso', max: 7, tamStatus: 'catalogo' },
        coletor_elixir:     { nome: 'Coletor de Elixir',       sigla: 'CE',  tam: 3, cat: 'recurso', max: 7, tamStatus: 'catalogo' },
        broca_negro:        { nome: 'Broca de Elixir Negro',   sigla: 'BN',  tam: 3, cat: 'recurso', max: 3, tamStatus: 'catalogo' },
        deposito_ouro:      { nome: 'Depósito de Ouro',        sigla: 'DO',  tam: 3, cat: 'recurso', max: 4, tamStatus: 'catalogo' },
        deposito_elixir:    { nome: 'Depósito de Elixir',      sigla: 'DE',  tam: 3, cat: 'recurso', max: 4, tamStatus: 'catalogo' },
        deposito_negro:     { nome: 'Depósito de Elixir Negro', sigla: 'DN', tam: 3, cat: 'recurso', max: 1, tamStatus: 'catalogo' },

        // ---------- exército ----------
        acampamento:        { nome: 'Acampamento',             sigla: 'AC',  tam: 4, cat: 'exercito', max: 4, tamStatus: 'confirmado', fonteTam: 'cocmap' },
        quartel:            { nome: 'Quartel',                 sigla: 'QT',  tam: 3, cat: 'exercito', max: 1, tamStatus: 'catalogo' },
        quartel_negro:      { nome: 'Quartel Sombrio',         sigla: 'QS',  tam: 3, cat: 'exercito', max: 1, tamStatus: 'catalogo' },
        laboratorio:        { nome: 'Laboratório',             sigla: 'LAB', tam: 3, cat: 'exercito', max: 1, tamStatus: 'catalogo' },
        fabrica_feiticos:   { nome: 'Fábrica de Feitiços',     sigla: 'FF',  tam: 3, cat: 'exercito', max: 1, tamStatus: 'catalogo' },
        fabrica_sombria:    { nome: 'Fábrica Sombria',         sigla: 'FS',  tam: 3, cat: 'exercito', max: 1, tamStatus: 'catalogo' },
        oficina:            { nome: 'Oficina de Cerco',        sigla: 'OF',  tam: 4, cat: 'exercito', max: 1, tamStatus: 'catalogo' },
        ferreiro:           { nome: 'Ferreiro',                sigla: 'FER', tam: 3, cat: 'exercito', max: 1, tamStatus: 'catalogo' },
        casa_mascotes:      { nome: 'Casa dos Mascotes',       sigla: 'PET', tam: 3, cat: 'exercito', max: 1, tamStatus: 'catalogo' },
        salao_herois:       { nome: 'Salão dos Heróis',        sigla: 'HER', tam: 4, cat: 'exercito', max: 1, tamStatus: 'pendente' },

        // ---------- muros ----------
        muro:               { nome: 'Muro',                    sigla: '',    tam: 1, cat: 'muro', max: 325, tamStatus: 'catalogo' },

        // ---------- armadilhas (sempre manuais: não aparecem em print de outra vila) ----------
        bomba:              { nome: 'Bomba',                   sigla: 'b',   tam: 1, cat: 'armadilha', max: 8, tamStatus: 'catalogo' },
        mola:               { nome: 'Armadilha de Mola',       sigla: 'm',   tam: 1, cat: 'armadilha', max: 9, tamStatus: 'catalogo' },
        bomba_aerea:        { nome: 'Bomba Aérea',             sigla: 'ba',  tam: 1, cat: 'armadilha', max: 8, tamStatus: 'catalogo' },
        bomba_gigante:      { nome: 'Bomba Gigante',           sigla: 'BG',  tam: 2, cat: 'armadilha', max: 8, tamStatus: 'catalogo' },
        mina_aerea:         { nome: 'Mina Aérea Teleguiada',   sigla: 'mt',  tam: 1, cat: 'armadilha', max: 9, tamStatus: 'catalogo' },
        armadilha_esqueleto:{ nome: 'Armadilha de Esqueleto',  sigla: 'es',  tam: 1, cat: 'armadilha', max: 4, tamStatus: 'catalogo' },
        armadilha_tornado:  { nome: 'Armadilha Tornado',       sigla: 'tn',  tam: 1, cat: 'armadilha', max: 1, tamStatus: 'catalogo' },
        giga_bomba:         { nome: 'Giga Bomba',              sigla: 'GB',  tam: 2, cat: 'armadilha', max: 1, tamStatus: 'confirmado', fonteTam: 'wiki', novo: true }
    };

    // Fusões: cada construção fundida gasta "vagas" das originais.
    // Ex.: o CV18 tem 7 vagas de canhão; um Canhão Ricochete gasta 2 e a Multiengrenagem gasta 1.
    // A soma (com os pesos) não pode passar do limite.
    const REGRAS_FUSAO = [
        {
            id: 'vagas_canhao', nome: 'Vagas de Canhão', limite: 7,
            pesos: { canhao: 1, canhao_ricochete: 2, torre_multiengrenagem: 1 },
            explica: 'Ricochete = 2 canhões · Multiengrenagem = 1 canhão + 1 torre de arqueiras'
        },
        {
            id: 'vagas_arqueira', nome: 'Vagas de Torre de Arqueiras', limite: 9,
            pesos: { torre_arqueiras: 1, multi_arqueira: 2, torre_multiengrenagem: 1 },
            explica: 'Multiarqueira = 2 torres · Multiengrenagem = 1 torre + 1 canhão'
        },
        {
            id: 'vagas_mago', nome: 'Vagas de Torre de Mago', limite: 6,
            pesos: { torre_mago: 1, super_torre_mago: 2 },
            explica: 'Super Torre de Mago = 2 torres de mago nível 17'
        },
        {
            id: 'vagas_aguia', nome: 'Águia / Artilharia Inferno', limite: 1,
            pesos: { artilharia_aguia: 1, artilharia_inferno: 1 },
            explica: 'A Artilharia Inferno nasce da fusão com a Águia: não existem as duas juntas'
        }
    ];

    const tamanho = (tipo, catalogo = CATALOGO) => catalogo[tipo]?.tam || 1;

    function contar(construcoes) {
        const n = {};
        for (const c of construcoes) n[c.tipo] = (n[c.tipo] || 0) + 1;
        return n;
    }

    function usoDaRegra(regra, contagem) {
        let usado = 0;
        for (const [tipo, peso] of Object.entries(regra.pesos)) usado += (contagem[tipo] || 0) * peso;
        return usado;
    }

    // Quantas ainda cabem desse tipo, considerando o máximo do tipo e as vagas de fusão.
    function restantes(tipo, contagem, catalogo = CATALOGO) {
        const item = catalogo[tipo];
        if (!item) return 0;
        let livre = item.max - (contagem[tipo] || 0);
        for (const r of REGRAS_FUSAO) {
            const peso = r.pesos[tipo];
            if (!peso) continue;
            livre = Math.min(livre, Math.floor((r.limite - usoDaRegra(r, contagem)) / peso));
        }
        return Math.max(0, livre);
    }

    // Valida o layout inteiro. Devolve problemas e quais ids destacar; não altera a lista.
    //   nivel 'erro'  → passa do que o jogo permite
    //   nivel 'aviso' → permitido, mas estranho para um CV18
    function validarCV18(construcoes, catalogo = CATALOGO) {
        const contagem = contar(construcoes);
        const problemas = [];
        const destaque = new Map();   // id → 'erro' | 'aviso'
        const marcar = (ids, nivel) => {
            for (const id of ids) if (destaque.get(id) !== 'erro') destaque.set(id, nivel);
        };

        // 1) Quantidade por tipo: as que passam do máximo (as colocadas por último) ficam marcadas.
        const vistos = {};
        const excedentes = {};
        for (const c of construcoes) {
            const item = catalogo[c.tipo];
            if (!item) continue;
            vistos[c.tipo] = (vistos[c.tipo] || 0) + 1;
            if (vistos[c.tipo] > item.max) (excedentes[c.tipo] = excedentes[c.tipo] || []).push(c.id);
        }
        for (const [tipo, ids] of Object.entries(excedentes)) {
            const item = catalogo[tipo];
            problemas.push({
                codigo: 'excesso', nivel: 'erro', tipo, ids,
                msg: `${item.nome}: ${contagem[tipo]}/${item.max} (${ids.length} a mais)`
            });
            marcar(ids, 'erro');
        }

        // 2) Fusões: vagas compartilhadas.
        for (const r of REGRAS_FUSAO) {
            const usado = usoDaRegra(r, contagem);
            if (usado <= r.limite) continue;
            const ids = construcoes.filter(c => r.pesos[c.tipo]).map(c => c.id);
            const partes = Object.entries(r.pesos)
                .filter(([t]) => contagem[t])
                .map(([t, p]) => `${contagem[t]} ${catalogo[t].nome}${p > 1 ? ` (×${p})` : ''}`);
            problemas.push({
                codigo: 'fusao', nivel: 'erro', regra: r.id, ids,
                msg: `${r.nome}: ${usado}/${r.limite} — ${partes.join(' + ')}. ${r.explica}.`
            });
            marcar(ids, 'erro');
        }

        // 3) Avisos de CV18: para subir ao CV18 a Águia já foi fundida na Artilharia Inferno.
        const aguias = construcoes.filter(c => c.tipo === 'artilharia_aguia').map(c => c.id);
        if (aguias.length && !contagem.artilharia_inferno) {
            problemas.push({
                codigo: 'aguia_cv18', nivel: 'aviso', ids: aguias,
                msg: 'Artilharia Águia: no CV18 ela já virou Artilharia Inferno (é requisito para chegar ao CV18).'
            });
            marcar(aguias, 'aviso');
        }

        // 4) Tamanho provisório: só avisa, para lembrar que o dado precisa ser conferido.
        const provisorios = construcoes.filter(c => catalogo[c.tipo]?.tamStatus === 'pendente');
        if (provisorios.length) {
            const nomes = [...new Set(provisorios.map(c => catalogo[c.tipo].nome))];
            problemas.push({
                codigo: 'tam_pendente', nivel: 'info', ids: provisorios.map(c => c.id),
                msg: `Tamanho ainda não confirmado: ${nomes.join(', ')}.`
            });
        }

        const erros = problemas.filter(p => p.nivel === 'erro').length;
        const avisos = problemas.filter(p => p.nivel === 'aviso').length;
        return { contagem, problemas, destaque, erros, avisos };
    }

    const pendentes = (catalogo = CATALOGO) =>
        Object.entries(catalogo).filter(([, i]) => i.tamStatus === 'pendente').map(([k]) => k);

    const api = { CV, FONTES, CATALOGO, REGRAS_FUSAO, tamanho, contar, usoDaRegra, restantes, validarCV18, pendentes };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else raiz.LayoutCV18 = api;
})(this);

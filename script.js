const NOME_CLA = "CLASH CITY BR";


// ================== GUERRA ATUAL ==================
let guerraAtual = JSON.parse(localStorage.getItem("guerraAtual")) || {
    adversario: "",
    data: "",
    players: []
};

function salvarGuerra() {
    localStorage.setItem("guerraAtual", JSON.stringify(guerraAtual));
}

// ================== HISTÓRICO ==================
let historicoGuerras = JSON.parse(
    localStorage.getItem("historicoGuerras")
) || [];

// ================== ADMIN ==================
const ADMIN_PASSWORD = "mancity";
let isAdmin = false;

function loginAdmin() {
    const pass = document.getElementById("adminPassword").value;
    const msg = document.getElementById("adminMsg");

    if (pass === ADMIN_PASSWORD) {
        isAdmin = true;
        msg.textContent = "Modo administrador ativado 🔓";
        msg.style.color = "green";
        document.querySelectorAll(".admin-only")
            .forEach(el => el.style.display = "block");
    } else {
        msg.textContent = "Senha incorreta ❌";
        msg.style.color = "red";
    }
}

// ================== ELEMENTOS ==================
const selectAtaque = document.getElementById("selectAtaque");
const inputEstrelasAtaque = document.getElementById("inputEstrelasAtaque");

const selectDefesa = document.getElementById("selectDefesa");
const inputEstrelasDefesa = document.getElementById("inputEstrelasDefesa");

const playerList = document.getElementById("playerList");
const rankingBox = document.getElementById("rankingBox");
const mvpBox = document.getElementById("mvpBox");

const inputNome = document.getElementById("inputNome");
const inputCV = document.getElementById("inputCV");
const formMsg = document.getElementById("formMsg");

const btnConfirmAdd = document.getElementById("btnConfirmAdd");
const btnAttack = document.getElementById("btnAttack");
const btnDefense = document.getElementById("btnDefense");

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
    renderPlayers();
    calcularMVP();
    mostrarGuerraAtual(); 
});


// ================== ADD PLAYER ==================
btnConfirmAdd.addEventListener("click", () => {
    let nome = inputNome.value.trim();
    let cv = Number(inputCV.value);

    if (!nome || isNaN(cv)) {
        formMsg.textContent = "Dados inválidos!";
        formMsg.style.color = "red";
        return;
    }

    if (guerraAtual.players.some(p => p.nome.toLowerCase() === nome.toLowerCase())) {
        formMsg.textContent = "Jogador já existe!";
        formMsg.style.color = "red";
        return;
    }

    guerraAtual.players.push({
        nome,
        cv,
        ataques: { feitos: 0, estrelas: 0 },
        defesas: { sofridas: 0, estrelas: 0 }
    });

    salvarGuerra();
    renderPlayers();
    calcularMVP();

    formMsg.textContent = "Jogador adicionado ✔";
    formMsg.style.color = "green";
    inputNome.value = "";
    inputCV.value = "";
});

// ================== SELECTS ==================
function atualizarSelects() {
    selectAtaque.innerHTML = "";
    selectDefesa.innerHTML = "";

    guerraAtual.players.forEach(p => {
        selectAtaque.innerHTML += `<option value="${p.nome}">${p.nome}</option>`;
        selectDefesa.innerHTML += `<option value="${p.nome}">${p.nome}</option>`;
    });
}

// ================== RENDER ==================
function renderPlayers() {
    playerList.innerHTML = "";

    guerraAtual.players.forEach((p, i) => {
        playerList.innerHTML += `
            <div class="player-card">
                <strong>${p.nome}</strong> (CV ${p.cv})<br>
                ⚔️ ${p.ataques.feitos} | ⭐ ${p.ataques.estrelas}<br>
                🛡️ ${p.defesas.sofridas} | ⭐ ${p.defesas.estrelas}<br>
                <button onclick="deletePlayer(${i})">Excluir</button>
            </div>
        `;
    });

    atualizarSelects();
}

function deletePlayer(index) {
    if (!confirm("Remover jogador?")) return;
    guerraAtual.players.splice(index, 1);
    salvarGuerra();
    renderPlayers();
    calcularMVP();
}

// ================== ATAQUE ==================
btnAttack.addEventListener("click", () => {
    let nome = selectAtaque.value;
    let estrelas = Number(inputEstrelasAtaque.value);

    let p = guerraAtual.players.find(p => p.nome === nome);
    if (!p || estrelas < 0 || estrelas > 3) return;

    p.ataques.feitos++;
    p.ataques.estrelas += estrelas;

    salvarGuerra();
    renderPlayers();
    calcularMVP();
    inputEstrelasAtaque.value = "";
});

// ================== DEFESA ==================
btnDefense.addEventListener("click", () => {
    let nome = selectDefesa.value;
    let estrelas = Number(inputEstrelasDefesa.value);

    let p = guerraAtual.players.find(p => p.nome === nome);
    if (!p || estrelas < 0 || estrelas > 3) return;

    p.defesas.sofridas++;
    p.defesas.estrelas += estrelas;

    salvarGuerra();
    renderPlayers();
    calcularMVP();
    inputEstrelasDefesa.value = "";
});

// ================== RANKING ==================
function rankingAtaque() {
    if (guerraAtual.players.length === 0) {
        rankingBox.innerHTML = "Nenhum jogador cadastrado";
        return;
    }

    let ranking = [...guerraAtual.players].sort((a, b) => {
        // desempate por porcentagem de ataque
        let mediaA = a.ataques.feitos
            ? a.ataques.estrelas / a.ataques.feitos
            : 0;

        let mediaB = b.ataques.feitos
            ? b.ataques.estrelas / b.ataques.feitos
            : 0;

        return mediaB - mediaA || b.ataques.estrelas - a.ataques.estrelas;
    });

    rankingBox.innerHTML = "<h3>⚔️ Ranking de Ataque</h3>";

    ranking.forEach((p, i) => {
        let classe = "";
        let titulo = "";

        if (i === 0) {
            classe = "pro-player";
            titulo = " 🏆 Pro-Player";
        }
        if (i === ranking.length - 1) {
            classe = "bagre";
            titulo = " 🐟 Bagre";
        }

        let media = p.ataques.feitos
            ? (p.ataques.estrelas / p.ataques.feitos).toFixed(2)
            : "0.00";

        rankingBox.innerHTML += `
            <div class="ranking-item ${classe}">
                <strong>${p.nome}</strong>${titulo}<br>
                ⭐ Estrelas: ${p.ataques.estrelas}<br>
                🎯 Ataques: ${p.ataques.feitos}<br>
                📊 Média: ${media}
            </div>
        `;
    });
}
function rankingDefesa() {
    if (guerraAtual.players.length === 0) {
        rankingBox.innerHTML = "Nenhum jogador cadastrado";
        return;
    }

    let ranking = [...guerraAtual.players].sort((a, b) => {
        // menor média de estrelas sofridas vence
        let mediaA = a.defesas.sofridas
            ? a.defesas.estrelas / a.defesas.sofridas
            : 0;

        let mediaB = b.defesas.sofridas
            ? b.defesas.estrelas / b.defesas.sofridas
            : 0;

        return mediaA - mediaB || a.defesas.estrelas - b.defesas.estrelas;
    });

    rankingBox.innerHTML = "<h3>🛡️ Ranking de Defesa</h3>";

    ranking.forEach((p, i) => {
        let classe = "";
        let titulo = "";

        if (i === 0) {
            classe = "pro-player";
            titulo = " 🏆 Pro-Player";
        }
        if (i === ranking.length - 1) {
            classe = "bagre";
            titulo = " 🐟 Bagre";
        }

        let media = p.defesas.sofridas
            ? (p.defesas.estrelas / p.defesas.sofridas).toFixed(2)
            : "0.00";

        rankingBox.innerHTML += `
            <div class="ranking-item ${classe}">
                <strong>${p.nome}</strong>${titulo}<br>
                ⭐ Sofridas: ${p.defesas.estrelas}<br>
                🛡️ Defesas: ${p.defesas.sofridas}<br>
                📉 Média: ${media}
            </div>
        `;
    });
}

function rankingGeral() {
    let ranking = [...guerraAtual.players].sort((a, b) =>
        (b.ataques.estrelas - b.defesas.estrelas) -
        (a.ataques.estrelas - a.defesas.estrelas)
    );

    rankingBox.innerHTML = "<h3>👑 Ranking Geral</h3>";

    ranking.forEach((p, i) => {
        let classe = i === 0 ? "pro-player" :
                     i === ranking.length - 1 ? "bagre" : "";
        rankingBox.innerHTML += `
            <div class="ranking-item ${classe}">
                ${i + 1}º - ${p.nome} | Score ${p.ataques.estrelas - p.defesas.estrelas}
            </div>
        `;
    });
}

// ================== MVP ==================
function calcularMVP() {
    if (guerraAtual.players.length === 0) {
        mvpBox.innerHTML = "Nenhum jogador";
        return;
    }

    let mvp = [...guerraAtual.players].sort((a, b) =>
        (b.ataques.estrelas - b.defesas.estrelas) -
        (a.ataques.estrelas - a.defesas.estrelas)
    )[0];

    mvpBox.innerHTML = `
        <div class="mvp-name">🏆 MVP da Guerra</div>
        <div class="mvp-player">👑 ${mvp.nome}</div>
        ⭐ ${mvp.ataques.estrelas} | 🛡️ ${mvp.defesas.estrelas}
    `;
}

// ================== GUERRA ==================
function criarGuerra() {
    const adversario = inputAdversario.value.trim();
    const data = inputData.value;

    if (!adversario || !data) return alert("Preencha tudo!");

    guerraAtual = { adversario, data, players: [] };
    salvarGuerra();
    renderPlayers();
    calcularMVP();
    mostrarGuerraAtual();

}

function finalizarGuerra() {
    historicoGuerras.push(JSON.parse(JSON.stringify(guerraAtual)));
    localStorage.setItem("historicoGuerras", JSON.stringify(historicoGuerras));
    localStorage.removeItem("guerraAtual");
    guerraAtual = { adversario: "", data: "", players: [] };
    renderPlayers();
    calcularMVP();
    mostrarGuerraAtual();

}
function listarHistorico() {
    rankingBox.innerHTML = "<h3>📚 Histórico de Guerras</h3>";

    historicoGuerras.forEach((g, i) => {
        rankingBox.innerHTML += `
            <div class="ranking-item">
                <strong>${i + 1}.</strong>
                ${NOME_CLA} 🆚 ${g.adversario}<br>
                📅 ${g.data}
                <br>
                <button onclick="verDetalhesGuerra(${i})">
                    🔍 Ver detalhes
                </button>
            </div>
        `;
    });
}

function verDetalhesGuerra(index) {
    const guerra = historicoGuerras[index];
    localStorage.setItem("guerraDetalhe", JSON.stringify(guerra));
    renderDetalheGuerra();
}
function renderDetalheGuerra() {
    const guerra = JSON.parse(localStorage.getItem("guerraDetalhe"));
    if (!guerra) return;

    rankingBox.innerHTML = `
        <h2>⚔️ ${NOME_CLA} 🆚 ${guerra.adversario}</h2>
        <p>📅 Data da guerra: ${guerra.data}</p>
        <hr>
    `;


    let ranking = [...guerra.players].sort((a, b) =>
        (b.ataques.estrelas - b.defesas.estrelas) -
        (a.ataques.estrelas - a.defesas.estrelas)
    );

    ranking.forEach((p, i) => {
        let classe = "";
        let titulo = "";

        if (i === 0) {
            classe = "pro-player";
            titulo = " 🏆 Pro-Player";
        }
        if (i === ranking.length - 1) {
            classe = "bagre";
            titulo = " 🐟 Bagre";
        }

        rankingBox.innerHTML += `
            <div class="ranking-item ${classe}">
                <strong>${p.nome}</strong>${titulo}<br>
                ⚔️ Ataque: ${p.ataques.estrelas} ⭐<br>
                🛡️ Defesa: ${p.defesas.estrelas} ⭐<br>
                🔥 Score: ${p.ataques.estrelas - p.defesas.estrelas}
            </div>
        `;
    });

    rankingBox.innerHTML += `
        <button onclick="listarHistorico()">⬅️ Voltar</button>
    `;
}

function mostrarGuerraAtual() {
    const guerra = JSON.parse(localStorage.getItem("guerraAtual"));
    const box = document.getElementById("guerraInfo");

    if (!guerra || !guerra.adversario) {
        box.innerHTML = "⚔️ Nenhuma guerra ativa";
        return;
    }

    box.innerHTML = `
        ⚔️ ${NOME_CLA} 🆚 ${guerra.adversario}
        <br>
        📅 ${guerra.data}
    `;
}


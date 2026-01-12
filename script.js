let players = JSON.parse(localStorage.getItem("players")) || [];
function savePlayers() {
    localStorage.setItem("players", JSON.stringify(players));
}

const playerList = document.getElementById("playerList");
const btnAddPlayer = document.getElementById("btnAddPlayer");
const btnAttack = document.getElementById("btnAttack");

btnAddPlayer.addEventListener("click", ()=> {
    const nome = prompt("Nome do jogador:");
    const cv = prompt("Centro de Vila do jogador:");

    if (!nome || !cv) {
        alert("Preencha tudo!");
        return;
    }
    const player = {
        nome: nome,
        cv: Number(cv),
        ataques: {
            feitos: 0,
            estrelas: 0
        },
        defesas: {
            sofridas: 0,
            estrelas: 0
        
        }
    };
    players.push(player);
    savePlayers(player);
    renderPlayers();
    btnAttack.addEventListener("click", ()=> {
        if (players.length === 0) {
            alert("Nenhum jogador cadastrado!");
            return;
        }
        let nomes = players.map(p => p.nome).join(",");
        let nomeJogador = prompt("Nome do jogador:\n" + nomes);
        let player = players.find(p =>p.nome === nomeJogador);
        if (!player) {
            alert("Jogador não encontrado!");
            return;
        }
        let estrelas = Number(prompt("Estrelas do ataque (0 a 3):"));
        if (estrelas < 0 || estrelas > 3 || isNaN(estrelas)){
            alert("Valor inválido");
            return;
        }
        player.ataques.feitos++;
        player.ataques.estrelas += estrelas;
        savePlayers();
        renderPlayers();
    });
});
function renderPlayers() {
    playerList.innerHTML = "";

    players.forEach(player => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${player.nome}</strong> (CV ${player.cv})<br>
        Ataques: ${player.ataques.feitos} | Estrelas ${player.ataques.estrelas}<br>
        Defesas: ${player.defesas.sofridas} | Estrelas ${player.defesas.estrelas}<hr>`;
        playerList.appendChild(div);
    });

   
}
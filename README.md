# 📊 Clash City BR - Sistema de Gestão de Desempenho ⚔️

Este é o motor analítico da nossa comunidade. Um dashboard dinâmico que transforma dados brutos de guerra em inteligência estratégica para a seleção da **Liga de Clãs (CWL)**.

> **Acesse o Painel:** [clashcitybr.github.io/controle-cla/](https://clashcitybr.github.io/controle-cla/)

## 🚀 Engenharia do Projeto
O sistema é dividido em duas partes:

1. **Front-end:** páginas estáticas (HTML/CSS/JS puro) hospedadas no GitHub Pages, sem framework.
2. **Backend:** Node.js/Express, com MongoDB Atlas via Prisma como banco de dados, cron jobs para sincronização automática de guerra, e integração com a API oficial da Supercell (via proxy de IP fixo, pra não depender de IP dinâmico) e com o WhatsApp (whatsapp-web.js) para alertas automáticos ao clã.

O front-end consome esse backend via `fetch`, direto do navegador do usuário.

## 📈 Lógica de Classificação e Filtros
Para evitar o erro de amostragem (jogadores com apenas 1 guerra no topo), o sistema prioriza a **constância**:

* **Ordenação Padrão (⚔️):** Classifica por quantidade de guerras participadas (Fidelidade).
* **Filtros Dinâmicos:** Permite alternar a visão por **Média de Estrelas** (Técnica) ou **Porcentagem de Destruição** (Precisão).
* **Desempate Multinível:** 1. Quantidade de Guerras
    2. Média de Estrelas
    3. Média de Porcentagem
    4. Nível do Centro de Vila (CV).

## 🎨 Interface e UX
* **Pódio Dinâmico:** Visualização automática do Top 3 (Ouro, Prata e Bronze) com destaque visual.
* **Badges de Status:** Classificação automática em **PRO**, **MÉDIA** ou **BAGRE** baseada na performance técnica.
* **Filtro por CV:** Busca rápida por camadas de poder de fogo (CV 18, 17, 16...).
* **Perfil Individual:** Página dedicada por jogador, com dados ao vivo da Supercell (heróis, equipamentos, troféus) e gráfico de evolução por temporada (Chart.js).
* **Histórico de Temporadas:** Ranking arquivado mês a mês, com seletor de temporada.

## 💻 Visão do Desenvolvedor (ADS)
Este projeto demonstra competências em:
* Manipulação de Arrays e Objetos complexos em JavaScript.
* Consumo de APIs externas e tratamento de dados assíncronos (`async/await`).
* Modelagem de dados e ORM (Prisma + MongoDB).
* Automação de tarefas recorrentes (cron jobs) e integração com serviços de terceiros (Supercell API, WhatsApp).
* Design Responsivo extremo para tabelas complexas em dispositivos mobile.

---
*"Dados não mentem, ataques sim. Estratégia acima de tudo."* Desenvolvido por **Carlos Daniel** - Digital Architect.

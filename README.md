# 📊 Clash City BR - Sistema de Gestão de Desempenho ⚔️

Este é o motor analítico da nossa comunidade. Um dashboard dinâmico que transforma dados brutos de guerra em inteligência estratégica para a seleção da **Liga de Clãs (CWL)**.

> **Acesse o Painel:** [clashcitybr.github.io/controle-cla/](https://clashcitybr.github.io/controle-cla/)

## 🚀 Engenharia do Projeto
Diferente de tabelas estáticas, este sistema utiliza uma arquitetura de **Dados como Serviço (DaaS)** simplificada:

1. **Database:** Google Sheets (Backend de entrada de dados após cada guerra).
2. **Data Fetching:** Integração via Fetch API consumindo o banco de dados em formato CSV em tempo real.
3. **Data Processing:** Script em JS que agrupa ataques, calcula médias ponderadas de estrelas/porcentagem e trata desempates técnicos.
4. **Hardware Control:** Implementação de **Wake Lock API** para garantir que os líderes possam analisar o ranking em reuniões sem a tela do dispositivo apagar.

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
* **Badges de Status:** Classificação automática em **ELITE**, **MÉDIA** ou **BAGRE** baseada na performance técnica.
* **Filtro por CV:** Busca rápida por camadas de poder de fogo (CV 18, 17, 16...).

## 💻 Visão do Desenvolvedor (ADS)
Este projeto demonstra competências em:
* Manipulação de Arrays e Objetos complexos em JavaScript.
* Consumo de APIs externas e tratamento de dados assíncronos (`async/await`).
* Design Responsivo extremo para tabelas complexas em dispositivos mobile.

---
*"Dados não mentem, ataques sim. Estratégia acima de tudo."* Desenvolvido por **Carlos Daniel** - Digital Architect.

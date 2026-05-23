# ytsift

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL%203.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)

<!-- README-I18N:START -->

[English](./README.md) | **Português (Brasil)**

<!-- README-I18N:END -->

Um userscript leve que adiciona filtros de busca por palavra-chave, duração, visualizações e status de reprodução diretamente nas páginas de canais do YouTube. Ele também permite adicionar os vídeos filtrados na sua fila em lote.

---

### Importante: Como funciona (e por que é lento)

Este script roda inteiramente no seu navegador. Ele não consulta um servidor customizado — apenas esconde os vídeos *depois* que o YouTube os carrega na página.

* **Regra de Ordenação do YouTube**: O YouTube força o carregamento dos vídeos na ordem nativa escolhida (Mais recentes, Populares ou Mais antigos). O script esconde os vídeos que não batem com os seus filtros, mas eles ainda são baixados pela rede.
* **Por que você precisa rolar a página**: Se você colocar filtros muito rígidos (ex: vídeos com mais de 1M de views), a página pode parecer vazia no início. Basta rolar para baixo; conforme o YouTube carrega mais vídeos, o script filtra e mostra as correspondências.
* **O Limite de 1.5s (Throttle)**: Se a tela ficar vazia, o YouTube tenta disparar várias requisições seguidas para preencher a página. Para evitar travamentos na sua CPU e não correr o risco de ter seu IP temporariamente bloqueado ou limitado pelos servidores do YouTube, nós limitamos as requisições para no máximo uma a cada 1,5 segundos. Você vai notar um pequeno atraso intencional ao rolar.

---

## O que ele faz

* **Busca por Título**: Busca rápida por palavra-chave com suporte a termos negativos (ex: `tutorial -shorts` esconde qualquer título que tenha a palavra "shorts").
* **Filtro de Vídeos Assistidos**: Esconda na hora vídeos já assistidos (ou começados) usando um controle de porcentagem limite.
* **Sliders de Duração**: Defina durações mínimas e máximas ou use predefinições rápidas (**Short**, **Medium**, **Long**).
* **Filtro de Visualizações**: Sliders mapeados de forma não-linear para filtrar visualizações de 0 até mais de 10M, sem espremer os valores altos.
* **Idade do Envio**: Filtre por idade relativa (ex: `1w` a `6mo`). Funciona tanto no layout em inglês quanto em português do YouTube.
* **Adicionar à Fila**: O botão `+ Queue` envia todos os vídeos visíveis para a fila de uma vez (usando um intervalo de 150ms entre cada vídeo para o reprodutor nativo processar sem problemas).
* **Visual Nativo**: Herda os tokens de design do YouTube (`--yt-sys-color-*`), com suporte automático para os temas claro e escuro.

## Instalação

1. Instale um gerenciador de userscripts no seu navegador:
   * [Violentmonkey](https://violentmonkey.github.io/) (Recomendado)
   * [Tampermonkey](https://www.tampermonkey.net/)
   * [Firemonkey](https://addons.mozilla.org/firefox/addon/firemonkey/)
2. Clique aqui para instalar: **[ytsift.user.js](ytsift.user.js?raw=1)**

## Desenvolvimento Local

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/ytsift.git
   ```
2. Ative a opção "Permitir acesso aos URLs do arquivo" nas configurações de extensão do seu gerenciador para testar alterações locais na hora.
3. Formate e valide o código com o [Biome](https://biomejs.dev/):
   ```bash
   npx @biomejs/biome format ytsift.user.js --write
   npx @biomejs/biome lint ytsift.user.js
   ```

## Licença
GPL-3.0. Veja o arquivo [LICENSE](LICENSE) para detalhes.

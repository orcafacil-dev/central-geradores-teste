# Central de Geradores — versão 1.4 RC (candidata a pré-lançamento)

Aplicação estática e gratuita com **15 geradores** de documentos: currículos, orçamentos, trabalhos acadêmicos (estrutura), cartas, recibos, checklists, planejamento semanal, declarações, cartas de apresentação, propostas, ordens de serviço, planos de estudo, controle de gastos, fichas de atendimento e atas de reunião.

A demonstração pública está em https://orcafacil-dev.github.io/central-geradores-teste/ . **É experimental**, não um serviço comercial pronto.

## Principais recursos

- Jornada encadeada entre orçamento → ordem de serviço → recibo, currículo → carta e plano de estudos → checklist. Nunca afirma que um pagamento ocorreu automaticamente.
- Três organizações: Clássico, Moderno e Elegante. Cores, fontes, tamanhos e identidade visual opcionais, com logotipo, cabeçalho e rodapé.
- PDF pela função de impressão do navegador, Word editável (.docx), HTML independente e texto (.txt).
- Histórico e rascunhos locais, duplicação, favoritos e dados próprios reutilizáveis.
- Aba de criação orientada: funciona com regras locais sem IA generativa quando o dispositivo não oferece modelo local compatível. **Não afirmar que o Android executa IA generativa**.
- Idiomas da interface: português, inglês, espanhol, francês, alemão e italiano; preferência detectada do navegador ou seleção manual. Valores ainda estão em BRL e documentos são baseados principalmente em contexto brasileiro.
- Funciona como PWA em navegadores compatíveis; experiência offline real em Android precisa de verificação em aparelho físico.

## Mudanças da versão 1.4 RC

1. **Erro visual corrigido:** `choice-ui.css` agora é efetivamente carregado no HTML. Antes, o JavaScript aprimorava os seletores, mas o CSS ausente deixava campos duplicados/sem estilo em algumas telas.
2. **Backup completo v2:** inclui documentos, rascunhos, perfil próprio, marca, favoritos e idioma. O JSON pode conter informações pessoais — armazene-o em local privado.
3. **Restauração segura:** é possível *mesclar sem apagar* ou *substituir com confirmação*. Backups antigos v1 (somente documentos) continuam sendo aceitos. A importação rejeita identificadores repetidos, tipos desconhecidos e arquivos malformados. Arquivos até 20 MB.
4. **Data corrigida:** a data padrão usa a data local do dispositivo, não o UTC, evitando mudança de dia à noite.
5. **Melhor atualização da PWA:** aviso de atualização somente quando há uma versão anterior já controlando o navegador; cache versionado e assets da nova interface incluídos.
6. **Restaurar em seis idiomas:** textos do diálogo acompanham o idioma configurado.

## Uso

Abra `index.html` num navegador com suporte a arquivos locais para testes simples. Para a PWA, é necessário HTTPS ou localhost. Escolha um gerador, preencha os dados, revise a prévia e exporte. Mantenha cópias JSON antes de limpar dados do navegador ou trocar de aparelho.

## Privacidade e limitações

- Os documentos, CPF/CNPJ e logotipos são armazenados **somente neste navegador**, em `localStorage`. Não há conta, nuvem, sincronização, cobrança, analytics ou envio intencional dos textos a nosso servidor. O provedor de hospedagem pode processar dados técnicos da conexão. Quem tiver acesso ao perfil do navegador poderá acessar os dados.
- Limpar os dados do site pode apagar tudo. **O backup é manual**, sem sincronização entre dispositivos. A restauração por substituição sobrescreve os dados deste navegador, mediante confirmação.
- Recibos particulares não substituem notas fiscais; CPF/CNPJ é validado apenas matematicamente e apenas no formato numérico. Documentos legais, fiscais e acadêmicos exigem revisão e adequação ao país/instituição.
- O editor Word preserva conteúdo, tabelas e cores principais, mas algumas composições visuais são simplificadas. PDF é produzido pelo navegador, cuja qualidade pode variar por plataforma.
- Tradução de interface não equivale a adaptação jurídica ou monetária internacional. Texto do usuário não é traduzido automaticamente.
- Evite informações sensíveis na demonstração até que haja revisão final de segurança e privacidade.
- A página de testes mantém `noindex,nofollow`. **GitHub Pages não deve ser usado como hospedagem definitiva de um SaaS comercial**; antes de monetizar, migrar para plataforma com termos adequados.

## Verificação automatizada

Na raiz, com Node.js e Python + Playwright/Chromium:

```bash
node --check app.js
node tests/dom-contract.js
node tests/dom-smoke.js
node tests/quality-unit.js
node tests/workflow-unit.js
TZ=America/Fortaleza node tests/backup-core-unit.js
python tests/build-inline.py
python tests/release-browser.py
python tests/release-documents.py
python tests/release-matrix.py
python tests/release-visual.py
```

Os testes com HTML embutido são uma adaptação do ambiente de testes, que não permite navegar para URLs locais; não constituem teste de rede real ou prova de funcionamento offline no Android. Consulte `QA_PRE_LANCAMENTO.md` no repositório privado.

## Pendências antes de produção

Validação em celulares Android e iPhone reais, com impressão, reinstalação/atualização da PWA, comportamento offline, backup/restauração de dados reais autorizados, avaliação de acessibilidade e 5 testes de usabilidade sem auxílio; revisão jurídica/LGPD, hospedagem comercial adequada, titularidade do nome/marca, política de suporte e precificação. Nenhum pagamento ou contato com clientes foi ativado nesta entrega.

Verificação extra: `node tests/assets-contract.js` impede a ausência de CSS e JavaScript de interface.

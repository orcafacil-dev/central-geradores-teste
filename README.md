# Central de Geradores — v1.0 | Seletores personalizados

## Novidades da v1.0
- Menus suspensos personalizados **dentro da página**: modelo, fonte, tamanho, alinhamento, filtros e opções dos geradores (inclusive campos criados dinamicamente).
- No celular, seleção em **painel inferior** com título, itens selecionáveis e botão para fechar; no computador, menu alinhado ao campo.
- Cor personalizada com **12 opções nomeadas e campo HEX**, em vez da janela nativa de cores do aparelho. As seis paletas rápidas existentes permanecem.
- Suporte a teclado (Tab, setas, Home, End, Enter, Escape), foco e nomes acessíveis; o seletor HTML original permanece como estado interno, sem alterar o formato dos documentos salvos.
- Não foi adicionada nenhuma API, rastreamento, sincronização ou cobrança. O usuário pode continuar usando os documentos existentes.
- Caso o script de aprimoramento não carregue, os controles HTML nativos continuam funcionando (melhoria progressiva).

### Verificações da v1.0
- `python tests/choice-ui-browser.py`: Chromium real, desktop e mobile (390 px), menus sem janela nativa, HEX, descontos, unidade, fonte, tamanho, alinhamento e persistência.
- `node tests/dom-contract.js`, `node tests/workflow-unit.js`, `node tests/quality-unit.js`, `node tests/dom-smoke.js`.
- A instalação em Android físico e o comportamento em todos os navegadores móveis ainda exigem validação manual.

## Versão anterior (v0.9)
- Orçamento aceita **unidade de medida** (un., serviço, hora, diária, m², m³, km, kg, litro), **desconto percentual ou em reais**, subtotal e total líquido. O valor líquido é reutilizado na ordem de serviço.
- Recibo informa o **valor por extenso** (português brasileiro), número opcional, CPF/CNPJ numérico opcional de pagador e recebedor, com verificação matemática dos dígitos. A validação **não confirma a existência, titularidade ou regularidade**. CNPJ alfanumérico não suportado nesta versão.
- **Revisão contextual** antes de exportar: recomendações de completude para currículos, orçamentos, recibos e trabalhos acadêmicos. Sugestões não equivalem a aconselhamento ou validação profissional.
- Modelos de orientação para currículo de primeiro emprego, estágio e profissional experiente, sem inventar experiências.
- Formulários de itens de orçamento com melhor legibilidade no celular. Dados antigos com itens sem unidade usam “un.”.
- Word, PDF, HTML, TXT e histórico preservados; revisão de exportação de subtotal/desconto nos três estilos.

## Benchmark (funcionalidades anunciadas publicamente em out/2026)
- Canva/FlowCV são muito superiores na variedade de modelos e funções avançadas de edição/importação de currículos; nossa abordagem é completar rapidamente documentos básicos sem cadastro.
- We.Inc oferece orçamento por profissão, descontos e unidade; v0.9 aproxima o preenchimento da nossa plataforma desse nível.
- Ritto gera recibo com valor por extenso e conferência de CPF/CNPJ, incluindo alfanumérico. Nossa versão cobre somente o formato numérico.
- Diferença a validar com usuários: jornada encadeada orçamento → ordem → recibo e currículo → carta. Nenhuma alegação de sermos “melhores que todos” sem pesquisa observacional.

## Segurança e limites
- App local e estático; **não** há IA generativa, conta, cobrança, envio de dados de documentos a servidor próprio ou telemetria.
- Documentos, CPF/CNPJ e logos ficam no armazenamento deste navegador; podem ser vistos por quem tiver acesso ao aparelho e perdidos ao limpar dados. Exporte backups privados.
- PDF pela impressão do navegador; DOCX editável preserva conteúdo e tabela, mas não garante fidelidade exata às colunas. Faça revisão antes de enviar.
- Recibo não comprova que um pagamento ocorreu sem assinatura/dados reais e não substitui nota fiscal. A validação de CPF/CNPJ apenas confere dígitos; **não consulta a Receita**.
- Versão de testes no GitHub Pages, ainda `noindex,nofollow`. **Não** usar Pages como hospedagem de SaaS comercial.

## Testes locais
- `node --check quality.js && node --check app.js`
- `node tests/quality-unit.js`
- `node tests/dom-smoke.js && node tests/dom-contract.js && node tests/workflow-unit.js`
- `python tests/competitor-gaps-browser.py`: Chromium, 15 ferramentas, 3 estilos, DOCX/PDF, CPF/CNPJ, desconto e 5 larguras.
- Word aberto e renderizado pelo LibreOffice; PDF renderizado para inspeção visual.

## Próximos passos
Teste real com pelo menos cinco usuários e comparação cronometrada por tarefa: currículo no FlowCV, orçamento no We.Inc e recibo na Ritto. Não coletar dados sem consentimento. Antes da monetização, revisar termos da hospedagem, privacidade, LGPD e pagamentos. Sem gastos novos.


## Aba Criar com IA — v1.1 (experimental)

Uma nova aba permite escolher **categoria** (Financeiro, Trabalho e emprego, Estudos, Negócios, Organização ou Documentos pessoais), **tipo de documento**, **organização** (Automático, Clássico, Moderno e Elegante) e **paleta de cores**. A descrição do usuário é organizada em um rascunho do gerador correspondente, que continua editável e pode ser exportado em PDF, Word ou HTML.

A opção *Automático* escolhe o **Clássico por padrão** e só muda o modelo se o texto solicitar explicitamente, por exemplo, "modelo moderno" ou "estilo elegante". A cor é verde por padrão, ou segue a cor explicitamente indicada na descrição.

**IA generativa verdadeira: opcional e limitada.** A integração usa apenas a Prompt API `window.LanguageModel` (modelo integrado ao navegador), quando disponível e compatível com texto em português. Atualmente, em especial no **Chrome para Android**, essa IA não é suportada; a opção é desativada e o usuário pode selecionar **Preparar sem IA**. O modo sem IA é um **estruturador de informações**, com regras de campos e organização; **não cria conteúdo novo com um modelo de linguagem**. Não há cadastro, chave, servidor de inferência ou cobrança. O navegador pode precisar baixar um modelo local antes de disponibilizá-lo.

Regras de confiança: a ferramenta não preenche preços ausentes, não inventa formação, empregos, fontes, pessoas, pagamento nem documentos oficiais. Para recibos, exige confirmação explícita de pagamento. O resultado sempre deve ser revisado por quem o utiliza.

Para testar via Python Playwright em um ambiente que bloqueia navegação localhost, execute `python tests/build-inline.py` e `python tests/assistant-browser.py`, ou `python tests/assistant-regression.py`. Esses testes criam um HTML com scripts locais incorporados **somente para teste**. Os arquivos de teste e seus dados fictícios não devem ser publicados no GitHub Pages.

## Internacionalização e estúdio — v1.2

- O estúdio possui **três modelos visuais**, com **Clássico pré-selecionado**. Se o usuário não tocou num modelo, a descrição pode pedir “moderno” ou “elegante”. A opção visível “Automático” foi removida.
- O estúdio agora possui **um único botão “Criar documento”**. Quando a API de IA **local** do navegador for realmente compatível, poderá ajudar a redigir. Nos demais aparelhos o mesmo botão **organiza os dados informados por regras determinísticas**, sem inventar texto ou simular uma chamada de IA. O estado real de compatibilidade é comunicado discretamente ao usuário.
- O idioma inicial segue `navigator.languages`/`navigator.language`, **não a geolocalização nem o IP**. Suporte inicial: português, inglês, espanhol, francês, alemão e italiano; demais idiomas recebem inglês. O menu 🌐 permite substituir a escolha, salva somente no navegador.
- Os rótulos principais do aplicativo, os campos dos 15 geradores, parte dos exemplos, a página de privacidade e os títulos/rótulos principais de documentos exportados foram traduzidos. O conteúdo digitado pelo usuário **não** é traduzido automaticamente nem enviado a serviços de tradução.
- Datas e a apresentação de valores monetários usam a preferência linguística; **a moeda continua sendo BRL (R$)**. CPF/CNPJ e documentos fiscais/jurídicos continuam brasileiros. Não afirmar validade universal nem tradução jurídica certificada.
- Testes: `python tests/build-inline.py`, `python tests/i18n-browser.py`, `python tests/i18n-regression.py`, `python tests/export-i18n.py`, `node tests/dom-contract.js`. Chromium roda com scripts incorporados nos testes porque navegação para arquivos locais é restrita neste ambiente. Word em inglês foi aberto/renderizado no LibreOffice e inspecionado visualmente.

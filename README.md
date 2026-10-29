# Central de Geradores — v0.3 experimental

Aplicação web estática/PWA gratuita, **sem cadastro, serviços pagos, API de IA ou back-end**. Desenvolvida para testar criação rápida de documentos em português brasileiro. O repositório de desenvolvimento permanece privado; uma cópia sanitizada serve a demonstração pública.

## Ferramentas disponíveis (15)

- **Emprego:** currículo, carta profissional, carta de apresentação para vagas.
- **Negócios:** orçamento, recibo simples, proposta comercial, ordem de serviço, ficha de atendimento.
- **Estudos:** trabalho acadêmico (modelo estrutural), plano de estudos.
- **Organização:** checklist, planejamento semanal, ata de reunião.
- **Finanças:** controle de gastos.
- **Documentos:** declaração particular simples.

## Recursos

- Categorias, busca e favoritos armazenados localmente.
- Três estilos visuais (Clássico, Moderno, Elegante) com prévia e impressão em A4.
- Modelos iniciais orientativos para oito geradores; não inserem qualificações, estudos, fontes ou dados pessoais inventados.
- Alternância entre formulário e prévia no celular.
- Cópia de texto, download de TXT e compartilhamento manual de texto (quando o navegador permitir).
- Salvamento local, rascunhos, duplicação, backup JSON e restauração.
- Perfil de dados **próprios**, salvo opcionalmente, sem reutilizar telefone do cliente ou nome do destinatário.
- Reaproveitamento de itens de orçamentos anteriores; valores sempre editáveis.
- Manifest PWA e cache offline dos arquivos de interface. A instalação depende do navegador e de HTTPS/localhost.

## Testar

Execute os arquivos sob HTTPS ou um servidor local (por exemplo, `python -m http.server 8765`). A abertura por `file://` pode limitar recursos de instalação e armazenamento em alguns navegadores.

Teste lógico sem dependências:

```sh
node --check app.js
node --check sw.js
node tests/dom-smoke.js
```

Teste real de DOM/CSS em Chromium, com dependência `playwright` Python instalada e `/usr/bin/chromium` disponível:

```sh
python tests/browser-smoke.py
python tests/browser-edge.py
```

Esses testes carregam arquivos locais **dentro do navegador de teste**, sem acesso a contas externas. Usam um `localStorage` falso em memória, portanto **não substituem testes de instalação PWA real, cache offline em HTTPS e uso em Safari/Firefox**.

## Privacidade e limitações

- Documentos e dados de perfil ficam somente no armazenamento do navegador, não sincronizados e sujeitos a perda. Backups JSON podem conter dados pessoais.
- O provedor de hospedagem ainda pode registrar dados técnicos de acesso, como IP.
- A geração de PDF usa **Imprimir / Salvar PDF** do navegador; não produz PDF por servidor.
- A cópia TXT não preserva a formatação visual; o compartilhamento envia texto ao destino escolhido pelo usuário.
- O currículo depende de informações reais do usuário. O trabalho acadêmico não verifica fontes, plágio ou ABNT.
- Recibos não substituem nota fiscal; documentos legais/fiscais devem ser revisados antes do uso.
- A identidade/nome comercial não foi liberada por pesquisa de marca.
- **Não há cobrança, assinaturas, analytics, propagandas nem recursos de IA gerativa.**
- A demonstração pública tem `noindex` durante os testes; não é um lançamento comercial.

## Gestão de versões

O service worker usa cache versionado `central-geradores-shell-v3`, atualiza navegação pela rede quando disponível e mantém os arquivos estáticos para uso offline. **Recarregue após uma atualização**. Versões antigas podem persistir temporariamente em abas existentes.

## Próximos critérios para produção

Validar por pessoas reais em Android e desktop, verificar PWA instalada/offline em HTTPS, PDF multipágina e qualidade dos modelos com usuários. Depois, validar demanda, retenção e monetização sem prometer resultados.

## v0.6: Jornadas conectadas
- Atender cliente: orçamento -> ordem de serviço -> recibo; currículo -> carta; estudos -> checklist.
- Salve o documento anterior e prepare o seguinte com dados reutilizados.
- Itens de orçamento são listados como previstos, não realizados.
- Um recibo só é preparado após confirmação; valor recebido e data devem ser inseridos manualmente.
- Sem cadastro, coleta remota de dados ou pagamentos.

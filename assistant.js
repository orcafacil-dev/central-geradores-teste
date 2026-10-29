'use strict';
/* Estúdio de documentos. Sem serviços remotos, telemetria, credenciais ou custo.
   A Prompt API é opcional: na ausência dela, apenas organiza dados fornecidos pelo usuário. */
(() => {
  const $ = id => document.getElementById(id);
  const CATEGORIES = [
    {id:'Finanças',label:'Financeiro',icon:'◫',tip:'Despesas, valores e recibos',types:['gastos','recibo']},
    {id:'Emprego',label:'Trabalho e emprego',icon:'▤',tip:'Currículos e candidaturas',types:['curriculo','apresentacao','carta']},
    {id:'Estudos',label:'Estudos',icon:'♧',tip:'Trabalhos e planejamentos',types:['trabalho','estudos']},
    {id:'Negócios',label:'Negócios e serviços',icon:'▦',tip:'Propostas e orçamentos',types:['orcamento','proposta','ordem','atendimento']},
    {id:'Organização',label:'Organização',icon:'☷',tip:'Metas, listas e reuniões',types:['planejamento','checklist','reuniao']},
    {id:'Documentos',label:'Documentos pessoais',icon:'✉',tip:'Cartas e declarações',types:['declaracao','carta']}
  ];
  const LAYOUTS=[['automatico','Automático','Clássico se você não indicar outro'],['classico','Clássico','Estrutura tradicional'],['moderno','Moderno','Visual contemporâneo'],['elegante','Elegante','Composição editorial']];
  const COLORS=[['Automática',''],['Verde','#14785f'],['Azul','#2058bd'],['Grafite','#354456'],['Vinho','#8f355d'],['Roxo','#6946ad'],['Turquesa','#007b80']];
  const EXAMPLES={
    gastos:'Título: Gastos de novembro\nReceita: 2500,00\nTransporte; 45,50\nInternet; 79,90\nAlimentação; 360,00',
    curriculo:'Nome: Ana Ribeiro\nCargo: Assistente administrativo\nCidade: Recife, PE\nExperiência: Atendimento ao público por 2 anos\nFormação: Ensino médio completo\nHabilidades: Excel, organização e atendimento',
    trabalho:'Título: Educação ambiental na escola\nAluno: Ana Ribeiro\nInstituição: Escola Exemplo\nIntrodução: O trabalho apresenta atividades ambientais realizadas em sala.\nDesenvolvimento: A turma participou de coleta seletiva e debates.\nConclusão: As atividades ajudaram a entender a separação de resíduos.',
    orcamento:'Empresa: Oficina Exemplo\nCliente: Maria Silva\nServiço: Instalação elétrica\nItem: Mão de obra; 1; serviço; 150,00\nItem: Material; 2; un.; 35,50\nPagamento: Na conclusão por Pix',
    recibo:'Recebedor: Empresa Exemplo\nPagador: Cliente Exemplo\nValor recebido: 120,50\nReferente a: Serviço prestado e já pago\nForma de pagamento: Pix',
    proposta:'Empresa: Oficina Exemplo\nCliente: Mercado Exemplo\nTítulo: Proposta de manutenção\nObjetivo: Manutenção preventiva\nEntregas: Inspeção\nEntregas: Relatório',
    checklist:'Título: Preparar viagem\nTarefas: Conferir documentos\nTarefas: Fazer malas\nTarefas: Verificar reservas'
  };
  const clean = x => String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const aliases={
    name:['nome','nome completo','candidato','declarante','seu nome'], role:['cargo','vaga','cargo desejado','profissao','area desejada'],
    city:['cidade','localidade','municipio'],phone:['telefone','celular','whatsapp'],email:['email','e mail'],
    experience:['experiencia','experiencias','experiencia profissional'],education:['formacao','escolaridade','curso de formacao'],skills:['habilidades','competencias'],
    company:['empresa','meu negocio','prestador','minha empresa','sua empresa'],client:['cliente','destinatario comercial'],
    service:['servico','tipo de servico'], title:['titulo','assunto do documento','nome do documento','nome do plano','tema'],
    student:['aluno','aluna','estudante'],institution:['instituicao','escola','faculdade'],teacher:['professor','orientador'],
    intro:['introducao'],development:['desenvolvimento'],conclusion:['conclusao'],references:['referencias','fontes consultadas'],
    sender:['remetente','autor da carta'],recipient:['destinatario','para'],subject:['assunto'],body:['texto','conteudo','corpo'],
    receiver:['recebedor','quem recebeu'],payer:['pagador','quem pagou'], amount:['valor recebido','valor pago'],
    description:['descricao','referente a','sobre'],method:['forma de pagamento','meio de pagamento'],
    tasks:['tarefas','itens da lista'],goal:['objetivo','meta','meta principal'],start:['inicio'],
    priorities:['prioridades'],schedule:['cronograma','agenda','horarios'],notes:['observacoes','notas','informacoes adicionais'],
    scope:['escopo','objetivo da proposta'],deliverables:['entregas','entregaveis'],price:['valor proposto'],
    provider:['prestador','responsavel pelo atendimento'],problem:['problema','solicitacao'],request:['pedido','motivo do atendimento'],
    actions:['acoes','procedimentos'],payment:['pagamento','condicoes de pagamento'],participants:['participantes'],
    reason:['motivo','por que essa vaga','motivacao'],strengths:['pontos fortes'],
    income:['receita','renda','receita do periodo'],expenses:['despesas','gastos'],owner:['responsavel'],
  };
  const moneyKeys=new Set(['amount','price','income','discountValue','receiverId','payerId']);
  const safeAiKeys=new Set(['summary','body','intro','development','conclusion','scope','deliverables','description','notes','reason','goal','priorities','schedule','review','request','assessment','action','strengths']);
  const labels=new Map();
  let category='Negócios', layout='automatico', accent='', ready='checking', busy=false;
  const rows={};

  function toolCatalog(){return window.CentralGeradores?.tools||[]}
  function toolById(id){return toolCatalog().find(x=>x.id===id)}
  function categoryInfo(){return CATEGORIES.find(c=>c.id===category)}
  function alertStatus(message,kind='info'){$('ai-status').textContent=message;$('ai-status').dataset.kind=kind}

  function renderCategories(){const container=$('ai-categories');container.replaceChildren();for(const c of CATEGORIES){const b=document.createElement('button');b.type='button';b.className='ai-category';b.setAttribute('aria-pressed',String(c.id===category));b.textContent=c.icon+'  '+c.label;b.addEventListener('click',()=>{category=c.id;renderCategories();renderTypes();});container.append(b)}}
  function renderTypes(){const sel=$('ai-type'),last=sel.value;sel.replaceChildren();const pool=categoryInfo().types;for(const id of pool){const t=toolById(id);if(!t)continue;const o=document.createElement('option');o.value=id;o.textContent=t.name;sel.append(o)}if(pool.includes(last))sel.value=last;updateHelp()}
  function updateHelp(){const id=$('ai-type').value;const t=toolById(id);$('ai-doc-description').textContent=t?.help||'Escreva apenas informações verdadeiras. Revise antes de exportar.';$('ai-example').hidden=!EXAMPLES[id];$('ai-actual-payment').hidden=id!=='recibo';if(id==='recibo')$('ai-paid-check').checked=false}
  function renderLayouts(){const parent=$('ai-layouts');parent.replaceChildren();for(const [id,name,sub] of LAYOUTS){const btn=document.createElement('button');btn.type='button';btn.className='ai-layout-option';btn.dataset.layout=id;btn.setAttribute('aria-pressed',String(layout===id));const mark=document.createElement('span');mark.className='ai-layout-preview';mark.dataset.layout=id;for(let i=0;i<4;i++)mark.append(document.createElement('i'));const a=document.createElement('strong');a.textContent=name;const b=document.createElement('small');b.textContent=sub;btn.append(mark,a,b);btn.addEventListener('click',()=>{layout=id;renderLayouts()});parent.append(btn)}}
  function renderColors(){const parent=$('ai-colors');parent.replaceChildren();for(const [name,color] of COLORS){const btn=document.createElement('button');btn.type='button';btn.className='ai-color-option';btn.style.setProperty('--swatch',color||'#14785f');btn.setAttribute('aria-label','Cor '+name);btn.setAttribute('aria-pressed',String(accent===color));const dot=document.createElement('span');dot.className='ai-color-dot';const label=document.createElement('small');label.textContent=name;btn.append(dot,label);btn.onclick=()=>{accent=color;$('ai-hex').value=color||'';renderColors()};parent.append(btn)}}
  const styleFromNotes = (text)=>{if(layout!=='automatico')return layout;const n=clean(text);if(/\b(?:nao|sem)\s+(?:quero|usar)?\s*(?:modelo|estilo)?\s*moderno\b/.test(n))return'classico';if(/\b(moderno|moderna|modern)\b/.test(n))return'moderno';if(/\b(elegante|editorial|sofisticad[oa])\b/.test(n))return'elegante';return'classico'};
  const colorFromNotes=(text)=>{if(accent)return accent;const n=clean(text);const found=n.match(/(?:cor|cores|paleta|tema)(?:\s+de)?\s+(azul|roxo|verde|vinho|grafite|turquesa)/) || n.match(/(?:moderno|moderna|classico|classica|elegante|visual|estilo)(?:\s+\w+){0,2}\s+(azul|roxo|verde|vinho|grafite|turquesa)/) || n.match(/\bem\s+(azul|roxo|verde|vinho|grafite|turquesa)\b/);const options={azul:'#2058bd',roxo:'#6946ad',verde:'#14785f',vinho:'#8f355d',grafite:'#354456',turquesa:'#007b80'};return options[found?.[1]]||'#14785f'};
  function parseRaw(text,tool){
    const fields=new Set(tool.fields.map(f=>f.key));const result={};const narrative=[];const expenses=[];const lineItems=[];
    const itemsAllowed=tool.id==='orcamento';let seen=[];
    for(const raw of text.split(/\r?\n/)){
      const s=raw.trim();if(!s)continue;
      const explicit=s.match(/^([^:：]{2,40})\s*[:：]\s*(.+)$/);
      if(explicit){
        const label=clean(explicit[1]),v=explicit[2].trim(),key=Object.entries(aliases).find(([k,arr])=>fields.has(k)&&arr.includes(label))?.[0];
        if(itemsAllowed && ['item','itens','material'].includes(label)){const parsed=parseItem(v);if(parsed)lineItems.push(parsed);else narrative.push(s);continue}
        if(key){if(moneyKeys.has(key)&&!/^\s*(?:R\$\s*)?\d[\d.,]*\s*$/.test(v)){narrative.push(s);continue}result[key]=result[key]&&['tasks','deliverables','priorities','participants','skills','actions','expenses','schedule'].includes(key)?result[key]+'\n'+v:v;seen.push(key);continue}
      }
      if(itemsAllowed && /^item\s*[-—]/i.test(s)){const parsed=parseItem(s.replace(/^item\s*[-—]\s*/i,''));if(parsed){lineItems.push(parsed);continue}}
      if(/^(monte|crie|faca|gere|prepare|construa)\b/.test(clean(s)) && /\b(moderno|moderna|classico|classica|elegante|cor azul|cor verde|cor roxo|visual azul|visual verde)\b/.test(clean(s))){continue;}
      if(tool.id==='gastos' && /;/.test(s) && /^.{2,80};\s*(?:R\$\s*)?\d[\d.,]*$/.test(s)){expenses.push(s);continue}
      narrative.push(s);
    }
    if(lineItems.length)result.items=lineItems;
    if(expenses.length)result.expenses=[result.expenses,...expenses].filter(Boolean).join('\n');
    const rest=narrative.join('\n').slice(0,14000);
    if(rest){
      const preferred={curriculo:'summary',orcamento:'notes',trabalho:'development',carta:'body',recibo:'description',checklist:'tasks',planejamento:'goal',declaracao:'body',apresentacao:'reason',proposta:'scope',ordem:'problem',estudos:'goal',gastos:'notes',atendimento:'request',reuniao:'notes'}[tool.id];
      if(preferred&&!result[preferred])result[preferred]=rest;
    }
    return result;
  }
  function parseItem(text){const parts=text.split(';').map(x=>x.trim());if(parts.length!==4)return null;const [description,quantity,unit,price]=parts;if(!description||description.length>500||!/^\d+(?:[.,]\d+)?$/.test(quantity)||!/^\d[\d.,]*$/.test(price.replace(/^R\$\s*/i,'')))return null;const valid=['un.','serviço','h','hora','diária','m²','metro','kg','litro','unidade'];return {description,quantity:quantity.replace(',','.'),unit:valid.includes(unit)?unit:'un.',price:price.replace(/^R\$\s*/i,'')}}
  function readyData(tool,text){const f=parseRaw(text,tool);const result={...f,__theme:styleFromNotes(text),__appearance:{accent:colorFromNotes(text),font:'sans',size:'normal'}};if(tool.id==='recibo'&&!$('ai-paid-check').checked)throw Error('Confirme que o pagamento realmente ocorreu antes de preparar um recibo.');return result}
  function analyzeMissing(tool,data){return tool.fields.filter(f=>f.required&&!String(data[f.key]||'').trim()).map(x=>x.label)}
  function openDraft(tool,data,mode){const missing=analyzeMissing(tool,data);$('ai-summary').textContent=mode==='ai'?'Rascunho criado usando IA local do navegador. Revise todos os dados.':'Rascunho organizado localmente a partir das informações que você forneceu. Nenhum texto foi inventado por IA.';$('ai-missing').textContent=missing.length?'Complete no editor: '+missing.slice(0,7).join(', ')+'.':'Revise os campos e confirme os dados antes de salvar ou exportar.';
    window.CentralGeradores.openDraft(tool.id,data);window.CentralGeradores.showNotice?.(mode==='ai'?'IA local criou um rascunho. Confira os dados antes de salvar.':'Rascunho guiado, sem IA generativa. Revise os campos e exporte.');alertStatus(mode==='ai'?'IA local preparou o documento. Revise e exporte.':'Documento estruturado localmente. Revise e exporte.','success');}
  async function aiGenerate(tool,text,data){
    const languageOptions={expectedInputs:[{type:'text',languages:['pt']}],expectedOutputs:[{type:'text',languages:['pt']}]};
    if(typeof window.LanguageModel==='undefined')throw Error('IA do navegador indisponível.');
    const available=await window.LanguageModel.availability(languageOptions);if(available==='unavailable')throw Error('Modelo de IA indisponível para português neste dispositivo.');
    // O modelo não recebe valores financeiros ou nomes como campos a inventar.
    const fields=tool.fields.filter(f=>safeAiKeys.has(f.key)).map(f=>({key:f.key,label:f.label}));
    const prompt=`Você é um assistente de documentos em português do Brasil. Crie somente um rascunho útil baseado EXCLUSIVAMENTE nas notas fornecidas. Sem inventar pessoas, datas, valores, qualificações, dados acadêmicos, referências, experiências, condições contratuais ou pagamentos. Retorne SOMENTE um objeto JSON com chave \"fields\" e valores string para as chaves permitidas: ${JSON.stringify(fields)}. Nunca retorne HTML, markdown ou explicações. Se não houver dados suficientes, omita o campo. Tipo: ${tool.name}. Notas do usuário:\n${text.slice(0,4500)}`;
    const session=await window.LanguageModel.create(languageOptions);
    try{const raw=await session.prompt(prompt);let parsed;try{parsed=JSON.parse(raw)}catch{const s=raw.indexOf('{'),e=raw.lastIndexOf('}');if(s<0||e<=s)throw Error('Resposta inválida da IA.');parsed=JSON.parse(raw.slice(s,e+1))}
      const output=parsed.fields||{},allowed=new Set(fields.map(f=>f.key));for(const [key,value]of Object.entries(output)){if(!allowed.has(key)||typeof value!=='string'||!value.trim())continue;if(key==='notes'&&data.notes)continue;if(!data[key])data[key]=value.slice(0,12000)}return data;
    }finally{session.destroy?.()}
  }
  async function generate(wantAI){if(busy)return;const tool=toolById($('ai-type').value);if(!tool){alertStatus('Selecione um documento válido.','error');return}const text=$('ai-request').value.trim();if(text.length<12){alertStatus('Descreva o que deseja em pelo menos 12 caracteres.','error');$('ai-request').focus();return}
    const hex=$('ai-hex').value.trim();if(hex&&!/^#[0-9a-f]{6}$/i.test(hex)){alertStatus('Informe uma cor HEX válida, como #2058BD, ou deixe o campo vazio.','error');return}
    busy=true;$('ai-generate').disabled=true;$('ai-guided').disabled=true;try{let data=readyData(tool,text),mode='guided';if(wantAI){try{data=await aiGenerate(tool,text,data);mode='ai'}catch(e){alertStatus(e.message+' Usando estruturação local segura.','warning')}}openDraft(tool,data,mode)}catch(e){alertStatus(e.message,'error')}finally{busy=false;$('ai-generate').disabled=ready==='no'||ready==='unavailable';$('ai-guided').disabled=false}}
  async function checkAvailability(){const label=$('ai-mode-status');const aiButton=$('ai-generate');if(typeof window.LanguageModel==='undefined'){ready='no';aiButton.disabled=true;aiButton.textContent='IA local indisponível';label.textContent='IA generativa local: indisponível neste navegador. Organização guiada: disponível e gratuita.';return}
    try{const result=await window.LanguageModel.availability({expectedInputs:[{type:'text',languages:['pt']}],expectedOutputs:[{type:'text',languages:['pt']}]});ready=result;aiButton.disabled=result==='unavailable';aiButton.textContent=result==='unavailable'?'IA local indisponível':'✦ Gerar com IA local';label.textContent=result==='available'?'IA local disponível neste navegador. Seus dados ficam no aparelho.':result==='downloadable'||result==='downloading'?'IA local pode exigir download pelo navegador (sem cobrança).':'IA em português não disponível aqui. Organização guiada funciona normalmente.';}catch{ready='no';aiButton.disabled=true;aiButton.textContent='IA local indisponível';label.textContent='IA local indisponível neste navegador. Organização guiada funciona normalmente.'}}
  function exitStudio(){ $('ai-studio').hidden=true;for(const id of ['inicio','jornadas','explorar'])$(id).hidden=false;const why=document.querySelector('.why');if(why)why.hidden=false;$('nav-ai').setAttribute('aria-pressed','false');$('nav-tools').setAttribute('aria-pressed','true') }
  function enableTab(ai){$('ai-studio').hidden=!ai;for(const id of ['inicio','jornadas','explorar'])$(id).hidden=ai;const why=document.querySelector('.why');if(why)why.hidden=ai;$('nav-ai').setAttribute('aria-pressed',String(ai));$('nav-tools').setAttribute('aria-pressed',String(!ai));if(ai){$('workspace').hidden=true;$('library').hidden=true;window.location.hash='ai';$('ai-studio').scrollIntoView({behavior:'smooth',block:'start'})}else{$('explorar').scrollIntoView({behavior:'smooth',block:'start'});window.location.hash='explorar'}}
  function initialize(){if(!$('ai-studio')||!window.CentralGeradores)return;
    $('nav-ai').onclick=()=>enableTab(true);$('nav-tools').onclick=()=>enableTab(false);window.addEventListener('cg:editor-open',exitStudio);
    $('ai-type').addEventListener('change',updateHelp);
    $('ai-generate').onclick=()=>generate(true);$('ai-guided').onclick=()=>generate(false);
    $('ai-example').onclick=()=>{$('ai-request').value=EXAMPLES[$('ai-type').value]||'';alertStatus('Exemplo fictício carregado. Substitua por seus dados antes de usar.')};
    $('ai-hex').addEventListener('input',e=>{const v=e.target.value.trim();if(!v){accent='';renderColors();return}if(/^#[0-9a-f]{6}$/i.test(v)){accent=v.toLowerCase();renderColors()}});
    renderCategories();renderTypes();renderLayouts();renderColors();checkAvailability();
    if(window.location.hash==='#ai')enableTab(true);
  }
  window.CentralAssistantCore={parseRaw,styleFromNotes,colorFromNotes,parseItem,analyzeMissing};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();

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
  const LAYOUTS=[['classico','Clássico','Estrutura tradicional'],['moderno','Moderno','Visual contemporâneo'],['elegante','Elegante','Composição editorial']];
  const COLORS=[['Verde','#14785f'],['Azul','#2058bd'],['Grafite','#354456'],['Vinho','#8f355d'],['Roxo','#6946ad'],['Turquesa','#007b80']];
  const LOCAL_EXAMPLES={
  en:{
   orcamento:'Company: Example Workshop\nClient: Maria Silva\nService: Electrical installation\nItem: Labor; 1; serviço; 150.00\nItem: Materials; 2; un.; 35.50',
   curriculo:'Full name: Ana Ribeiro\nRole: Office assistant\nCity: London\nExperience: Customer service for two years\nEducation: High school\nSkills: Spreadsheets and organization',
   gastos:'Title: Monthly expenses\nIncome: 2500.00\nTransport; 45.50\nInternet; 79.90',
   recibo:'Received by: Example Business\nPaid by: Example Client\nAmount received: 120.50\nDescription: Service provided and paid\nPayment method: Bank transfer',
   checklist:'Title: Trip preparation\nTasks: Check documents\nTasks: Pack bags\nTasks: Confirm reservations',
   trabalho:'Title: Environmental education\nStudent name: Alex Morgan\nInstitution: Example School\nIntroduction: Describe your project here.'
  },
  es:{
   orcamento:'Empresa: Taller Ejemplo\nCliente: María Silva\nServicio: Instalación eléctrica\nItem: Mano de obra; 1; serviço; 150,00\nItem: Materiales; 2; un.; 35,50',
   curriculo:'Nombre completo: Ana Ribeiro\nPuesto: Auxiliar administrativo\nCiudad: Madrid\nExperiencia: Atención al público durante dos años\nEducación: Bachillerato\nHabilidades: Excel y organización',
   gastos:'Título: Gastos mensuales\nIngresos: 2500,00\nTransporte; 45,50\nInternet; 79,90',
   recibo:'Recebedor: Empresa Ejemplo\nPagador: Cliente Ejemplo\nValor recibido: 120,50\nReferente a: Servicio realizado y pagado',
   checklist:'Título: Preparar viaje\nTareas: Comprobar documentos\nTareas: Hacer equipaje',
   trabalho:'Título: Educación ambiental\nAlumno: Ana Ribeiro\nInstitución: Escuela Ejemplo\nIntroducción: Describe el tema aquí.'
  },
  fr:{
   orcamento:'Entreprise: Atelier Exemple\nClient: Marie Martin\nService: Installation électrique\nItem: Main d’œuvre; 1; serviço; 150,00\nItem: Matériaux; 2; un.; 35,50',
   curriculo:'Nom complet: Ana Ribeiro\nPoste: Assistante administrative\nVille: Paris\nExpérience: Accueil clientèle pendant deux ans\nFormation: Baccalauréat',
   gastos:'Titre: Dépenses mensuelles\nRevenus: 2500,00\nTransport; 45,50\nInternet; 79,90'
  },
  de:{
   orcamento:'Unternehmen: Beispielwerkstatt\nKunde: Maria Weber\nService: Elektroinstallation\nItem: Arbeit; 1; serviço; 150,00\nItem: Material; 2; un.; 35,50',
   curriculo:'Vollständiger Name: Ana Weber\nStelle: Büroassistenz\nStadt: Berlin\nBerufserfahrung: Zwei Jahre im Kundenservice',
   gastos:'Titel: Monatliche Ausgaben\nEinnahmen: 2500,00\nTransport; 45,50\nInternet; 79,90'
  },
  it:{
   orcamento:'Azienda: Officina Esempio\nCliente: Maria Rossi\nServizio: Installazione elettrica\nItem: Manodopera; 1; serviço; 150,00\nItem: Materiale; 2; un.; 35,50',
   curriculo:'Nome completo: Anna Rossi\nRuolo: Assistente amministrativa\nCittà: Milano\nEsperienza: Due anni in assistenza clienti',
   gastos:'Titolo: Spese mensili\nEntrate: 2500,00\nTrasporti; 45,50\nInternet; 79,90'
  }
};
function sampleFor(type){const lang=window.CentralI18n?.locale()||'pt';return lang==='pt'?EXAMPLES[type]:LOCAL_EXAMPLES[lang]?.[type]}
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
    name:['name','full name','nombre','nombre completo','nom','nom complet','nome','nome completo','candidato','declarante','seu nome'], role:['role','position','job title','puesto','poste','beruf','cargo','vaga','cargo desejado','profissao','area desejada'],
    city:['cidade','localidade','municipio'],phone:['telefone','celular','whatsapp'],email:['email','correo electronico','e mail','e mail'],
    experience:['experience','experiencia','experiencias','experiencia profissional'],education:['education','educacion','formacao','escolaridade','curso de formacao'],skills:['skills','habilidades','competencias'],
    company:['company','business','empresa','meu negocio','prestador','minha empresa','sua empresa'],client:['client','customer','cliente','destinatario comercial'],
    service:['service','servicio','servico','tipo de servico'], title:['title','titre','titel','titulo','assunto do documento','nome do documento','nome do plano','tema'],
    student:['aluno','aluna','estudante'],institution:['instituicao','escola','faculdade'],teacher:['professor','orientador'],
    intro:['introducao'],development:['desenvolvimento'],conclusion:['conclusao'],references:['referencias','fontes consultadas'],
    sender:['remetente','autor da carta'],recipient:['destinatario','para'],subject:['assunto'],body:['text','message','texte','texto','conteudo','corpo'],
    receiver:['recebedor','quem recebeu'],payer:['pagador','quem pagou'], amount:['amount received','importe recibido','valor recebido','valor pago'],
    description:['description','descripcion','descricao','referente a','sobre'],method:['forma de pagamento','meio de pagamento'],
    tasks:['tarefas','itens da lista'],goal:['objetivo','meta','meta principal'],start:['inicio'],
    priorities:['prioridades'],schedule:['cronograma','agenda','horarios'],notes:['observacoes','notas','informacoes adicionais'],
    scope:['escopo','objetivo da proposta'],deliverables:['entregas','entregaveis'],price:['valor proposto'],
    provider:['prestador','responsavel pelo atendimento'],problem:['problema','solicitacao'],request:['pedido','motivo do atendimento'],
    actions:['acoes','procedimentos'],payment:['pagamento','condicoes de pagamento'],participants:['participantes'],
    reason:['motivo','por que essa vaga','motivacao'],strengths:['pontos fortes'],
    income:['income','ingresos','receita','renda','receita do periodo'],expenses:['expenses','gastos','despesas','gastos'],owner:['responsavel'],
  };
  const moneyKeys=new Set(['amount','price','income','discountValue','receiverId','payerId']);
  const safeAiKeys=new Set(['summary','body','intro','development','conclusion','scope','deliverables','description','notes','reason','goal','priorities','schedule','review','request','assessment','action','strengths']);
  const labels=new Map();
  let category='Negócios', layout='classico', layoutTouched=false, accent='#14785f', accentTouched=false, ready='checking', busy=false;
  const rows={};

  const tr = s => window.CentralI18n?.t(s) || s;
  function toolCatalog(){return window.CentralGeradores?.tools||[]}
  function toolById(id){return toolCatalog().find(x=>x.id===id)}
  function categoryInfo(){return CATEGORIES.find(c=>c.id===category)}
  function alertStatus(message,kind='info'){$('ai-status').textContent=message;$('ai-status').dataset.kind=kind}

  function renderCategories(){const container=$('ai-categories');container.replaceChildren();for(const c of CATEGORIES){const b=document.createElement('button');b.type='button';b.className='ai-category';b.setAttribute('aria-pressed',String(c.id===category));b.textContent=c.icon+'  '+tr(c.label);b.addEventListener('click',()=>{category=c.id;renderCategories();renderTypes();});container.append(b)}}
  function renderTypes(){const sel=$('ai-type'),last=sel.value;sel.replaceChildren();const pool=categoryInfo().types;for(const id of pool){const t=toolById(id);if(!t)continue;const o=document.createElement('option');o.value=id;o.textContent=tr(t.name);sel.append(o)}if(pool.includes(last))sel.value=last;updateHelp()}
  function updateHelp(){const id=$('ai-type').value;const t=toolById(id);$('ai-doc-description').textContent=tr(t?.help||'Escreva apenas informações verdadeiras. Revise antes de exportar.');$('ai-example').hidden=!sampleFor(id);$('ai-actual-payment').hidden=id!=='recibo';if(id==='recibo')$('ai-paid-check').checked=false}
  function renderLayouts(){const parent=$('ai-layouts');parent.replaceChildren();for(const [id,name,sub] of LAYOUTS){const btn=document.createElement('button');btn.type='button';btn.className='ai-layout-option';btn.dataset.layout=id;btn.setAttribute('aria-pressed',String(layout===id));const mark=document.createElement('span');mark.className='ai-layout-preview';mark.dataset.layout=id;for(let i=0;i<4;i++)mark.append(document.createElement('i'));const a=document.createElement('strong');a.textContent=tr(name);const b=document.createElement('small');b.textContent=tr(sub);btn.append(mark,a,b);btn.addEventListener('click',()=>{layout=id;layoutTouched=true;renderLayouts()});parent.append(btn)}}
  function renderColors(){const parent=$('ai-colors');parent.replaceChildren();for(const [name,color] of COLORS){const btn=document.createElement('button');btn.type='button';btn.className='ai-color-option';btn.style.setProperty('--swatch',color||'#14785f');btn.setAttribute('aria-label',tr('Cor')+' '+tr(name));btn.setAttribute('aria-pressed',String(accent===color));const dot=document.createElement('span');dot.className='ai-color-dot';const label=document.createElement('small');label.textContent=tr(name);btn.append(dot,label);btn.onclick=()=>{accent=color;accentTouched=true;$('ai-hex').value=color||'';renderColors()};parent.append(btn)}}
  // A primeira opção aparece selecionada, mas instruções no texto ainda podem definir o estilo
  // quando o usuário não tiver alterado explicitamente os cartões.
  const styleFromNotes = text => {
    if(layoutTouched)return layout;
    const n=clean(text);
    if(/\b(?:moderno|moderna|modern|moderno|moderne|modernes|moderno)\b/.test(n))return 'moderno';
    if(/\b(?:elegante|editorial|elegant|elegante|elegant|elegantes)\b/.test(n))return 'elegante';
    return 'classico';
  };
  const colorFromNotes = text => {
    if(accentTouched)return accent;
    const n=clean(text);
    const colorNames={
      azul:'#2058bd',blue:'#2058bd',azul:'#2058bd',bleu:'#2058bd',blau:'#2058bd',blu:'#2058bd',
      roxo:'#6946ad',purple:'#6946ad',violet:'#6946ad',lila:'#6946ad',viola:'#6946ad',
      verde:'#14785f',green:'#14785f',vert:'#14785f',grun:'#14785f',gruen:'#14785f',
      vinho:'#8f355d',burgundy:'#8f355d',bordeaux:'#8f355d',
      grafite:'#354456',graphite:'#354456',gris:'#354456',gray:'#354456',grey:'#354456',grau:'#354456',grigio:'#354456',
      turquesa:'#007b80',turquoise:'#007b80',turkis:'#007b80',turchese:'#007b80'
    };
    const pattern=/\b(?:cor|color|colour|farbe|colore|couleur|in|em|en|avec|mit|with)\s+(?:de\s+)?([a-z]+)\b/g;
    let m;while((m=pattern.exec(n)))if(colorNames[m[1]])return colorNames[m[1]];
    // A cor mencionada em instruções livres também é respeitada.
    for(const word of n.split(' '))if(colorNames[word])return colorNames[word];
    return '#14785f';
  };
  function parseRaw(text,tool){
    const fields=new Set(tool.fields.map(f=>f.key));const result={};const narrative=[];const expenses=[];const lineItems=[];
    const itemsAllowed=tool.id==='orcamento';let seen=[];
    for(const raw of text.split(/\r?\n/)){
      const s=raw.trim();if(!s)continue;
      const explicit=s.match(/^([^:：]{2,40})\s*[:：]\s*(.+)$/);
      if(explicit){
        const label=clean(explicit[1]),v=explicit[2].trim(),key=Object.entries(aliases).find(([k,arr])=>fields.has(k)&&arr.includes(label))?.[0];
        if(itemsAllowed && ['item','items','articulo','articulo de presupuesto','itens','material'].includes(label)){const parsed=parseItem(v);if(parsed)lineItems.push(parsed);else narrative.push(s);continue}
        if(key){if(moneyKeys.has(key)&&!/^\s*(?:R\$\s*)?\d[\d.,]*\s*$/.test(v)){narrative.push(s);continue}result[key]=result[key]&&['tasks','deliverables','priorities','participants','skills','actions','expenses','schedule'].includes(key)?result[key]+'\n'+v:v;seen.push(key);continue}
      }
      if(itemsAllowed && /^item\s*[-—]/i.test(s)){const parsed=parseItem(s.replace(/^item\s*[-—]\s*/i,''));if(parsed){lineItems.push(parsed);continue}}
      if(/^(monte|crie|faca|gere|prepare|construa|create|make|build|prepare|crea|creer|erstelle|creare)\b/.test(clean(s)) && /\b(moderno|moderna|classico|classica|elegante|cor azul|cor verde|cor roxo|visual azul|visual verde)\b/.test(clean(s))){continue;}
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
  function openDraft(tool,data,mode){const missing=analyzeMissing(tool,data).map(tr);$('ai-summary').textContent=tr(mode==='ai'?'Rascunho criado usando IA local do navegador. Revise todos os dados.':'Rascunho organizado localmente a partir das informações que você forneceu. Nenhum texto foi inventado por IA.');$('ai-missing').textContent=missing.length?tr('Complete no editor:')+' '+missing.slice(0,7).join(', ')+'.':tr('Revise os campos e confirme os dados antes de salvar ou exportar.');
    window.CentralGeradores.openDraft(tool.id,data);window.CentralGeradores.showNotice?.(tr(mode==='ai'?'IA local criou um rascunho. Confira os dados antes de salvar.':'Rascunho guiado, sem IA generativa. Revise os campos e exporte.'));alertStatus(tr(mode==='ai'?'IA local preparou o documento. Revise e exporte.':'Documento estruturado localmente. Revise e exporte.'),'success');}
  async function aiGenerate(tool,text,data){
    const currentLang=(window.CentralI18n?.locale()||'pt').split('-')[0];
    const languageOptions={expectedInputs:[{type:'text',languages:[currentLang]}],expectedOutputs:[{type:'text',languages:[currentLang]}]};
    if(typeof window.LanguageModel==='undefined')throw Error('IA do navegador indisponível.');
    const available=await window.LanguageModel.availability(languageOptions);if(available==='unavailable')throw Error('Modelo de IA indisponível neste dispositivo.');
    // O modelo não recebe valores financeiros ou nomes como campos a inventar.
    const fields=tool.fields.filter(f=>safeAiKeys.has(f.key)).map(f=>({key:f.key,label:f.label}));
    const prompt=`You are a document assistant. Answer in the language of these notes when possible. Crie somente um rascunho útil baseado EXCLUSIVAMENTE nas notas fornecidas. Sem inventar pessoas, datas, valores, qualificações, dados acadêmicos, referências, experiências, condições contratuais ou pagamentos. Retorne SOMENTE um objeto JSON com chave \"fields\" e valores string para as chaves permitidas: ${JSON.stringify(fields)}. Nunca retorne HTML, markdown ou explicações. Se não houver dados suficientes, omita o campo. Tipo: ${tool.name}. Notas do usuário:\n${text.slice(0,4500)}`;
    const session=await window.LanguageModel.create(languageOptions);
    try{const raw=await session.prompt(prompt);let parsed;try{parsed=JSON.parse(raw)}catch{const s=raw.indexOf('{'),e=raw.lastIndexOf('}');if(s<0||e<=s)throw Error('Resposta inválida da IA.');parsed=JSON.parse(raw.slice(s,e+1))}
      const output=parsed.fields||{},allowed=new Set(fields.map(f=>f.key));for(const [key,value]of Object.entries(output)){if(!allowed.has(key)||typeof value!=='string'||!value.trim())continue;if(key==='notes'&&data.notes)continue;if(!data[key])data[key]=value.slice(0,12000)}return data;
    }finally{session.destroy?.()}
  }
  async function generate(){
    if(busy)return;
    const tool=toolById($('ai-type').value);
    if(!tool){alertStatus(tr('Selecione um documento válido.'),'error');return}
    const notes=$('ai-request').value.trim();
    if(notes.length<12){alertStatus(tr('Descreva o que deseja em pelo menos 12 caracteres.'),'error');$('ai-request').focus();return}
    const hex=$('ai-hex').value.trim();
    if(hex&&!/^#[0-9a-f]{6}$/i.test(hex)){alertStatus(tr('Informe uma cor HEX válida, como #2058BD, ou deixe o campo vazio.'),'error');return}
    busy=true;$('ai-generate').disabled=true;
    try{
      let data=readyData(tool,notes),mode='guided';
      if(ready==='available'){
        try{data=await aiGenerate(tool,notes,data);mode='ai'}
        catch(e){console.warn('IA local não pôde concluir; usando estruturação local.',e)}
      }
      openDraft(tool,data,mode);
    }catch(e){alertStatus(tr(e.message),'error')}
    finally{busy=false;$('ai-generate').disabled=false}
  }
  async function checkAvailability(){
    const label=$('ai-mode-status');
    if(typeof window.LanguageModel==='undefined'){
      ready='unavailable';label.textContent=tr('A IA generativa não está disponível neste dispositivo. O organizador de informações continua funcionando.');return;
    }
    try{
      const lang=(window.CentralI18n?.locale()||'pt').split('-')[0];
      const languages=['pt','en','es','fr','de','it'].includes(lang)?lang:'en';
      const opt={expectedInputs:[{type:'text',languages:[languages]}],expectedOutputs:[{type:'text',languages:[languages]}]};
      const status=await window.LanguageModel.availability(opt);
      ready=status;
      label.textContent=tr(status==='available'?'IA local disponível; o assistente pode ajudar a redigir.':status==='downloadable'||status==='downloading'?'IA local requer recursos do navegador. O organizador de informações já funciona.':'A IA generativa não está disponível neste dispositivo. O organizador de informações continua funcionando.');
    }catch{ready='unavailable';label.textContent=tr('A IA generativa não está disponível neste dispositivo. O organizador de informações continua funcionando.')}
  }
  function exitStudio(){ $('ai-studio').hidden=true;for(const id of ['inicio','jornadas','explorar'])$(id).hidden=false;const why=document.querySelector('.why');if(why)why.hidden=false;$('nav-ai').setAttribute('aria-pressed','false');$('nav-tools').setAttribute('aria-pressed','true') }
  function enableTab(ai){$('ai-studio').hidden=!ai;for(const id of ['inicio','jornadas','explorar'])$(id).hidden=ai;const why=document.querySelector('.why');if(why)why.hidden=ai;$('nav-ai').setAttribute('aria-pressed',String(ai));$('nav-tools').setAttribute('aria-pressed',String(!ai));if(ai){$('workspace').hidden=true;$('library').hidden=true;window.location.hash='ai';$('ai-studio').scrollIntoView({behavior:'smooth',block:'start'})}else{$('explorar').scrollIntoView({behavior:'smooth',block:'start'});window.location.hash='explorar'}}
  function initialize(){if(!$('ai-studio')||!window.CentralGeradores)return;
    $('nav-ai').onclick=()=>enableTab(true);$('nav-tools').onclick=()=>enableTab(false);window.addEventListener('cg:editor-open',exitStudio);
    $('ai-type').addEventListener('change',updateHelp);
    $('ai-generate').onclick=generate;
    $('ai-example').onclick=()=>{$('ai-request').value=sampleFor($('ai-type').value)||'';alertStatus(tr('Exemplo fictício carregado. Substitua por seus dados antes de usar.'))};
    $('ai-hex').addEventListener('input',e=>{const v=e.target.value.trim();if(!v){accent='#14785f';accentTouched=false;renderColors();return}if(/^#[0-9a-f]{6}$/i.test(v)){accent=v.toLowerCase();accentTouched=true;renderColors()}});
    renderCategories();renderTypes();renderLayouts();renderColors();checkAvailability();
    if(window.location.hash==='#ai')enableTab(true);
    window.addEventListener('cg:localechange',()=>{renderCategories();renderTypes();renderLayouts();renderColors();checkAvailability()});
  }
  window.CentralAssistantCore={parseRaw,styleFromNotes,colorFromNotes,parseItem,analyzeMissing};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();

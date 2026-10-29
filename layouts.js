'use strict';
/* Templates change section hierarchy and placement. No external calls or data storage. */
(()=>{
 const IDS=['classico','moderno','elegante'];
 const E=(tag,cls='',value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e};
 const add=(p,...cs)=>{for(const c of cs)if(c)p.append(c);return p};
 const val=(parent,tag,v,cls='')=>{if(String(v||'').trim())parent.append(E(tag,cls,v))};
 const section=(title,value,kind='p')=>{if(!String(value||'').trim())return null;const s=E('section','layout-section');s.append(E('h2','',title));if(kind==='ul'){const ul=E('ul','doc-list');String(value).split('\n').map(s=>s.trim()).filter(Boolean).slice(0,60).forEach(x=>ul.append(E('li','',x)));s.append(ul)}else s.append(E('p','',value));return s};
 const header=(kicker,title,sub,cls='')=>{const h=E('header','layout-head '+cls);add(h,E('span','layout-eyebrow',kicker),E('h1','',title));val(h,'p',sub,'layout-subtitle');return h};
 const date=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')?v.split('-').reverse().join('/'):(v||'—');
 const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n)||0);
 const num=v=>{let s=String(v??'').trim().replace(/\s/g,'');const n=Number(s.includes(',')?s.replace(/\./g,'').replace(',','.'):s);return Number.isFinite(n)&&n>=0?n:0};
 const meta=(pairs)=>{const g=E('div','layout-meta');pairs.forEach(([k,v])=>{const x=E('div','layout-meta-item');add(x,E('span','layout-meta-label',k),E('strong','',v||'—'));g.append(x)});return g};
 const warning=t=>E('p','doc-warning',t);
 function cv(root,t,d){
  if(t==='classico')return;
  root.replaceChildren();
  const contact=[d.city,d.phone,d.email,d.links].filter(Boolean).join('  ·  ');
  const title=header('CURRÍCULO PROFISSIONAL',d.name||'Seu nome',d.role||'Área de atuação',t==='moderno'?'layout-resume-head':'layout-resume-editorial');
  if(t==='moderno'){
   const cols=E('div','layout-resume-columns'),side=E('aside','layout-resume-aside'),main=E('div','layout-resume-main');
   add(side,section('Contato',contact),section('Habilidades',d.skills,'ul'),section('Formação',d.education,'ul'));
   add(main,section('Perfil profissional',d.summary),section('Experiência profissional',d.experience,'ul'));
   add(root,title,add(cols,side,main));
  }else{
   val(title,'p',contact,'layout-contact-centered');
   const main=E('div','layout-resume-editorial-body');
   add(main,section('Experiência profissional',d.experience,'ul'),section('Perfil',d.summary));
   const foot=E('div','layout-resume-footer-columns');
   add(foot,section('Formação',d.education,'ul'),section('Competências',d.skills,'ul'));
   add(root,title,main,foot);
  }
 }
 function quote(root,t,d){
  if(t==='classico')return;
  const table=root.querySelector('table'),total=root.querySelector('.doc-total');
  root.replaceChildren();
  const details=meta([['Cliente',d.client],['Emissão',date(d.date)],['Validade',date(d.validity)],['Execução',d.execution||'A combinar']]);
  const end=E('div','layout-quote-end');
  add(end,section('Pagamento',d.payment),section('Condições e observações',d.notes));
  const totalMoney=money((d.items||[]).reduce((sum,i)=>sum+Math.round(num(i.quantity)*num(i.price)*100),0)/100);
  if(t==='moderno'){
   const hero=E('div','layout-quote-banner'),badge=E('div','layout-quote-highlight');
   add(badge,E('small','','TOTAL'),E('strong','',totalMoney));
   add(hero,header('ORÇAMENTO DE SERVIÇOS',d.company||'Seu negócio',d.service),badge);
   const body=E('div','layout-quote-body');
   add(body,details,E('h2','','Itens do orçamento'),table);
   add(root,hero,body);
  }else{
   add(root,header('PROPOSTA DE SERVIÇOS',d.company||'Seu negócio',d.service,'layout-quote-formal-head'));
   add(root,E('p','layout-salutation','Proposta preparada para '+(d.client||'o cliente')+'.'),E('p','layout-quote-intro','Apresentamos abaixo os serviços e valores previstos para o trabalho descrito.'));
   const body=E('div','layout-quote-formal-body');
   add(body,details,E('h2','','Discriminação dos serviços'),table,total);
   root.append(body);
  }
  if(end.children.length)root.append(end);
  root.append(warning('Revise itens, escopo, prazos e condições antes de enviar.'));
 }
 function academic(root,t,d){
  if(t==='classico')return;
  const doc=root.querySelector('.doc-academic'),cover=doc?.querySelector('.academic-cover');
  if(!doc||!cover)return;
  doc.classList.add(t==='moderno'?'layout-academic-report':'layout-academic-monograph');
  if(t==='moderno'){
   cover.classList.add('layout-academic-compact-cover');
   cover.append(meta([['Aluno(a)',d.student],['Instituição',d.institution],['Turma/curso',d.course],['Ano',d.year]]));
  }else{
   cover.classList.add('layout-academic-title-cover');
   const body=doc.querySelector('.academic-body');
   if(body&&d.teacher){const preface=E('div','layout-academic-preface');val(preface,'p','Trabalho apresentado à instituição indicada, para fins acadêmicos. Confira as exigências antes da entrega.');body.prepend(preface)}
  }
 }
 function generic(root,t){
  if(t==='classico')return;
  const elements=[...root.children],pivot=elements.findIndex(n=>n.classList.contains('doc-rule'));
  if(pivot<0)return;
  const head=E('div','layout-generic-head'),rest=E('div','layout-generic-content');
  elements.slice(0,pivot).forEach(n=>head.append(n));elements.slice(pivot+1).forEach(n=>rest.append(n));
  if(t==='moderno'){
   const wrap=E('div','layout-generic-shell'),side=E('aside','layout-generic-side'),body=E('div','layout-generic-main');
   const children=[...rest.children],firstHeading=children.findIndex(n=>n.tagName==='H2');
   children.slice(0,firstHeading<0?Math.min(2,children.length):firstHeading).forEach(n=>side.append(n));
   [...rest.children].forEach(n=>body.append(n));
   add(wrap,side,body);add(root,head,wrap);
  }else{
   const body=E('div','layout-generic-editorial');
   while(rest.firstChild)body.append(rest.firstChild);
   add(root,head,body);
  }
 }
 function picker(target,type,selected,choose){
  if(!target)return;
  target.replaceChildren();
  const descriptions=type==='curriculo'?['Seções tradicionais','Contato e habilidades na lateral','Experiência em destaque']:
   type==='orcamento'?['Tabela clássica','Total em destaque','Proposta mais formal']:
   type==='trabalho'?['Capa separada','Capa compacta','Capa formal']:
   ['Leitura linear','Painel lateral','Composição editorial'];
  IDS.forEach((id,i)=>{
   const b=E('button','layout-choice');b.type='button';b.dataset.layout=id;
   b.setAttribute('aria-pressed',String(id===selected));
   b.setAttribute('aria-label',id+': '+descriptions[i]);
   const mini=E('span','layout-mini layout-mini-'+id);mini.setAttribute('aria-hidden','true');
   for(let j=0;j<4;j++)mini.append(E('i'));
   add(b,mini,E('strong','',({classico:'Clássico',moderno:'Moderno',elegante:'Elegante'})[id]),E('small','',descriptions[i]));
   b.onclick=()=>choose(id);target.append(b);
  });
 }
 window.GeneratorLayouts={
  apply(root,type,d){
   const theme=IDS.includes(d.__theme)?d.__theme:'classico';root.dataset.layout=theme;root.dataset.kind=type;
   if(type==='curriculo')cv(root,theme,d);
   else if(type==='orcamento')quote(root,theme,d);
   else if(type==='trabalho')academic(root,theme,d);
   else generic(root,theme);
  },renderPicker:picker
 };
})();
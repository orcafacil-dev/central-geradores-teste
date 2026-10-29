'use strict';
/* Modelos com composição real (e não só cores). Não lê, guarda nem transmite dados. */
(() => {
  const TYPES = ['classico','moderno','elegante'];
  const LABELS = {
    classico:{title:'Clássico',desc:'Linear, leitura direta'},
    moderno:{title:'Moderno',desc:'Colunas e destaques'},
    elegante:{title:'Elegante',desc:'Editorial, espaçamento amplo'}
  };
  const $el=(tag,cls='',value)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(value!==undefined)node.textContent=String(value);return node};
  const add=(parent,...nodes)=>{for(const n of nodes)if(n)parent.append(n);return parent};
  const text=(parent,tag,value,cls='')=>{if(String(value||'').trim())parent.append($el(tag,cls,value))};
  const block=(title,value,kind='p')=>{if(!String(value||'').trim())return null;const div=$el('section','layout-section');add(div,$el('h2','',title));if(kind==='ul'){
    const ul=$el('ul','doc-list');String(value).split('\n').map(v=>v.trim()).filter(Boolean).slice(0,60).forEach(v=>ul.append($el('li','',v)));div.append(ul)
  }else div.append($el('p','',value));return div};
  const pack=(parent,...children)=>add(parent,...children);
  const formatDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')?v.split('-').reverse().join('/'):(v||'—');
  const meta=(entries,cls='layout-meta')=>{const wrap=$el('div',cls);for(const [label,value] of entries){const item=$el('div','layout-meta-item');add(item,$el('span','layout-meta-label',label),$el('strong','',value||'—'));wrap.append(item)}return wrap};
  const heading=(kicker,title,description,klass='')=>{const h=$el('header','layout-head '+klass);add(h,$el('span','layout-eyebrow',kicker),$el('h1','',title));text(h,'p',description,'layout-subtitle');return h};
  const foot=(v)=>$el('p','doc-warning',v);
  const money=n=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n)||0);
  const toNumber=s=>{const v=String(s??'').trim().replace(/\s/g,'');if(!v)return 0;const n=Number(v.includes(',')?v.replace(/\./g,'').replace(',','.'):v);return Number.isFinite(n)&&n>=0?n:0};

  function resume(root,theme,d){
    if(theme==='classico')return;
    root.replaceChildren();
    const contact=[d.city,d.phone,d.email,d.links].filter(Boolean).join('  ·  ');
    const intro=heading('CURRÍCULO PROFISSIONAL',d.name||'Seu nome',d.role||'Área de atuação',theme==='moderno'?'layout-resume-head':'layout-resume-editorial');
    if(theme==='moderno'){
      const cols=$el('div','layout-resume-columns');
      const aside=$el('aside','layout-resume-aside');
      const main=$el('div','layout-resume-main');
      add(aside,block('Contato',contact),block('Habilidades',d.skills,'ul'),block('Formação',d.education,'ul'));
      add(main,block('Perfil profissional',d.summary),block('Experiência profissional',d.experience,'ul'));
      add(cols,aside,main);add(root,intro,cols);
    }else{
      text(intro,'p',contact,'layout-contact-centered');
      const main=$el('div','layout-resume-editorial-body');
      add(main,block('Experiência profissional',d.experience,'ul'),block('Perfil',d.summary));
      const cols=$el('div','layout-resume-footer-columns');
      add(cols,block('Formação',d.education,'ul'),block('Competências',d.skills,'ul'));
      add(root,intro,main,cols);
    }
  }
  function quote(root,theme,d){
    if(theme==='classico')return;
    // Reaproveitar a tabela original para garantir os mesmos itens e valores.
    const originalTable=root.querySelector('table');
    const originalTotal=root.querySelector('.doc-total');
    const originalBreakdown=root.querySelector('.quote-breakdown');
    root.replaceChildren();
    const details=meta([['Cliente',d.client],['Emissão',formatDate(d.date)],['Validade',formatDate(d.validity)],['Execução',d.execution||'A combinar']]);
    const footnote=foot('Revise itens, escopo, prazos e condições antes de enviar.');
    const payment=block('Pagamento',d.payment);
    const notes=block('Condições e observações',d.notes);
    if(theme==='moderno'){
      const banner=$el('div','layout-quote-banner');
      const highlight=$el('div','layout-quote-highlight');const calc=window.DocumentQuality.quoteTotals(d);const sum=calc.valid?calc.netCents/100:0;add(highlight,$el('small','','TOTAL'),$el('strong','',money(sum)));add(banner,heading('ORÇAMENTO DE SERVIÇOS',d.company||'Seu negócio',d.service),highlight);
      const content=$el('div','layout-quote-body');
      add(content,details,block('Itens do orçamento','Veja abaixo a discriminação dos serviços e materiais.'),originalTable,originalBreakdown);
      const columns=$el('div','layout-quote-end');add(columns,payment,notes);
      add(root,banner,content,columns,footnote);
    }else{
      const top=heading('PROPOSTA DE SERVIÇOS',d.company||'Seu negócio',d.service,'layout-quote-formal-head');
      const salutation=$el('p','layout-salutation',`Proposta preparada para ${d.client||'o cliente'}.`);
      const intro=$el('p','layout-quote-intro','Apresentamos abaixo os serviços e valores previstos para a execução do trabalho descrito.');
      const content=$el('div','layout-quote-formal-body');
      add(content,details,$el('h2','','Discriminação dos serviços'),originalTable,originalBreakdown,originalTotal);
      const columns=$el('div','layout-quote-end');add(columns,payment,notes);
      add(root,top,salutation,intro,content,columns,footnote);
    }
  }
  function academic(root,theme,d){
    if(theme==='classico')return;
    const main=root.querySelector('.doc-academic');
    if(!main)return;
    main.classList.add(theme==='moderno'?'layout-academic-report':'layout-academic-monograph');
    const cover=main.querySelector('.academic-cover');
    if(theme==='moderno'){
      cover?.classList.add('layout-academic-compact-cover');
      const details=meta([['Aluno(a)',d.student],['Instituição',d.institution],['Turma/curso',d.course],['Ano',d.year]]);
      cover?.append(details);
    }else{
      cover?.classList.add('layout-academic-title-cover');
      const body=main.querySelector('.academic-body');
      if(body&&d.teacher){const preface=$el('div','layout-academic-preface');text(preface,'p','Trabalho apresentado à instituição indicada, para fins acadêmicos. Confira exigências de apresentação e formatação antes da entrega.');body.prepend(preface)}
    }
  }
  function generic(root,theme){
    if(theme==='classico')return;
    const children=[...root.children];
    const sep=children.findIndex(n=>n.classList.contains('doc-rule'));
    if(sep<0)return;
    const head=$el('div','layout-generic-head');
    const rest=$el('div','layout-generic-content');
    for(const item of children.slice(0,sep))head.append(item);
    for(const item of children.slice(sep+1))rest.append(item);
    if(theme==='moderno'){
      const shell=$el('div','layout-generic-shell');
      const mini=$el('aside','layout-generic-side');
      const body=$el('div','layout-generic-main');
      // Separar o início do corpo e as seções; tabelas e blocos longos ficam integrais.
      const nodes=[...rest.children];const firstHeading=nodes.findIndex(n=>n.tagName==='H2');
      for(const el of nodes.slice(0,firstHeading<0?Math.min(2,nodes.length):firstHeading))mini.append(el);
      for(const el of nodes.filter(n=>n.parentNode===rest))body.append(el);
      add(shell,mini,body);add(root,head,shell);
    }else{
      const body=$el('div','layout-generic-editorial');
      while(rest.firstChild)body.append(rest.firstChild);
      add(root,head,body);
    }
  }
  function renderPicker(element,type,selected,onChange){
    if(!element)return;
    element.replaceChildren();
    const texts=type==='curriculo'?
      ['Tradicional: seções lineares','Duas colunas: contato lateral','Editorial: experiência em destaque']:
      type==='orcamento'?
      ['Tabela comercial clássica','Destaque de total e blocos','Proposta formal e detalhada']:
      type==='trabalho'?
      ['Capa acadêmica separada','Relatório com capa compacta','Capa formal e texto organizado']:
      ['Seções lineares','Painel lateral e corpo','Composição editorial'];
    for(const [index,id] of TYPES.entries()){
      const b=$el('button','layout-choice');b.type='button';b.dataset.layout=id;
      b.setAttribute('aria-pressed',String(id===selected));
      b.setAttribute('aria-label',`${LABELS[id].title}: ${texts[index]}`);
      const mini=$el('span','layout-mini layout-mini-'+id);mini.setAttribute('aria-hidden','true');
      const blocks=[$el('i'),$el('i'),$el('i'),$el('i')];for(const child of blocks)mini.append(child);
      const name=$el('strong','',LABELS[id].title);
      const desc=$el('small','',texts[index]);
      add(b,mini,name,desc);b.onclick=()=>onChange(id);element.append(b);
    }
  }
  window.GeneratorLayouts={apply(root,type,d){const theme=TYPES.includes(d.__theme)?d.__theme:'classico';root.dataset.layout=theme;root.dataset.kind=type;
    if(type==='curriculo')resume(root,theme,d);
    else if(type==='orcamento')quote(root,theme,d);
    else if(type==='trabalho')academic(root,theme,d);
    else generic(root,theme);
  },renderPicker,TYPES};
})();

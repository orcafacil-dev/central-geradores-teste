'use strict';
/* Journeys use only the data intentionally provided in this browser. No remote API. */
(()=>{
  const JOURNEYS=[
    {id:'servicos',icon:'▦',title:'Atender um cliente',description:'Orçamento → ordem de serviço → recibo',start:'orcamento',steps:['orcamento','ordem','recibo']},
    {id:'emprego',icon:'▤',title:'Conseguir uma oportunidade',description:'Currículo → carta de apresentação',start:'curriculo',steps:['curriculo','apresentacao']},
    {id:'estudos',icon:'☑',title:'Organizar os estudos',description:'Plano de estudos → checklist',start:'estudos',steps:['estudos','checklist']}
  ];
  const NEXT={orcamento:'ordem',ordem:'recibo',curriculo:'apresentacao',estudos:'checklist'};
  const decimal=v=>{
    const s=String(v??'').trim().replace(/\s/g,'');if(!s)return NaN;
    const n=Number(s.includes(',')?s.replace(/\./g,'').replace(',','.'):s);
    return Number.isFinite(n)&&n>=0&&n<=1e9?n:NaN;
  };
  const cap=(s,n=2000)=>typeof s==='string'?s.slice(0,n):'';
  const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
  const sumQuote=items=>(Array.isArray(items)?items:[]).reduce((total,i)=>{
    const q=decimal(i?.quantity),p=decimal(i?.price);
    return total+(Number.isFinite(q)&&Number.isFinite(p)?Math.round(q*p*100):0);
  },0)/100;
  const br=n=>n.toFixed(2).replace('.',',');
  function nextFor(source){return NEXT[source]||null}
  function transfer(source,target,raw){
    if(nextFor(source)!==target||!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Transição não permitida');
    const d=raw;
    if(source==='orcamento'){
      const items=(Array.isArray(d.items)?d.items:[]).slice(0,80);
      const details=items.filter(x=>cap(x?.description).trim()).map(x=>{
        const q=decimal(x.quantity);return `• ${cap(x.description,200)}${Number.isFinite(q)?' (previsto: '+q+(x.unit?' '+x.unit:'')+')':''}`
      }).join('\n');
      return {
        provider:cap(d.company),client:cap(d.client),date:today(),
        equipment:'',problem:cap(d.service),actions:'',parts:'',
        amount:br((window.DocumentQuality?.quoteTotals(d)?.netCents??Math.round(sumQuote(items)*100))/100),payment:cap(d.payment),
        notes:cap('Informações copiadas de um orçamento; confira escopo e valores antes de utilizar.\nItens previstos (não comprovam execução):\n'+details,4000)
      };
    }
    if(source==='ordem')return {
      receiver:cap(d.provider),payer:cap(d.client),
      amount:'', // Actual payment value MUST be supplied; never claim that a quoted price was paid.
      description:cap(d.problem),method:'',city:'',date:'' // Actual payment date MUST be supplied.
    };
    if(source==='curriculo')return {
      name:cap(d.name),role:cap(d.role),company:'',
      experience:cap(d.experience),strengths:cap(d.skills),reason:'',
      contact:[cap(d.email,200),cap(d.phone,80)].filter(Boolean).join(' · ')
    };
    if(source==='estudos')return {
      title:cap('Tarefas — '+(cap(d.title)||'Plano de estudos'),150),owner:cap(d.student),date:today(),
      description:cap(d.goal),tasks:cap((cap(d.subjects).split('\n').map(s=>s.trim()).filter(Boolean).slice(0,60).map(s=>'Estudar: '+s).join('\n')),7000)
    };
    throw Error('Transição não implementada');
  }
  window.DocumentFlows={JOURNEYS,NEXT,nextFor,transfer,sumQuote};
})();

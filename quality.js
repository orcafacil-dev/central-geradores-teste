'use strict';
/* Utilidades locais, sem rede: valor por extenso, documento numérico, totais e revisão contextual. */
(()=>{
  const parse=raw=>{
    const s=String(raw??'').trim().replace(/\s/g,'');
    if(!s)return NaN;
    const normalized=s.includes(',')?s.replace(/\./g,'').replace(',','.'):s;
    const n=Number(normalized);
    return Number.isFinite(n)&&n>=0&&n<=1e9?n:NaN;
  };
  const units=['un.','serviço','hora','diária','m²','m³','km','kg','litro'];
  const kinds=['Sem desconto','Percentual (%)','Valor (R$)'];
  function quoteTotals(data){
    const items=Array.isArray(data?.items)?data.items:[];
    let grossCents=0;
    for(const item of items){
      const q=parse(item?.quantity),p=parse(item?.price);
      if(!Number.isFinite(q)||!Number.isFinite(p)||q<=0)return {valid:false,reason:'Preencha quantidade e preço válidos.'};
      const subtotal=Math.round(q*p*100);
      if(!Number.isSafeInteger(subtotal)||subtotal>1e12)return {valid:false,reason:'O valor do item é excessivo.'};
      grossCents+=subtotal;
    }
    if(!Number.isSafeInteger(grossCents))return {valid:false,reason:'O valor total é excessivo.'};
    const kind=kinds.includes(data?.discountType)?data.discountType:kinds[0];
    let discountCents=0;
    if(kind!==kinds[0]){
      const n=parse(data?.discountValue);
      if(!Number.isFinite(n))return {valid:false,reason:'Desconto inválido.'};
      if(kind===kinds[1]){
        if(n>100)return {valid:false,reason:'O desconto percentual não pode exceder 100%.'};
        discountCents=Math.round(grossCents*n/100);
      }else discountCents=Math.round(n*100);
      if(discountCents>grossCents)return {valid:false,reason:'O desconto não pode ultrapassar o subtotal.'};
    }
    return {valid:true,grossCents,discountCents,netCents:grossCents-discountCents,kind};
  }
  const digits=s=>String(s??'').replace(/\D/g,'');
  function verifyId(s){
    const raw=String(s??'').trim();if(!raw)return {valid:true,empty:true};
    if(/[A-Za-z]/.test(raw))return {valid:false,reason:'Este protótipo valida apenas CPF/CNPJ numéricos; CNPJ alfanumérico não é suportado.'};
    if(/[^\d.\-/\s]/.test(raw))return {valid:false,reason:'Use somente números e a pontuação de CPF/CNPJ.'};
    const v=digits(raw);
    if(![11,14].includes(v.length)||/^(\d)\1+$/.test(v))return {valid:false,reason:'CPF/CNPJ inválido ou incompleto.'};
    const mod11=(base,weights)=>{
      let total=0;for(let i=0;i<base.length;i++)total+=Number(base[i])*weights[i];
      const x=total%11;return x<2?0:11-x;
    };
    if(v.length===11){
      const first=mod11(v.slice(0,9),[10,9,8,7,6,5,4,3,2]);
      const second=mod11(v.slice(0,10),[11,10,9,8,7,6,5,4,3,2]);
      return first===Number(v[9])&&second===Number(v[10])?{valid:true,kind:'CPF'}:{valid:false,reason:'Dígitos verificadores do CPF não conferem.'};
    }
    const first=mod11(v.slice(0,12),[5,4,3,2,9,8,7,6,5,4,3,2]);
    const second=mod11(v.slice(0,13),[6,5,4,3,2,9,8,7,6,5,4,3,2]);
    return first===Number(v[12])&&second===Number(v[13])?{valid:true,kind:'CNPJ'}:{valid:false,reason:'Dígitos verificadores do CNPJ não conferem.'};
  }
  const ones=['','um','dois','três','quatro','cinco','seis','sete','oito','nove'];
  const teens=['dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
  const tens=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
  const hundreds=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
  function triplet(n){
    if(n===100)return 'cem';
    const parts=[];const h=Math.floor(n/100);if(h)parts.push(hundreds[h]);n%=100;
    if(n>=10&&n<=19){parts.push(teens[n-10]);return parts.join(' e ')}
    const t=Math.floor(n/10);if(t)parts.push(tens[t]);n%=10;
    if(n)parts.push(ones[n]);return parts.join(' e ');
  }
  function integerWords(n){
    if(n===0)return 'zero';
    const groups=[Math.floor(n/1e6),Math.floor(n/1e3)%1000,n%1000];
    const parts=[];
    if(groups[0])parts.push(triplet(groups[0])+(groups[0]===1?' milhão':' milhões'));
    if(groups[1])parts.push(groups[1]===1?'mil':triplet(groups[1])+' mil');
    if(groups[2])parts.push(triplet(groups[2]));
    const last=groups[2];
    if(parts.length===1)return parts[0];
    if(last>0&&(last<100||last%100===0))return parts.slice(0,-1).join(' ')+' e '+parts.at(-1);
    return parts.join(' ');
  }
  function amountWords(amount){
    const n=parse(amount);if(!Number.isFinite(n)||n>=1e9)return '';
    const cents=Math.round(n*100);let reais=Math.floor(cents/100),centavos=cents%100;
    if(reais>=1e9)return '';
    const parts=[];
    if(reais)parts.push(integerWords(reais)+(reais===1?' real':reais>=1000000&&reais%1000000===0?' de reais':' reais'));
    if(centavos)parts.push(integerWords(centavos)+(centavos===1?' centavo':' centavos'));
    return parts.length?parts.join(' e '):'zero real';
  }
  function review(type,d){
    const tips=[];const has=k=>Boolean(String(d?.[k]??'').trim());
    if(type==='orcamento'){
      if(!has('payment'))tips.push('Informe a forma e as condições de pagamento.');
      if(!has('execution'))tips.push('Indique o prazo de execução.');
      if(!has('notes'))tips.push('Especifique materiais, exclusões e garantias aplicáveis.');
      if(d?.validity&&d?.date&&d.validity<d.date)tips.push('A validade está antes da data de emissão.');
      const t=quoteTotals(d);if(!t.valid)tips.push(t.reason);
    }
    if(type==='recibo'){
      if(!has('date'))tips.push('Informe a data real do pagamento.');
      if(!has('city'))tips.push('Inclua a cidade onde o pagamento foi registrado.');
      for(const [k,label] of [['receiverId','recebedor'],['payerId','pagador']]){
        const check=verifyId(d?.[k]);if(!check.valid)tips.push('Documento do '+label+': '+check.reason);
      }
      if(!Number.isFinite(parse(d?.amount))||parse(d?.amount)<=0)tips.push('Informe o valor efetivamente recebido.');
    }
    if(type==='curriculo'){
      if(!has('email')&&!has('phone'))tips.push('Inclua um contato profissional para retorno.');
      if(!has('summary'))tips.push('Um perfil de duas a quatro frases ajuda a apresentar sua experiência.');
      if(!has('experience'))tips.push('Sem emprego formal? Considere projetos, atividades e experiências reais.');
      if(!has('education'))tips.push('Adicione sua formação real, mesmo que ainda esteja em andamento.');
    }
    if(type==='trabalho'){
      if(!has('intro'))tips.push('A introdução deve apresentar objetivo e contexto.');
      if(!has('references'))tips.push('Liste somente as fontes que você realmente consultou.');
    }
    return tips.slice(0,5);
  }
  window.DocumentQuality={parse,units,kinds,quoteTotals,verifyId,amountWords,review};
})();

'use strict';
/* CSV local de orçamentos e controle de gastos; abre em planilhas, sem bibliotecas. */
(()=>{
 const parse=x=>window.DocumentQuality?.parse(x);
 const fmt=n=>(Math.round(n*100)/100).toFixed(2).replace('.',',');
 const protect=value=>{
   let s=String(value??'').replace(/[\u0000-\u001F]/g,' ').trim();
   // Evita que Excel/Calc executem formulas ao importar texto de terceiros.
   if(!/^-?\d+(?:,\d{1,2})?$/.test(s)&&(/^[=+\-@\t\r\n]/.test(s)||/^[\uFEFF\u200B]/.test(s)))s="'"+s;
   return '"'+s.replace(/"/g,'""')+'"';
 };
 const locale=()=>window.CentralI18n?.locale()||'pt';
 const labels={
  pt:{d:'Descrição',q:'Quantidade',u:'Unidade',p:'Preço unitário (BRL)',s:'Subtotal (BRL)',total:'Total (BRL)',discount:'Desconto (BRL)',gross:'Subtotal geral (BRL)',income:'Receita (BRL)',balance:'Saldo (BRL)',amount:'Valor (BRL)'},
  en:{d:'Description',q:'Quantity',u:'Unit',p:'Unit price (BRL)',s:'Subtotal (BRL)',total:'Total (BRL)',discount:'Discount (BRL)',gross:'Gross subtotal (BRL)',income:'Income (BRL)',balance:'Balance (BRL)',amount:'Amount (BRL)'},
  es:{d:'Descripción',q:'Cantidad',u:'Unidad',p:'Precio unitario (BRL)',s:'Subtotal (BRL)',total:'Total (BRL)',discount:'Descuento (BRL)',gross:'Subtotal bruto (BRL)',income:'Ingreso (BRL)',balance:'Saldo (BRL)',amount:'Importe (BRL)'},
  fr:{d:'Description',q:'Quantité',u:'Unité',p:'Prix unitaire (BRL)',s:'Sous-total (BRL)',total:'Total (BRL)',discount:'Remise (BRL)',gross:'Sous-total brut (BRL)',income:'Revenu (BRL)',balance:'Solde (BRL)',amount:'Montant (BRL)'},
  de:{d:'Beschreibung',q:'Menge',u:'Einheit',p:'Einzelpreis (BRL)',s:'Zwischensumme (BRL)',total:'Gesamt (BRL)',discount:'Rabatt (BRL)',gross:'Brutto-Zwischensumme (BRL)',income:'Einnahmen (BRL)',balance:'Saldo (BRL)',amount:'Betrag (BRL)'},
  it:{d:'Descrizione',q:'Quantità',u:'Unità',p:'Prezzo unitario (BRL)',s:'Subtotale (BRL)',total:'Totale (BRL)',discount:'Sconto (BRL)',gross:'Subtotale lordo (BRL)',income:'Entrate (BRL)',balance:'Saldo (BRL)',amount:'Importo (BRL)'}
 };
 function create(type,data){
  if(!['orcamento','gastos'].includes(type))throw Error('Esta ferramenta não produz planilha CSV.');
  const l=labels[locale()]||labels.pt,rows=[];
  if(type==='orcamento'){
   const totals=window.DocumentQuality?.quoteTotals(data);
   if(!totals?.valid)throw Error('Confira os itens e descontos antes de exportar.');
   rows.push([l.d,l.q,l.u,l.p,l.s]);
   for(const i of data.items||[]){const qty=parse(i.quantity),p=parse(i.price);rows.push([i.description,fmt(qty),i.unit||'un.',fmt(p),fmt(qty*p)])}
   rows.push(['','','',l.gross,fmt(totals.grossCents/100)]);
   if(totals.discountCents)rows.push(['','','',l.discount,fmt(totals.discountCents/100)]);
   rows.push(['','','',l.total,fmt(totals.netCents/100)]);
  }else{
   rows.push([l.d,l.amount]);let cents=0;
   for(const item of String(data.expenses||'').split(/\r?\n/)){
    if(!item.trim())continue;const sep=item.lastIndexOf(';');if(sep<=0)throw Error('Informe cada despesa como Descrição; Valor.');
    const description=item.slice(0,sep).trim(),value=parse(item.slice(sep+1));
    if(!description||!Number.isFinite(value))throw Error('Confira os valores das despesas.');
    cents+=Math.round(value*100);if(!Number.isSafeInteger(cents))throw Error('Total de despesas excessivo.');
    rows.push([description,fmt(value)]);
   }
   if(rows.length===1)throw Error('Adicione pelo menos uma despesa.');
   rows.push([l.total,fmt(cents/100)]);
   if(String(data.income||'').trim()){
    const income=parse(data.income);if(!Number.isFinite(income))throw Error('Confira a receita informada.');
    rows.push([l.income,fmt(income)],[l.balance,fmt(income-cents/100)]);
   }
  }
  // UTF-8 BOM para Excel; delimitador ; evita conflito com decimal comma PT-BR.
  return '\uFEFFsep=;\r\n'+rows.map(row=>row.map(protect).join(';')).join('\r\n')+'\r\n';
 }
 const blob=(type,data)=>new Blob([create(type,data)],{type:'text/csv;charset=utf-8'});
 window.CentralFinanceExport={create,blob};
})();

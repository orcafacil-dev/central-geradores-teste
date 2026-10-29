'use strict';
/* Exportacao local sem dependencias: Word Office Open XML (.docx) e HTML independente. */
(()=>{
 const encoder=new TextEncoder();
 const safeXml=value=>String(value??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
 const safeColor=c=>/^#[0-9a-fA-F]{6}$/.test(c||'')?c.slice(1).toUpperCase():'14785F';
 const safeFont=font=>({sans:'Arial',serif:'Georgia',compact:'Calibri'})[font]||'Arial';
 const safeSize=size=>({compacto:19,normal:22,grande:25})[size]||22; // Word half-points
 const crcTable=(()=>{const arr=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let i=0;i<8;i++)c=c&1?0xEDB88320^(c>>>1):c>>>1;arr[n]=c>>>0}return arr})();
 const crc32=bytes=>{let c=0xFFFFFFFF;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
 const u16=(v)=>[v&255,(v>>>8)&255],u32=v=>[v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255];
 function zipStore(files){
  const local=[],central=[];let offset=0;
  for(const [name,body] of Object.entries(files)){
   const filename=encoder.encode(name),data=typeof body==='string'?encoder.encode(body):body,crc=crc32(data),size=data.length;
   const header=Uint8Array.from([...u32(0x04034b50),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(size),...u32(size),...u16(filename.length),...u16(0)]);
   local.push(header,filename,data);
   const cd=Uint8Array.from([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(size),...u32(size),...u16(filename.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset)]);
   central.push(cd,filename);offset+=header.length+filename.length+size;
  }
  const centralSize=central.reduce((s,a)=>s+a.length,0),count=Object.keys(files).length;
  const end=Uint8Array.from([...u32(0x06054b50),...u16(0),...u16(0),...u16(count),...u16(count),...u32(centralSize),...u32(offset),...u16(0)]);
  const chunks=[...local,...central,end],out=new Uint8Array(chunks.reduce((s,a)=>s+a.length,0));let pos=0;
  for(const chunk of chunks){out.set(chunk,pos);pos+=chunk.length}return out;
 }
 const paragraph=(value,kind,opts)=>{
  const accent=safeColor(opts.accent),font=safeXml(safeFont(opts.font)),normal=safeSize(opts.size),big=kind==='title',heading=kind==='heading';
  const size=big?Math.round(normal*1.85):heading?Math.round(normal*1.25):normal;
  const color=big||heading?accent:'24343B';
  const before=heading?'260':'0',after=big?'220':heading?'130':'120';
  const text=String(value??'').replace(/\r\n/g,'\n').split('\n').map((line,i)=>(i?'<w:br/>':'')+'<w:t xml:space="preserve">'+safeXml(line)+'</w:t>').join('');
  const bold=big||heading?'<w:b/>':'';
  return `<w:p><w:pPr><w:spacing w:before="${before}" w:after="${after}" w:line="315" w:lineRule="auto"/></w:pPr><w:r><w:rPr>${bold}<w:color w:val="${color}"/><w:rFonts w:ascii="${font}" w:hAnsi="${font}"/><w:sz w:val="${size}"/></w:rPr>${text}</w:r></w:p>`;
 };
 function cell(text,opts){return `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/></w:tcPr>${paragraph(text,'body',opts)}</w:tc>`}
 function table(node,opts){
  const rows=[...node.querySelectorAll('tr')].slice(0,250);
  return `<w:tbl><w:tblPr><w:tblBorders><w:bottom w:val="single" w:sz="4" w:color="DAE5E2"/><w:insideH w:val="single" w:sz="4" w:color="DAE5E2"/></w:tblBorders></w:tblPr><w:tblGrid/>${rows.map(row=>`<w:tr>${[...row.children].map(cellNode=>cell(cellNode.textContent,opts)).join('')}</w:tr>`).join('')}</w:tbl>`;
 }
 function collect(node,opts,out=[]){
  if(node.nodeType!==1)return out;
  const tag=node.tagName?.toLowerCase();
  if(['script','style','button'].includes(tag)||node.getAttribute('aria-hidden')==='true')return out;
  if(tag==='table'){out.push(table(node,opts));return out}
  if(tag==='h1'){out.push(paragraph(node.textContent,'title',opts));return out}
  if(['h2','h3','h4'].includes(tag)){out.push(paragraph(node.textContent,'heading',opts));return out}
  if(tag==='p'||tag==='li'){const text=(tag==='li'?'• ':'')+node.textContent;if(text.trim())out.push(paragraph(text,'body',opts));return out}
  // Grupos formados so por spans/strong e nos de texto (ex.: valor total)
  const children=[...node.children];
  if(children.length && children.every(ch=>['span','strong','small','em','b','i','br'].includes(ch.tagName.toLowerCase()))){
   const parts=[...node.childNodes].map(ch=>(ch.textContent||'').trim()).filter(Boolean);
   const text=parts.length===2&&parts[0].length<=35?parts[0]+': '+parts[1]:parts.join(' ');
   if(text.trim())out.push(paragraph(text,'body',opts));return out;
  }
  if(children.length===0){const text=node.textContent.trim();if(text)out.push(paragraph(text,'body',opts));return out}
  for(const child of children)collect(child,opts,out);
  return out;
 }
 function embeddedLogo(opts){
  const image=opts.brand?.logo;
  if(typeof image!=='string'||image.length>240000)return null;
  const match=/^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(image);
  if(!match)return null;
  try{const data=atob(match[2]);if(!data||data.length>180000)return null;
    const bytes=Uint8Array.from(data,x=>x.charCodeAt(0));
    const isPng=match[1]==='png';
    if(isPng&&!(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71))return null;
    if(!isPng&&!(bytes[0]===255&&bytes[1]===216&&bytes[2]===255))return null;
    return {bytes,ext:isPng?'png':'jpg'};
  }catch{return null}
 }
 const drawing=(cx,cy)=>`<w:p><w:pPr><w:spacing w:after="180"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="1" name="Logotipo"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="2" name="Logotipo"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rIdLogo"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
 function createDocx(root,opts={}){
  if(!root||!root.children)throw Error('Prévia do documento indisponível');
  const logo=embeddedLogo(opts);
  const image=root.querySelector('.doc-brand-logo');
  const ratio=image?.naturalWidth&&image?.naturalHeight?image.naturalWidth/image.naturalHeight:3;
  const width=Math.min(1905000,Math.round(650000*ratio)),height=Math.min(650000,Math.round(width/ratio));
  const content=(logo?drawing(width,height):'')+(collect(root,opts).join('')||paragraph('Documento vazio','body',opts));
  const doc=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${content}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const title=safeXml(String(opts.title||'Documento').slice(0,140));
  const files={
   '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>',
   '_rels/.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>',
   'word/document.xml':doc,
   'docProps/core.xml':`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${title}</dc:title><dc:creator>Central de Geradores</dc:creator></cp:coreProperties>`,
   'docProps/app.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Central de Geradores</Application></Properties>'
  };
  if(logo){
    files['word/media/logo.'+logo.ext]=logo.bytes;
    files['word/_rels/document.xml.rels']='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.'+logo.ext+'"/></Relationships>';
  }
  return new Blob([zipStore(files)],{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
 }
 function createHtml(root,opts={}){
  const accent='#'+safeColor(opts.accent),font=safeFont(opts.font),title=safeXml(String(opts.title||'Documento').slice(0,140));
  const size=({compacto:10,normal:11,grande:12})[opts.size]||11;
  return `<!doctype html><html lang="${window.CentralI18n?.locale()==='pt'?'pt-BR':window.CentralI18n?.locale()||'pt-BR'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font:${size}pt/1.55 ${font},Arial,sans-serif;max-width:840px;margin:40px auto;padding:0 25px;color:#24343b}h1,h2,h3{color:${accent};break-after:avoid}h1{font-size:2em}h2{font-size:1.3em}p{white-space:pre-wrap}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #dae5e2;text-align:left;padding:9px}ul{padding-left:22px}.layout-resume-columns,.layout-resume-footer-columns,.layout-generic-shell{display:grid;grid-template-columns:1fr 2fr;gap:22px}.layout-resume-aside{padding:18px;background:#f3f7f5}.layout-quote-banner{padding:18px;border-top:5px solid ${accent}}.doc-warning{color:#63717a;font-size:.85em}.doc-brand-header{display:flex;align-items:center;gap:14px;border-bottom:2px solid ${accent};padding-bottom:12px;margin-bottom:18px}.doc-brand-logo{max-width:150px;max-height:75px;object-fit:contain}.doc-brand-heading{font-weight:600}.doc-brand-header[data-align=center]{flex-direction:column;text-align:center}.doc-brand-header[data-align=right]{flex-direction:row-reverse;text-align:right}.doc-brand-footer{border-top:1px solid #bbb;margin-top:24px;padding-top:12px;color:#526b64}.doc-brand-footer[data-align=center]{text-align:center}.doc-brand-footer[data-align=right]{text-align:right}@media print{@page{size:A4;margin:16mm}body{margin:0;padding:0}}</style></head><body>${root.innerHTML}</body></html>`;
 }
 const filename=(base,ext)=>String(base||'documento').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,65).replace(/^$/,'documento')+'.'+ext;
 function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3500)}
 window.DocumentExport={createDocx,createHtml,download,filename};
})();

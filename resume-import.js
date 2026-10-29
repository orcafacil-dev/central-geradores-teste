'use strict';
/* Curriculo existente: importacao opcional 100% local de TXT/DOCX, sem terceiros.
   Nao interpreta imagens ou PDF; nao cria experiencias, cargos nem qualificacoes. */
(()=>{
  const MAX_FILE=3_000_000,MAX_XML=1_500_000,MAX_TEXT=50_000;
  const NS='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const clean=s=>String(s||'').replace(/\r/g,'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim();
  const ascii=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const lines=s=>clean(s).split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,400);
  function safeRead(view,index,bytes,limit){if(index<0||index+bytes>limit)throw Error('Arquivo Word incompleto ou danificado.');return bytes===2?view.getUint16(index,true):view.getUint32(index,true)}
  async function docxText(file){
    if(!file||file.size>MAX_FILE)throw Error('O arquivo deve ter até 3 MB.');
    const data=await file.arrayBuffer(),v=new DataView(data),n=data.byteLength;
    if(n<22)throw Error('Arquivo Word inválido.');
    let end=-1;for(let i=n-22;i>=Math.max(0,n-65557);i--){if(safeRead(v,i,4,n)===0x06054b50){end=i;break}}
    if(end===-1)throw Error('Formato DOCX não reconhecido.');
    const count=safeRead(v,end+10,2,n),offset=safeRead(v,end+16,4,n);
    if(count>1000||offset>n-46)throw Error('Arquivo Word com estrutura inesperada.');
    let pos=offset,target=null;
    const decoder=new TextDecoder('utf-8',{fatal:false});
    for(let i=0;i<count;i++){
      if(safeRead(v,pos,4,n)!==0x02014b50)throw Error('Índice DOCX danificado.');
      const method=safeRead(v,pos+10,2,n),comp=safeRead(v,pos+20,4,n),size=safeRead(v,pos+24,4,n),nameLen=safeRead(v,pos+28,2,n),extra=safeRead(v,pos+30,2,n),comment=safeRead(v,pos+32,2,n),local=safeRead(v,pos+42,4,n);
      if(nameLen>500||pos+46+nameLen+extra+comment>n)throw Error('Índice DOCX inválido.');
      const name=decoder.decode(new Uint8Array(data,pos+46,nameLen));
      if(name==='word/document.xml')target={method,comp,size,local};
      pos+=46+nameLen+extra+comment;
    }
    if(!target)throw Error('Este DOCX não contém texto de documento.');
    if(target.comp>MAX_FILE||target.size>MAX_XML)throw Error('Documento grande demais para importação local.');
    const {method,comp,size,local}=target;
    if(safeRead(v,local,4,n)!==0x04034b50)throw Error('Dados do Word inválidos.');
    const start=local+30+safeRead(v,local+26,2,n)+safeRead(v,local+28,2,n);
    if(start+comp>n)throw Error('Arquivo Word incompleto.');
    const slice=data.slice(start,start+comp);
    let decoded;
    if(method===0)decoded=slice;
    else if(method===8){
      if(typeof DecompressionStream!=='function')throw Error('Este navegador não pode descompactar DOCX; importe um TXT.');
      try{
        const reader=new Blob([slice]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
        const chunks=[];let total=0;
        for(;;){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;
          if(total>MAX_XML){await reader.cancel().catch(()=>{});throw Error('Texto do DOCX maior que o limite seguro.');}
          chunks.push(value);
        }
        const bytes=new Uint8Array(total);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.byteLength}
        decoded=bytes.buffer;
      }catch(e){if(e.message.includes('limite seguro'))throw e;throw Error('Não foi possível descompactar este DOCX. Tente exportar como TXT.')}
    }else throw Error('Compactação do Word não suportada.');
    if(decoded.byteLength>MAX_XML||decoded.byteLength!==size)throw Error('Documento Word com tamanho inesperado.');
    const documentText=decoder.decode(decoded);
    if(/<!DOCTYPE|<!ENTITY/i.test(documentText))throw Error('Este DOCX contém definições XML que não são aceitas.');
    const doc=new DOMParser().parseFromString(documentText,'application/xml');
    if(doc.querySelector('parsererror'))throw Error('O XML do Word está danificado.');
    const paras=[...doc.getElementsByTagNameNS(NS,'p')];
    const result=paras.map(p=>[...p.getElementsByTagNameNS(NS,'t')].map(t=>t.textContent).join('')).filter(s=>s.trim()).join('\n');
    if(!result.trim())throw Error('Nenhum texto editável encontrado. Imagens não são lidas.');
    return result.slice(0,MAX_TEXT);
  }
  async function read(file){
    if(!file||file.size>MAX_FILE)throw Error('Selecione um arquivo de até 3 MB.');
    const ext=(file.name||'').toLowerCase().split('.').pop();
    if(ext==='txt')return clean(await file.text()).slice(0,MAX_TEXT);
    if(ext==='docx')return docxText(file);
    throw Error('Formato não suportado. Escolha Word .docx ou texto .txt.');
  }
  const groups={
    summary:['resumo profissional','perfil profissional','perfil','sobre mim','objetivo profissional','summary','profile','about me','objective','resumen profesional','perfil profesional'],
    experience:['experiencia profissional','experiencias profissionais','experiencia','historico profissional','experience','work experience','employment history','experiencia laboral','experiencia profesional'],
    education:['formacao academica','formacao','educacao','education','academic background','educacion','formacion academica'],
    skills:['habilidades','competencias','conhecimentos','skills','competencies','habilidades tecnicas','aptitudes','competencias tecnicas']
  };
  const direct={name:['nome completo','nome','full name','name','nombre'],role:['cargo','objetivo','profissao','role','position','puesto','puesto deseado'],city:['cidade','localizacao','city','location','ciudad'],phone:['telefone','celular','phone','mobile','tel','telefono'],email:['email','e-mail','correo electronico'],links:['linkedin','portfolio','portifolio','website','site']};
  const findGroup=s=>Object.entries(groups).find(([,terms])=>terms.includes(ascii(s).replace(/[:：]+$/,'')))?.[0];
  const findDirect=s=>Object.entries(direct).find(([,terms])=>terms.includes(ascii(s)))?.[0];
  function parse(raw){
    const input=clean(raw).slice(0,MAX_TEXT),ls=lines(input),values={},sections={summary:[],experience:[],education:[],skills:[]};
    let section=null,other=[],hasSections=false;
    for(const line of ls){
      const heading=findGroup(line);
      if(heading){section=heading;hasSections=true;continue}
      const pair=line.match(/^([^:：]{2,32})[:：]\s*(.{1,900})$/);
      const key=pair&&findDirect(pair[1]);
      if(key){if(!values[key])values[key]=pair[2].trim();continue}
      if(section){sections[section].push(line);continue}
      other.push(line);
    }
    const source=ls.join('\n');
    if(!values.email)values.email=source.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]||'';
    if(!values.links)values.links=source.match(/(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/in\/|github\.com\/)[^\s|,;]+/i)?.[0]||'';
    if(!values.phone)values.phone=source.match(/(?:\+?\d{1,3}[-\s]?)?\(?\d{2,3}\)?[-\s]?\d{4,5}[-\s]?\d{4}/)?.[0]||'';
    if(!values.name&&other[0]&&other[0].length<=85&&!/\d|@|https?:|linkedin|[;|]/i.test(other[0])){
      values.name=other.shift();
    }
    if(!values.role&&other[0]&&other[0].length<=85&&!/\d|@|https?:|[;|]/i.test(other[0]))values.role=other.shift();
    for(const [key,rows]of Object.entries(sections))if(rows.length)values[key]=rows.join('\n').slice(0,14000);
    const mapped=Object.keys(values).filter(k=>values[k]).length;
    // Unmapped content is retained for user review. Never silently treat it as a job history.
    return {values,unmapped:other.join('\n').slice(0,20000),hasSections,mapped,original:input};
  }
  window.CentralResumeImport={parse,read};
})();

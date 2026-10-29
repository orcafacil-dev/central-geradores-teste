'use strict';
/* Backup local versionado: valida estrutura e preserva itens existentes durante mesclagem.
   Não faz requisições de rede nem carrega conteúdo do backup como HTML. */
(()=>{
  const MAX=250;
  const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
  const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
  const safeText=(x,max=200)=>typeof x==='string'?x.slice(0,max):'';
  const dateLocal=(d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  function inspect(raw, known){
    if(!plain(raw)||raw.format!=='central-geradores-backup'||![1,2].includes(raw.version)||!Array.isArray(raw.documents)||raw.documents.length>MAX)throw Error('Arquivo de backup incompatível ou muito grande.');
    const seen=new Set();
    for(const d of raw.documents){
      if(!plain(d)||typeof d.id!=='string'||!d.id||d.id.length>90||typeof d.type!=='string'||!known.has(d.type)||!plain(d.data)||seen.has(d.id))throw Error('Backup contém documentos inválidos ou identificadores duplicados.');
      seen.add(d.id);
    }
    if(raw.version===2){
      if(raw.drafts!==undefined&&!plain(raw.drafts))throw Error('Rascunhos do backup inválidos.');
      if(raw.profile!==undefined&&!plain(raw.profile))throw Error('Perfil do backup inválido.');
      if(raw.brand!==undefined&&!plain(raw.brand))throw Error('Identidade visual do backup inválida.');
      if(raw.favorites!==undefined&&(!Array.isArray(raw.favorites)||raw.favorites.length>MAX||raw.favorites.some(x=>typeof x!=='string')))throw Error('Favoritos do backup inválidos.');
    }
    return {version:raw.version,count:raw.documents.length};
  }
  function merge(existing,incoming,idFactory){
    const byId=new Map(existing.map(d=>[d.id,d]));
    const result=existing.slice();let added=0,skipped=0,copied=0;
    for(const d of incoming){
      const original=byId.get(d.id);
      if(original){
        if(original.type===d.type&&JSON.stringify(original.data)===JSON.stringify(d.data)){skipped++;continue;}
        const copy={...d,id:idFactory()};
        if(byId.has(copy.id))throw Error('Não foi possível criar um identificador único.');
        if(result.length>=MAX)throw Error('Limite de 250 documentos. Exporte o histórico e exclua itens antigos antes de mesclar.');
        result.push(copy);byId.set(copy.id,copy);copied++;added++;
      }else{
        if(result.length>=MAX)throw Error('Limite de 250 documentos. Exporte o histórico e exclua itens antigos antes de mesclar.');
        result.push(d);byId.set(d.id,d);added++;
      }
    }
    return {documents:result,added,skipped,copied};
  }
  function snapshot(docs,drafts,profile,brand,favorites,language){
    return {format:'central-geradores-backup',version:2,exportedAt:new Date().toISOString(),documents:docs,drafts:plain(drafts)?drafts:{},profile:plain(profile)?profile:{},brand:plain(brand)?brand:{},favorites:Array.isArray(favorites)?favorites:[],language:safeText(language,12)};
  }
  window.CentralBackup={inspect,merge,snapshot,dateLocal,MAX};
})();

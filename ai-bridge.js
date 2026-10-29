'use strict';
/* Free, explicit bring-your-own-AI workflow. No API keys, requests or invisible uploads. */
(() => {
 const $=id=>document.getElementById(id);
 function promptText(type,description,notes,lang){
  const tool=window.CentralGeradores?.tools?.find(t=>t.id===type);
  const fields=(tool?.fields||[]).map(f=>`${f.label}: [valor fornecido, se existir]`).join('\n');
  const safety='Nunca invente fatos, dados pessoais, salários, experiências, pagamentos, fontes bibliográficas, datas ou números. Não crie comprovantes falsos. Se faltar informação, deixe em branco. Nunca inclua scripts, HTML ou links executáveis.';
  return `Assistente de documentos — Central de Geradores\nIdioma da saída: ${lang}\nTipo de documento: ${tool?.name||description||type}\n\nOrganize somente as informações a seguir. ${safety}\nResponda APENAS em linhas no formato «Rótulo: valor», usando quando possível os rótulos abaixo, para que o usuário possa colar o resultado de volta na Central. Não adicione Markdown nem bloco JSON.\n\nCampos possíveis:\n${fields}\n\nInformações do usuário:\n${notes.slice(0,5000)}\n\nPor fim: o usuário deverá revisar antes de gerar o arquivo.`;
 }
 function openPromptText(txt){const dialog=$('cg-ai-prompt-dialog'),area=$('cg-ai-prompt-preview');if(!dialog||!area)return;area.value=txt;dialog.showModal();area.focus();area.select()}
 async function copy(){const notes=$('ai-request').value.trim();if(notes.length<8){$('ai-request').focus();$('ai-status').textContent='Informe os dados do documento primeiro, depois copie o prompt.';return}
 const t=$('ai-type');const prompt=promptText(t.value,t.options[t.selectedIndex]?.textContent||'',notes,window.CentralI18n?.locale?.()||'pt');
 try{if(!navigator.clipboard?.writeText)throw Error('clipboard missing');await navigator.clipboard.writeText(prompt);$('ai-status').textContent='Prompt copiado. Você escolhe se deseja colá-lo em uma IA externa. A Central não enviou seus dados.'}catch{openPromptText(prompt);$('ai-status').textContent='Selecione e copie o texto do painel. Nenhum conteúdo foi enviado pela Central.'}
 }
 function init(){if(!$('cg-copy-ai-prompt'))return;$('cg-copy-ai-prompt').addEventListener('click',copy);$('cg-ai-prompt-close').addEventListener('click',()=>$('cg-ai-prompt-dialog').close())}
 window.CentralAIBridge={promptText};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

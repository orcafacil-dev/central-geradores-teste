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
 function openImport(){const d=$('cg-ai-import-dialog');d.showModal();$('cg-ai-import-text').focus()}
function applyImport(){const response=$('cg-ai-import-text').value.trim();if(response.length<8){$('cg-ai-import-text').focus();return}if($('ai-request').value.trim()&&!confirm('Substituir as informações atuais pelo texto colado?'))return;$('ai-request').value=response;$('cg-ai-import-dialog').close();$('ai-status').textContent='Resposta colocada nos campos de preparação. Confira as informações no editor.';$('ai-generate').click()}
function updateLabels(){const lang=window.CentralI18n?.locale?.()||'pt';const d={pt:['Copiar prompt preparado','Colar resposta da IA'],en:['Copy structured prompt','Paste AI response'],es:['Copiar prompt preparado','Pegar respuesta de IA'],fr:['Copier le prompt préparé','Coller la réponse de l’IA'],de:['Vorbereiteten Prompt kopieren','KI-Antwort einfügen'],it:['Copia il prompt preparato','Incolla risposta IA']};const words=d[lang]||d.en;$('cg-copy-ai-prompt').textContent=words[0];$('cg-import-ai-response').textContent=words[1]}
function init(){if(!$('cg-copy-ai-prompt'))return;$('cg-copy-ai-prompt').addEventListener('click',copy);$('cg-ai-prompt-close').addEventListener('click',()=>$('cg-ai-prompt-dialog').close());$('cg-import-ai-response').addEventListener('click',openImport);$('cg-ai-import-close').addEventListener('click',()=>$('cg-ai-import-dialog').close());$('cg-ai-import-apply').addEventListener('click',applyImport);updateLabels();window.addEventListener('cg:localechange',updateLabels)}
 window.CentralAIBridge={promptText};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

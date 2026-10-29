'use strict';
/* v1.3 — only presentation controls. Hidden native selectors remain canonical for saved data. */
(()=>{
 const $=id=>document.getElementById(id);
 const SWATCHES=['#14785f','#2058bd','#8f355d','#6946ad','#ad5428','#354456','#007b80','#537342','#a33770','#78523d','#202124','#167c8e'];
 const I18N={
  pt:{'Mais cores':'Mais cores','Escolha sua cor':'Escolha sua cor','Selecione uma cor pronta ou informe um código HEX.':'Selecione uma cor pronta ou informe um código HEX.','Cor personalizada (HEX)':'Cor personalizada (HEX)','Cancelar':'Cancelar','Aplicar cor':'Aplicar cor','Código HEX inválido. Use #RRGGBB.':'Código HEX inválido. Use #RRGGBB.','Adicionar marca':'Adicionar marca','Marca ativa':'Marca ativa','PNG ou JPG, até 2 MB':'PNG ou JPG, até 2 MB','Logotipo adicionado':'Logotipo adicionado','Remover':'Remover','Escolher imagem':'Escolher imagem','Profissional':'Profissional','Editorial':'Editorial','Compacta':'Compacta','Pequeno':'Pequeno','Padrão':'Padrão','Grande':'Grande'},
  en:{'Mais cores':'More colors','Escolha sua cor':'Choose your color','Selecione uma cor pronta ou informe um código HEX.':'Select a color or enter a HEX code.','Cor personalizada (HEX)':'Custom color (HEX)','Cancelar':'Cancel','Aplicar cor':'Apply color','Código HEX inválido. Use #RRGGBB.':'Invalid HEX code. Use #RRGGBB.','Adicionar marca':'Add branding','Marca ativa':'Branding active','PNG ou JPG, até 2 MB':'PNG or JPG, up to 2 MB','Logotipo adicionado':'Logo added','Remover':'Remove','Escolher imagem':'Choose image','Profissional':'Professional','Editorial':'Editorial','Compacta':'Compact','Pequeno':'Small','Padrão':'Default','Grande':'Large'},
  es:{'Mais cores':'Más colores','Escolha sua cor':'Elige tu color','Selecione uma cor pronta ou informe um código HEX.':'Elige un color o introduce un código HEX.','Cor personalizada (HEX)':'Color personalizado (HEX)','Cancelar':'Cancelar','Aplicar cor':'Aplicar color','Código HEX inválido. Use #RRGGBB.':'Código HEX inválido. Usa #RRGGBB.','Adicionar marca':'Añadir marca','Marca ativa':'Marca activa','PNG ou JPG, até 2 MB':'PNG o JPG, hasta 2 MB','Logotipo adicionado':'Logotipo añadido','Remover':'Quitar','Escolher imagem':'Elegir imagen','Profissional':'Profesional','Editorial':'Editorial','Compacta':'Compacta','Pequeno':'Pequeño','Padrão':'Predeterminado','Grande':'Grande'},
  fr:{'Mais cores':'Plus de couleurs','Escolha sua cor':'Choisissez votre couleur','Selecione uma cor pronta ou informe um código HEX.':'Choisissez une couleur ou saisissez un code HEX.','Cor personalizada (HEX)':'Couleur personnalisée (HEX)','Cancelar':'Annuler','Aplicar cor':'Appliquer','Código HEX inválido. Use #RRGGBB.':'Code HEX invalide. Utilisez #RRGGBB.','Adicionar marca':'Ajouter une identité','Marca ativa':'Identité active','PNG ou JPG, até 2 MB':'PNG ou JPG, 2 Mo max.','Logotipo adicionado':'Logo ajouté','Remover':'Retirer','Escolher imagem':'Choisir une image','Profissional':'Professionnel','Editorial':'Éditorial','Compacta':'Compacte','Pequeno':'Petit','Padrão':'Par défaut','Grande':'Grand'},
  de:{'Mais cores':'Mehr Farben','Escolha sua cor':'Farbe wählen','Selecione uma cor pronta ou informe um código HEX.':'Wählen Sie eine Farbe oder geben Sie einen HEX-Code ein.','Cor personalizada (HEX)':'Eigene Farbe (HEX)','Cancelar':'Abbrechen','Aplicar cor':'Farbe anwenden','Código HEX inválido. Use #RRGGBB.':'Ungültiger HEX-Code. Nutzen Sie #RRGGBB.','Adicionar marca':'Marke hinzufügen','Marca ativa':'Marke aktiv','PNG ou JPG, até 2 MB':'PNG oder JPG, bis 2 MB','Logotipo adicionado':'Logo hinzugefügt','Remover':'Entfernen','Escolher imagem':'Bild auswählen','Profissional':'Professionell','Editorial':'Editorial','Compacta':'Kompakt','Pequeno':'Klein','Padrão':'Standard','Grande':'Groß'},
  it:{'Mais cores':'Altri colori','Escolha sua cor':'Scegli un colore','Selecione uma cor pronta ou informe um código HEX.':'Scegli un colore o inserisci un codice HEX.','Cor personalizada (HEX)':'Colore personalizzato (HEX)','Cancelar':'Annulla','Aplicar cor':'Applica colore','Código HEX inválido. Use #RRGGBB.':'Codice HEX non valido. Usa #RRGGBB.','Adicionar marca':'Aggiungi brand','Marca ativa':'Brand attivo','PNG ou JPG, até 2 MB':'PNG o JPG, max 2 MB','Logotipo adicionado':'Logo aggiunto','Remover':'Rimuovi','Escolher imagem':'Scegli immagine','Profissional':'Professionale','Editorial':'Editoriale','Compacta':'Compatta','Pequeno':'Piccolo','Padrão':'Predefinito','Grande':'Grande'}
 };
 const VKEY={
  pt:['Escolha um modelo e personalize','Cores e tipografia para combinar com seu documento','Restaurar','Cor principal','Sobre os formatos','As cores e fontes aparecem no PDF. No Word, algumas composições em colunas são simplificadas para facilitar a edição.','Identidade visual','Logotipo, cabeçalho e rodapé · opcional','Logotipo','Escolher imagem','Salvar identidade padrão','Aplicar identidade salva','Apagar padrão','Seu logotipo fica neste navegador e é incluído nos documentos exportados. Faça backup se precisar preservar seus dados.','Exportar arquivo','PDF (imprimir)','Página HTML','Texto (.txt)','Selecione uma cor pronta ou informe um código HEX.','Cor personalizada (HEX)'],
  en:['Choose a layout and customize','Colors and typography to suit your document','Reset','Main color','About the formats','Colors and fonts appear in the PDF. In Word, some column layouts are simplified for easier editing.','Brand identity','Logo, header and footer · optional','Logo','Choose image','Save default branding','Apply saved branding','Clear default','Your logo remains in this browser and is included in exported documents. Make a backup to protect your data.','Export file','PDF (print)','HTML page','Text (.txt)','Choose a color or enter a HEX code.','Custom color (HEX)'],
  es:['Elige un modelo y personaliza','Colores y tipografía para tu documento','Restablecer','Color principal','Acerca de los formatos','Los colores y fuentes aparecen en el PDF. En Word, algunas columnas se simplifican para facilitar la edición.','Identidad visual','Logotipo, cabecera y pie · opcional','Logotipo','Elegir imagen','Guardar identidad predeterminada','Aplicar identidad guardada','Borrar identidad predeterminada','El logotipo permanece en este navegador y se incluye en los documentos exportados. Guarda una copia de seguridad.','Exportar archivo','PDF (imprimir)','Página HTML','Texto (.txt)','Elige un color o introduce un código HEX.','Color personalizado (HEX)'],
  fr:['Choisissez un modèle et personnalisez','Couleurs et typographie adaptées à votre document','Réinitialiser','Couleur principale','À propos des formats','Les couleurs et les polices figurent dans le PDF. Dans Word, certaines colonnes sont simplifiées pour faciliter la modification.','Identité visuelle','Logo, en-tête et pied de page · facultatif','Logo','Choisir une image','Enregistrer comme identité par défaut','Appliquer l’identité enregistrée','Supprimer l’identité par défaut','Votre logo reste dans ce navigateur et est inclus dans les fichiers exportés. Pensez à créer une sauvegarde.','Exporter un fichier','PDF (imprimer)','Page HTML','Texte (.txt)','Choisissez une couleur ou saisissez un code HEX.','Couleur personnalisée (HEX)'],
  de:['Vorlage wählen und anpassen','Farben und Schrift für Ihr Dokument','Zurücksetzen','Hauptfarbe','Über die Formate','Farben und Schriften bleiben im PDF erhalten. In Word werden einige Spaltenlayouts vereinfacht, damit sie bearbeitbar bleiben.','Visuelle Identität','Logo, Kopf- und Fußzeile · optional','Logo','Bild auswählen','Als Standardidentität speichern','Gespeicherte Identität anwenden','Standard entfernen','Ihr Logo bleibt in diesem Browser und wird in exportierte Dokumente eingefügt. Sichern Sie Ihre Daten regelmäßig.','Datei exportieren','PDF (drucken)','HTML-Seite','Text (.txt)','Farbe auswählen oder HEX-Code eingeben.','Eigene Farbe (HEX)'],
  it:['Scegli un modello e personalizza','Colori e caratteri per il tuo documento','Ripristina','Colore principale','Informazioni sui formati','Colori e font appaiono nel PDF. In Word alcuni layout a colonne sono semplificati per facilitare la modifica.','Identità visiva','Logo, intestazione e piè di pagina · facoltativo','Logo','Scegli immagine','Salva identità predefinita','Applica identità salvata','Elimina identità predefinita','Il tuo logo resta in questo browser e viene incluso nei documenti esportati. Effettua backup regolari.','Esporta file','PDF (stampa)','Pagina HTML','Testo (.txt)','Scegli un colore o inserisci un codice HEX.','Colore personalizzato (HEX)']
 };
 const VKEYS=['pick-model','appearance-caption','reset','color-main','formats-about','formats-help','brand-title','brand-caption','logo','choose-image','save-brand','apply-brand','clear-brand','brand-help','export-file','pdf-print','html-page','txt-file','color-description','color-hex'];
 const language=()=>window.CentralI18n?.locale?.()||'pt';
 const t=key=>(I18N[language()]||I18N.en)[key]||key;
 function setText(id,value){const node=$(id);if(node)node.textContent=t(value)}
 function choose(control,value){const select=$(control);if(!select)return;select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}))}
 function sync(){
  for(const [group,select] of [['cg-font-options','doc-font'],['cg-size-options','doc-size']]){
   const value=$(select)?.value;
   $(group)?.querySelectorAll('button[data-value]').forEach(btn=>{btn.setAttribute('aria-pressed',String(btn.dataset.value===value))});
  }
  const hex=$('custom-accent')?.value;
  if(hex)$('cg-more-colors')?.style.setProperty('--current-accent',hex);
 }
 function syncBrand(brand){
  if(!brand)return;
  const hasBrand=!!(brand.logo||brand.heading||brand.footer);
  const state=$('brand-state');if(state){state.dataset.configured=String(hasBrand);state.textContent=t(hasBrand?'Marca ativa':'Adicionar marca')}
  const thumb=$('brand-logo-thumb');if(thumb){thumb.hidden=!brand.logo;if(brand.logo&&thumb.src!==brand.logo)thumb.src=brand.logo;else if(!brand.logo)thumb.removeAttribute('src')}
  const fileLabel=$('brand-file-status');if(fileLabel)fileLabel.textContent=t(brand.logo?'Logotipo adicionado':'PNG ou JPG, até 2 MB');
 }
 let colorCandidate='#14785f';
 const validHEX=x=>/^#[0-9a-fA-F]{6}$/.test(x);
 function reflectDialog(){
   const value=$('cg-color-hex')?.value.trim()||'';
   colorCandidate=value;
   const ok=validHEX(value);
   $('cg-hex-preview')?.style.setProperty('--cg-color-preview',ok?value:'#d0d6d1');
   if($('cg-color-error'))$('cg-color-error').textContent=ok?'':t('Código HEX inválido. Use #RRGGBB.');
   $('cg-color-apply').disabled=!ok;
   $('cg-color-dialog-swatches')?.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color?.toLowerCase()===value.toLowerCase())));
 }
 function openColor(){
   const dialog=$('cg-color-dialog');if(!dialog)return;
   $('cg-color-hex').value=($('custom-accent')?.value||'#14785f').toUpperCase();reflectDialog();
   dialog.showModal();$('cg-color-hex').focus();
 }
 function closeColor(){$('cg-color-dialog')?.close()}
 function applyColor(){if(!validHEX(colorCandidate))return;const input=$('custom-accent');input.value=colorCandidate.toLowerCase();input.dispatchEvent(new Event('input',{bubbles:true}));closeColor()}
 function translateAdded(){
   document.querySelectorAll('[data-vkey]').forEach(el=>{const i=VKEYS.indexOf(el.dataset.vkey);if(i>=0)el.textContent=(VKEY[language()]||VKEY.en)[i]});
   const button=$('cg-more-colors')?.lastElementChild;if(button)button.textContent=t('Mais cores');
   for(const [id,arr] of [['cg-font-options',['Profissional','Editorial','Compacta']],['cg-size-options',['Pequeno','Padrão','Grande']]]){$(id)?.querySelectorAll('button').forEach((b,i)=>{b.textContent=t(arr[i])})}
   for(const [id,key] of [['brand-state',$('brand-state')?.dataset.configured==='true'?'Marca ativa':'Adicionar marca'],['brand-file-status',$('brand-logo-thumb')?.hidden===false?'Logotipo adicionado':'PNG ou JPG, até 2 MB'],['cg-color-title','Escolha sua cor'],['cg-color-cancel','Cancelar'],['cg-color-apply','Aplicar cor']])setText(id,key);
 }
 function init(){
   for(const [group,select] of [['cg-font-options','doc-font'],['cg-size-options','doc-size']])$(group)?.querySelectorAll('button[data-value]').forEach(b=>b.addEventListener('click',()=>choose(select,b.dataset.value)));
   const grid=$('cg-color-dialog-swatches');for(const color of SWATCHES){const b=document.createElement('button');b.type='button';b.className='cg-dialog-swatch';b.dataset.color=color;b.style.setProperty('--cg-color',color);b.setAttribute('aria-label',color);b.addEventListener('click',()=>{$('cg-color-hex').value=color.toUpperCase();reflectDialog()});grid.append(b)}
   $('cg-more-colors')?.addEventListener('click',openColor);
   $('cg-color-hex')?.addEventListener('input',reflectDialog);
   $('cg-color-hex')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('cg-color-apply').click()}});
   $('cg-color-close')?.addEventListener('click',closeColor);$('cg-color-cancel')?.addEventListener('click',closeColor);$('cg-color-apply')?.addEventListener('click',applyColor);
   $('cg-color-dialog')?.addEventListener('click',e=>{if(e.target===$('cg-color-dialog'))closeColor()});
   $('cg-export-pdf')?.addEventListener('click',()=>$('print-document')?.click());
   $('cg-export-details')?.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{$('cg-export-details').open=false}));
   document.addEventListener('click',e=>{const d=$('cg-export-details');if(d?.open&&!d.contains(e.target))d.open=false});
   window.addEventListener('cg:localechange',translateAdded);
   sync();translateAdded();
 }
 window.CentralVisualClean={sync,syncBrand};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
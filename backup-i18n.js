'use strict';
/* O diálogo de recuperação acompanha o idioma escolhido; conteúdo de usuários não é traduzido. */
(()=>{
 const words={
  pt:{title:'Restaurar backup',description:'Revise as opções antes de importar documentos. Seus dados permanecem neste aparelho.',merge:'Mesclar sem apagar',mergeHelp:'Adicionar documentos do arquivo; preservar os atuais e não sobrescrever seus ajustes.',replace:'Substituir todo o histórico',replaceHelp:'Apaga os documentos atuais. Em backups completos, restaura também seus rascunhos e preferências.',cancel:'Cancelar',inFile:n=>`${n} documento(s) no arquivo`,onDevice:n=>`${n} documento(s) atuais`,full:'Backup completo',legacy:'Backup antigo (somente documentos)'},
  en:{title:'Restore backup',description:'Review the choices before importing documents. Your information stays on this device.',merge:'Merge without deleting',mergeHelp:'Add documents from the file while preserving your current documents and changes.',replace:'Replace all saved documents',replaceHelp:'Removes current documents. Full backups also restore drafts and preferences.',cancel:'Cancel',inFile:n=>`${n} documents in file`,onDevice:n=>`${n} documents on device`,full:'Full backup',legacy:'Older backup (documents only)'},
  es:{title:'Restaurar copia',description:'Revisa las opciones antes de importar. Tus datos permanecen en este dispositivo.',merge:'Combinar sin borrar',mergeHelp:'Añadir documentos del archivo sin sobrescribir tus documentos actuales.',replace:'Reemplazar documentos',replaceHelp:'Elimina los documentos actuales. Las copias completas restauran borradores y preferencias.',cancel:'Cancelar',inFile:n=>`${n} documentos en el archivo`,onDevice:n=>`${n} documentos actuales`,full:'Copia completa',legacy:'Copia anterior (solo documentos)'},
  fr:{title:'Restaurer une sauvegarde',description:'Vérifiez les options avant l’importation. Vos données restent sur cet appareil.',merge:'Fusionner sans supprimer',mergeHelp:'Ajouter les documents sans écraser ceux déjà enregistrés.',replace:'Remplacer les documents',replaceHelp:'Supprime les documents actuels. Les sauvegardes complètes restaurent aussi brouillons et préférences.',cancel:'Annuler',inFile:n=>`${n} documents dans le fichier`,onDevice:n=>`${n} documents actuels`,full:'Sauvegarde complète',legacy:'Ancienne sauvegarde (documents seulement)'},
  de:{title:'Sicherung wiederherstellen',description:'Prüfen Sie die Auswahl vor dem Import. Ihre Daten bleiben auf diesem Gerät.',merge:'Zusammenführen ohne Löschen',mergeHelp:'Dokumente hinzufügen, ohne vorhandene Dokumente zu überschreiben.',replace:'Alle Dokumente ersetzen',replaceHelp:'Löscht aktuelle Dokumente. Vollständige Sicherungen stellen auch Entwürfe und Einstellungen wieder her.',cancel:'Abbrechen',inFile:n=>`${n} Dokumente in der Datei`,onDevice:n=>`${n} aktuelle Dokumente`,full:'Vollständige Sicherung',legacy:'Alte Sicherung (nur Dokumente)'},
  it:{title:'Ripristina backup',description:'Controlla le opzioni prima di importare. I dati restano su questo dispositivo.',merge:'Unisci senza eliminare',mergeHelp:'Aggiungi documenti senza sovrascrivere quelli esistenti.',replace:'Sostituisci i documenti',replaceHelp:'Elimina i documenti attuali. I backup completi ripristinano anche bozze e preferenze.',cancel:'Annulla',inFile:n=>`${n} documenti nel file`,onDevice:n=>`${n} documenti attuali`,full:'Backup completo',legacy:'Vecchio backup (solo documenti)'}
 };
 const language=()=>window.CentralI18n?.locale?.()||'pt';
 const t=(key,n)=>{const value=(words[language()]||words.en)[key]||words.pt[key]||key;return typeof value==='function'?value(n):value};
 const pairs=[['cg-backup-title','title'],['cg-backup-description','description'],['cg-backup-cancel','cancel'],['cg-backup-merge','merge'],['cg-backup-replace','replace']];
 function update(){
  for(const [id,key] of pairs){const el=document.getElementById(id);if(!el)continue;const label=el.querySelector('strong');(label||el).textContent=t(key)}
  for(const [id,key] of [['cg-backup-merge','mergeHelp'],['cg-backup-replace','replaceHelp']]){const el=document.getElementById(id)?.querySelector('small');if(el)el.textContent=t(key)}
 }
 window.CentralBackup.t=t;
 window.addEventListener('cg:localechange',update);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',update,{once:true});else update();
})();

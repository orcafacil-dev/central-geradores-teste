'use strict';
/* Selectors inside the page, with a mobile bottom sheet and no third-party dependencies. */
(() => {
 const done=new WeakSet(), triggers=new WeakMap();
 let active=null;
 const make=(tag,cls='',value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e};
 const isMobile=()=>matchMedia('(max-width:700px)').matches;
 const fieldName=s=>{
  if(s.getAttribute('aria-label'))return s.getAttribute('aria-label');
  if(s.id){const label=document.querySelector('label[for="'+s.id+'"]');if(label)return label.textContent.trim().replace(/:\s*$/,'')}
  const l=s.closest('label');if(l){const words=[...l.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join(' ').trim();return words||l.querySelector('.field-label')?.textContent?.trim()||'Escolher opção'}
  return 'Escolher opção';
 };
 function close(focus=true){if(!active)return;const b=active.button;active.layer.remove();b.setAttribute('aria-expanded','false');document.body.classList.remove('cg-dialog-open');active=null;if(focus&&b.isConnected)b.focus({preventScroll:true})}
 function popup(button,title,variant='options'){
  close(false);
  const layer=make('div','cg-layer'),backdrop=make('button','cg-backdrop');
  backdrop.type='button';backdrop.setAttribute('aria-label','Fechar opções');backdrop.onclick=()=>close();
  const menu=make('section','cg-menu cg-menu-'+variant);menu.setAttribute('role','dialog');menu.setAttribute('aria-modal','true');
  const head=make('div','cg-menu-header'),x=make('button','cg-menu-close','✕');
  x.type='button';x.setAttribute('aria-label','Fechar opções');x.onclick=()=>close();
  head.append(make('strong','',title),x);menu.append(head);layer.append(backdrop,menu);document.body.append(layer);
  document.body.classList.add('cg-dialog-open');active={layer,menu,button};
  if(!isMobile()){
   const rect=button.getBoundingClientRect(),w=Math.max(rect.width,Math.min(360,innerWidth-24));
   const left=Math.min(Math.max(rect.left,12),innerWidth-w-12),top=innerHeight-rect.bottom>=210?rect.bottom+7:Math.max(12,rect.top-360);
   Object.assign(menu.style,{position:'fixed',width:w+'px',left:left+'px',top:top+'px',maxHeight:Math.max(180,innerHeight-top-12)+'px'});
  }
  return menu;
 }
 function syncSelect(s){
  const b=triggers.get(s);if(!b)return;
  const choice=s.selectedOptions?.[0]?.textContent?.trim()||'Selecione',label=fieldName(s);
  b.setAttribute('aria-label',label+': '+choice);
  const text=b.querySelector('.cg-trigger-text');if(text.textContent!==choice)text.textContent=choice;
  b.dataset.empty=String(!s.value);
 }
 function selectMenu(s,b){
  const menu=popup(b,fieldName(s)),list=make('div','cg-options');list.setAttribute('role','listbox');list.setAttribute('aria-label',fieldName(s));
  const opts=[...s.options].filter(o=>!o.disabled&&!o.hidden),buttons=[];
  const choose=o=>{
   const changed=s.value!==o.value;s.value=o.value;
   if(changed){s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}))}
   syncSelect(s);close();
  };
  for(const o of opts){
   const row=make('button','cg-option');row.type='button';row.setAttribute('role','option');row.setAttribute('aria-selected',String(o.value===s.value));
   row.append(make('span','cg-option-name',o.textContent.trim()));
   if(o.value===s.value)row.append(make('span','cg-option-check','✓'));
   row.onclick=()=>choose(o);list.append(row);buttons.push(row);
  }
  if(!opts.length)list.append(make('p','cg-options-empty','Nenhuma opção disponível.'));
  menu.append(list);
  const pos=Math.max(0,opts.findIndex(o=>o.value===s.value));
  if(buttons[pos])requestAnimationFrame(()=>{buttons[pos].focus({preventScroll:true});buttons[pos].scrollIntoView({block:'nearest'})});
  menu.onkeydown=e=>{
   if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
   e.preventDefault();if(!buttons.length)return;
   const i=buttons.indexOf(document.activeElement);
   const target=e.key==='Home'?0:e.key==='End'?buttons.length-1:e.key==='ArrowDown'?Math.min(i+1,buttons.length-1):Math.max(i-1,0);
   buttons[target].focus();
  };
 }
 function enhanceSelect(s){
  if(done.has(s)||s.closest('.cg-layer')||s.hasAttribute('data-native-select'))return;
  done.add(s);s.classList.add('cg-native-select');s.tabIndex=-1;s.setAttribute('aria-hidden','true');
  const b=make('button','cg-trigger');b.type='button';b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-expanded','false');
  b.append(make('span','cg-trigger-text'),make('span','cg-chevron','⌄'));s.after(b);triggers.set(s,b);
  b.onclick=e=>{e.preventDefault();selectMenu(s,b)};
  s.addEventListener('input',()=>syncSelect(s));s.addEventListener('change',()=>syncSelect(s));s.addEventListener('click',e=>{e.preventDefault();b.click()});
  syncSelect(s);
 }
 const colors=[['Verde esmeralda','#14785f'],['Azul petróleo','#145c80'],['Azul royal','#2058bd'],['Vinho','#8f355d'],['Roxo','#6946ad'],['Grafite','#354456'],['Laranja queimado','#ad5428'],['Turquesa','#007b80'],['Marrom','#78523d'],['Rosa escuro','#a33770'],['Preto','#202124'],['Verde oliva','#537342']];
 function colorMenu(input,b,sync){
  const menu=popup(b,'Personalizar cor','color');
  menu.append(make('p','cg-color-hint','Escolha uma cor ou digite um código HEX.'));
  const grid=make('div','cg-color-grid');grid.setAttribute('role','group');grid.setAttribute('aria-label','Cores disponíveis');
  const hex=make('input','cg-hex-input');hex.type='text';hex.maxLength=7;hex.autocomplete='off';hex.spellcheck=false;hex.inputMode='text';
  const feedback=make('span','cg-color-feedback');feedback.setAttribute('role','status');
  const preview=make('span','cg-hex-preview'),buttons=[];
  let selected=input.value;
  const valid=x=>/^#[0-9a-f]{6}$/i.test(x);
  let apply;
  const reflect=()=>{
   const ok=valid(selected);preview.style.background=ok?selected:'#ddd';
   feedback.textContent=ok?'':'Informe uma cor HEX como #14785F.';
   apply.disabled=!ok;
   for(const [button,value] of buttons)button.setAttribute('aria-pressed',String(value.toLowerCase()===selected.toLowerCase()));
  };
  for(const [name,value] of colors){
   const option=make('button','cg-color-choice');option.type='button';option.style.setProperty('--cg-swatch',value);
   option.setAttribute('aria-label',name+' '+value);
   const color=make('span','cg-color-choice-swatch');color.setAttribute('aria-hidden','true');
   option.append(color,make('small','',name));option.onclick=()=>{selected=value;hex.value=value.toUpperCase();reflect()};
   buttons.push([option,value]);grid.append(option);
  }
  menu.append(grid);
  const label=make('label','cg-hex-label');label.append(make('span','','Cor personalizada (HEX)'));
  const hexRow=make('div','cg-hex-row');hexRow.append(preview,hex);label.append(hexRow,feedback);menu.append(label);
  const actions=make('div','cg-color-actions'),cancel=make('button','cg-color-cancel','Cancelar');
  cancel.type='button';cancel.onclick=()=>close();
  apply=make('button','cg-color-apply','Aplicar cor');apply.type='button';
  apply.onclick=()=>{
   if(!valid(selected))return;
   const value=selected.toLowerCase();
   if(input.value.toLowerCase()!==value){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))}
   sync();close();
  };
  actions.append(cancel,apply);menu.append(actions);
  hex.value=selected.toUpperCase();hex.addEventListener('input',()=>{selected=hex.value.trim();reflect()});
  hex.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();apply.click()}});
  reflect();requestAnimationFrame(()=>hex.focus({preventScroll:true}));
 }
 function enhanceColor(input){
  if(done.has(input))return;done.add(input);input.classList.add('cg-native-select');input.tabIndex=-1;input.setAttribute('aria-hidden','true');
  const b=make('button','cg-trigger cg-color-trigger');b.type='button';b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-expanded','false');
  b.append(make('span','cg-color-dot'),make('span','cg-trigger-text'),make('span','cg-chevron','⌄'));
  input.after(b);triggers.set(input,b);
  const sync=()=>{
   const value=/^#[\da-f]{6}$/i.test(input.value)?input.value.toUpperCase():'#14785F';
   b.querySelector('.cg-color-dot').style.background=value;
   const text=b.querySelector('.cg-trigger-text');if(text.textContent!==value)text.textContent=value;
   b.setAttribute('aria-label','Cor personalizada: '+value);
  };
  sync();input.addEventListener('input',sync);input.addEventListener('change',sync);
  input.addEventListener('click',e=>{e.preventDefault();b.click()});
  b.onclick=e=>{e.preventDefault();colorMenu(input,b,sync)};
 }
 function enhance(){
  document.querySelectorAll('select').forEach(enhanceSelect);
  document.querySelectorAll('input[type="color"]').forEach(enhanceColor);
  document.querySelectorAll('select').forEach(syncSelect);
 }
 document.addEventListener('keydown',e=>{
  if(!active)return;
  if(e.key==='Escape'){e.preventDefault();close();return}
  if(e.key==='Tab'){
   const focusable=[...active.menu.querySelectorAll('button:not([disabled]),input:not([disabled])')],i=focusable.indexOf(document.activeElement);
   if(!e.shiftKey&&i===focusable.length-1){e.preventDefault();focusable[0]?.focus()}
   if(e.shiftKey&&i===0){e.preventDefault();focusable[focusable.length-1]?.focus()}
  }
 });
 function init(){enhance();new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
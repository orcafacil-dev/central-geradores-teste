'use strict';
/* Controles personalizados sem APIs externas. O select original continua como fonte de verdade.
 * Inclui teclado, leitura por tecnologias assistivas e apresentação mobile em bottom sheet. */
(() => {
  const enhanced = new WeakSet();
  const triggers = new WeakMap();
  let active = null;
  let restoreFocus = null;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const prettyLabel = input => {
    const byAria = input.getAttribute('aria-label');
    if (byAria) return byAria;
    const explicit = input.id && document.querySelector(`label[for="${CSS.escape(input.id)}"]`);
    if (explicit) return explicit.textContent.trim().replace(/:\s*$/, '');
    const label = input.closest('label');
    if (label) {
      const textNode = [...label.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join(' ').trim();
      if (textNode) return textNode;
      return label.querySelector('.field-label')?.textContent?.trim() || 'Escolher opção';
    }
    return 'Escolher opção';
  };
  const selectedText = input => input.selectedOptions?.[0]?.textContent?.trim() || 'Selecione';
  const selectedValue = input => input.value || '';
  const mobile = () => window.matchMedia('(max-width: 700px)').matches;
  const pickColorLabel = '#custom-accent';
  const colorOptions = [
    ['Verde esmeralda','#14785f'], ['Azul petróleo','#145c80'], ['Azul royal','#2058bd'],
    ['Vinho','#8f355d'], ['Roxo','#6946ad'], ['Grafite','#354456'],
    ['Laranja queimado','#ad5428'], ['Turquesa','#007b80'], ['Marrom','#78523d'],
    ['Rosa escuro','#a33770'], ['Preto','#202124'], ['Verde oliva','#537342']
  ];

  function close(shouldFocus = true) {
    if (!active) return;
    active.overlay.remove();
    active.trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('cg-dialog-open');
    const focusNode = active.trigger;
    active = null;
    if (shouldFocus && focusNode.isConnected) focusNode.focus({preventScroll: true});
  }

  function overlayFor(trigger, heading, variant = 'options') {
    close(false);
    const layer = el('div', 'cg-layer');
    const backdrop = el('button', 'cg-backdrop');
    backdrop.type = 'button'; backdrop.setAttribute('aria-label','Fechar opções');
    backdrop.onclick = () => close();
    const menu = el('section', 'cg-menu cg-menu-'+variant);
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-modal', 'true');
    const header = el('div','cg-menu-header');
    header.append(el('strong','',heading));
    const x = el('button','cg-menu-close','✕');
    x.type='button'; x.setAttribute('aria-label', 'Fechar opções'); x.onclick=()=>close();
    header.append(x);menu.append(header);
    layer.append(backdrop,menu);document.body.append(layer);
    document.body.classList.add('cg-dialog-open');
    active={overlay:layer,menu,trigger};
    if (!mobile()) {
      const rect=trigger.getBoundingClientRect();
      const width=Math.max(rect.width,Math.min(360,window.innerWidth-24));
      const left=Math.min(Math.max(rect.left,12),window.innerWidth-width-12);
      const topSpace=window.innerHeight-rect.bottom;
      const top=topSpace>=210?rect.bottom+7:Math.max(12,rect.top-360);
      menu.style.position='fixed';menu.style.width=`${width}px`;
      menu.style.left=`${left}px`;menu.style.top=`${top}px`;
      menu.style.maxHeight=`${Math.max(180,window.innerHeight-top-12)}px`;
    }
    return menu;
  }

  function syncSelect(input){
    const btn=triggers.get(input);
    if(!btn)return;
    const chosen=selectedText(input);
    const label=prettyLabel(input);
    btn.setAttribute('aria-label',`${label}: ${chosen}`);
    const txt=btn.querySelector('.cg-trigger-text');
    if(txt.textContent!==chosen)txt.textContent=chosen;
    btn.dataset.empty=String(!selectedValue(input));
  }
  function enhanceSelect(input){
    if(enhanced.has(input)||input.closest('.cg-layer')||input.hasAttribute('data-native-select')) return;
    enhanced.add(input);
    input.classList.add('cg-native-select');
    input.tabIndex=-1;input.setAttribute('aria-hidden','true');
    const button=el('button','cg-trigger');
    button.type='button';button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');
    button.append(el('span','cg-trigger-text'),el('span','cg-chevron','⌄'));
    input.after(button);triggers.set(input,button);
    button.onclick=(e)=>{e.preventDefault();openSelect(input,button)};
    input.addEventListener('change',()=>syncSelect(input));
    input.addEventListener('input',()=>syncSelect(input));
    syncSelect(input);
  }
  function openSelect(input,button){
    const heading=prettyLabel(input);
    const menu=overlayFor(button,heading);
    const list=el('div','cg-options');list.setAttribute('role','listbox');
    list.setAttribute('aria-label',heading);
    const opts=[...input.options].filter(o=>!o.disabled&&!o.hidden);
    const buttons=[];
    const choose=option=>{
      const changed=input.value!==option.value;
      input.value=option.value;
      if(changed){
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.dispatchEvent(new Event('change',{bubbles:true}));
      }
      syncSelect(input);
      close();
    };
    opts.forEach(option=>{
      const row=el('button','cg-option');row.type='button';
      row.setAttribute('role','option');
      row.setAttribute('aria-selected',String(option.value===input.value));
      row.append(el('span','cg-option-name',option.textContent.trim()));
      if(option.value===input.value)row.append(el('span','cg-option-check','✓'));
      row.onclick=()=>choose(option);
      list.append(row);buttons.push(row);
    });
    if(!opts.length)list.append(el('p','cg-options-empty','Nenhuma opção disponível.'));
    menu.append(list);
    const current=Math.max(0,opts.findIndex(o=>o.value===input.value));
    const selected=buttons[current];
    if(selected)requestAnimationFrame(()=>{selected.focus({preventScroll:true});selected.scrollIntoView({block:'nearest'})});
    menu.onkeydown=e=>{
      const idx=buttons.indexOf(document.activeElement);
      if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
        e.preventDefault();if(!buttons.length)return;
        const target=e.key==='Home'?0:e.key==='End'?buttons.length-1:e.key==='ArrowDown'?Math.min(idx+1,buttons.length-1):Math.max(idx-1,0);
        buttons[target].focus();
      }
    };
  }
  function enhanceColor(input){
    if(enhanced.has(input)||input.hasAttribute('data-ui-internal'))return;
    enhanced.add(input);
    input.classList.add('cg-native-select');input.tabIndex=-1;input.setAttribute('aria-hidden','true');
    const button=el('button','cg-trigger cg-color-trigger');button.type='button';
    button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-expanded','false');
    button.append(el('span','cg-color-dot'),el('span','cg-trigger-text'),el('span','cg-chevron','⌄'));
    input.after(button);triggers.set(input,button);
    const sync=()=>{
      const value=/^#[\da-f]{6}$/i.test(input.value)?input.value.toUpperCase():'#14785F';
      button.querySelector('.cg-color-dot').style.background=value;
      button.querySelector('.cg-trigger-text').textContent=value;
      button.setAttribute('aria-label',`Cor personalizada: ${value}`);
    };
    sync();input.addEventListener('input',sync);input.addEventListener('change',sync);
    button.onclick=(e)=>{e.preventDefault();openColor(input,button,sync)};
  }
  function openColor(input,button,sync){
    const menu=overlayFor(button,'Personalizar cor','color');
    const subtitle=el('p','cg-color-hint','Escolha uma cor ou digite um código HEX.');
    menu.append(subtitle);
    const grid=el('div','cg-color-grid');grid.setAttribute('role','group');grid.setAttribute('aria-label','Cores disponíveis');
    const hex=el('input','cg-hex-input');hex.type='text';hex.maxLength=7;
    hex.autocomplete='off';hex.spellcheck=false;hex.inputMode='text';
    let candidate=input.value;
    const swatchButtons=[];
    const feedback=el('span','cg-color-feedback');feedback.setAttribute('role','status');
    const preview=el('span','cg-hex-preview');
    function valid(c){return /^#[0-9a-f]{6}$/i.test(c)}
    function reflect(){
      const ok=valid(candidate);preview.style.background=ok?candidate:'#ddd';
      feedback.textContent=ok?'':'Informe uma cor HEX como #14785F.';
      apply.disabled=!ok;
      for(const [b,value] of swatchButtons)b.setAttribute('aria-pressed',String(value.toLowerCase()===candidate.toLowerCase()));
    }
    for(const [name,value] of colorOptions){
      const b=el('button','cg-color-choice');b.type='button';b.style.setProperty('--cg-swatch',value);
      b.setAttribute('aria-label',name+' '+value);b.setAttribute('aria-pressed',String(value.toLowerCase()===candidate.toLowerCase()));
      const sw=el('span','cg-color-choice-swatch');sw.setAttribute('aria-hidden','true');
      b.append(sw,el('small','',name));
      b.onclick=()=>{candidate=value;hex.value=value.toUpperCase();reflect()};
      swatchButtons.push([b,value]);grid.append(b);
    }
    menu.append(grid);
    const label=el('label','cg-hex-label');label.append(el('span','', 'Cor personalizada (HEX)'));
    const hexRow=el('div','cg-hex-row');hexRow.append(preview,hex);label.append(hexRow,feedback);menu.append(label);
    const footer=el('div','cg-color-actions');
    const cancel=el('button','cg-color-cancel','Cancelar');cancel.type='button';cancel.onclick=()=>close();
    const apply=el('button','cg-color-apply','Aplicar cor');apply.type='button';
    apply.onclick=()=>{
      if(!valid(candidate))return;
      const value=candidate.toLowerCase();
      if(input.value.toLowerCase()!==value){
        input.value=value;
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.dispatchEvent(new Event('change',{bubbles:true}));
      }
      sync();close();
    };
    footer.append(cancel,apply);menu.append(footer);
    hex.value=candidate.toUpperCase();
    hex.addEventListener('input',()=>{candidate=hex.value.trim();reflect()});
    hex.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();apply.click()}});
    reflect();requestAnimationFrame(()=>hex.focus({preventScroll:true}));
  }
  function enhance(){
    document.querySelectorAll('select').forEach(enhanceSelect);
    document.querySelectorAll('input[type="color"]').forEach(enhanceColor);
    document.querySelectorAll('select').forEach(syncSelect);
  }
  document.addEventListener('keydown',e=>{
    if(!active)return;
    if(e.key==='Escape'){e.preventDefault();close();}
    if(e.key==='Tab'){
      // Permite mover foco dentro do painel; ao sair, retorna ao botão de origem.
      const focusables=[...active.menu.querySelectorAll('button:not([disabled]),input:not([disabled])')];
      const i=focusables.indexOf(document.activeElement);
      if(!e.shiftKey&&i===focusables.length-1){e.preventDefault();focusables[0]?.focus()}
      if(e.shiftKey&&i===0){e.preventDefault();focusables[focusables.length-1]?.focus()}
    }
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  function init(){
    enhance();
    const observer=new MutationObserver(()=>enhance());
    observer.observe(document.body,{childList:true,subtree:true});
  }
})();
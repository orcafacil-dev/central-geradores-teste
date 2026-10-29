'use strict';
/* Central — planos e identidade. Nenhuma cobrança é executada neste protótipo.
   Autenticação Firebase é opcional. Entitlements pagos só poderão ser concedidos
   por um backend validando pagamento e token, NUNCA pelo navegador. */
(() => {
 const $=id=>document.getElementById(id);
 const QUOTA=20; const KEY='central-geradores.usage-preview.v1';
 const PRICES=Object.freeze({monthly:1290,annual:9990,lifetime:24900});
 const copy={
 pt:{plans:'Planos',account:'Minha conta',free:'Gratuito',monthly:'Mensal',annual:'Anual',lifetime:'Vitalício fundador',checkout:'Prévia do pagamento',prepare:'Ver formas de pagamento',login:'Entrar com Google',notReady:'Login Google depende da configuração segura do projeto. Seus documentos locais continuam disponíveis.',authReady:'Continuar com Google',demo:'Prévia comercial • Nenhum pagamento será realizado',guest:'Continuar sem conta',close:'Fechar'},
 en:{plans:'Plans',account:'Account',free:'Free',monthly:'Monthly',annual:'Yearly',lifetime:'Founder lifetime',checkout:'Payment preview',prepare:'See payment options',login:'Sign in with Google',notReady:'Google login requires a securely configured project. Your local documents remain available.',authReady:'Continue with Google',demo:'Commercial preview • No payment will be made',guest:'Continue without an account',close:'Close'},
 es:{plans:'Planes',account:'Mi cuenta',free:'Gratis',monthly:'Mensual',annual:'Anual',lifetime:'Vitalicio fundador',checkout:'Vista previa de pago',prepare:'Ver formas de pago',login:'Ingresar con Google',notReady:'El acceso con Google requiere configuración segura. Sus documentos locales siguen disponibles.',authReady:'Continuar con Google',demo:'Vista previa • No se realizará ningún pago',guest:'Continuar sin cuenta',close:'Cerrar'},
 fr:{plans:'Offres',account:'Mon compte',free:'Gratuit',monthly:'Mensuel',annual:'Annuel',lifetime:'À vie fondateur',checkout:'Aperçu du paiement',prepare:'Voir les moyens de paiement',login:'Connexion Google',notReady:'Connexion Google en attente de configuration sécurisée. Vos documents locaux restent disponibles.',authReady:'Continuer avec Google',demo:'Aperçu commercial • Aucun paiement effectué',guest:'Continuer sans compte',close:'Fermer'},
 de:{plans:'Tarife',account:'Mein Konto',free:'Kostenlos',monthly:'Monatlich',annual:'Jährlich',lifetime:'Gründer lebenslang',checkout:'Zahlungsvorschau',prepare:'Zahlarten ansehen',login:'Mit Google anmelden',notReady:'Google-Anmeldung erfordert sichere Einrichtung. Lokale Dokumente bleiben verfügbar.',authReady:'Mit Google fortfahren',demo:'Vorschau • Keine Zahlung wird ausgeführt',guest:'Ohne Konto fortfahren',close:'Schließen'},
 it:{plans:'Piani',account:'Account',free:'Gratis',monthly:'Mensile',annual:'Annuale',lifetime:'A vita fondatore',checkout:'Anteprima pagamento',prepare:'Mostra metodi di pagamento',login:'Accedi con Google',notReady:'Accesso Google richiede configurazione sicura. I documenti locali restano disponibili.',authReady:'Continua con Google',demo:'Anteprima • Nessun pagamento verrà effettuato',guest:'Continua senza account',close:'Chiudi'}
 };
 const locale=()=>{const l=window.CentralI18n?.locale?.()||'pt';return copy[l]||copy.pt};
 const safeLoad=()=>{try{const r=JSON.parse(localStorage.getItem(KEY));return r&&typeof r==='object'&&Array.isArray(r.events)?r.events.filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(x)).slice(-400):[]}catch{return []}};
 const monthId=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;
 const monthlyCount=()=>safeLoad().filter(date=>{const d=new Date(date);return !isNaN(d)&&monthId(d)===monthId()}).length;
 const meter=()=>{const n=monthlyCount();$('cg-usage-count').textContent=`${n} / ${QUOTA}`;$('cg-usage-progress').value=Math.min(n,QUOTA);$('cg-usage-note').textContent=n>=QUOTA?'Limite de exemplo atingido. No beta você pode continuar criando gratuitamente; nenhuma trava foi ativada.':'Contagem apenas neste aparelho. O limite não está sendo aplicado durante o beta.'};
 function setTab(kind){const p=$('cg-plan-section'), a=$('cg-account-section');p.hidden=kind!=='plans';a.hidden=kind!=='account';const ai=$('ai-studio');if(ai)ai.hidden=true;for(const id of ['inicio','jornadas','explorar'])$(id).hidden=true;const why=document.querySelector('.why');if(why)why.hidden=true;$('workspace').hidden=true;$('library').hidden=true;$('nav-tools').setAttribute('aria-pressed','false');$('nav-ai').setAttribute('aria-pressed','false');$('cg-nav-plans').setAttribute('aria-pressed',String(kind==='plans'));$('cg-nav-account').setAttribute('aria-pressed',String(kind==='account'));window.location.hash=kind==='plans'?'planos':'conta';$(kind==='plans'?'cg-plan-section':'cg-account-section').scrollIntoView({block:'start',behavior:'smooth'});meter();}
 function exitTab(){for(const id of ['inicio','jornadas','explorar'])$(id).hidden=false;const why=document.querySelector('.why');if(why)why.hidden=false;$('cg-plan-section').hidden=true;$('cg-account-section').hidden=true;$('cg-nav-plans').setAttribute('aria-pressed','false');$('cg-nav-account').setAttribute('aria-pressed','false')}
 function applyLang(){const t=locale();for(const [key,id] of [['plans','cg-nav-plans'],['account','cg-nav-account']])$(id).textContent=t[key];$('cg-google-login').textContent=t.login;$('cg-guest').textContent=t.guest;document.querySelectorAll('[data-cg-select-plan]').forEach(b=>b.textContent=t.prepare);$('cg-checkout-title').textContent=t.checkout;$('cg-checkout-warning').textContent=t.demo;}
 const money=(num)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(num/100);
 let chosen='monthly',method='card',auth=null,currentUser=null;
 function preview(plan){if(!Object.hasOwn(PRICES,plan))return;chosen=plan;method='card';$('cg-checkout-price').textContent=money(PRICES[plan]);$('cg-checkout-plan').textContent=locale()[plan];$('cg-pay-card').setAttribute('aria-pressed','true');$('cg-pay-pix').setAttribute('aria-pressed','false');$('cg-payment-help').textContent='Cartão: no futuro, formulário seguro do intermediador. Não informe dados aqui.';$('cg-checkout').showModal();}
 const useMethod=m=>{method=m;$('cg-pay-card').setAttribute('aria-pressed',String(m==='card'));$('cg-pay-pix').setAttribute('aria-pressed',String(m==='pix'));$('cg-payment-help').textContent=m==='card'?'Cartão: checkout hospedado por um processador, ainda não conectado.':'Pix: QR Code seria emitido pelo processador, apenas após integração segura. Nenhuma chave ou QR real nesta prévia.'};
 async function configureLogin(){const cfg=window.CG_FIREBASE_CONFIG;if(!cfg||!cfg.apiKey||!cfg.authDomain||!cfg.projectId||!cfg.appId){$('cg-account-status').textContent=locale().notReady;$('cg-google-login').disabled=true;return}
   try{
    const [{initializeApp,getApps},{getAuth,GoogleAuthProvider,signInWithPopup,onAuthStateChanged,signOut}]=await Promise.all([import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js')]);
    const app=getApps().length?getApps()[0]:initializeApp(cfg);const service=getAuth(app);auth={service,signIn:()=>signInWithPopup(service,new GoogleAuthProvider()),signOut:()=>signOut(service)};
    $('cg-google-login').disabled=false;
    onAuthStateChanged(service,user=>{currentUser=user;$('cg-account-status').textContent=user?`Conectado: ${user.displayName||user.email||'Conta Google'}. Seus documentos ainda ficam somente neste aparelho.`:'Conta não conectada. Você pode usar a Central sem entrar.';$('cg-google-login').hidden=!!user;$('cg-google-logout').hidden=!user});
   }catch(e){$('cg-google-login').disabled=true;$('cg-account-status').textContent='Login não carregou. A Central permanece disponível sem cadastro.';}
 }
 function init(){if(!$('cg-plan-section'))return;
  $('cg-nav-plans').onclick=()=>setTab('plans');$('cg-nav-account').onclick=()=>setTab('account');
  document.querySelectorAll('[data-cg-select-plan]').forEach(b=>b.onclick=()=>preview(b.dataset.cgSelectPlan));
  $('cg-pay-card').onclick=()=>useMethod('card');$('cg-pay-pix').onclick=()=>useMethod('pix');$('cg-checkout-close').onclick=()=>$('cg-checkout').close();$('cg-checkout').addEventListener('click',e=>{if(e.target===$('cg-checkout'))e.target.close()});
  $('cg-google-login').onclick=async()=>{if(!auth)return;try{await auth.signIn()}catch(e){$('cg-account-status').textContent='Não foi possível entrar. Verifique se esta origem foi autorizada no Firebase.'}};
  $('cg-google-logout').onclick=async()=>{if(auth)await auth.signOut()};
  $('cg-guest').onclick=()=>{$('nav-tools').click();exitTab()};$('cg-use-free').onclick=()=>{$('nav-tools').click();exitTab()};
  $('nav-tools').addEventListener('click',exitTab);$('nav-ai').addEventListener('click',exitTab);$('go-library').addEventListener('click',exitTab);window.addEventListener('cg:editor-open',exitTab);
  window.addEventListener('cg:document-saved',e=>{if(e.detail?.isNew){try{const events=safeLoad();events.push(new Date().toISOString());localStorage.setItem(KEY,JSON.stringify({events:events.slice(-400)}))}catch{}meter()}});
  window.addEventListener('cg:localechange',applyLang);
  applyLang();meter();configureLogin();
  if(location.hash==='#planos')setTab('plans');if(location.hash==='#conta')setTab('account');
 }
 window.CentralCommerce={PRICES,QUOTA,monthId,monthlyCount,preview,canBuy:false,authConfigured:()=>Boolean(auth)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

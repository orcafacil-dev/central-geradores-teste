/* Central de Geradores - PWA offline shell. No client documents or private data are cached by this worker. */
const CACHE='central-geradores-shell-v14';
const FILES=['./','./index.html','./visual-clean.css?v=1.3','./backup-ui.css?v=1.4','./backup-core.js?v=1.4','./backup-i18n.js?v=1.4','./visual-clean.js?v=1.3','./style.css?v=1.1','./layouts.css?v=1.3','./workflows.js?v=0.9','./doc-export.js?v=0.9','./app.js?v=1.4','./quality.js?v=0.9','./layouts.js?v=0.9','./choice-ui.js?v=1.3','./choice-ui.css?v=1.4','./assistant.js?v=1.2','./assistant.css?v=1.2','./i18n.js?v=1.2','./i18n.css?v=1.2','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./privacidade.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('central-geradores-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{})}return response}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
    return;
  }
  const path=new URL(event.request.url).pathname;
  const freshFirst=/\.(js|css)$/.test(path);
  const fromNetwork=()=>fetch(event.request).then(response=>{
    if(response.ok&&response.type==='basic'){
      const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});
    }
    return response;
  });
  if(freshFirst){event.respondWith(fromNetwork().catch(()=>caches.match(event.request)));return}
  event.respondWith(caches.match(event.request).then(hit=>hit||fromNetwork()));
});

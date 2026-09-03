// Sincronização do LMC com Firebase/Firestore.
// Mantém o funcionamento offline e usa o documento do posto como fonte de backup online.
(function(){
  const KEY='lmcDados';
  const FLAG='lmcCloudHydrated';
  let timer=null;
  let lastPayload='';

  function postoId(){
    try{return typeof lmcPostoId==='function' ? lmcPostoId() : (new URLSearchParams(location.search).get('posto')||'');}
    catch(e){return '';}
  }
  function db(){return window.lmcDb||null;}
  function ref(){
    const p=postoId();
    if(!db()||!p)return null;
    return db().collection('postos').doc(String(p)).collection('dados').doc('estado');
  }
  function local(){
    try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}
  }
  function payload(){
    const dados=local();
    return JSON.stringify(dados);
  }

  async function upload(){
    const r=ref();
    if(!r)return;
    const raw=payload();
    if(!raw || raw===lastPayload)return;
    const dados=JSON.parse(raw);
    await r.set({dados,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
    lastPayload=raw;
    document.documentElement.dataset.firebaseSync='ok';
  }

  async function hydrate(){
    const r=ref();
    if(!r || sessionStorage.getItem(FLAG)==='1')return;
    try{
      const snap=await r.get();
      if(snap.exists && snap.exists && snap.data() && snap.data().dados){
        const cloud=JSON.stringify(snap.data().dados);
        const current=payload();
        if(cloud!==current){
          localStorage.setItem(KEY,cloud);
          sessionStorage.setItem(FLAG,'1');
          location.reload();
          return;
        }
      }
      sessionStorage.setItem(FLAG,'1');
    }catch(e){console.warn('Firebase: não foi possível carregar os dados do posto.',e)}
  }

  async function start(){
    if(!window.lmcFirebaseOnline || !db() || !postoId())return;
    await hydrate();
    try{await upload()}catch(e){console.warn('Firebase: não foi possível sincronizar os dados.',e)}
    if(timer)clearInterval(timer);
    timer=setInterval(async()=>{try{await upload()}catch(e){console.warn('Firebase: sincronização pendente.',e)}},3000);
  }

  window.lmcSincronizarFirebase=start;
  window.addEventListener('load',()=>setTimeout(start,500));
})();

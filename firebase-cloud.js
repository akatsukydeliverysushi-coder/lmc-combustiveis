// Camada inicial de conexão com Firebase/Firestore.
// A aplicação continua funcionando localmente até a migração das rotinas para a nuvem.
(function(){
  function iniciarFirebase(){
    if(!window.firebase||!window.LMC_FIREBASE_CONFIG){console.warn('Firebase ainda não carregado.');return false;}
    if(!firebase.apps.length)firebase.initializeApp(window.LMC_FIREBASE_CONFIG);
    window.lmcAuth=firebase.auth();
    window.lmcDb=firebase.firestore();
    window.lmcFirebaseOnline=true;
    return true;
  }
  window.iniciarFirebase=iniciarFirebase;
  window.lmcSalvarDocumento=async function(colecao,id,dados){
    if(!window.lmcDb)throw new Error('Firestore não inicializado');
    return window.lmcDb.collection(colecao).doc(String(id)).set({...dados,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  };
})();

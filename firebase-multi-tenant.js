// Núcleo multi-posto do LMC. Usa Firestore como fonte online e mantém a aplicação atual compatível.
(function(){
  const COLECOES=['produtos','tanques','bombas','bicos','entradas','movimentacoes','reguas','vendas','turnos','responsaveis'];
  function postoId(){ return typeof postoAtualId==='function' ? (postoAtualId()||'') : (new URLSearchParams(location.search).get('posto')||''); }
  function usuario(){ return typeof usuarioAtual==='function' ? usuarioAtual() : null; }
  function caminho(nome){ const p=postoId(); if(!p) throw new Error('Posto não selecionado'); return lmcDb.collection('postos').doc(p).collection(nome); }
  async function salvarColecao(nome, item){ if(!window.lmcDb||!item) return; const dados={...item,postoId:postoId()}; const id=String(dados.id||Date.now()); dados.id=id; await caminho(nome).doc(id).set(dados,{merge:true}); return id; }
  async function listarColecao(nome){ if(!window.lmcDb||!postoId()) return []; const snap=await caminho(nome).get(); return snap.docs.map(d=>d.data()); }
  window.LMC_CLOUD_COLLECTIONS=COLECOES;
  window.lmcPostoId=postoId;
  window.lmcUsuarioFirebase=usuario;
  window.lmcSalvarColecao=salvarColecao;
  window.lmcListarColecao=listarColecao;
})();

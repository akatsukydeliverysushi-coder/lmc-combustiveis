function renderBackup(){
  const totalProdutos=state.produtos.length;
  const totalTanques=state.tanques.length;
  const totalEntradas=state.entradas.length;
  const totalMovimentacoes=state.movimentacoes.length;
  m('Backup e Restauração',`<h2>💾 Backup e Restauração</h2><p class="muted">Faça uma cópia dos dados do LMC para guardar com segurança ou transferir para outro computador.</p><div class="summary"><div><span>Produtos</span><strong>${totalProdutos}</strong></div><div><span>Tanques</span><strong>${totalTanques}</strong></div><div><span>Entradas</span><strong>${totalEntradas}</strong></div><div><span>Movimentações</span><strong>${totalMovimentacoes}</strong></div></div><div class="subsection"><h3>📤 Exportar backup</h3><p class="muted">O arquivo contém o cadastro do posto, produtos, tanques, bombas, bicos, entradas e movimentações armazenados neste dispositivo.</p><div class="actions"><button class="primary" onclick="exportarBackup()">⬇️ Baixar backup</button></div></div><div class="subsection"><h3>📥 Importar backup</h3><p class="muted">Use um arquivo de backup gerado pelo LMC. A importação substituirá os dados atuais deste navegador.</p><input id="backupArquivo" type="file" accept="application/json,.json" onchange="importarBackup(event)"></div><div class="formnotice">🔒 Os dados atuais ficam armazenados neste navegador. Faça backups periódicos, principalmente antes de trocar de computador ou limpar os dados do navegador.</div><button onclick="back()">Voltar</button>`)
}
function exportarBackup(){
  const dados={posto:state.posto||{},produtos:state.produtos||[],tanques:state.tanques||[],bombas:state.bombas||[],bicos:state.bicos||[],entradas:state.entradas||[],movimentacoes:state.movimentacoes||[]};
  const pacote={versao:'1.0',tipo:'LMC Combustíveis',geradoEm:new Date().toISOString(),dados};
  const blob=new Blob([JSON.stringify(pacote,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const nomePosto=(state.posto&&((state.posto.fantasia||state.posto.nome)))||'posto';
  const nomeSeguro=nomePosto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase()||'posto';
  a.href=url;a.download=`backup-lmc-${nomeSeguro}-${dataHoje()}.json`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  alert('Backup baixado com sucesso. Guarde este arquivo em local seguro.');
}
function validarBackup(obj){
  if(!obj||typeof obj!=='object')return false;
  const d=obj.dados||obj;
  if(!d||typeof d!=='object')return false;
  const listas=['produtos','tanques','bombas','bicos','entradas','movimentacoes'];
  return listas.every(k=>Array.isArray(d[k]));
}
function importarBackup(e){
  const arquivo=e.target.files&&e.target.files[0];
  if(!arquivo)return;
  const leitor=new FileReader();
  leitor.onload=()=>{
    try{
      const obj=JSON.parse(leitor.result);
      if(!validarBackup(obj))throw new Error('Formato inválido');
      const d=obj.dados||obj;
      if(!confirm('ATENÇÃO: a importação substituirá todos os dados atuais deste navegador. Deseja continuar?')){e.target.value='';return;}
      state.posto=d.posto&&typeof d.posto==='object'?d.posto:{};
      state.produtos=d.produtos;
      state.tanques=d.tanques;
      state.bombas=d.bombas;
      state.bicos=d.bicos;
      state.entradas=d.entradas;
      state.movimentacoes=d.movimentacoes;
      state.tanques.forEach((t,i)=>{if(t.estoqueAtual===undefined)t.estoqueAtual=0;if(!t.id)t.id=Date.now()+i});
      state.bombas.forEach((b,i)=>{if(!b.id)b.id=Date.now()+1000+i});
      state.bicos.forEach((b,i)=>{if(!b.id)b.id=Date.now()+2000+i});
      save();
      alert('Backup restaurado com sucesso.');
      renderBackup();
    }catch(err){alert('Não foi possível importar o backup. Verifique se o arquivo foi gerado pelo LMC.');e.target.value='';}
  };
  leitor.onerror=()=>{alert('Erro ao ler o arquivo de backup.');e.target.value='';};
  leitor.readAsText(arquivo,'UTF-8');
}
window.renderBackup=renderBackup;
window.exportarBackup=exportarBackup;
window.importarBackup=importarBackup;

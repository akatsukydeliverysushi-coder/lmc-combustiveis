/* LMC - Estoque inicial real e Livro LMC */
(function(){
  const n=v=>Number.parseFloat(String(v??'').replace(',','.'))||0;
  const fmt=v=>n(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const br=v=>{const p=String(v||'').split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:'—'};
  const hoje=()=>new Date().toISOString().slice(0,10);

  // Permite informar o estoque que já existia no tanque antes dos lançamentos do sistema.
  window.renderTanques=function(){
    m('Tanques',`<h2>🛢️ Tanques</h2><p class="muted">Cadastre os tanques e informe o estoque inicial real quando já houver combustível antes do primeiro lançamento.</p>
      <form onsubmit="addTanque(event)"><div class="formgrid">
        <label>Número<input id="tanqueNumero" required type="number" min="1"></label>
        <label>Produto<select id="tanqueProduto" required>${state.produtos.length?state.produtos.map(p=>`<option value="${esc(p.nome)}">${esc(p.nome)}</option>`).join(''):'<option value="">Cadastre produto primeiro</option>'}</select></label>
        <label>Capacidade (L)<input id="tanqueCap" required type="number" min="0" step="0.01"></label>
        <label>Estoque inicial (L)<input id="tanqueEstoqueInicial" type="number" min="0" step="0.01" value="0"></label>
      </div><div class="actions"><button class="primary" ${state.produtos.length?'':'disabled'}>Adicionar tanque</button></div></form>
      <div class="tablewrap"><table><thead><tr><th>Tanque</th><th>Produto</th><th>Capacidade</th><th>Estoque inicial</th><th>Estoque atual</th><th>Ação</th></tr></thead><tbody>${state.tanques.length?state.tanques.map((t,i)=>`<tr><td>${esc(t.numero)}</td><td>${esc(t.produto)}</td><td>${fmt(t.capacidade)} L</td><td>${fmt(t.estoqueInicial||0)} L</td><td><strong>${fmt(t.estoqueAtual)} L</strong></td><td><button onclick="definirEstoqueInicial(${i})">Definir inicial</button> <button class="danger" onclick="removeTanque(${i})">Excluir</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty">Nenhum tanque cadastrado.</td></tr>'}</tbody></table></div><button onclick="back()">Voltar</button>`);
  };

  window.addTanque=function(e){
    e.preventDefault();
    if(state.tanques.some(t=>String(t.numero)===String(tanqueNumero.value)))return alert('Número de tanque já cadastrado.');
    const cap=n(tanqueCap.value), inicial=n(tanqueEstoqueInicial.value);
    if(inicial>cap)return alert('O estoque inicial não pode ser maior que a capacidade do tanque.');
    state.tanques.push({id:Date.now(),numero:tanqueNumero.value,produto:tanqueProduto.value,capacidade:cap,estoqueInicial:inicial,estoqueAtual:inicial});
    save();renderTanques();
  };

  window.definirEstoqueInicial=function(i){
    const t=state.tanques[i];if(!t)return;
    const atual=n(t.estoqueAtual), antigo=n(t.estoqueInicial);
    const valor=prompt(`Estoque inicial real do Tanque ${t.numero} (L):`,String(antigo||0));
    if(valor===null)return;
    const inicial=n(valor);
    if(inicial<0||inicial>n(t.capacidade))return alert('Informe um estoque inicial entre 0 e a capacidade do tanque.');
    // Ajusta o estoque atual pela diferença, preservando as entradas/saídas já registradas.
    t.estoqueInicial=inicial;
    t.estoqueAtual=Math.max(0,atual+(inicial-antigo));
    save();renderTanques();
  };

  window.renderLivro=function(){
    const data=document.getElementById('lmcData')?.value||hoje();
    const entradas=(state.entradas||[]).filter(x=>String(x.data)===data);
    const vendas=(state.movimentacoes||[]).filter(x=>String(x.data)===data);
    const tanques=state.tanques||[];
    let totalEnt=0,totalVend=0;
    const rows=tanques.map(t=>{
      const ent=entradas.filter(x=>String(x.tanqueId)===String(t.id)||String(x.tanque)===String(t.numero)&&String(x.produto)===String(t.produto)).reduce((s,x)=>s+n(x.quantidade),0);
      const vend=vendas.filter(x=>String(x.tanqueId)===String(t.id)).reduce((s,x)=>s+n(x.litrosVendidos??x.litros),0);
      const estoqueInicial=n(t.estoqueInicial);
      const estoqueFinal=estoqueInicial+ent-vend;
      totalEnt+=ent;totalVend+=vend;
      return {t,ent,vend,estoqueInicial,estoqueFinal};
    });
    m('Livro LMC',`<h2>📘 Livro LMC</h2><p class="muted">Resumo diário de entradas, vendas e estoque. O estoque inicial vem do cadastro do tanque e não é confundido com a leitura do bico.</p>
      <div class="formgrid"><label>Data de consulta<input id="lmcData" type="date" value="${esc(data)}" onchange="renderLivro()"></label></div>
      <div class="summary"><div><span>Entradas do dia</span><strong>${fmt(totalEnt)} L</strong></div><div><span>Vendas do dia</span><strong>${fmt(totalVend)} L</strong></div></div>
      <h3>Movimentação por tanque</h3><div class="tablewrap"><table><thead><tr><th>Tanque</th><th>Produto</th><th>Estoque inicial</th><th>Entradas</th><th>Vendas</th><th>Estoque final</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td>Tanque ${esc(r.t.numero)}</td><td>${esc(r.t.produto)}</td><td>${fmt(r.estoqueInicial)} L</td><td>${fmt(r.ent)} L</td><td>${fmt(r.vend)} L</td><td><strong>${fmt(r.estoqueFinal)} L</strong></td></tr>`).join(''):'<tr><td colspan="6" class="empty">Nenhum tanque cadastrado.</td></tr>'}</tbody></table></div>
      <p class="muted">Fórmula: <strong>estoque final = estoque inicial + entradas − vendas</strong>.</p>
      <h3>Entradas do dia</h3><div class="tablewrap"><table><thead><tr><th>Data</th><th>NF</th><th>Produto</th><th>Tanque</th><th>Quantidade</th></tr></thead><tbody>${entradas.length?entradas.map(x=>`<tr><td>${br(x.data)}</td><td>${esc(x.notaFiscal||x.nf||'—')}</td><td>${esc(x.produto)}</td><td>${esc(x.tanqueNome||x.tanque||'—')}</td><td>${fmt(x.quantidade)} L</td></tr>`).join(''):'<tr><td colspan="5" class="empty">Nenhuma entrada na data selecionada.</td></tr>'}</tbody></table></div>
      <h3>Vendas por bico</h3><div class="tablewrap"><table><thead><tr><th>Bomba</th><th>Bico</th><th>Produto</th><th>Tanque</th><th>Inicial</th><th>Final</th><th>Vendido</th></tr></thead><tbody>${vendas.length?vendas.map(x=>`<tr><td>${esc(x.bicoNome||'—')}</td><td>${esc(x.bicoNumero||'—')}</td><td>${esc(x.produto)}</td><td>${esc(x.tanqueNome||'—')}</td><td>${fmt(x.leituraInicial)}</td><td>${fmt(x.leituraFinal)}</td><td><strong>${fmt(x.litrosVendidos??x.litros)} L</strong></td></tr>`).join(''):'<tr><td colspan="7" class="empty">Nenhuma venda na data selecionada.</td></tr>'}</tbody></table></div>
      <div class="actions"><button onclick="window.print()">🖨️ Imprimir LMC</button><button onclick="back()">Voltar</button></div>`);
  };
})();

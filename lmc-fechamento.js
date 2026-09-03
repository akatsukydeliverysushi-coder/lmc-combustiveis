/* LMC - Fechamento e conferência diária */
(function(){
  const n=v=>Number.parseFloat(String(v??'').trim().replace(',','.'))||0;
  const fmt=v=>n(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const br=v=>{const p=String(v||'').split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:'—'};
  const hoje=()=>new Date().toISOString().slice(0,10);
  const soma=(arr,fn)=>arr.reduce((s,x)=>s+n(fn(x)),0);
  const dataAnterior=d=>{const x=new Date(`${d}T12:00:00`);x.setDate(x.getDate()-1);return x.toISOString().slice(0,10)};

  window.renderLivro=function(){
    const data=document.getElementById('lmcData')?.value||hoje();
    const entradas=state.entradas||[], vendas=state.movimentacoes||[], tanques=state.tanques||[];
    const doDia=entradas.filter(x=>String(x.data)===data), vendasDia=vendas.filter(x=>String(x.data)===data);
    let totalEnt=0,totalVend=0,totalValor=0;
    const rows=tanques.map(t=>{
      const tid=String(t.id);
      const entAntes=soma(entradas.filter(x=>String(x.data)<data&&(String(x.tanqueId)===tid||String(x.tanque)===String(t.numero)&&String(x.produto)===String(t.produto))),x=>x.quantidade);
      const vendAntes=soma(vendas.filter(x=>String(x.data)<data&&String(x.tanqueId)===tid),x=>x.litrosVendidos??x.litros);
      const base=n(t.estoqueInicial);
      const inicial=base+entAntes-vendAntes;
      const ent=soma(doDia.filter(x=>String(x.tanqueId)===tid||String(x.tanque)===String(t.numero)&&String(x.produto)===String(t.produto)),x=>x.quantidade);
      const vend=soma(vendasDia.filter(x=>String(x.tanqueId)===tid),x=>x.litrosVendidos??x.litros);
      const valor=soma(vendasDia.filter(x=>String(x.tanqueId)===tid),x=>x.valorTotal);
      const final=inicial+ent-vend;
      totalEnt+=ent;totalVend+=vend;totalValor+=valor;
      const conf=data===hoje()?n(t.estoqueAtual)-final:null;
      return {t,inicial,ent,vend,valor,final,conf};
    });
    const divergentes=rows.filter(r=>r.conf!==null&&Math.abs(r.conf)>0.01);
    const confHtml=data===hoje()?(divergentes.length?`<div class="formnotice" style="border-color:#f3b3b3;background:#fff5f5;color:#8a1c1c"><strong>⚠️ Atenção:</strong> há ${divergentes.length} tanque(s) com diferença entre o estoque calculado e o estoque atual.</div>`:`<div class="formnotice" style="border-color:#b7dfc6;background:#f3fff6;color:#176b35"><strong>✅ Conferência OK:</strong> estoque calculado confere com o estoque atual.</div>`):`<div class="formnotice">ℹ️ Para datas anteriores a hoje, o estoque final é apresentado como cálculo histórico.</div>`;
    m('Livro LMC',`<h2>📘 Livro LMC</h2><p class="muted">Fechamento diário: <strong>estoque inicial + entradas − vendas = estoque final</strong>. A leitura do bico é usada somente para calcular a venda.</p>
      <div class="formgrid"><label>Data de consulta<input id="lmcData" type="date" value="${esc(data)}" onchange="renderLivro()"></label></div>
      <div class="summary"><div><span>Entradas do dia</span><strong>${fmt(totalEnt)} L</strong></div><div><span>Vendas do dia</span><strong>${fmt(totalVend)} L</strong></div><div><span>Valor das vendas</span><strong>R$ ${totalValor.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div></div>
      ${confHtml}
      <h3>Fechamento por tanque</h3><div class="tablewrap"><table><thead><tr><th>Tanque</th><th>Produto</th><th>Estoque inicial</th><th>Entradas</th><th>Vendas</th><th>Estoque final</th><th>Conferência</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td>Tanque ${esc(r.t.numero)}</td><td>${esc(r.t.produto)}</td><td>${fmt(r.inicial)} L</td><td>${fmt(r.ent)} L</td><td>${fmt(r.vend)} L</td><td><strong>${fmt(r.final)} L</strong></td><td>${r.conf===null?'Calculado':Math.abs(r.conf)<=0.01?'✅ OK':`⚠️ Diferença ${fmt(r.conf)} L`}</td></tr>`).join(''):'<tr><td colspan="7" class="empty">Nenhum tanque cadastrado.</td></tr>'}</tbody></table></div>
      <p class="muted">O estoque inicial de cada dia considera o estoque inicial cadastrado e todos os lançamentos anteriores à data consultada.</p>
      <h3>Entradas do dia</h3><div class="tablewrap"><table><thead><tr><th>Data</th><th>NF</th><th>Produto</th><th>Tanque</th><th>Quantidade</th></tr></thead><tbody>${doDia.length?doDia.map(x=>`<tr><td>${br(x.data)}</td><td>${esc(x.notaFiscal||x.nf||'—')}</td><td>${esc(x.produto)}</td><td>${esc(x.tanqueNome||x.tanque||'—')}</td><td>${fmt(x.quantidade)} L</td></tr>`).join(''):'<tr><td colspan="5" class="empty">Nenhuma entrada na data selecionada.</td></tr>'}</tbody></table></div>
      <h3>Vendas por bico</h3><div class="tablewrap"><table><thead><tr><th>Bomba</th><th>Bico</th><th>Produto</th><th>Tanque</th><th>Inicial</th><th>Final</th><th>Vendido</th><th>Valor</th></tr></thead><tbody>${vendasDia.length?vendasDia.map(x=>`<tr><td>${esc(x.bicoNome||'—')}</td><td>${esc(x.bicoNumero||'—')}</td><td>${esc(x.produto)}</td><td>${esc(x.tanqueNome||'—')}</td><td>${fmt(x.leituraInicial)}</td><td>${fmt(x.leituraFinal)}</td><td><strong>${fmt(x.litrosVendidos??x.litros)} L</strong></td><td>R$ ${fmt(x.valorTotal)}</td></tr>`).join(''):'<tr><td colspan="8" class="empty">Nenhuma venda na data selecionada.</td></tr>'}</tbody></table></div>
      <div class="actions"><button onclick="window.print()">🖨️ Imprimir fechamento</button><button onclick="back()">Voltar</button></div>`);
  };
})();

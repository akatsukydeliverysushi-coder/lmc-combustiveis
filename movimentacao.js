/* LMC - Movimentacao diaria / saida de combustivel */
(function(){
  function escM(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function litrosM(v){return Number.parseFloat(String(v).replace(',','.'))||0}
  function fmtM(v){return litrosM(v).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}
  function hojeM(){return new Date().toISOString().slice(0,10)}
  function brM(v){const p=String(v||'').split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:'—'}
  function ultimoBico(bicoId){
    const lista=state.movimentacoes.filter(x=>String(x.bicoId)===String(bicoId)).slice().sort((a,b)=>String(b.data).localeCompare(String(a.data))||(Number(b.criadoEm||0)-Number(a.criadoEm||0)));
    return lista[0]||null;
  }
  window.syncMovBico=function(){
    const b=document.getElementById('movBico'), i=document.getElementById('movLeituraInicial'), t=document.getElementById('movTanque');
    if(!b||!i)return;
    const bico=state.bicos.find(x=>String(x.id)===String(b.value));
    if(bico&&t)t.value=String(bico.tanqueId);
    const ult=ultimoBico(b.value);
    i.value=ult?Number(ult.leituraFinal||0).toFixed(3):'';
    window.updateMovCalculo&&window.updateMovCalculo();
  };
  window.updateMovCalculo=function(){
    const ini=litrosM(document.getElementById('movLeituraInicial')?.value), fim=litrosM(document.getElementById('movLeituraFinal')?.value), preco=litrosM(document.getElementById('movPreco')?.value);
    const l=Math.max(0,fim-ini), total=l*preco, el=document.getElementById('movCalculo');
    if(el)el.innerHTML=`Litros vendidos: <strong>${fmtM(l)} L</strong> &nbsp; • &nbsp; Valor total: <strong>R$ ${total.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong>`;
  };
  window.renderMovimentacao=function(){
    const bicos=state.bicos.map(b=>`<option value="${escM(b.id)}">${escM(b.bombaNome)} • Bico ${escM(b.numero)} • ${escM(b.produto)}</option>`).join('');
    const responsaveis=(typeof getUsuarios==='function'?getUsuarios():[]).map(u=>`<option value="${escM(u.nome||u.email||'')}">${escM(u.nome||u.email||'')}</option>`).join('');
    const movimentos=state.movimentacoes.slice().sort((a,b)=>String(b.data).localeCompare(String(a.data))||(Number(b.criadoEm||0)-Number(a.criadoEm||0)));
    m('Movimentação Diária',`<h2>📋 Saída / Movimentação Diária</h2><p class="muted">Informe as leituras do bico. O sistema calcula os litros vendidos, baixa o estoque do tanque e calcula o valor da venda.</p>
      <form onsubmit="addMovimentacao(event)">
        <div class="formgrid">
          <label>Data<input id="movData" required type="date" value="${hojeM()}"></label>
          <label>Bico<select id="movBico" required onchange="syncMovBico()">${bicos||'<option value="">Cadastre bomba e bico primeiro</option>'}</select></label>
          <label>Tanque<select id="movTanque" required disabled>${state.tanques.map(t=>`<option value="${escM(t.id)}">Tanque ${escM(t.numero)} — ${escM(t.produto)}</option>`).join('')||'<option>Cadastre um tanque primeiro</option>'}</select><input type="hidden" id="movTanqueId"></label>
          <label>Leitura inicial<input id="movLeituraInicial" required type="number" min="0" step="0.001" oninput="updateMovCalculo()"></label>
          <label>Leitura final<input id="movLeituraFinal" required type="number" min="0" step="0.001" oninput="updateMovCalculo()"></label>
          <label>Preço por litro (R$)<input id="movPreco" required type="number" min="0" step="0.001" oninput="updateMovCalculo()" placeholder="0,000"></label>
          <label>Responsável<input id="movResponsavel" list="responsaveisLmc" placeholder="Nome do responsável"><datalist id="responsaveisLmc">${responsaveis}</datalist></label>
          <label class="full">Observações<textarea id="movObservacoes" rows="3" placeholder="Informações adicionais"></textarea></label>
        </div>
        <div id="movCalculo" class="formnotice">Litros vendidos: <strong>0,00 L</strong> &nbsp; • &nbsp; Valor total: <strong>R$ 0,00</strong></div>
        <div class="actions"><button class="primary" ${bicos.length?'':'disabled'}>💾 Registrar movimentação</button><button type="button" onclick="back()">Voltar</button></div>
      </form>
      <div class="summary"><div><span>Movimentações</span><strong>${movimentos.length}</strong></div><div><span>Litros vendidos</span><strong>${fmtM(movimentos.reduce((s,x)=>s+litrosM(x.litrosVendidos),0))} L</strong></div><div><span>Valor total</span><strong>R$ ${movimentos.reduce((s,x)=>s+litrosM(x.valorTotal),0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div></div>
      <h3>Histórico de movimentações</h3><div class="tablewrap"><table><thead><tr><th>Data</th><th>Bico</th><th>Produto</th><th>Tanque</th><th>Inicial</th><th>Final</th><th>Litros</th><th>Preço/L</th><th>Total</th><th>Responsável</th><th>Ação</th></tr></thead><tbody>${movimentos.length?movimentos.map(x=>`<tr><td>${brM(x.data)}</td><td>${escM(x.bicoNome||x.bicoNumero)}</td><td>${escM(x.produto)}</td><td>${escM(x.tanqueNome)}</td><td>${fmtM(x.leituraInicial)}</td><td>${fmtM(x.leituraFinal)}</td><td><strong>${fmtM(x.litrosVendidos)} L</strong></td><td>R$ ${fmtM(x.precoLitro)}</td><td><strong>R$ ${fmtM(x.valorTotal)}</strong></td><td>${escM(x.responsavel)||'—'}</td><td><button class="danger" onclick="removeMovimentacao(${state.movimentacoes.indexOf(x)})">Excluir</button></td></tr>`).join(''):'<tr><td colspan="11" class="empty">Nenhuma movimentação registrada.</td></tr>'}</tbody></table></div>`);
    syncMovBico();
  };
  window.addMovimentacao=function(e){
    e.preventDefault();
    const bico=state.bicos.find(x=>String(x.id)===String(movBico.value));
    const tanque=state.tanques.find(x=>String(x.id)===String(movTanque.value));
    const ini=litrosM(movLeituraInicial.value), fim=litrosM(movLeituraFinal.value), preco=litrosM(movPreco.value);
    if(!bico||!tanque)return alert('Selecione um bico e um tanque.');
    if(String(bico.tanqueId)!==String(tanque.id))return alert('O bico selecionado não pertence a este tanque.');
    if(fim<ini)return alert('A leitura final não pode ser menor que a leitura inicial.');
    const litrosVendidos=fim-ini;
    if(litrosVendidos<=0)return alert('Informe uma leitura final maior que a inicial.');
    if(preco<=0)return alert('Informe um preço por litro válido.');
    const estoque=litrosM(tanque.estoqueAtual);
    if(litrosVendidos>estoque)return alert(`Estoque insuficiente no ${tanque.numero?'Tanque '+tanque.numero:'tanque'}. Estoque atual: ${fmtM(estoque)} L.`);
    const ult=ultimoBico(bico.id);
    if(ult&&ini<litrosM(ult.leituraFinal))return alert(`A leitura inicial não pode ser menor que a última leitura registrada (${fmtM(ult.leituraFinal)}).`);
    const item={id:Date.now(),criadoEm:Date.now(),data:movData.value,bicoId:bico.id,bicoNumero:bico.numero,bicoNome:`${bico.bombaNome} • Bico ${bico.numero}`,produto:bico.produto,tanqueId:tanque.id,tanqueNome:`Tanque ${tanque.numero}`,leituraInicial:ini,leituraFinal:fim,litrosVendidos,precoLitro:preco,valorTotal:litrosVendidos*preco,responsavel:movResponsavel.value.trim(),observacoes:movObservacoes.value.trim()};
    state.movimentacoes.push(item);tanque.estoqueAtual=estoque-litrosVendidos;save();alert(`Movimentação registrada. ${fmtM(litrosVendidos)} L baixados do estoque.`);renderMovimentacao();
  };
  window.removeMovimentacao=function(i){
    const item=state.movimentacoes[i];if(!item)return;
    const ult=ultimoBico(item.bicoId);
    if(ult&&String(ult.id)!==String(item.id))return alert('Para manter as leituras e o estoque corretos, exclua primeiro a movimentação mais recente deste bico.');
    const tanque=state.tanques.find(t=>String(t.id)===String(item.tanqueId));
    if(tanque&&litrosM(tanque.estoqueAtual)+litrosM(item.litrosVendidos)>litrosM(tanque.capacidade))return alert('Não é possível excluir: o estoque ultrapassaria a capacidade do tanque.');
    if(confirm('Excluir esta movimentação e devolver os litros ao estoque?')){if(tanque)tanque.estoqueAtual=litrosM(tanque.estoqueAtual)+litrosM(item.litrosVendidos);state.movimentacoes.splice(i,1);save();renderMovimentacao();}
  };
})();

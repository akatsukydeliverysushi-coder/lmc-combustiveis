(function(){
  'use strict';
  function isMobile(){return window.matchMedia&&window.matchMedia('(max-width: 768px)').matches}
  function renderMobilePanel(){
    if(!isMobile() || typeof modoPosto!=='function' || !modoPosto()) return;
    const module=document.getElementById('module'), cards=document.getElementById('cards'), welcome=document.getElementById('welcome');
    if(!module) return;
    if(cards) cards.classList.add('hidden');
    if(welcome) welcome.classList.add('hidden');
    module.classList.remove('hidden');
    module.innerHTML=`<div class="mobile-panel">
      <div class="mobile-head"><div><h2>📱 Operação pelo celular</h2><p>Lance os movimentos do posto de forma rápida.</p></div><button class="mobile-back" onclick="mobileVoltarPainel()">↩ Voltar</button></div>
      <div class="mobile-actions">
        <button onclick="mobileAbrir('Entradas')"><b>📥</b><span>Entrada de combustível</span><small>Registrar recebimento</small></button>
        <button onclick="mobileAbrir('Movimentação Diária')"><b>⛽</b><span>Lançar venda / saída</span><small>Registrar leitura do bico</small></button>
        <button onclick="mobileAbrir('Livro LMC')"><b>📘</b><span>Livro LMC</span><small>Consultar fechamento do dia</small></button>
        <button onclick="mobileAbrir('Tanques')"><b>🛢️</b><span>Estoque dos tanques</span><small>Ver litros disponíveis</small></button>
      </div>
      <div class="mobile-tip">💡 Os lançamentos continuam sendo sincronizados pelo Firebase com o posto selecionado.</div>
    </div>`;
  }
  window.mobileAbrir=function(name){
    const old=window.openModule;
    if(typeof old==='function') old(name);
    setTimeout(function(){
      const m=document.getElementById('module');
      if(m) m.insertAdjacentHTML('afterbegin','<button class="mobile-return" onclick="renderMobilePanel()">📱 Voltar para operação</button>');
    },50);
  };
  window.mobileVoltarPainel=function(){renderMobilePanel()};
  window.renderMobilePanel=renderMobilePanel;
  const css=`
  .mobile-panel{max-width:760px;margin:0 auto;padding:8px 0 24px}.mobile-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px}.mobile-head h2{margin:0 0 5px}.mobile-head p{margin:0;color:#667085}.mobile-back,.mobile-return{border:0;border-radius:12px;padding:12px 15px;font-weight:700;cursor:pointer}.mobile-back{background:#e5e7eb}.mobile-actions{display:grid;grid-template-columns:1fr 1fr;gap:14px}.mobile-actions button{min-height:125px;border:1px solid #d0d5dd;border-radius:18px;background:#fff;padding:18px;text-align:left;box-shadow:0 3px 12px rgba(16,24,40,.08);cursor:pointer}.mobile-actions button:active{transform:scale(.98)}.mobile-actions b{display:block;font-size:32px;margin-bottom:10px}.mobile-actions span{display:block;font-size:18px;font-weight:800}.mobile-actions small{display:block;margin-top:5px;color:#667085}.mobile-tip{margin-top:18px;padding:14px;border-radius:14px;background:#eef6ff;color:#344054}.mobile-return{display:block;margin:0 0 12px;background:#e5e7eb}@media(max-width:600px){.mobile-panel{padding:4px 2px 20px}.mobile-head{align-items:flex-start}.mobile-head h2{font-size:21px}.mobile-head p{font-size:14px}.mobile-back{padding:10px 12px}.mobile-actions{grid-template-columns:1fr;gap:12px}.mobile-actions button{min-height:105px;padding:16px}.mobile-actions b{font-size:29px;margin-bottom:7px}.mobile-actions span{font-size:17px}}
  `;
  const style=document.createElement('style');style.id='lmc-mobile-style';style.textContent=css;document.head.appendChild(style);
  window.addEventListener('load',function(){setTimeout(renderMobilePanel,300)});
  window.addEventListener('resize',function(){if(isMobile()) setTimeout(renderMobilePanel,100)});
})();
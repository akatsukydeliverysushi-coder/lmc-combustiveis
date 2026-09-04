const POSTOS_KEY='lmcPostos';
function getPostos(){try{return JSON.parse(localStorage.getItem(POSTOS_KEY)||'[]')}catch(e){return []}}
function savePostos(lista){localStorage.setItem(POSTOS_KEY,JSON.stringify(lista))}
function slugPosto(nome){return String(nome||'posto').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'posto'}
function novoCodigoPosto(){return 'P'+Date.now().toString(36).toUpperCase().slice(-7)}
function linkPosto(id){return location.origin+location.pathname+'?posto='+encodeURIComponent(id)}
function postoAtualId(){return new URLSearchParams(location.search).get('posto')||''}
function postoAtual(){return getPostos().find(p=>p.id===postoAtualId())||null}
function limparCnpj(v){return String(v||'').replace(/\D/g,'').slice(0,14)}
function formatarCnpj(v){const n=limparCnpj(v);return n.length===14?n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,'$1.$2.$3/$4-$5'):v}
async function consultarCnpj(){
 const input=document.getElementById('novoPostoCnpj');const status=document.getElementById('cnpjStatus');
 if(!input)return;const cnpj=limparCnpj(input.value);
 if(cnpj.length!==14){if(status)status.textContent='Digite um CNPJ com 14 números.';return}
 if(status)status.textContent='🔎 Consultando CNPJ...';
 try{
   const r=await fetch('https://brasilapi.com.br/api/cnpj/v1/'+cnpj);
   if(!r.ok)throw new Error('CNPJ não encontrado');
   const d=await r.json();
   const nome=d.razao_social||d.razao_social||'';const fantasia=d.nome_fantasia||'';const cidade=d.municipio||'';const uf=d.uf||'';
   const nomeEl=document.getElementById('novoPostoNome'),fantEl=document.getElementById('novoPostoFantasia'),cidEl=document.getElementById('novoPostoCidade'),ufEl=document.getElementById('novoPostoUf');
   if(nomeEl)nomeEl.value=nome;if(fantEl)fantEl.value=fantasia;if(cidEl)cidEl.value=cidade;if(ufEl)ufEl.value=uf;
   input.value=formatarCnpj(cnpj);if(status)status.textContent='✅ Dados encontrados. Confira e cadastre o posto.';
 }catch(e){if(status)status.textContent='❌ Não foi possível consultar este CNPJ. Confira os números e tente novamente.'}
}
function renderPostos(){
 const lista=getPostos();
 m('Postos',`<h2>🏢 Cadastro de Postos</h2><p class="muted">Informe o CNPJ para buscar automaticamente os dados públicos do estabelecimento.</p><form onsubmit="addPosto(event)"><div class="formgrid"><label>CNPJ<input id="novoPostoCnpj" inputmode="numeric" maxlength="18" placeholder="00.000.000/0000-00" oninput="this.value=formatarCnpj(this.value)" required></label><div class="actions" style="align-self:end"><button type="button" onclick="consultarCnpj()">🔎 Buscar CNPJ</button></div><div id="cnpjStatus" class="muted" style="grid-column:1/-1;margin-top:-8px"></div><label>Nome / Razão Social<input id="novoPostoNome" required></label><label>Nome Fantasia<input id="novoPostoFantasia"></label><label>Cidade<input id="novoPostoCidade"></label><label>UF<input id="novoPostoUf" maxlength="2"></label></div><div class="actions"><button class="primary">Cadastrar posto</button><button type="button" onclick="back()">Voltar</button></div></form><hr><h3>Postos cadastrados</h3><div class="tablewrap"><table><thead><tr><th>Posto</th><th>CNPJ</th><th>Cidade/UF</th><th>Código</th><th>Acesso</th></tr></thead><tbody>${lista.length?lista.map(p=>`<tr><td><strong>${esc(p.nome)}</strong><br><small>${esc(p.fantasia||'')}</small></td><td>${esc(p.cnpj||'—')}</td><td>${esc(p.cidade||'—')}/${esc(p.uf||'')}</td><td>${esc(p.id)}</td><td><button onclick="abrirPosto('${esc(p.id)}')">Abrir</button> <button onclick="copiarLinkPosto('${esc(p.id)}')">Copiar link</button></td></tr>`).join(''):'<tr><td colspan="5">Nenhum posto cadastrado.</td></tr>'}</tbody></table></div>`)
}
function addPosto(e){e.preventDefault();const lista=getPostos();const id=novoCodigoPosto();lista.push({id,nome:novoPostoNome.value.trim(),cnpj:formatarCnpj(novoPostoCnpj.value.trim()),fantasia:novoPostoFantasia.value.trim(),cidade:novoPostoCidade.value.trim(),uf:novoPostoUf.value.trim().toUpperCase(),slug:slugPosto(novoPostoNome.value),criadoEm:new Date().toISOString()});savePostos(lista);alert('Posto cadastrado. Link exclusivo gerado: '+linkPosto(id));renderPostos()}
function abrirPosto(id){location.href=linkPosto(id)}
async function copiarLinkPosto(id){const url=linkPosto(id);try{await navigator.clipboard.writeText(url);alert('Link copiado:\n'+url)}catch(e){prompt('Copie o link do posto:',url)}}
function renderPainelPosto(){const p=postoAtual();if(!p){m('Posto','<h2>Posto não encontrado</h2><p class="muted">O link informado não corresponde a um posto cadastrado.</p><button onclick="location.href=location.pathname">Voltar ao ADM</button>');return}m('Posto',`<h2>🏪 ${esc(p.nome)}</h2><p class="muted">Acesso exclusivo do estabelecimento • Código ${esc(p.id)}</p><div class="cards"><button class="card" onclick="openModule('Configurações')"><strong>⚙️</strong><span>Cadastro</span><small>Dados do posto</small></button><button class="card" onclick="openModule('Produtos')"><strong>⛽</strong><span>Produtos</span><small>Combustíveis</small></button><button class="card" onclick="openModule('Tanques')"><strong>🛢️</strong><span>Tanques</span><small>Estoques e réguas</small></button><button class="card" onclick="openModule('Bombas e Bicos')"><strong>🔢</strong><span>Bombas e Bicos</span><small>Leituras</small></button><button class="card" onclick="openModule('Entradas')"><strong>📥</strong><span>Entradas</span><small>Recebimentos</small></button><button class="card" onclick="openModule('Movimentação Diária')"><strong>📋</strong><span>Movimentação</span><small>Vendas e turnos</small></button><button class="card" onclick="openModule('Livro LMC')"><strong>📘</strong><span>Livro LMC</span><small>Fechamento</small></button><button class="card" onclick="openModule('Relatórios')"><strong>📊</strong><span>Relatórios</span><small>Consultas do posto</small></button></div><div class="actions"><button onclick="location.href=location.pathname">Sair do posto</button></div>`)}
function modoPosto(){return !!postoAtualId()}
window.getPostos=getPostos;window.renderPostos=renderPostos;window.addPosto=addPosto;window.postoAtual=postoAtual;window.modoPosto=modoPosto;window.renderPainelPosto=renderPainelPosto;window.linkPosto=linkPosto;window.consultarCnpj=consultarCnpj;window.formatarCnpj=formatarCnpj;
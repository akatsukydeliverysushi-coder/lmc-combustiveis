const AUTH_KEY='lmcAuth';
const AUTH_USER='admin';
const AUTH_PASS='lmc2026';
function isAuthenticated(){return sessionStorage.getItem(AUTH_KEY)==='1'}
function showLogin(){document.body.innerHTML=`<main class="loginpage"><section class="loginbox"><div class="loginicon">⛽</div><h1>LMC Combustíveis</h1><p>Acesso restrito ao sistema</p><form onsubmit="doLogin(event)"><label>Usuário<input id="loginUser" autocomplete="username" required></label><label>Senha<input id="loginPass" type="password" autocomplete="current-password" required></label><button class="primary">Entrar</button><div id="loginError" class="loginerror"></div></form><small>Primeiro acesso: usuário <strong>admin</strong> e senha <strong>lmc2026</strong>. Altere a senha nas configurações de segurança.</small></section></main>`}
function doLogin(e){e.preventDefault();const u=document.getElementById('loginUser').value.trim();const p=document.getElementById('loginPass').value;if(u===AUTH_USER&&p===AUTH_PASS){sessionStorage.setItem(AUTH_KEY,'1');location.reload()}else document.getElementById('loginError').textContent='Usuário ou senha inválidos.'}
function logoutLmc(){sessionStorage.removeItem(AUTH_KEY);location.reload()}
if(!isAuthenticated())showLogin();

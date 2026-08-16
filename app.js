window.AVENTURA_VERSION='v.90M';
console.log('Aventura Turismo • v.90M');
const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const id=()=>{
  if(globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes=new Uint8Array(16);
  if(globalThis.crypto?.getRandomValues){
    globalThis.crypto.getRandomValues(bytes);
  }else{
    for(let i=0;i<16;i++) bytes[i]=Math.floor(Math.random()*256);
  }
  bytes[6]=(bytes[6]&0x0f)|0x40;
  bytes[8]=(bytes[8]&0x3f)|0x80;
  const h=[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');
  return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
};


function ensureActionToast(){
  let el=document.getElementById('actionToast');
  if(!el){
    el=document.createElement('div');
    el.id='actionToast';
    el.className='action-toast hidden';
    document.body.appendChild(el);
  }
  return el;
}

let actionToastTimer=null;
function showActionToast(message,type='info',duration=2600){
  const el=ensureActionToast();
  clearTimeout(actionToastTimer);
  el.textContent=message;
  el.className=`action-toast ${type}`;
  actionToastTimer=setTimeout(()=>el.classList.add('hidden'),duration);
}

function setButtonBusy(button,busy,busyText='Carregando...'){
  if(!button) return;
  if(busy){
    if(button.dataset.busy==='1') return;
    button.dataset.busy='1';
    button.dataset.originalText=button.textContent;
    button.disabled=true;
    button.classList.add('is-loading');
    button.textContent=busyText;
  }else{
    button.dataset.busy='0';
    button.disabled=false;
    button.classList.remove('is-loading');
    if(button.dataset.originalText) button.textContent=button.dataset.originalText;
  }
}

window.addEventListener('error',event=>{
  const msg=event?.error?.message||event?.message||'Erro inesperado.';
  console.error('Erro capturado pela interface:',event?.error||event);
  showActionToast(`Erro: ${msg}`,'error',5000);
});

window.addEventListener('unhandledrejection',event=>{
  const reason=event?.reason;
  const msg=reason?.message||String(reason||'Falha inesperada.');
  console.error('Promessa rejeitada:',reason);
  showActionToast(`Erro: ${msg}`,'error',5000);
});

document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button || button.disabled) return;
  button.classList.add('button-click-feedback');
  setTimeout(()=>button.classList.remove('button-click-feedback'),180);
});

const DEFAULT_PASSAGE_PRICE=110;
const MENU_VERSION='2026-08-cardapio-02';
const MENU_PRODUCTS=[
    {id:"almoco-peixe-camarao",name:"Filé de peixe ao molho de camarão",category:"ALMOÇO",sector:"COZINHA",price:70,stock:999,min:0},
    {id:"almoco-peixe-palmito",name:"Filé de peixe ao creme de palmito",category:"ALMOÇO",sector:"COZINHA",price:65,stock:999,min:0},
    {id:"almoco-frango-palmito",name:"Filé de frango grelhado ao creme de palmito",category:"ALMOÇO",sector:"COZINHA",price:65,stock:999,min:0},
    {id:"almoco-frango-grelhado",name:"Frango grelhado",category:"ALMOÇO",sector:"COZINHA",price:60,stock:999,min:0},
    {id:"almoco-strogonoff-frango",name:"Strogonoff de frango",category:"ALMOÇO",sector:"COZINHA",price:55,stock:999,min:0},
    {id:"almoco-espaguete-camarao",name:"Espaguete ao molho de camarão",category:"ALMOÇO",sector:"COZINHA",price:60,stock:999,min:0},
    {id:"almoco-salada-mista",name:"Salada mista",category:"ALMOÇO",sector:"COZINHA",price:45,stock:999,min:0},
    {id:"almoco-kids",name:"Kids",category:"ALMOÇO",sector:"COZINHA",price:50,stock:999,min:0},
    {id:"almoco-strogonoff-camarao",name:"Strogonoff de camarão",category:"ALMOÇO",sector:"COZINHA",price:60,stock:999,min:0},
    {id:"almoco-vegetariano",name:"Vegetariano",category:"ALMOÇO",sector:"COZINHA",price:50,stock:999,min:0},
    {id:"porcao-isca-frango",name:"Isca de frango",category:"PORÇÕES",sector:"COZINHA",price:70,stock:999,min:0},
    {id:"porcao-isca-peixe",name:"Isca de peixe",category:"PORÇÕES",sector:"COZINHA",price:85,stock:999,min:0},
    {id:"porcao-batata-frita",name:"Batata frita",category:"PORÇÕES",sector:"COZINHA",price:49,stock:999,min:0},
    {id:"porcao-camarao-frito",name:"Camarão frito",category:"PORÇÕES",sector:"COZINHA",price:130,stock:999,min:0},
    {id:"porcao-camarao-dore",name:"Camarão à dorê",category:"PORÇÕES",sector:"COZINHA",price:130,stock:999,min:0},
    {id:"porcao-lula-dore",name:"Lula à dorê",category:"PORÇÕES",sector:"COZINHA",price:110,stock:999,min:0},
    {id:"porcao-fritas-calabresa",name:"Fritas com calabresa",category:"PORÇÕES",sector:"COZINHA",price:60,stock:999,min:0},
    {id:"porcao-calabresa-acebolada",name:"Calabresa acebolada",category:"PORÇÕES",sector:"COZINHA",price:50,stock:999,min:0},
    {id:"porcao-contrafile-fritas",name:"Contra filé com fritas",category:"PORÇÕES",sector:"COZINHA",price:99,stock:999,min:0},
    {id:"bebida-agua-sem-gas",name:"Água sem gás",category:"BEBIDAS",sector:"BAR",price:5,stock:999,min:0},
    {id:"bebida-agua-com-gas",name:"Água com gás",category:"BEBIDAS",sector:"BAR",price:6,stock:999,min:0},
    {id:"bebida-refrigerante-lata",name:"Refrigerante lata",category:"BEBIDAS",sector:"BAR",price:10,stock:999,min:0},
    {id:"bebida-suco-natural",name:"Suco natural",category:"BEBIDAS",sector:"BAR",price:18,stock:999,min:0},
    {id:"bebida-cerveja-lata",name:"Cerveja lata",category:"BEBIDAS",sector:"BAR",price:10,stock:999,min:0},
    {id:"bebida-cerveja-latao",name:"Cerveja latão",category:"BEBIDAS",sector:"BAR",price:15,stock:999,min:0},
    {id:"bebida-cerveja-long-neck",name:"Cerveja long neck",category:"BEBIDAS",sector:"BAR",price:17,stock:999,min:0},
    {id:"drink-caipirinha",name:"Caipirinha",category:"DRINKS",sector:"BAR",price:35,stock:999,min:0},
    {id:"drink-caipvodka",name:"Caipvodka",category:"DRINKS",sector:"BAR",price:35,stock:999,min:0},
    {id:"drink-jorge-amado",name:"Jorge Amado",category:"DRINKS",sector:"BAR",price:35,stock:999,min:0},
    {id:"drink-dose-cachaca",name:"Dose de cachaça Gabriela ou pinga",category:"DRINKS",sector:"BAR",price:15,stock:999,min:0},
    {id:"drink-dose-vodka",name:"Dose de vodka",category:"DRINKS",sector:"BAR",price:20,stock:999,min:0},
    {id:"drink-batida",name:"Batida",category:"DRINKS",sector:"BAR",price:35,stock:999,min:0},
    {id:"drink-carpe-diem",name:"Carpe Diem",category:"DRINKS",sector:"BAR",price:35,stock:999,min:0},
    {id:"extra-colete-salva-vidas",name:"Colete salva-vidas",category:"EXTRAS",sector:"EXTRAS",price:30,stock:999,min:0,description:"Locação do início ao fim do passeio"},
    {id:"extra-doce-marinheiros",name:"Doce dos Marinheiros",category:"EXTRAS",sector:"BAR",price:10,stock:999,min:0}
  ];

const EXAMPLE_AGENTS=[
  {id:'agent-joao',name:'João',partner:'Pousada A',commissionPercent:20,bankName:'',bankAgency:'',bankAccount:'',pixKey:'',active:true,example:true},
  {id:'agent-maria',name:'Maria',partner:'Pousada B',commissionPercent:30,bankName:'',bankAgency:'',bankAccount:'',pixKey:'',active:true,example:true},
  {id:'agent-carlos',name:'Carlos',partner:'Pousada C',commissionPercent:20,bankName:'',bankAgency:'',bankAccount:'',pixKey:'',active:true,example:true},
  {id:'agent-example-4',name:'Agente Exemplo 4',partner:'Pousada D',commissionPercent:0,bankName:'',bankAgency:'',bankAccount:'',pixKey:'',active:true,example:true},
  {id:'agent-example-5',name:'Agente Exemplo 5',partner:'Pousada E',commissionPercent:0,bankName:'',bankAgency:'',bankAccount:'',pixKey:'',active:true,example:true}
];

const defaults={
  menuVersion:MENU_VERSION,
  products:structuredClone(MENU_PRODUCTS),
  tabs:[],orders:[],payments:[],vouchers:[],voucherPayments:[],agents:structuredClone(EXAMPLE_AGENTS),commissionPayments:[],
  settings:{company:'Aventura Turismo',boat:'Capitão Gancho',printBridge:'http://localhost:8787'}
};

let state=JSON.parse(localStorage.getItem('aventura_pdv')||'null')||defaults;
state.vouchers=Array.isArray(state.vouchers)?state.vouchers:[];
state.voucherPayments=Array.isArray(state.voucherPayments)?state.voucherPayments:[];
state.agents=Array.isArray(state.agents)?state.agents:[];
if(!state.agents.length){ state.agents=structuredClone(EXAMPLE_AGENTS); }
state.commissionPayments=Array.isArray(state.commissionPayments)?state.commissionPayments:[];


let selectedOperationalDate=new Date().toLocaleDateString('en-CA');

function dateKeyFrom(value){
  if(!value) return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const d=new Date(value);
  if(Number.isNaN(d.getTime())) return '';
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,'0');
  const day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function selectedDateIsToday(){
  return selectedOperationalDate===new Date().toLocaleDateString('en-CA');
}

function tabOperationalDate(tab){
  return tab.businessDate || dateKeyFrom(tab.createdAt);
}

function getDayTabs(dateKey=selectedOperationalDate){
  return state.tabs.filter(t=>tabOperationalDate(t)===dateKey);
}

function getDayPayments(dateKey=selectedOperationalDate){
  const ids=new Set(getDayTabs(dateKey).map(t=>t.id));
  return state.payments.filter(p=>ids.has(p.tabId));
}

function getDayOrders(dateKey=selectedOperationalDate){
  const ids=new Set(getDayTabs(dateKey).map(t=>t.id));
  return state.orders.filter(o=>ids.has(o.tabId));
}

function canOperateSelectedDay(){
  if(window.currentProfile?.role==='MASTER') return true;
  return selectedDateIsToday();
}

window.changeOperationalDate=function(dateKey){
  if(window.currentProfile?.role!=='MASTER'){
    alert('Somente o MASTER pode navegar ou operar outros dias.');
    selectedOperationalDate=new Date().toLocaleDateString('en-CA');
  }else if(dateKey){
    selectedOperationalDate=dateKey;
  }
  renderAll();
};

window.shiftOperationalDay=function(delta){
  if(window.currentProfile?.role!=='MASTER'){
    return alert('Somente o MASTER pode navegar entre os dias.');
  }
  const d=new Date(`${selectedOperationalDate}T12:00:00`);
  d.setDate(d.getDate()+delta);
  selectedOperationalDate=dateKeyFrom(d);
  renderAll();
};

let currentTabId=null;
let cart=[];
let lastSentOrderId=null;
let orderReviewLocked=false;

function isMaster(){return window.currentProfile?.role==='MASTER';}
function isGestor(){return ['MASTER','GESTOR'].includes(window.currentProfile?.role);}
function isGerente(){return ['MASTER','GESTOR','GERENTE'].includes(window.currentProfile?.role);}
function isGarcom(){return ['MASTER','GESTOR','GERENTE','GARCOM'].includes(window.currentProfile?.role);}
function canManageComanda(){return ['MASTER','GESTOR','GERENTE'].includes(window.currentProfile?.role);}
function canCloseComanda(){return ['MASTER','GESTOR','GERENTE','GARCOM'].includes(window.currentProfile?.role);}

let cloudReady=false;
let savingCloud=false;
let pendingCloudSave=false;
let realtimeChannel=null;


let remoteStatusTimer=null;

function setRemoteBadge(text,mode='neutral'){
  const el=document.getElementById('remoteSyncStatus');
  if(!el) return;
  el.textContent=text;
  el.dataset.mode=mode;
}

async function refreshRemoteSyncStatus(){
  if(!localServerReady) return;
  try{
    const res=await fetch('/api/remote-status',{cache:'no-store'});
    if(!res.ok) throw new Error('status indisponível');
    const data=await res.json();

    if(!data.enabled){
      setRemoteBadge('Nuvem • não configurada','warning');
      return;
    }

    if(data.connected){
      const suffix=data.lastSyncAt
        ? ` • ${new Date(data.lastSyncAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`
        : '';
      setRemoteBadge(`Nuvem • sincronizada${suffix}`,'ok');
    }else{
      setRemoteBadge('Nuvem • sem internet / aguardando','warning');
    }
  }catch(_){
    setRemoteBadge('Nuvem • status indisponível','error');
  }
}

function startRemoteStatusMonitor(){
  if(remoteStatusTimer) clearInterval(remoteStatusTimer);
  refreshRemoteSyncStatus();
  remoteStatusTimer=setInterval(refreshRemoteSyncStatus,5000);
}

let localServerReady=false;
let localServerSaving=false;
let localServerPendingSave=false;
let localServerUpdatedAt=null;
let localServerPoll=null;

function isHttpApp(){
  return location.protocol==='http:' || location.protocol==='https:';
}

async function detectLocalServer(){
  if(!isHttpApp()) return false;
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),1800);
    const res=await fetch('/api/health',{cache:'no-store',signal:controller.signal});
    clearTimeout(timeout);
    if(!res.ok) return false;
    const data=await res.json();
    return Boolean(data?.ok && data?.database==='SQLite');
  }catch(_){
    return false;
  }
}

function normalizeLoadedState(incoming){
  if(!incoming || typeof incoming!=='object') return;
  state=incoming;
  state.products=Array.isArray(state.products)&&state.products.length?state.products:structuredClone(MENU_PRODUCTS);
  state.tabs=Array.isArray(state.tabs)?state.tabs:[];
  state.orders=Array.isArray(state.orders)?state.orders:[];
  state.payments=Array.isArray(state.payments)?state.payments:[];
  state.vouchers=Array.isArray(state.vouchers)?state.vouchers:[];
  state.voucherPayments=Array.isArray(state.voucherPayments)?state.voucherPayments:[];
  state.agents=Array.isArray(state.agents)?state.agents:[];
  if(!state.agents.length) state.agents=structuredClone(EXAMPLE_AGENTS);
  state.commissionPayments=Array.isArray(state.commissionPayments)?state.commissionPayments:[];
  state.settings=state.settings||structuredClone(defaults.settings);
  if(state.menuVersion!==MENU_VERSION){
    state.products=structuredClone(MENU_PRODUCTS);
    state.menuVersion=MENU_VERSION;
  }
}

async function loadLocalServerState(){
  const res=await fetch('/api/state',{cache:'no-store'});
  if(!res.ok) throw new Error('Não foi possível carregar o banco local.');
  const data=await res.json();

  if(data?.state && Object.keys(data.state).length){
    normalizeLoadedState(data.state);
    localStorage.setItem('aventura_pdv',JSON.stringify(state));
  }else{
    // Primeiro uso do servidor: envia o estado existente deste navegador.
    await saveLocalServerState();
  }

  localServerUpdatedAt=data?.updatedAt||localServerUpdatedAt;
  localServerReady=true;
  renderAll();
}

async function saveLocalServerState(){
  if(!isHttpApp()) return;
  if(localServerSaving){
    localServerPendingSave=true;
    return;
  }

  localServerSaving=true;
  try{
    const res=await fetch('/api/state',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({state})
    });
    if(!res.ok) throw new Error('Falha ao salvar no SQLite.');
    const data=await res.json();
    localServerUpdatedAt=data?.updatedAt||localServerUpdatedAt;
  }catch(err){
    console.error('Erro ao salvar no servidor local:',err);
    const status=document.getElementById('connectionStatus');
    if(status) status.textContent='Servidor local • erro ao salvar';
    throw err;
  }finally{
    localServerSaving=false;
    if(localServerPendingSave){
      localServerPendingSave=false;
      saveLocalServerState();
    }
  }
}

async function pollLocalServer(){
  if(!localServerReady || localServerSaving) return;
  try{
    const res=await fetch('/api/state',{cache:'no-store'});
    if(!res.ok) return;
    const data=await res.json();
    if(!data?.updatedAt || data.updatedAt===localServerUpdatedAt) return;

    normalizeLoadedState(data.state||{});
    localServerUpdatedAt=data.updatedAt;
    localStorage.setItem('aventura_pdv',JSON.stringify(state));
    renderAll();

    if(currentTabId && !document.getElementById('modal')?.classList.contains('hidden')){
      const exists=state.tabs.some(t=>t.id===currentTabId);
      if(exists && !orderReviewLocked) renderTabModal();
      if(!exists) closeModal();
    }
  }catch(err){
    console.error('Erro na sincronização local:',err);
  }
}

function startLocalServerSync(){
  if(localServerPoll) clearInterval(localServerPoll);
  localServerPoll=setInterval(pollLocalServer,1000);
}

function save(){
  localStorage.setItem('aventura_pdv',JSON.stringify(state));
  renderAll();

  if(localServerReady){
    return saveLocalServerState();
  }

  if(cloudReady){
    return saveCloudState();
  }

  return Promise.resolve();
}

async function saveCloudState(){
  if(!window.sb || !window.currentProfile) return;
  if(savingCloud){ pendingCloudSave=true; return; }
  savingCloud=true;
  try{
    const payload={id:1,state,updated_at:new Date().toISOString(),updated_by:window.currentProfile.id};
    const {error}=await window.sb.from('app_state').upsert(payload,{onConflict:'id'});
    if(error) console.error('Erro ao sincronizar:',error);
  }finally{
    savingCloud=false;
    if(pendingCloudSave){ pendingCloudSave=false; saveCloudState(); }
  }
}

async function loadCloudState(){
  if(!window.sb || !window.currentProfile) return;
  const {data,error}=await window.sb.from('app_state').select('state').eq('id',1).maybeSingle();
  if(error){ console.error(error); alert('Não foi possível carregar os dados compartilhados.'); return; }

  if(data?.state){
    state=data.state;
    state.vouchers=Array.isArray(state.vouchers)?state.vouchers:[];
    state.voucherPayments=Array.isArray(state.voucherPayments)?state.voucherPayments:[];

    // Atualiza o catálogo para o cardápio oficial sem apagar comandas/pedidos antigos.
    if(state.menuVersion!==MENU_VERSION){
      state.products=structuredClone(MENU_PRODUCTS);
      state.menuVersion=MENU_VERSION;
      localStorage.setItem('aventura_pdv',JSON.stringify(state));
      await window.sb.from('app_state').update({
        state,
        updated_at:new Date().toISOString(),
        updated_by:window.currentProfile?.id||null
      }).eq('id',1);
    }else{
      localStorage.setItem('aventura_pdv',JSON.stringify(state));
    }
  }else{
    // Na primeira ativação, envia os dados que já existiam neste computador.
    const {error:upErr}=await window.sb.from('app_state').insert({
      id:1,state,updated_at:new Date().toISOString(),updated_by:window.currentProfile.id
    });
    if(upErr) console.error(upErr);
  }
  cloudReady=true;
  renderAll();
  startRealtimeSync();
}

function startRealtimeSync(){
  if(realtimeChannel || !window.sb) return;
  realtimeChannel=window.sb.channel('aventura-global-sync')
    .on('postgres_changes',
      {event:'*',schema:'public',table:'app_state',filter:'id=eq.1'},
      payload=>{
        const remote=payload.new?.state;
        if(!remote) return;
        state=remote;
        setRemoteBadge('Nuvem • atualização recebida','ok');
        localStorage.setItem('aventura_pdv',JSON.stringify(state));
        renderAll();
        // Se uma comanda estiver aberta, atualiza a tela dela também.
        if(currentTabId && !document.getElementById('modal')?.classList.contains('hidden')){
          const exists=state.tabs.some(t=>t.id===currentTabId);
          // Depois de "Enviar pedido", o resumo BAR/COZINHA fica travado
          // até o operador decidir imprimir ou iniciar um novo pedido.
          if(exists && !orderReviewLocked) renderTabModal();
        }
      })
    .subscribe();
}

window.showView=function(name){
  localStorage.setItem('aventura_current_view',name);
  const btn=document.querySelector(`.tab[data-view="${name}"]`);
  const req=btn?.dataset.permission;
  if(req && window.hasPermission && !window.hasPermission(req)) return alert('Você não tem permissão para acessar esta área.');
  if(name==='usuarios' && window.currentProfile?.role!=='MASTER') return alert('Área exclusiva do MASTER.');
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.getElementById(name)?.classList.add('active');
  btn?.classList.add('active');
  if(name==='usuarios' && window.loadUsers) window.loadUsers();
};

function wireTabs(){document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>showView(b.dataset.view));}
function openModal(title,html){document.getElementById('modalTitle').textContent=title;document.getElementById('modalContent').innerHTML=`<div class="modal-body">${html}</div>`;document.getElementById('modal').classList.remove('hidden');}
window.closeModal=()=>{
  document.getElementById('modal').classList.add('hidden');
  orderReviewLocked=false;
  lastSentOrderId=null;
};

window.openNewTabModal=function(){
  if(window.hasPermission&&!window.hasPermission('comandas'))return alert('Sem permissão.');
  if(!canOperateSelectedDay()) return alert('Seu perfil só pode lançar comandas no dia atual.');

  openModal('Nova comanda',`
    <div class="comanda-open-form">
      <label>
        <span>Número da comanda</span>
        <input id="newTabNumber" type="number" min="1" step="1" inputmode="numeric" placeholder="Ex.: 18" required>
      </label>

      <label>
        <span>Responsável pela comanda</span>
        <input id="newTabCustomer" type="text" placeholder="Ex.: Carlos" required>
      </label>

      <label>
        <span>Quantidade de pessoas</span>
        <input id="newTabPeople" type="number" min="1" step="1" inputmode="numeric" placeholder="Ex.: 4" required>
      </label>

      <div class="automatic-fees-preview">
        <strong>Lançamentos automáticos</strong>
        <span>Couvert artístico: R$ 12,00 por pessoa</span>
        <span>Taxa de sustentabilidade: R$ 2,00 por pessoa</span>
        <strong id="feesPreviewTotal">Total automático: R$ 0,00</strong>
      </div>
    </div>

    <div class="checkout">
      <button class="primary" onclick="createTab()">Criar comanda</button>
    </div>
  `);

  const people=document.getElementById('newTabPeople');
  people?.addEventListener('input',()=>{
    const qtd=Math.max(0,Number(people.value)||0);
    const el=document.getElementById('feesPreviewTotal');
    if(el) el.textContent=`Total automático: ${money(qtd*14)}`;
  });

  setTimeout(()=>document.getElementById('newTabNumber')?.focus(),50);
};

window.createTab=async function(){
  const raw=document.getElementById('newTabNumber')?.value;
  const numeric=Number(raw);
  const customer=document.getElementById('newTabCustomer')?.value.trim();
  const people=Number(document.getElementById('newTabPeople')?.value);

  if(!Number.isInteger(numeric)||numeric<=0){
    return alert('Digite um número de comanda válido.');
  }
  if(!customer){
    return alert('Informe o nome do responsável pela comanda.');
  }
  if(!Number.isInteger(people)||people<=0){
    return alert('Informe a quantidade de pessoas da comanda.');
  }

  const number=String(numeric);
  const today=selectedOperationalDate;

  const duplicate=state.tabs.some(t=>{
    if(t.status==='CANCELADA')return false;
    const tabDate=new Date(t.createdAt).toLocaleDateString('en-CA');
    return tabDate===today&&String(Number(t.number))===number;
  });

  if(duplicate){
    return alert(`A Comanda ${number} já existe hoje. Abra a comanda existente.`);
  }

  const tabId=id();
  const now=new Date().toISOString();

  state.tabs.push({
    id:tabId,
    number,
    customer,
    people,
    status:'ABERTA',
    createdAt:now,
    businessDate:selectedOperationalDate,
    closedAt:null,
    total:0,
    createdBy:window.currentProfile?.id||null,
    createdByName:window.currentProfile?.full_name||'Usuário'
  });

  // Lançamentos obrigatórios automáticos da operação.
  state.orders.push({
    id:id(),
    tabId,
    items:[
      {
        productId:'taxa-couvert-artistico',
        name:'Couvert artístico',
        category:'TAXAS',
        sector:'TAXAS',
        price:12,
        qty:people
      },
      {
        productId:'taxa-sustentabilidade',
        name:'Taxa de sustentabilidade',
        category:'TAXAS',
        sector:'TAXAS',
        price:2,
        qty:people
      }
    ],
    total:people*14,
    createdAt:now,
    status:'ENVIADO',
    automatic:true,
    createdBy:window.currentProfile?.id||null,
    createdByName:window.currentProfile?.full_name||'Sistema'
  });

  try{
    showActionToast('Criando comanda...','info',1500);
    await save();
    closeModal();
    showView('comandas');
    showActionToast(`Comanda ${number} criada com sucesso.`,'success',2800);
  }catch(err){
    console.error(err);
    showActionToast(`Erro ao criar comanda: ${err?.message||'falha ao salvar'}`,'error',5000);
    alert('Não foi possível criar a comanda. Verifique a conexão com o servidor local.');
  }
};

window.openTab=function(tabId){
  if(window.hasPermission&&!window.hasPermission('comandas'))return alert('Sem permissão.');
  currentTabId=tabId;
  cart=[];
  lastSentOrderId=null;
  orderReviewLocked=false;
  renderTabModal();
};

function renderTabModal(){
  const tab=state.tabs.find(t=>t.id===currentTabId);
  if(!tab) return;

  const existing=state.orders.filter(o=>o.tabId===currentTabId&&o.status!=='CANCELADO');
  const historical=existing.reduce((s,o)=>s+Number(o.total||0),0);
  const manager=canManageComanda();

  const categoryOrder=['ALMOÇO','PORÇÕES','BEBIDAS','DRINKS','EXTRAS'];
  const productButtons=categoryOrder.map(category=>{
    const products=state.products.filter(p=>p.category===category);
    if(!products.length)return '';
    return `<section class="order-menu-category">
      <div class="order-menu-title">${category}</div>
      <div class="order-menu-grid">
        ${products.map(p=>`
          <button class="order-product-btn" onclick="addProductStable('${p.id}')">
            <strong>${p.name}</strong>
            ${p.description?`<em>${p.description}</em>`:''}
            <span>${money(p.price)}</span>
          </button>`).join('')}
      </div>
    </section>`;
  }).join('');

  const sentSummary=existing
    .filter(o=>!o.automatic)
    .slice()
    .sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))
    .map((o,i)=>`
      <div class="sent-history-row">
        <div>
          <strong>Pedido ${i+1}</strong>
          <small>${new Date(o.createdAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} • ${o.items.map(x=>`${x.qty}x ${x.name}`).join(', ')}</small>
        </div>
        ${manager?`<strong>${money(o.total)}</strong>`:''}
      </div>`).join('');

  openModal(`Comanda ${tab.number}`,`
    <div class="comanda-order-layout">
      <div class="comanda-order-main">
        <div class="comanda-order-header">
          <div>
            <span class="eyebrow">COMANDA ${tab.number}</span>
            <h3>${tab.customer||'Sem responsável'}</h3>
            <p>${tab.people||1} pessoa(s)${manager?` • Total acumulado: ${money(historical)}`:''}</p>
          </div>
          <span class="pill">${tab.status}</span>
        </div>

        <div class="order-menu-scroll">
          ${productButtons}
        </div>
      </div>

      <aside class="current-order-panel">
        <div class="current-order-head">
          <div>
            <span class="eyebrow">PEDIDO ATUAL</span>
            <h3>Itens selecionados</h3>
          </div>
        </div>

        <div id="stableCartLines" class="stable-cart-lines"></div>

        <div class="stable-cart-total">
          <span>Total deste pedido</span>
          <strong id="stableCartTotal">${money(0)}</strong>
        </div>

        <button id="stableSendButton" class="primary stable-send-btn" onclick="sendOrderStable()" disabled>
          Enviar pedido
        </button>

        <div id="sentOrderArea" class="sent-order-area hidden"></div>

        <div class="sent-history-box">
          <div class="sent-history-head">
            <strong>Pedidos já enviados</strong>
            <small>Continuam registrados nesta comanda.</small>
          </div>
          <div class="sent-history-list">
            ${sentSummary || '<small>Nenhum pedido enviado ainda.</small>'}
          </div>
        </div>

        <div class="comanda-secondary-actions">
          ${manager?'<button class="ghost" onclick="openAllOrdersManager()">Visualizar todos os pedidos</button>':''}
          ${canCloseComanda()
            ? '<button class="ghost" onclick="openCheckout()">Fechar comanda</button>'
            : ''}
        </div>
      </aside>
    </div>
  `);

  updateStableCart();

  if(orderReviewLocked && lastSentOrderId){
    const reviewedOrder=state.orders.find(o=>o.id===lastSentOrderId);
    if(reviewedOrder){
      showSentOrderInline(reviewedOrder);
    }
  }
}



window.openAllOrdersManager=function(){
  if(!canManageComanda()) return alert('Somente MASTER ou GESTOR podem gerenciar os pedidos da comanda.');

  const tab=state.tabs.find(t=>t.id===currentTabId);
  if(!tab) return;

  const orders=state.orders
    .filter(o=>o.tabId===currentTabId&&o.status!=='CANCELADO')
    .slice()
    .sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));

  const content=orders.map((order,orderIndex)=>`
    <section class="manager-order-card">
      <div class="manager-order-head">
        <div>
          <strong>${order.automatic?'Lançamentos automáticos':`Pedido ${orderIndex+1}`}</strong>
          <small>${new Date(order.createdAt).toLocaleString('pt-BR')} • ${order.createdByName||'Sistema'}</small>
        </div>
        <strong>${money(order.total)}</strong>
      </div>

      <div class="manager-order-items">
        ${order.items.map((item,itemIndex)=>`
          <div class="manager-order-item">
            <div>
              <strong>${item.name}</strong>
              <small>${money(item.price)} cada</small>
            </div>

            ${order.automatic?`
              <span>${item.qty}x</span>
            `:`
              <div class="manager-item-actions">
                <button onclick="managerChangeItemQty('${order.id}',${itemIndex},-1)">−</button>
                <b>${item.qty}</b>
                <button onclick="managerChangeItemQty('${order.id}',${itemIndex},1)">+</button>
                <button class="danger" onclick="managerCancelItem('${order.id}',${itemIndex})">Cancelar item</button>
              </div>
            `}
          </div>`).join('')}
      </div>
    </section>
  `).join('');

  openModal(`Todos os pedidos • Comanda ${tab.number}`,`
    <div class="manager-orders-view">
      <div class="manager-warning">
        <strong>Área de gestão</strong>
        <span>Somente MASTER e GESTOR podem alterar ou cancelar itens já enviados.</span>
      </div>
      ${content || '<small>Nenhum pedido registrado.</small>'}
      <div class="checkout">
        <button class="ghost" onclick="renderTabModal()">Voltar para a comanda</button>
      </div>
    </div>
  `);
};

window.managerChangeItemQty=function(orderId,itemIndex,delta){
  if(!canManageComanda()) return alert('Sem permissão.');

  const order=state.orders.find(o=>o.id===orderId);
  if(!order || order.automatic) return;

  const item=order.items[itemIndex];
  if(!item) return;

  const newQty=Number(item.qty||0)+delta;
  if(newQty<=0){
    return managerCancelItem(orderId,itemIndex);
  }

  // Ajusta estoque de forma inversa à alteração.
  const product=state.products.find(p=>p.id===item.productId);
  if(delta>0 && product && product.stock<delta){
    return alert(`Estoque insuficiente: ${product.name}`);
  }
  if(product) product.stock-=delta;

  item.qty=newQty;
  order.total=order.items.reduce((s,i)=>s+Number(i.qty||0)*Number(i.price||0),0);
  order.updatedAt=new Date().toISOString();
  order.updatedBy=window.currentProfile?.id||null;
  order.updatedByName=window.currentProfile?.full_name||'Gestor';

  save();
  openAllOrdersManager();
};

window.managerCancelItem=function(orderId,itemIndex){
  if(!canManageComanda()) return alert('Sem permissão.');

  const order=state.orders.find(o=>o.id===orderId);
  if(!order || order.automatic) return;

  const item=order.items[itemIndex];
  if(!item) return;

  if(!confirm(`Cancelar ${item.qty}x ${item.name}?`)) return;

  const product=state.products.find(p=>p.id===item.productId);
  if(product) product.stock+=Number(item.qty||0);

  if(!order.cancelledItems) order.cancelledItems=[];
  order.cancelledItems.push({
    ...item,
    cancelledAt:new Date().toISOString(),
    cancelledBy:window.currentProfile?.id||null,
    cancelledByName:window.currentProfile?.full_name||'Gestor'
  });

  order.items.splice(itemIndex,1);
  order.total=order.items.reduce((s,i)=>s+Number(i.qty||0)*Number(i.price||0),0);
  order.updatedAt=new Date().toISOString();

  if(!order.items.length){
    order.status='CANCELADO';
    order.cancelledAt=new Date().toISOString();
    order.cancelledBy=window.currentProfile?.id||null;
    order.cancelledByName=window.currentProfile?.full_name||'Gestor';
  }

  save();
  openAllOrdersManager();
};

window.addProductStable=function(pid){
  const p=state.products.find(x=>x.id===pid);
  if(!p) return;

  const line=cart.find(x=>x.productId===pid);
  if(line) line.qty++;
  else cart.push({
    productId:p.id,
    name:p.name,
    category:p.category,
    sector:p.sector,
    price:p.price,
    qty:1
  });

  updateStableCart();
};

window.changeStableQty=function(index,delta){
  const line=cart[index];
  if(!line) return;
  line.qty+=delta;
  if(line.qty<=0) cart.splice(index,1);
  updateStableCart();
};

window.removeStableItem=function(index){
  cart.splice(index,1);
  updateStableCart();
};

function updateStableCart(){
  const box=document.getElementById('stableCartLines');
  const totalEl=document.getElementById('stableCartTotal');
  const sendBtn=document.getElementById('stableSendButton');
  if(!box||!totalEl||!sendBtn) return;

  if(!cart.length){
    box.innerHTML='<div class="empty-current-order">Clique nos produtos do cardápio para montar o pedido.</div>';
  }else{
    box.innerHTML=cart.map((l,i)=>`
      <div class="stable-cart-item">
        <div class="stable-cart-info">
          <strong>${l.name}</strong>
          <small>${l.sector==='EXTRAS'?'EXTRA':l.sector} • ${money(l.price)}</small>
        </div>
        <div class="stable-cart-controls">
          <button onclick="changeStableQty(${i},-1)">−</button>
          <b>${l.qty}</b>
          <button onclick="changeStableQty(${i},1)">+</button>
          <button class="remove-stable" onclick="removeStableItem(${i})">×</button>
        </div>
      </div>`).join('');
  }

  const total=cart.reduce((s,l)=>s+Number(l.qty||0)*Number(l.price||0),0);
  totalEl.textContent=money(total);
  sendBtn.disabled=!cart.length;
}

window.sendOrderStable=async function(){
  const sendBtn=document.getElementById('stableSendButton');

  if(!canOperateSelectedDay()){
    showActionToast('Seu perfil só pode lançar pedidos no dia atual.','error');
    return alert('Seu perfil só pode lançar pedidos no dia atual.');
  }

  if(!cart.length){
    showActionToast('Nenhum item foi selecionado.','error');
    return;
  }

  setButtonBusy(sendBtn,true,'Enviando pedido...');
  showActionToast('Enviando pedido...','info',1800);

  const stateBefore=structuredClone(state);
  const cartBefore=structuredClone(cart);

  try{
    for(const line of cart){
      const p=state.products.find(x=>x.id===line.productId);
      if(p&&p.stock<line.qty){
        throw new Error(`Estoque insuficiente: ${p.name}`);
      }
    }

    const order={
      id:id(),
      tabId:currentTabId,
      items:structuredClone(cart),
      total:cart.reduce((s,l)=>s+Number(l.qty||0)*Number(l.price||0),0),
      createdAt:new Date().toISOString(),
      status:'ENVIADO',
      createdBy:window.currentProfile?.id||null,
      createdByName:window.currentProfile?.full_name||'Usuário'
    };

    state.orders.push(order);

    cart.forEach(line=>{
      const p=state.products.find(x=>x.id===line.productId);
      if(p) p.stock-=line.qty;
    });

    lastSentOrderId=order.id;
    orderReviewLocked=true;

    await save();

    cart=[];
    updateStableCart();
    showSentOrderInline(order);
    showActionToast('Pedido enviado e salvo com sucesso.','success',3200);

  }catch(err){
    console.error('Falha ao enviar pedido:',err);

    state=stateBefore;
    cart=cartBefore;
    localStorage.setItem('aventura_pdv',JSON.stringify(state));
    renderAll();

    if(currentTabId) renderTabModal();

    const message=err?.message||'Não foi possível enviar o pedido.';
    showActionToast(`Pedido NÃO enviado: ${message}`,'error',6000);
    alert(`Não foi possível enviar o pedido.\n\n${message}`);

  }finally{
    const currentBtn=document.getElementById('stableSendButton');
    setButtonBusy(currentBtn,false);
    updateStableCart();
  }
};

function showSentOrderInline(order){
  const area=document.getElementById('sentOrderArea');
  if(!area) return;

  const tab=state.tabs.find(t=>t.id===order.tabId);
  const bar=order.items.filter(i=>i.sector==='BAR');
  const cozinha=order.items.filter(i=>i.sector==='COZINHA');
  const extras=order.items.filter(i=>!['BAR','COZINHA'].includes(i.sector));

  area.classList.remove('hidden');
  area.innerHTML=`
    <div class="sent-order-success">
      <strong>Pedido enviado e salvo.</strong>
      <span>Agora confira o resumo abaixo. Esta tela ficará aberta até você imprimir ou clicar em “Novo pedido nesta comanda”.</span>
    </div>

    <div class="order-review-steps">
      <span class="done">1. Pedido enviado ✓</span>
      <span class="active">2. Conferir BAR / COZINHA</span>
      <span>3. Imprimir</span>
    </div>

    <div class="production-tabs inline-production-tabs">
      <button class="production-tab active" data-sector="BAR" onclick="switchInlinePrintTab('BAR')">
        BAR <span>${bar.reduce((s,i)=>s+Number(i.qty||0),0)}</span>
      </button>
      <button class="production-tab" data-sector="COZINHA" onclick="switchInlinePrintTab('COZINHA')">
        COZINHA <span>${cozinha.reduce((s,i)=>s+Number(i.qty||0),0)}</span>
      </button>
    </div>

    <div class="inline-production-panes">
      <div class="inline-production-pane active" data-sector="BAR">
        ${receiptHtml('BAR',bar,tab,order)}
      </div>
      <div class="inline-production-pane" data-sector="COZINHA">
        ${receiptHtml('COZINHA',cozinha,tab,order)}
      </div>
    </div>

    ${extras.length?`
      <div class="non-production-items">
        <strong>Sem impressão de produção</strong>
        ${extras.map(i=>`<span>${i.qty}x ${i.name}</span>`).join('')}
      </div>`:''}

    <div class="inline-print-actions">
      <button class="ghost" onclick="printSector('BAR')" ${bar.length?'':'disabled'}>Imprimir BAR</button>
      <button class="ghost" onclick="printSector('COZINHA')" ${cozinha.length?'':'disabled'}>Imprimir COZINHA</button>
      <button class="primary" onclick="printBothSectors()" ${bar.length||cozinha.length?'':'disabled'}>Imprimir os dois</button>
    </div>

    <button class="ghost new-order-same-tab" onclick="startAnotherOrder()">+ Novo pedido nesta comanda</button>
  `;
}

window.switchInlinePrintTab=function(sector){
  document.querySelectorAll('.inline-production-tabs .production-tab').forEach(b=>{
    b.classList.toggle('active',b.dataset.sector===sector);
  });
  document.querySelectorAll('.inline-production-pane').forEach(p=>{
    p.classList.toggle('active',p.dataset.sector===sector);
  });
};

window.startAnotherOrder=function(){
  orderReviewLocked=false;
  lastSentOrderId=null;
  cart=[];

  // Reabre a mesma comanda; pedidos anteriores permanecem no histórico.
  renderTabModal();

  setTimeout(()=>{
    const first=document.querySelector('.order-menu-scroll');
    first?.scrollTo({top:0,behavior:'smooth'});
  },50);
};

window.addProduct=function(pid){const p=state.products.find(x=>x.id===pid);if(!p)return;const line=cart.find(x=>x.productId===pid);if(line)line.qty++;else cart.push({productId:p.id,name:p.name,sector:p.sector,price:p.price,qty:1});renderTabModal();};
window.removeCart=i=>{cart.splice(i,1);renderTabModal();};

window.sendOrder=async function(){
  if(!cart.length)return;
  for(const line of cart){
    const p=state.products.find(x=>x.id===line.productId);
    if(p&&p.stock<line.qty)return alert(`Estoque insuficiente: ${p.name}`);
  }
  const order={
    id:id(),tabId:currentTabId,items:structuredClone(cart),
    total:cart.reduce((s,l)=>s+l.qty*l.price,0),
    createdAt:new Date().toISOString(),status:'ENVIADO',
    createdBy:window.currentProfile?.id||null,
    createdByName:window.currentProfile?.full_name||'Usuário'
  };
  state.orders.push(order);
  cart.forEach(line=>{
    const p=state.products.find(x=>x.id===line.productId);
    if(p)p.stock-=line.qty;
  });
  save();
  cart=[];
  showPrintPreview(order);
};

function receiptHtml(sector,items,tab,order){
  if(!items.length) return `<div class="print-preview-empty"><strong>${sector}</strong><span>Nenhum item para este setor.</span></div>`;
  return `<div class="print-preview-ticket" data-ticket="${sector}">
    <div class="print-preview-sector">${sector}</div>
    <strong>${state.settings.company}</strong>
    <span>${state.settings.boat}</span>
    <hr>
    <strong>COMANDA ${tab.number}</strong>
    <span>Responsável: ${tab.customer||'Sem responsável'}</span>
    <span>Pessoas: ${tab.people||1}</span>
    <span>${new Date(order.createdAt).toLocaleString('pt-BR')}</span>
    <hr>
    ${items.map(i=>`<div class="print-item"><b>${i.qty}x</b><span>${i.name}</span></div>`).join('')}
    <hr>
    <small>Lançado por: ${order.createdByName||'Usuário'}</small>
  </div>`;
}

window.switchPrintTab=function(sector){
  document.querySelectorAll('.production-tab').forEach(b=>b.classList.toggle('active',b.dataset.sector===sector));
  document.querySelectorAll('.production-pane').forEach(p=>p.classList.toggle('active',p.dataset.sector===sector));
};

window.printSector=function(sector){
  orderReviewLocked=true;
  document.body.dataset.printSector=sector;
  window.print();
  setTimeout(()=>{
    delete document.body.dataset.printSector;
    orderReviewLocked=true;
  },300);
};

window.printBothSectors=function(){
  orderReviewLocked=true;
  document.body.dataset.printSector='AMBOS';
  window.print();
  setTimeout(()=>{
    delete document.body.dataset.printSector;
    orderReviewLocked=true;
  },300);
};

function showPrintPreview(order){
  const tab=state.tabs.find(t=>t.id===order.tabId);
  const bar=order.items.filter(i=>i.sector==='BAR');
  const cozinha=order.items.filter(i=>i.sector==='COZINHA');
  const extras=order.items.filter(i=>!['BAR','COZINHA'].includes(i.sector));

  openModal('Pedido enviado • Conferir impressão',`
    <div class="print-preview-note">
      <strong>PEDIDO SALVO</strong>
      <span>Confira o que será enviado para cada setor. A impressão só acontece depois que você escolher abaixo.</span>
    </div>

    <div class="production-tabs">
      <button class="production-tab active" data-sector="BAR" onclick="switchPrintTab('BAR')">
        BAR <span>${bar.reduce((s,i)=>s+Number(i.qty||0),0)}</span>
      </button>
      <button class="production-tab" data-sector="COZINHA" onclick="switchPrintTab('COZINHA')">
        COZINHA <span>${cozinha.reduce((s,i)=>s+Number(i.qty||0),0)}</span>
      </button>
    </div>

    <div class="production-panes">
      <div class="production-pane active" data-sector="BAR">
        ${receiptHtml('BAR',bar,tab,order)}
      </div>
      <div class="production-pane" data-sector="COZINHA">
        ${receiptHtml('COZINHA',cozinha,tab,order)}
      </div>
    </div>

    ${extras.length?`
      <div class="non-production-items">
        <strong>Itens sem impressão de produção</strong>
        ${extras.map(i=>`<span>${i.qty}x ${i.name}</span>`).join('')}
      </div>`:''}

    <div class="print-action-grid">
      <button class="ghost" onclick="printSector('BAR')" ${bar.length?'':'disabled'}>Imprimir BAR</button>
      <button class="ghost" onclick="printSector('COZINHA')" ${cozinha.length?'':'disabled'}>Imprimir COZINHA</button>
      <button class="primary" onclick="printBothSectors()" ${bar.length||cozinha.length?'':'disabled'}>Imprimir os dois</button>
    </div>

    <div class="checkout">
      <button class="ghost" onclick="renderTabModal()">Voltar para a comanda</button>
      <button class="primary" onclick="closeModal()">Concluir</button>
    </div>
  `);
}


function getTabClosingValues(tabId){
  const orders=state.orders.filter(o=>o.tabId===tabId&&o.status!=='CANCELADO');

  const automaticOrders=orders.filter(o=>o.automatic);
  const normalOrders=orders.filter(o=>!o.automatic);

  const productSubtotal=normalOrders.reduce((sum,o)=>sum+Number(o.total||0),0);

  const couvert=automaticOrders.reduce((sum,o)=>
    sum+o.items.filter(i=>i.productId==='taxa-couvert-artistico')
      .reduce((s,i)=>s+Number(i.qty||0)*Number(i.price||0),0)
  ,0);

  const sustentabilidade=automaticOrders.reduce((sum,o)=>
    sum+o.items.filter(i=>i.productId==='taxa-sustentabilidade')
      .reduce((s,i)=>s+Number(i.qty||0)*Number(i.price||0),0)
  ,0);

  return {orders,normalOrders,automaticOrders,productSubtotal,couvert,sustentabilidade};
}

window.updateClosingFees=function(){
  const tab=state.tabs.find(t=>t.id===currentTabId);
  if(!tab) return;

  const base=getTabClosingValues(currentTabId);

  const useService=document.getElementById('toggleServiceFee')?.checked!==false;
  const useCouvert=document.getElementById('toggleCouvert')?.checked!==false;
  const useSustainability=document.getElementById('toggleSustainability')?.checked!==false;

  const serviceFee=useService?base.productSubtotal*0.10:0;
  const couvert=useCouvert?base.couvert:0;
  const sustentabilidade=useSustainability?base.sustentabilidade:0;
  const total=base.productSubtotal+serviceFee+couvert+sustentabilidade;

  const setText=(id,val)=>{
    const el=document.getElementById(id);
    if(el) el.textContent=money(val);
  };

  setText('closingProductsSubtotal',base.productSubtotal);
  setText('closingServiceFee',serviceFee);
  setText('closingCouvert',couvert);
  setText('closingSustainability',sustentabilidade);
  setText('closingGrandTotal',total);
  setText('checkoutTopTotal',total);
  setText('mixedTotalReference',total);

  const card=Math.max(0,Number(document.getElementById('payCard')?.value)||0);
  const pix=Math.max(0,Number(document.getElementById('payPix')?.value)||0);
  const cash=Math.max(0,Number(document.getElementById('payCash')?.value)||0);
  const paid=card+pix+cash;
  const remaining=total-paid;

  const paidEl=document.getElementById('mixedPaid');
  const remainingEl=document.getElementById('mixedRemaining');
  const msg=document.getElementById('mixedPaymentMessage');
  const btn=document.getElementById('confirmMixedPaymentBtn');

  if(paidEl) paidEl.textContent=money(paid);
  if(remainingEl) remainingEl.textContent=money(Math.abs(remaining)<0.005?0:remaining);

  const balanced=Math.abs(remaining)<0.005;
  if(btn) btn.disabled=!balanced;

  if(msg){
    msg.classList.remove('ok','error');
    if(balanced){
      msg.textContent='Pagamento distribuído corretamente.';
      msg.classList.add('ok');
    }else if(remaining>0){
      msg.textContent=`Ainda faltam ${money(remaining)} para completar o pagamento.`;
    }else{
      msg.textContent=`O valor informado ultrapassa o total em ${money(Math.abs(remaining))}.`;
      msg.classList.add('error');
    }
  }

  return {
    ...base,
    useService,useCouvert,useSustainability,
    serviceFee,couvert,sustentabilidade,total,
    card,pix,cash,paid,remaining,balanced
  };
}

window.openCheckout=function(){
  if(!canOperateSelectedDay()) return alert('Seu perfil só pode fechar comandas no dia atual.');
  if(!canCloseComanda()){
    alert('Seu perfil não pode fechar comandas.');
    return;
  }

  const tab=state.tabs.find(t=>t.id===currentTabId);
  if(!tab) return;

  const base=getTabClosingValues(currentTabId);

  const productItemsMap={};
  for(const order of base.normalOrders){
    for(const item of order.items){
      const key=item.productId||item.name;
      if(!productItemsMap[key]){
        productItemsMap[key]={name:item.name,qty:0,price:item.price,total:0};
      }
      productItemsMap[key].qty+=Number(item.qty||0);
      productItemsMap[key].total+=Number(item.qty||0)*Number(item.price||0);
    }
  }

  const items=Object.values(productItemsMap);

  const lines=items.length
    ? items.map(i=>`
      <div class="checkout-item">
        <div><strong>${i.qty}x ${i.name}</strong><small>${money(i.price)} cada</small></div>
        <strong>${money(i.total)}</strong>
      </div>`).join('')
    : '<small>Nenhum produto consumido.</small>';

  const initialService=base.productSubtotal*0.10;
  const initialTotal=base.productSubtotal+initialService+base.couvert+base.sustentabilidade;

  openModal(`Fechamento • Comanda ${tab.number}`,`
    <div class="checkout-panel">
      <div class="checkout-client">
        <div>
          <span class="eyebrow">CONFERÊNCIA DA COMANDA</span>
          <h3>Comanda ${tab.number}</h3>
          <p>${tab.customer||'Sem responsável'} • ${tab.people||1} pessoa(s)</p>
        </div>
        <div class="checkout-total-box">
          <span>Total a pagar</span>
          <strong id="checkoutTopTotal">${money(initialTotal)}</strong>
        </div>
      </div>

      <div class="checkout-items-list">${lines}</div>

      <div class="closing-fees-panel">
        <div class="closing-fees-title">
          <strong>Taxas do fechamento</strong>
          <small>Ligue ou desligue cada cobrança antes de receber.</small>
        </div>

        <label class="fee-toggle-row">
          <div>
            <strong>Taxa de serviço 10%</strong>
            <small>10% somente sobre produtos/consumos.</small>
          </div>
          <div class="fee-toggle-end">
            <strong id="closingServiceFee">${money(initialService)}</strong>
            <input id="toggleServiceFee" type="checkbox" checked onchange="updateClosingFees()">
          </div>
        </label>

        <label class="fee-toggle-row">
          <div>
            <strong>Couvert artístico</strong>
            <small>${tab.voucherId?'Conforme composição do voucher (inteira, meia, cortesia e free)':`${tab.people||1} pessoa(s) × R$ 12,00`}</small>
          </div>
          <div class="fee-toggle-end">
            <strong id="closingCouvert">${money(base.couvert)}</strong>
            <input id="toggleCouvert" type="checkbox" checked onchange="updateClosingFees()">
          </div>
        </label>

        <label class="fee-toggle-row">
          <div>
            <strong>Taxa de sustentabilidade</strong>
            <small>${tab.voucherId?'Conforme composição do voucher (inteira, meia, cortesia e free)':`${tab.people||1} pessoa(s) × R$ 2,00`}</small>
          </div>
          <div class="fee-toggle-end">
            <strong id="closingSustainability">${money(base.sustentabilidade)}</strong>
            <input id="toggleSustainability" type="checkbox" checked onchange="updateClosingFees()">
          </div>
        </label>
      </div>

      <div class="checkout-summary">
        <div><span>Subtotal dos produtos</span><strong id="closingProductsSubtotal">${money(base.productSubtotal)}</strong></div>
        <div><span>Taxa de serviço 10%</span><strong id="closingServiceFeeSummary">${money(initialService)}</strong></div>
        <div><span>Couvert artístico</span><strong id="closingCouvertSummary">${money(base.couvert)}</strong></div>
        <div><span>Sustentabilidade</span><strong id="closingSustainabilitySummary">${money(base.sustentabilidade)}</strong></div>
        <div class="checkout-summary-total"><span>Total final</span><strong id="closingGrandTotal">${money(initialTotal)}</strong></div>
      </div>

      <div class="mixed-payment-box">
        <div class="mixed-payment-head">
          <div>
            <strong>Distribuição do pagamento</strong>
            <small>Preencha um ou mais meios de pagamento.</small>
          </div>
          <strong id="mixedTotalReference" class="mixed-total-reference">Total: ${money(initialTotal)}</strong>
        </div>

        <div class="mixed-payment-grid">
          <label>
            <span>Cartão</span>
            <div class="money-input-wrap">
              <span>R$</span>
              <input id="payCard" type="number" min="0" step="0.01" value="0.00" inputmode="decimal" oninput="updateClosingFees()">
            </div>
          </label>

          <label>
            <span>PIX</span>
            <div class="money-input-wrap">
              <span>R$</span>
              <input id="payPix" type="number" min="0" step="0.01" value="0.00" inputmode="decimal" oninput="updateClosingFees()">
            </div>
          </label>

          <label>
            <span>Dinheiro</span>
            <div class="money-input-wrap">
              <span>R$</span>
              <input id="payCash" type="number" min="0" step="0.01" value="0.00" inputmode="decimal" oninput="updateClosingFees()">
            </div>
          </label>
        </div>

        <div class="mixed-payment-status">
          <div><span>Pago</span><strong id="mixedPaid">${money(0)}</strong></div>
          <div><span>Falta</span><strong id="mixedRemaining">${money(initialTotal)}</strong></div>
        </div>

        <div id="mixedPaymentMessage" class="mixed-payment-message">
          Distribua o valor entre Cartão, PIX e Dinheiro.
        </div>
      </div>

      <div class="checkout-actions">
        <button class="ghost" onclick="printCustomerReceipt()">Imprimir / visualizar nota</button>
        <button class="ghost" onclick="renderTabModal()">Voltar</button>
        <button id="confirmMixedPaymentBtn" class="primary" onclick="confirmCloseTab()" disabled>Confirmar pagamento e fechar</button>
      </div>
    </div>
  `);

  // Mantém os valores dos espelhos do resumo sincronizados.
  const mirrorObserver=()=>{
    const vals=updateClosingFees();
    const map=[
      ['closingServiceFeeSummary',vals?.serviceFee],
      ['closingCouvertSummary',vals?.couvert],
      ['closingSustainabilitySummary',vals?.sustentabilidade]
    ];
    map.forEach(([id,v])=>{
      const el=document.getElementById(id);
      if(el) el.textContent=money(v||0);
    });
  };

  ['toggleServiceFee','toggleCouvert','toggleSustainability','payCard','payPix','payCash']
    .forEach(id=>document.getElementById(id)?.addEventListener('input',mirrorObserver));

  mirrorObserver();
};

window.printCustomerReceipt=function(){
  if(!canCloseComanda()){
    alert('Seu perfil não pode acessar o fechamento desta comanda.');
    return;
  }

  const tab=state.tabs.find(t=>t.id===currentTabId);
  if(!tab) return;

  const values=updateClosingFees();
  if(!values) return;

  const itemsMap={};
  for(const order of values.normalOrders){
    for(const item of order.items){
      const key=item.productId||item.name;
      if(!itemsMap[key]) itemsMap[key]={name:item.name,qty:0,price:item.price,total:0};
      itemsMap[key].qty+=Number(item.qty||0);
      itemsMap[key].total+=Number(item.qty||0)*Number(item.price||0);
    }
  }

  const items=Object.values(itemsMap);

  openModal(`Nota • Comanda ${tab.number}`,`
    <div class="customer-receipt">
      <div class="receipt-center">
        <strong>${state.settings.company}</strong>
        <span>${state.settings.boat}</span>
        <span>COMANDA ${tab.number}</span>
        <span>Responsável: ${tab.customer||'Sem responsável'}</span>
        <span>Pessoas: ${tab.people||1}</span>
      </div>

      <hr>

      ${items.length?items.map(i=>`
        <div class="receipt-line">
          <span>${i.qty}x ${i.name}</span>
          <strong>${money(i.total)}</strong>
        </div>`).join(''):'<div class="receipt-line"><span>Nenhum produto</span><strong>${money(0)}</strong></div>'}

      <hr>

      <div class="receipt-line"><span>Subtotal dos produtos</span><strong>${money(values.productSubtotal)}</strong></div>
      <div class="receipt-line"><span>Taxa de serviço 10%</span><strong>${money(values.serviceFee)}</strong></div>
      <div class="receipt-line"><span>Couvert artístico</span><strong>${money(values.couvert)}</strong></div>
      <div class="receipt-line"><span>Taxa de sustentabilidade</span><strong>${money(values.sustentabilidade)}</strong></div>

      <div class="receipt-service-note">
        10% calculados somente sobre produtos/consumos. Couvert e sustentabilidade não entram na base.
      </div>

      <hr>

      <div class="receipt-total"><span>TOTAL</span><strong>${money(values.total)}</strong></div>
      <small>Prévia para conferência do cliente.</small>
    </div>

    <div class="checkout-actions">
      <button class="ghost" onclick="openCheckout()">Voltar ao fechamento</button>
      <button class="primary" onclick="window.print()">Imprimir pelo navegador</button>
    </div>
  `);
};

window.confirmCloseTab=function(){
  if(!canCloseComanda()){
    alert('Seu perfil não pode fechar comandas.');
    return;
  }

  const tab=state.tabs.find(t=>t.id===currentTabId);
  if(!tab) return;

  const values=updateClosingFees();
  if(!values) return;

  if(!values.balanced){
    return alert('A soma de Cartão, PIX e Dinheiro precisa ser exatamente igual ao total da comanda.');
  }

  if(values.paid<=0){
    return alert('Informe o pagamento antes de fechar a comanda.');
  }

  tab.status='FECHADA';
  tab.closedAt=new Date().toISOString();

  tab.productSubtotal=values.productSubtotal;
  tab.serviceFee=values.serviceFee;
  tab.chargedCouvert=values.couvert;
  tab.chargedSustainability=values.sustentabilidade;
  tab.feeSettings={
    service:values.useService,
    couvert:values.useCouvert,
    sustainability:values.useSustainability
  };
  tab.total=values.total;

  tab.closedBy=window.currentProfile?.id||null;
  tab.closedByName=window.currentProfile?.full_name||'Usuário';

  const paymentTime=new Date().toISOString();
  const paymentCommon={
    tabId:tab.id,
    subtotal:values.productSubtotal,
    serviceFee:values.serviceFee,
    couvert:values.couvert,
    sustentabilidade:values.sustentabilidade,
    createdAt:paymentTime,
    createdBy:window.currentProfile?.id||null,
    createdByName:window.currentProfile?.full_name||'Usuário'
  };

  if(values.card>0){
    state.payments.push({
      id:id(),
      ...paymentCommon,
      method:'CARTAO',
      amount:values.card
    });
  }

  if(values.pix>0){
    state.payments.push({
      id:id(),
      ...paymentCommon,
      method:'PIX',
      amount:values.pix
    });
  }

  if(values.cash>0){
    state.payments.push({
      id:id(),
      ...paymentCommon,
      method:'DINHEIRO',
      amount:values.cash
    });
  }

  tab.paymentBreakdown={
    CARTAO:values.card,
    PIX:values.pix,
    DINHEIRO:values.cash
  };

  save();
  currentTabId=null;
  closeModal();

  if(isGerente()) showView('caixa');
  else showView('comandas');
};


window.editTab=function(tabId){
  if(!canManageComanda()) return alert('Sem permissão para editar comanda.');
  const tab=state.tabs.find(t=>t.id===tabId);
  if(!tab) return alert('Comanda não encontrada.');

  openModal(`Editar comanda ${tab.number}`,`
    <div class="comanda-open-form">
      <label><span>Número da comanda</span><input id="editTabNumber" type="number" min="1" value="${escHtml(tab.number)}"></label>
      <label><span>Responsável</span><input id="editTabCustomer" value="${escHtml(tab.customer||'')}"></label>
      <label><span>Quantidade de pessoas</span><input id="editTabPeople" type="number" min="1" value="${Number(tab.people||1)}"></label>
      <label><span>Agente</span><input id="editTabAgent" value="${escHtml(tab.agent||'')}" placeholder="Opcional"></label>
    </div>
    <div class="checkout-actions">
      <button class="ghost" onclick="closeModal()">Cancelar</button>
      <button class="primary" onclick="saveTabEdit('${tab.id}')">Salvar alterações</button>
    </div>
  `);
};

window.saveTabEdit=async function(tabId){
  if(!canManageComanda()) return alert('Sem permissão.');
  const tab=state.tabs.find(t=>t.id===tabId);
  if(!tab) return alert('Comanda não encontrada.');

  const number=String(Number(document.getElementById('editTabNumber')?.value)||'');
  const customer=document.getElementById('editTabCustomer')?.value.trim();
  const people=Number(document.getElementById('editTabPeople')?.value);
  const agentName=document.getElementById('editTabAgent')?.value.trim();

  if(!number || Number(number)<=0) return alert('Informe um número de comanda válido.');
  if(!customer) return alert('Informe o responsável.');
  if(!Number.isInteger(people)||people<=0) return alert('Informe a quantidade de pessoas.');

  const duplicate=state.tabs.some(t=>t.id!==tabId && tabOperationalDate(t)===tabOperationalDate(tab) && String(Number(t.number))===String(Number(number)));
  if(duplicate) return alert(`A Comanda ${number} já existe neste dia.`);

  const oldPeople=Number(tab.people||1);
  tab.number=number;
  tab.customer=customer;
  tab.people=people;
  tab.agent=agentName||'';
  const agent=ensureAgentFromVoucher(agentName);
  tab.agentId=agent?.id||null;
  tab.updatedAt=new Date().toISOString();
  tab.updatedBy=window.currentProfile?.id||null;
  tab.updatedByName=window.currentProfile?.full_name||'Usuário';

  if(oldPeople!==people){
    const automatic=state.orders.find(o=>o.tabId===tabId&&o.automatic&&o.status!=='CANCELADO');
    if(automatic){
      automatic.items.forEach(item=>{
        if(['taxa-couvert-artistico','taxa-sustentabilidade'].includes(item.productId)) item.qty=people;
      });
      automatic.total=automatic.items.reduce((s,i)=>s+Number(i.qty||0)*Number(i.price||0),0);
    }
  }

  try{
    showActionToast('Salvando alterações...','info',1500);
    await save();
    closeModal();
    showActionToast(`Comanda ${number} atualizada com sucesso.`,'success');
  }catch(err){
    console.error(err);
    showActionToast(`Erro ao editar comanda: ${err?.message||'falha ao salvar'}`,'error',5000);
  }
};

window.deleteTabPermanently=function(tabId){
  if(!canManageComanda()){
    return alert('Somente MASTER, GESTOR ou GERENTE podem apagar comandas.');
  }

  const tab=state.tabs.find(t=>t.id===tabId);
  if(!tab) return alert('Comanda não encontrada.');

  const linkedOrders=state.orders.filter(o=>o.tabId===tabId);
  const linkedPayments=state.payments.filter(p=>p.tabId===tabId);

  const warning=
    `ATENÇÃO: apagar a Comanda ${tab.number}?\n\n`+
    `Responsável: ${tab.customer||'Sem responsável'}\n\n`+
    `Esta ação excluirá DEFINITIVAMENTE a comanda, os pedidos e os pagamentos vinculados.\n`+
    `Ela não aparecerá no Caixa, Relatórios ou vendas.\n\n`+
    `O estoque dos itens lançados será devolvido.\n\n`+
    `ESTA AÇÃO NÃO PODE SER DESFEITA.`;

  if(!confirm(warning)) return;

  // Devolve ao estoque somente itens de pedidos não automáticos e não cancelados.
  linkedOrders
    .filter(o=>!o.automatic && o.status!=='CANCELADO')
    .forEach(order=>{
      (order.items||[]).forEach(item=>{
        const product=state.products.find(p=>p.id===item.productId);
        if(product) product.stock+=Number(item.qty||0);
      });
    });

  // Se a comanda veio de voucher, desvincula o voucher para permitir nova comanda.
  state.vouchers.forEach(v=>{
    if(v.tabId===tabId){
      delete v.tabId;
      delete v.tabNumber;
      delete v.boardedAt;
      delete v.boardedBy;
      delete v.boardedByName;

      const paidNow=state.voucherPayments
        .filter(p=>p.voucherId===v.id)
        .reduce((s,p)=>s+Number(p.amount||0),0);
      const remaining=Math.max(0,Number(v.due||0)-paidNow);
      v.status=remaining>0.005?'AGUARDANDO_PAGAMENTO':'PRONTO_EMBARQUE';
    }
  });

  state.orders=state.orders.filter(o=>o.tabId!==tabId);
  state.payments=state.payments.filter(p=>p.tabId!==tabId);
  state.tabs=state.tabs.filter(t=>t.id!==tabId);

  if(currentTabId===tabId){
    currentTabId=null;
    cart=[];
    lastSentOrderId=null;
    orderReviewLocked=false;
  }

  save();
  closeModal();
  showView('comandas');
  alert(`Comanda ${tab.number} apagada definitivamente.`);
};

window.openProductModal=function(){
  if(window.hasPermission&&!window.hasPermission('produtos'))return alert('Sem permissão.');
  openModal('Novo produto',`<div class="form-grid"><label>Nome<input id="pName"></label><label>Setor<select id="pSector"><option>BAR</option><option>COZINHA</option></select></label><label>Preço<input id="pPrice" type="number" step="0.01"></label><label>Estoque inicial<input id="pStock" type="number"></label><label>Estoque mínimo<input id="pMin" type="number" value="5"></label></div><div class="checkout"><button class="primary" onclick="createProduct()">Salvar produto</button></div>`);
};

window.createProduct=function(){
  const name=document.getElementById('pName').value.trim();if(!name)return alert('Informe o nome.');
  state.products.push({id:id(),name,sector:document.getElementById('pSector').value,price:+document.getElementById('pPrice').value||0,stock:+document.getElementById('pStock').value||0,min:+document.getElementById('pMin').value||0});
  save();closeModal();
};

window.stockAdjust=function(pid,delta){
  if(!canOperateSelectedDay()) return alert('Seu perfil só pode alterar estoque no dia atual.');
  if(window.hasPermission&&!window.hasPermission('estoque'))return alert('Sem permissão.');
  const p=state.products.find(x=>x.id===pid);const qty=Number(prompt(delta>0?'Quantidade de entrada:':'Quantidade de saída:'));if(!qty||qty<0)return;p.stock=Math.max(0,p.stock+(delta*qty));save();
};

window.deleteProduct=function(pid){if(confirm('Excluir este produto?')){state.products=state.products.filter(p=>p.id!==pid);save();}};

window.saveSettings=function(){
  if(window.hasPermission&&!window.hasPermission('configuracoes'))return alert('Sem permissão.');
  state.settings.company=document.getElementById('companyName').value.trim()||'Aventura Turismo';
  state.settings.boat=document.getElementById('boatName').value.trim()||'Capitão Gancho';
  state.settings.printBridge=document.getElementById('printBridgeUrl').value.trim()||'http://localhost:8787';
  save();alert('Configurações salvas.');
};

window.testPrinter=sector=>alert(`Impressão física desativada por enquanto. Os pedidos de ${sector} continuarão sendo separados e exibidos na prévia.`);


function getTodayOperationalData(){
  const today=selectedOperationalDate;
  const todaysTabs=state.tabs.filter(t=>new Date(t.createdAt).toLocaleDateString('en-CA')===today);
  const tabIds=new Set(todaysTabs.map(t=>t.id));
  const todaysOrders=state.orders.filter(o=>tabIds.has(o.tabId)&&o.status!=='CANCELADO');
  const todaysPayments=state.payments.filter(p=>tabIds.has(p.tabId));
  const people=todaysTabs.reduce((s,t)=>s+Number(t.people||0),0);
  const open=todaysTabs.filter(t=>t.status==='ABERTA');
  const closed=todaysTabs.filter(t=>t.status==='FECHADA');
  const automaticOrders=todaysOrders.filter(o=>o.automatic);

  const couvert=closed.reduce((sum,t)=>{
    if(t.chargedCouvert!=null) return sum+Number(t.chargedCouvert||0);
    const tabAuto=automaticOrders.filter(o=>o.tabId===t.id);
    return sum+tabAuto.reduce((s,o)=>s+o.items.filter(i=>i.productId==='taxa-couvert-artistico').reduce((a,i)=>a+Number(i.qty||0)*Number(i.price||0),0),0);
  },0);

  const sustentabilidade=closed.reduce((sum,t)=>{
    if(t.chargedSustainability!=null) return sum+Number(t.chargedSustainability||0);
    const tabAuto=automaticOrders.filter(o=>o.tabId===t.id);
    return sum+tabAuto.reduce((s,o)=>s+o.items.filter(i=>i.productId==='taxa-sustentabilidade').reduce((a,i)=>a+Number(i.qty||0)*Number(i.price||0),0),0);
  },0);

  const productOrders=todaysOrders.filter(o=>!o.automatic);

  const productSales=productOrders.reduce(
    (sum,o)=>sum+Number(o.total||0),0
  );

  const barSales=productOrders.reduce(
    (sum,o)=>sum+o.items
      .filter(i=>i.sector==='BAR')
      .reduce((s,i)=>s+Number(i.qty||0)*Number(i.price||0),0)
  ,0);

  const kitchenSales=productOrders.reduce(
    (sum,o)=>sum+o.items
      .filter(i=>i.sector==='COZINHA')
      .reduce((s,i)=>s+Number(i.qty||0)*Number(i.price||0),0)
  ,0);

  const extrasSales=productOrders.reduce(
    (sum,o)=>sum+o.items
      .filter(i=>!['BAR','COZINHA'].includes(i.sector))
      .reduce((s,i)=>s+Number(i.qty||0)*Number(i.price||0),0)
  ,0);

  const serviceFee=closed.reduce((s,t)=>s+Number(t.serviceFee||0),0);
  const totalReceived=todaysPayments.reduce((s,p)=>s+Number(p.amount||0),0);
  const byMethod=m=>todaysPayments.filter(p=>p.method===m).reduce((s,p)=>s+Number(p.amount||0),0);
  const soldMap={};
  for(const o of productOrders){
    for(const i of o.items){
      const k=i.productId||i.name;
      if(!soldMap[k]) soldMap[k]={name:i.name,sector:i.sector,qty:0,total:0};
      soldMap[k].qty+=Number(i.qty||0);
      soldMap[k].total+=Number(i.qty||0)*Number(i.price||0);
    }
  }
  const products=Object.values(soldMap).sort((a,b)=>b.qty-a.qty);
  const durations=closed.filter(t=>t.closedAt).map(t=>(new Date(t.closedAt)-new Date(t.createdAt))/60000).filter(n=>Number.isFinite(n)&&n>=0);
  const avgDuration=durations.length?durations.reduce((a,b)=>a+b,0)/durations.length:0;
  const passages=getPassageReport(today);

  return {
    today,todaysTabs,people,open,closed,couvert,sustentabilidade,productSales,barSales,kitchenSales,extrasSales,serviceFee,totalReceived,
    pix:byMethod('PIX'),cash:byMethod('DINHEIRO'),card:byMethod('CARTAO'),products,avgDuration,
    passages,
    avgTicket:closed.length?totalReceived/closed.length:0,
    avgPerPerson:people?totalReceived/people:0,
    serviceCarol:serviceFee/3,
    serviceHiago:serviceFee/3,
    serviceJoao:serviceFee/3,
    couvertMachineFee:couvert*0.10,
    couvertDimas:couvert*0.90
  };
}

window.downloadDailyReport=function(){
  if(!isGestor()) return alert('Somente MASTER ou GESTOR podem baixar o relatório completo do dia.');

  if(!window.jspdf?.jsPDF){
    alert('O módulo de PDF ainda não carregou. Atualize a página e tente novamente.');
    return;
  }

  const d=getTodayOperationalData(selectedOperationalDate);
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});

  const pageW=210;
  const pageH=297;
  const margin=14;
  const contentW=pageW-(margin*2);

  const purple=[76,35,107];
  const purple2=[112,45,210];
  const dark=[38,35,45];
  const muted=[105,100,115];
  const soft=[247,244,250];
  const line=[226,220,232];
  const green=[29,129,86];
  const orange=[217,135,35];

  const brl=value=>Number(value||0).toLocaleString('pt-BR',{
    style:'currency',
    currency:'BRL'
  });

  const text=(value,x,y,size=9,style='normal',color=dark,align='left')=>{
    doc.setFont('helvetica',style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(String(value??''),x,y,{align});
  };

  const roundedBox=(x,y,w,h,fill=soft,r=3)=>{
    doc.setFillColor(...fill);
    doc.roundedRect(x,y,w,h,r,r,'F');
  };

  const addFooter=()=>{
    const pages=doc.getNumberOfPages();
    for(let i=1;i<=pages;i++){
      doc.setPage(i);
      doc.setDrawColor(...line);
      doc.line(margin,pageH-12,pageW-margin,pageH-12);
      text('Aventura Turismo - Capitão Gancho',margin,pageH-7,7,'normal',muted);
      text(`Página ${i} de ${pages}`,pageW-margin,pageH-7,7,'normal',muted,'right');
    }
  };

  const ensureSpace=(needed,y)=>{
    if(y+needed>pageH-20){
      doc.addPage();
      return 18;
    }
    return y;
  };

  // HEADER
  doc.setFillColor(...purple);
  doc.rect(0,0,pageW,34,'F');
  doc.setFillColor(...purple2);
  doc.roundedRect(margin,8,18,18,4,4,'F');
  text('AT',margin+9,20,12,'bold',[255,255,255],'center');
  text('AVENTURA TURISMO',margin+24,14,10,'bold',[255,255,255]);
  text(state.settings.boat||'Capitão Gancho',margin+24,21,15,'bold',[255,255,255]);
  text('Relatório operacional do dia',margin+24,27,8,'normal',[225,213,238]);

  text(new Date(`${d.today}T12:00:00`).toLocaleDateString('pt-BR',{
    weekday:'long',day:'2-digit',month:'long',year:'numeric'
  }),pageW-margin,15,8,'normal',[255,255,255],'right');
  text(`Gerado às ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`,
    pageW-margin,22,7,'normal',[225,213,238],'right');

  let y=43;

  // SUMMARY CARDS
  text('RESUMO DO DIA',margin,y,10,'bold',purple);
  y+=5;

  const cards=[
    ['Pessoas',d.people],
    ['Comandas fechadas',d.closed.length],
    ['Ticket médio',brl(d.avgTicket)],
    ['Total recebido',brl(d.totalReceived)]
  ];

  const gap=3;
  const cardW=(contentW-(gap*3))/4;
  cards.forEach((c,i)=>{
    const x=margin+i*(cardW+gap);
    roundedBox(x,y,cardW,21,[248,246,251],3);
    text(c[0],x+4,y+7,7,'normal',muted);
    text(c[1],x+4,y+15,10,'bold',dark);
  });
  y+=28;

  // OPERATION DATA
  text('OPERAÇÃO',margin,y,10,'bold',purple);
  y+=5;
  roundedBox(margin,y,contentW,25,[250,249,252],3);

  const op=[
    ['Comandas abertas',d.open.length],
    ['Tempo médio',`${d.avgDuration.toFixed(0)} min`],
    ['Média por pessoa',brl(d.avgPerPerson)],
    ['Produtos/consumos',brl(d.productSales)]
  ];
  op.forEach((item,i)=>{
    const colW=contentW/4;
    const x=margin+i*colW;
    if(i>0){
      doc.setDrawColor(...line);
      doc.line(x,y+5,x,y+20);
    }
    text(item[0],x+4,y+8,7,'normal',muted);
    text(item[1],x+4,y+17,9,'bold',dark);
  });
  y+=32;

  // REVENUE BY SECTOR - bars
  text('VENDAS POR SETOR',margin,y,10,'bold',purple);
  y+=6;

  const sectorData=[
    ['BAR',d.barSales,purple2],
    ['COZINHA',d.kitchenSales,orange],
    ['EXTRAS',d.extrasSales,green]
  ];
  const maxSector=Math.max(...sectorData.map(x=>x[1]),1);

  sectorData.forEach(([label,value,color])=>{
    text(label,margin,y+4,8,'bold',dark);
    text(brl(value),pageW-margin,y+4,8,'bold',dark,'right');

    doc.setFillColor(239,235,244);
    doc.roundedRect(margin+30,y,contentW-60,5,2,2,'F');

    const barW=(contentW-60)*(Number(value)/maxSector);
    if(barW>0){
      doc.setFillColor(...color);
      doc.roundedRect(margin+30,y,Math.max(barW,2),5,2,2,'F');
    }
    y+=10;
  });
  y+=4;

  // PAYMENT METHODS
  text('FORMAS DE PAGAMENTO',margin,y,10,'bold',purple);
  y+=6;

  const payData=[
    ['PIX',d.pix,[80,126,209]],
    ['Cartão',d.card,[112,45,210]],
    ['Dinheiro',d.cash,[29,129,86]]
  ];
  const maxPay=Math.max(...payData.map(x=>x[1]),1);

  payData.forEach(([label,value,color])=>{
    text(label,margin,y+4,8,'bold',dark);
    text(brl(value),pageW-margin,y+4,8,'bold',dark,'right');
    doc.setFillColor(239,235,244);
    doc.roundedRect(margin+30,y,contentW-60,5,2,2,'F');

    const barW=(contentW-60)*(Number(value)/maxPay);
    if(barW>0){
      doc.setFillColor(...color);
      doc.roundedRect(margin+30,y,Math.max(barW,2),5,2,2,'F');
    }
    y+=10;
  });
  y+=4;

  // TAXES / FEES
  y=ensureSpace(38,y);
  text('TAXAS E ADICIONAIS',margin,y,10,'bold',purple);
  y+=6;

  const feeData=[
    ['Couvert artístico',d.couvert],
    ['Sustentabilidade',d.sustentabilidade],
    ['Taxa de serviço 10%',d.serviceFee]
  ];
  const feeW=(contentW-6)/3;
  feeData.forEach((item,i)=>{
    const x=margin+i*(feeW+3);
    roundedBox(x,y,feeW,20,[248,246,251],3);
    text(item[0],x+4,y+7,7,'normal',muted);
    text(brl(item[1]),x+4,y+15,9,'bold',dark);
  });
  y+=27;


  y=ensureSpace(78,y);
  text('PASSAGENS / VOUCHERS',margin,y,10,'bold',purple);
  y+=6;
  [
    ['Passagens cadastradas',d.passages?.count||0],
    ['Passageiros',d.passages?.passengers||0],
    ['Inteira',d.passages?.fullPassengers||0],
    ['Meia',d.passages?.halfPassengers||0],
    ['Cortesia',d.passages?.courtesyPassengers||0],
    ['Free / bebê',d.passages?.freePassengers||0],
    ['Valor total das passagens',brl(d.passages?.passageTotal||0)],
    ['Pago antes do embarque',brl(d.passages?.paidBefore||0)],
    ['Recebido no barco',brl(d.passages?.receivedOnBoard||0)],
    ['Barco - Dinheiro',brl(d.passages?.cash||0)],
    ['Barco - PIX',brl(d.passages?.pix||0)],
    ['Barco - Cartão',brl(d.passages?.card||0)],
    ['Saldo pendente',brl(d.passages?.pending||0)]
  ].forEach(([label,value])=>{
    text(label,margin,y+4,8,'normal',dark);
    text(value,pageW-margin,y+4,8,'bold',dark,'right');
    y+=8;
  });
  y+=4;

  y=ensureSpace(58,y);
  text('REPASSES',margin,y,10,'bold',purple);
  y+=6;
  [
    ['Taxa de serviço 10% - TOTAL DA EQUIPE',d.serviceFee],
    ['Carol - 1/3 da taxa de serviço',d.serviceCarol],
    ['Hiago - 1/3 da taxa de serviço',d.serviceHiago],
    ['João - 1/3 da taxa de serviço',d.serviceJoao],
    ['Couvert bruto',d.couvert],
    ['Taxa máquina do couvert (10%)',d.couvertMachineFee],
    ['Dimas - líquido do couvert',d.couvertDimas]
  ].forEach(([label,value])=>{
    text(label,margin,y+4,8,'normal',dark);
    text(brl(value),pageW-margin,y+4,8,'bold',dark,'right');
    y+=8;
  });
  y+=4;

  // PRODUCTS TABLE
  y=ensureSpace(45,y);
  text('PRODUTOS VENDIDOS',margin,y,10,'bold',purple);
  y+=4;

  const productRows=d.products.map(p=>[
    p.name,
    p.sector,
    String(p.qty),
    brl(p.total)
  ]);

  if(doc.autoTable){
    doc.autoTable({
      startY:y,
      head:[['Produto','Setor','Qtd.','Total']],
      body:productRows.length?productRows:[['Nenhum produto vendido','','','']],
      margin:{left:margin,right:margin,bottom:18},
      theme:'grid',
      styles:{
        font:'helvetica',
        fontSize:7.5,
        cellPadding:2.3,
        lineColor:line,
        lineWidth:.2,
        textColor:dark
      },
      headStyles:{
        fillColor:purple,
        textColor:[255,255,255],
        fontStyle:'bold'
      },
      alternateRowStyles:{
        fillColor:[249,247,251]
      },
      columnStyles:{
        2:{halign:'center',cellWidth:16},
        3:{halign:'right',cellWidth:30},
        1:{cellWidth:25}
      }
    });
    y=doc.lastAutoTable.finalY+9;
  }

  // COMMANDS TABLE
  y=ensureSpace(45,y);
  text('COMANDAS DO DIA',margin,y,10,'bold',purple);
  y+=4;

  const commandRows=d.todaysTabs
    .slice()
    .sort((a,b)=>Number(a.number)-Number(b.number))
    .map(t=>[
      `#${t.number}`,
      t.customer||'-',
      String(t.people||0),
      new Date(t.createdAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
      t.closedAt?new Date(t.closedAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'-',
      t.status,
      brl(t.total||0)
    ]);

  if(doc.autoTable){
    doc.autoTable({
      startY:y,
      head:[['Comanda','Responsável','Pessoas','Abertura','Fechamento','Status','Total']],
      body:commandRows.length?commandRows:[['Nenhuma comanda','','','','','','']],
      margin:{left:margin,right:margin,bottom:18},
      theme:'grid',
      styles:{
        font:'helvetica',
        fontSize:6.7,
        cellPadding:2,
        lineColor:line,
        lineWidth:.2,
        textColor:dark
      },
      headStyles:{
        fillColor:purple,
        textColor:[255,255,255],
        fontStyle:'bold'
      },
      alternateRowStyles:{
        fillColor:[249,247,251]
      },
      columnStyles:{
        0:{cellWidth:18},
        2:{halign:'center',cellWidth:15},
        3:{halign:'center',cellWidth:19},
        4:{halign:'center',cellWidth:19},
        5:{halign:'center',cellWidth:20},
        6:{halign:'right',cellWidth:28}
      }
    });
  }

  // FINAL TOTAL BOX
  let finalY=(doc.lastAutoTable?.finalY||y)+10;
  finalY=ensureSpace(28,finalY);

  doc.setFillColor(...purple);
  doc.roundedRect(margin,finalY,contentW,22,4,4,'F');
  text('TOTAL RECEBIDO NO DIA',margin+6,finalY+9,8,'bold',[231,221,241]);
  text(brl(d.totalReceived),pageW-margin-6,finalY+14,16,'bold',[255,255,255],'right');

  addFooter();

  const safeBoat=(state.settings.boat||'capitao-gancho')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-zA-Z0-9]+/g,'-')
    .replace(/^-|-$/g,'')
    .toLowerCase();

  doc.save(`relatorio-${safeBoat}-${d.today}.pdf`);
};



function voucherDateKey(value){
  const s=String(value||'').trim();
  if(!s) return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const br=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if(br){
    return `${br[3]}-${String(br[2]).padStart(2,'0')}-${String(br[1]).padStart(2,'0')}`;
  }
  const d=new Date(s);
  return Number.isNaN(d.getTime())?'':dateKeyFrom(d);
}

function getPassageReport(dateKey=selectedOperationalDate){
  const vouchers=(state.vouchers||[]).filter(v=>voucherDateKey(v.date)===dateKey && v.deleted!==true);
  const voucherIds=new Set(vouchers.map(v=>v.id));
  const onboardPayments=(state.voucherPayments||[]).filter(p=>voucherIds.has(p.voucherId));

  const passageTotal=vouchers.reduce((s,v)=>s+Number(v.total||0),0);
  const paidBefore=vouchers.reduce((s,v)=>s+Math.min(Number(v.paid||0),Number(v.total||0)),0);
  const receivedOnBoard=onboardPayments.reduce((s,p)=>s+Number(p.amount||0),0);
  const pending=Math.max(0,passageTotal-paidBefore-receivedOnBoard);
  const byMethod=method=>onboardPayments.filter(p=>p.method===method).reduce((s,p)=>s+Number(p.amount||0),0);
  const passengers=vouchers.reduce((s,v)=>s+Number(v.passengers||0),0);
  const fullPassengers=vouchers.reduce((s,v)=>s+Number(v.fullPassengers ?? v.passengers ?? 0),0);
  const halfPassengers=vouchers.reduce((s,v)=>s+Number(v.halfPassengers||0),0);
  const courtesyPassengers=vouchers.reduce((s,v)=>s+Number(v.courtesyPassengers||0),0);
  const freePassengers=vouchers.reduce((s,v)=>s+Number(v.freePassengers||0),0);

  return {
    vouchers,
    count:vouchers.length,
    passengers,
    fullPassengers,
    halfPassengers,
    courtesyPassengers,
    freePassengers,
    passageTotal,
    paidBefore,
    receivedOnBoard,
    pending,
    cash:byMethod('DINHEIRO'),
    pix:byMethod('PIX'),
    card:byMethod('CARTAO')
  };
}


function normalizeAgentName(v){
  return String(v||'').trim().toLocaleLowerCase('pt-BR');
}

function findAgentByName(name){
  const key=normalizeAgentName(name);
  return (state.agents||[]).find(a=>normalizeAgentName(a.name)===key || normalizeAgentName(a.partner)===key);
}

function ensureAgentFromVoucher(agentName){
  const clean=String(agentName||'').trim();
  if(!clean) return null;
  let agent=findAgentByName(clean);
  if(agent) return agent;

  agent={
    id:id(),
    name:clean,
    partner:'',
    commissionPercent:0,
    bankName:'',
    bankAgency:'',
    bankAccount:'',
    pixKey:'',
    active:true,
    createdAt:new Date().toISOString(),
    createdFromVoucher:true
  };
  state.agents.push(agent);
  return agent;
}


function getVoucherCommissionBase(v){
  // A comissão acompanha o valor efetivo da passagem registrado no voucher.
  // Exemplo padrão: 6 passagens inteiras x R$ 110 = R$ 660.
  return Math.max(0,Number(v.total||0));
}

function getVoucherCommission(v){
  const agent=(state.agents||[]).find(a=>a.id===v.agentId) || findAgentByName(v.agent);
  const percent=Math.max(0,Number(agent?.commissionPercent||0));
  const base=getVoucherCommissionBase(v);
  const amount=base*(percent/100);
  const payment=(state.commissionPayments||[]).find(p=>p.voucherId===v.id);
  return {
    voucher:v,
    agent,
    percent,
    base,
    amount,
    paid:Boolean(payment?.paidAt),
    paidAt:payment?.paidAt||null,
    paidByName:payment?.paidByName||null
  };
}

function getCommissionRows(dateKey=null){
  return (state.vouchers||[])
    .filter(v=>v.deleted!==true)
    .filter(v=>!dateKey || voucherDateKey(v.date)===dateKey)
    .filter(v=>String(v.agent||'').trim())
    .map(getVoucherCommission)
    .filter(r=>r.agent && r.percent>0 && r.amount>0)
    .sort((a,b)=>{
      const an=String(a.agent?.name||'');
      const bn=String(b.agent?.name||'');
      if(an!==bn) return an.localeCompare(bn,'pt-BR');
      return String(a.voucher?.voucherNumber||'').localeCompare(String(b.voucher?.voucherNumber||''),'pt-BR');
    });
}

function getCommissionSummary(dateKey=null){
  const rows=getCommissionRows(dateKey);
  const byAgent=new Map();

  rows.forEach(r=>{
    const key=r.agent.id;
    if(!byAgent.has(key)){
      byAgent.set(key,{
        agent:r.agent,
        vouchers:0,
        passengers:0,
        base:0,
        amount:0,
        paid:0,
        pending:0
      });
    }
    const x=byAgent.get(key);
    x.vouchers++;
    x.passengers+=Number(r.voucher.passengers||0);
    x.base+=r.base;
    x.amount+=r.amount;
    if(r.paid) x.paid+=r.amount;
    else x.pending+=r.amount;
  });

  return {
    rows,
    agents:[...byAgent.values()],
    total:rows.reduce((s,r)=>s+r.amount,0),
    paid:rows.filter(r=>r.paid).reduce((s,r)=>s+r.amount,0),
    pending:rows.filter(r=>!r.paid).reduce((s,r)=>s+r.amount,0)
  };
}

window.setCommissionPaid=async function(voucherId,paid){
  if(window.currentProfile?.role!=='MASTER'){
    return alert('Somente o MASTER pode marcar comissões como pagas.');
  }

  state.commissionPayments=Array.isArray(state.commissionPayments)?state.commissionPayments:[];
  state.commissionPayments=state.commissionPayments.filter(p=>p.voucherId!==voucherId);

  if(paid){
    state.commissionPayments.push({
      id:id(),
      voucherId,
      paidAt:new Date().toISOString(),
      paidBy:window.currentProfile?.id||null,
      paidByName:window.currentProfile?.full_name||'MASTER'
    });
  }

  await save();
  showActionToast(paid?'Comissão marcada como paga.':'Comissão reaberta como pendente.','success');
  renderCommissions();
  renderCommissionReport();
};

function voucherMoney(v){
  return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

function parseVoucherNumber(text){
  const m=text.match(/#\s*(\d{2,})/i);
  return m?m[1]:'';
}

function parseVoucherField(text,label,nextLabels=[]){
  const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const next=nextLabels.length
    ? `(?=\\s+(?:${nextLabels.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})\\b|$)`
    : '$';
  const re=new RegExp(`${escaped}\\s+(.+?)${next}`,'i');
  const m=text.match(re);
  return m?m[1].trim():'';
}

function parseMoneyValue(raw){
  if(!raw) return 0;
  let s=String(raw).replace(/[^\d,.-]/g,'').trim();
  if(s.includes(',') && s.includes('.')){
    s=s.replace(/\./g,'').replace(',','.');
  }else if(s.includes(',')){
    s=s.replace(',','.');
  }
  const n=Number(s);
  return Number.isFinite(n)?n:0;
}

async function extractVoucherFromPdf(file){
  if(!window.pdfjsLib) throw new Error('Leitor de PDF não carregado.');
  window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

  const buffer=await file.arrayBuffer();
  const pdf=await window.pdfjsLib.getDocument({data:buffer}).promise;
  let full='';

  for(let p=1;p<=pdf.numPages;p++){
    const page=await pdf.getPage(p);
    const content=await page.getTextContent();
    full+=' '+content.items.map(i=>i.str).join(' ');
  }

  const text=full.replace(/\s+/g,' ').trim();

  const voucherNumber=parseVoucherNumber(text);
  const name=parseVoucherField(text,'NOME',['CONTATO','DATA','PASSAGEIROS','SAÍDA','SAIDA']);
  const contact=parseVoucherField(text,'CONTATO',['DATA','PASSAGEIROS']);
  const date=parseVoucherField(text,'DATA',['PASSAGEIROS','SAÍDA','SAIDA']);
  const passengersRaw=parseVoucherField(text,'PASSAGEIROS',['SAÍDA','SAIDA','EMBARQUE']);
  const departure=parseVoucherField(text,text.includes('SAÍDA')?'SAÍDA':'SAIDA',['EMBARQUE']);
  const embarkation=parseVoucherField(text,'EMBARQUE',['AGENTE','TOTAL']);
  const agent=parseVoucherField(text,'AGENTE',['TOTAL']);

  const totalMatch=text.match(/TOTAL\s+R\$\s*([\d.,]+)/i);
  const paidMatch=text.match(/PAGO\s+R\$\s*([\d.,]+)/i);
  const dueMatch=text.match(/A\s+PAGAR\s+R\$\s*([\d.,]+)/i);

  const passengersMatch=passengersRaw.match(/(\d+)/);

  return {
    voucherNumber,
    name,
    contact,
    date,
    passengers:passengersMatch?Number(passengersMatch[1]):1,
    fullPassengers:passengersMatch?Number(passengersMatch[1]):1,
    halfPassengers:0,
    courtesyPassengers:0,
    freePassengers:0,
    departure,
    embarkation,
    agent,
    total:parseMoneyValue(totalMatch?.[1]),
    paid:parseMoneyValue(paidMatch?.[1]),
    due:parseMoneyValue(dueMatch?.[1]),
    sourceFileName:file.name
  };
}

window.handleVoucherUpload=async function(input){
  const file=input.files?.[0];
  if(!file) return;

  const status=document.getElementById('voucherUploadStatus');
  if(status){
    status.className='voucher-upload-status';
    status.textContent='Lendo voucher...';
  }

  try{
    const data=await extractVoucherFromPdf(file);
    openVoucherReview({
      ...data,
      fullPassengers:Number(data.fullPassengers ?? data.passengers ?? 1),
      halfPassengers:Number(data.halfPassengers||0),
      courtesyPassengers:Number(data.courtesyPassengers||0),
      freePassengers:Number(data.freePassengers||0)
    });

    if(status){
      status.className='voucher-upload-status ok';
      status.textContent='Voucher lido. Confira os dados antes de salvar.';
    }
  }catch(err){
    console.error(err);
    if(status){
      status.className='voucher-upload-status error';
      status.textContent=`Erro ao ler voucher: ${err?.message||'falha desconhecida'}. Você pode conferir os dados manualmente.`;
    }
    openVoucherReview({sourceFileName:file.name});
  }finally{
    input.value='';
  }
};

window.openVoucherManual=function(){
  openVoucherReview({});
};


function voucherAgentDatalist(){
  return (state.agents||[])
    .filter(a=>a.active!==false)
    .slice()
    .sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt-BR'))
    .map(a=>{
      const label=a.partner?`${a.name} • ${a.partner}`:a.name;
      return `<option value="${escHtml(a.name)}">${escHtml(label)}</option>`;
    }).join('');
}

function openVoucherReview(v={},editId=null){
  openModal(editId?'Editar passagem / voucher':'Cadastrar voucher',`
    <div class="voucher-form">
      <div class="voucher-form-grid">
        <label>Nº do voucher<input id="voucherNumber" value="${escHtml(v.voucherNumber||'')}" placeholder="Ex.: 1304"></label>
        <label>Nome do passageiro<input id="voucherName" value="${escHtml(v.name||'')}" placeholder="Nome completo"></label>
        <label>Contato<input id="voucherContact" value="${escHtml(v.contact||'')}" placeholder="Telefone / WhatsApp"></label>
        <label>Data<input id="voucherDate" value="${escHtml(v.date||'')}" placeholder="dd/mm/aaaa"></label>
        <div class="voucher-passenger-types">
          <strong>Passageiros</strong>
          <div class="voucher-passenger-grid">
            <label>Inteira • R$ 110
              <input id="voucherFullPassengers" type="number" min="0" value="${Number(v.fullPassengers ?? v.passengers ?? 1)}" oninput="recalcVoucherTotalByPassengers()">
            </label>
            <label>Meia • R$ 55
              <input id="voucherHalfPassengers" type="number" min="0" value="${Number(v.halfPassengers||0)}" oninput="recalcVoucherTotalByPassengers()">
            </label>
            <label>Cortesia • R$ 0
              <input id="voucherCourtesyPassengers" type="number" min="0" value="${Number(v.courtesyPassengers||0)}" oninput="recalcVoucherTotalByPassengers()">
            </label>
            <label>Free / bebê • R$ 0
              <input id="voucherFreePassengers" type="number" min="0" value="${Number(v.freePassengers||0)}" oninput="recalcVoucherTotalByPassengers()">
            </label>
          </div>
          <small>Meia paga metade do couvert e da sustentabilidade. Cortesia paga as taxas normalmente. Free/bebê não paga passagem, couvert nem sustentabilidade.</small>
        </div>
        <label>Saída<input id="voucherDeparture" value="${escHtml(v.departure||'')}" placeholder="Ex.: 10:30h"></label>
        <label>Embarque<input id="voucherEmbarkation" value="${escHtml(v.embarkation||'')}" placeholder="Ex.: Cais de Turismo"></label>
        <label>Agente
          <input id="voucherAgent" list="voucherAgentList" value="${escHtml(v.agent||'')}" placeholder="Digite ou selecione um agente">
          <datalist id="voucherAgentList">${voucherAgentDatalist()}</datalist>
          <small>Selecione um agente cadastrado ou digite um novo nome.</small>
        </label>
      </div>

      <div class="voucher-values-grid">
        <label>Total da passagem • R$ 110 por passageiro
          <div class="money-input-wrap"><span>R$</span><input id="voucherTotal" type="number" min="0" step="0.01" value="${Number(v.total||((Number(v.fullPassengers ?? v.passengers ?? 1))*DEFAULT_PASSAGE_PRICE + Number(v.halfPassengers||0)*(DEFAULT_PASSAGE_PRICE/2))).toFixed(2)}" readonly></div>
        </label>
        <label>Já pago
          <div class="money-input-wrap"><span>R$</span><input id="voucherPaid" type="number" min="0" step="0.01" value="${Number(v.paid||0).toFixed(2)}" oninput="recalcVoucherDue()"></div>
        </label>
        <label>Saldo a pagar
          <div class="money-input-wrap"><span>R$</span><input id="voucherDue" type="number" min="0" step="0.01" value="${Number(v.due||0).toFixed(2)}" readonly></div>
        </label>
      </div>

      <div class="voucher-info-note"><strong>Total de passageiros: <span id="voucherPassengerTotal">0</span></strong><br>
        Este saldo é da <strong>passagem/passeio</strong>. Ele não entra na conta de consumo do barco.
        A comanda de consumo só será iniciada quando o passageiro chegar e o saldo da passagem for acertado.
      </div>

      <div class="checkout-actions">
        <button class="ghost" onclick="closeModal()">Cancelar</button>
        <button class="primary" onclick="saveVoucher(${editId?`'${editId}'`:'null'})">${editId?'Salvar alterações':'Salvar voucher'}</button>
      </div>
    </div>
  `);

  recalcVoucherTotalByPassengers();
}

function escHtml(v){
  return String(v??'')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;');
}


window.recalcVoucherTotalByPassengers=function(){
  const full=Math.max(0,Number(document.getElementById('voucherFullPassengers')?.value)||0);
  const half=Math.max(0,Number(document.getElementById('voucherHalfPassengers')?.value)||0);
  const courtesy=Math.max(0,Number(document.getElementById('voucherCourtesyPassengers')?.value)||0);
  const free=Math.max(0,Number(document.getElementById('voucherFreePassengers')?.value)||0);

  const passengers=full+half+courtesy+free;
  const total=(full*DEFAULT_PASSAGE_PRICE)+(half*(DEFAULT_PASSAGE_PRICE/2));

  const totalEl=document.getElementById('voucherTotal');
  if(totalEl) totalEl.value=total.toFixed(2);

  const totalPeopleEl=document.getElementById('voucherPassengerTotal');
  if(totalPeopleEl) totalPeopleEl.textContent=String(passengers);

  recalcVoucherDue();
};
window.recalcVoucherDue=function(){
  const total=Math.max(0,Number(document.getElementById('voucherTotal')?.value)||0);
  const paid=Math.max(0,Number(document.getElementById('voucherPaid')?.value)||0);
  const due=Math.max(0,total-paid);
  const el=document.getElementById('voucherDue');
  if(el) el.value=due.toFixed(2);
};

window.saveVoucher=function(editId=null){
  const voucherNumber=document.getElementById('voucherNumber')?.value.trim();
  const name=document.getElementById('voucherName')?.value.trim();
  const contact=document.getElementById('voucherContact')?.value.trim();
  const date=document.getElementById('voucherDate')?.value.trim();
  const fullPassengers=Math.max(0,Number(document.getElementById('voucherFullPassengers')?.value)||0);
  const halfPassengers=Math.max(0,Number(document.getElementById('voucherHalfPassengers')?.value)||0);
  const courtesyPassengers=Math.max(0,Number(document.getElementById('voucherCourtesyPassengers')?.value)||0);
  const freePassengers=Math.max(0,Number(document.getElementById('voucherFreePassengers')?.value)||0);
  const passengers=fullPassengers+halfPassengers+courtesyPassengers+freePassengers;
  const departure=document.getElementById('voucherDeparture')?.value.trim();
  const embarkation=document.getElementById('voucherEmbarkation')?.value.trim();
  const agent=document.getElementById('voucherAgent')?.value.trim();
  const linkedAgent=ensureAgentFromVoucher(agent);
  const total=Math.max(0,Number(document.getElementById('voucherTotal')?.value)||0);
  const paid=Math.max(0,Number(document.getElementById('voucherPaid')?.value)||0);
  const due=Math.max(0,total-paid);

  if(!voucherNumber) return alert('Informe o número do voucher.');
  if(!name) return alert('Informe o nome do passageiro.');
  if(!date) return alert('Informe a data do passeio.');
  if(!Number.isInteger(passengers)||passengers<=0) return alert('Informe pelo menos 1 passageiro entre Inteira, Meia, Cortesia ou Free.');

  const duplicate=state.vouchers.some(v=>String(v.voucherNumber)===String(voucherNumber)&&v.id!==editId);
  if(duplicate) return alert(`O voucher #${voucherNumber} já está cadastrado.`);

  if(editId){
    const existing=state.vouchers.find(v=>v.id===editId);
    if(!existing) return alert('Passagem / voucher não encontrado.');

    Object.assign(existing,{
      voucherNumber,
      name,
      contact,
      date,
      passengers,
      fullPassengers,
      halfPassengers,
      courtesyPassengers,
      freePassengers,
      departure,
      embarkation,
      agent,
      agentId:linkedAgent?.id||null,
      total,
      paid,
      due,
      updatedAt:new Date().toISOString(),
      updatedBy:window.currentProfile?.id||null,
      updatedByName:window.currentProfile?.full_name||'Usuário'
    });

    const paidOnBoard=state.voucherPayments
      .filter(p=>p.voucherId===existing.id)
      .reduce((s,p)=>s+Number(p.amount||0),0);

    if(existing.tabId) existing.status='EMBARCADO';
    else existing.status=Math.max(0,due-paidOnBoard)>0.005?'AGUARDANDO_PAGAMENTO':'PRONTO_EMBARQUE';

    save();
    closeModal();
    showView('vouchers');
    showActionToast('Passagem / voucher atualizado com sucesso.','success');
    return;
  }

  state.vouchers.push({
    id:id(),
    voucherNumber,
    name,
    contact,
    date,
    passengers,
    fullPassengers,
    halfPassengers,
    courtesyPassengers,
    freePassengers,
    departure,
    embarkation,
    agent,
    agentId:linkedAgent?.id||null,
    total,
    paid,
    due,
    status:due>0?'AGUARDANDO_PAGAMENTO':'PRONTO_EMBARQUE',
    createdAt:new Date().toISOString(),
    createdBy:window.currentProfile?.id||null,
    createdByName:window.currentProfile?.full_name||'Usuário'
  });

  save();
  closeModal();
  showView('vouchers');
  showActionToast('Passagem / voucher salvo com sucesso.','success');
};


window.editVoucher=function(voucherId){
  if(window.currentProfile?.role!=='MASTER'){
    return alert('Somente o MASTER pode editar passagens / vouchers.');
  }
  const v=state.vouchers.find(x=>x.id===voucherId);
  if(!v) return alert('Passagem / voucher não encontrado.');
  openVoucherReview({...v},voucherId);
};

window.deleteVoucherPermanently=function(voucherId){
  if(window.currentProfile?.role!=='MASTER'){
    return alert('Somente o MASTER pode apagar passagens / vouchers.');
  }

  const v=state.vouchers.find(x=>x.id===voucherId);
  if(!v) return alert('Passagem / voucher não encontrado.');

  const onboard=state.voucherPayments
    .filter(p=>p.voucherId===voucherId)
    .reduce((s,p)=>s+Number(p.amount||0),0);

  const warning=
    `ATENÇÃO: apagar a passagem / voucher #${v.voucherNumber}?\n\n`+
    `Passageiro: ${v.name}\n`+
    `Data: ${v.date}\n`+
    `Valor total: ${money(v.total)}\n`+
    `Recebido no barco: ${money(onboard)}\n\n`+
    `A passagem e os recebimentos vinculados serão excluídos definitivamente e NÃO contarão em nenhum relatório.\n\n`+
    `A comanda de consumo, se existir, NÃO será apagada.\n\n`+
    `ESTA AÇÃO NÃO PODE SER DESFEITA.`;

  if(!confirm(warning)) return;

  // Desvincula eventual comanda, mas preserva a comanda e seus consumos.
  state.tabs.forEach(t=>{
    if(t.voucherId===voucherId){
      delete t.voucherId;
      delete t.voucherNumber;
    }
  });

  state.voucherPayments=state.voucherPayments.filter(p=>p.voucherId!==voucherId);
  state.vouchers=state.vouchers.filter(x=>x.id!==voucherId);

  save();
  showActionToast('Passagem / voucher apagado definitivamente.','success');
};

window.searchVouchers=function(){

  const opDate=document.getElementById('operationalDate');
  if(opDate) opDate.value=selectedOperationalDate;
  const opStatus=document.getElementById('operationalDayStatus');
  if(opStatus){
    const isToday=selectedDateIsToday();
    opStatus.textContent=isToday?'DIA ATUAL':'HISTÓRICO';
    opStatus.className=`operational-status ${isToday?'current':'history'}`;
  }
  const opNav=document.getElementById('operationalCalendar');
  if(opNav){
    opNav.classList.toggle('master-calendar-hidden',window.currentProfile?.role!=='MASTER');
  }

  renderAgents();
  renderVouchers();
  renderCommissions();
  renderCommissionReport();
};

function renderVouchers(){
  const box=document.getElementById('vouchersList');
  if(!box) return;

  const q=(document.getElementById('voucherSearch')?.value||'').trim().toLowerCase();

  const list=state.vouchers
    .slice()
    .sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt-BR'))
    .filter(v=>{
      if(!q) return true;
      return [
        v.voucherNumber,v.name,v.contact,v.agent,v.date
      ].some(x=>String(x||'').toLowerCase().includes(q));
    });

  if(!list.length){
    box.innerHTML='<div class="voucher-empty">Nenhum voucher encontrado.</div>';
    return;
  }

  box.innerHTML=list.map(v=>{
    const paidNow=state.voucherPayments
      .filter(p=>p.voucherId===v.id)
      .reduce((s,p)=>s+Number(p.amount||0),0);

    const remaining=Math.max(0,Number(v.due||0)-paidNow);
    const started=Boolean(v.tabId);

    let statusLabel='Aguardando pagamento';
    if(started) statusLabel='Comanda iniciada';
    else if(remaining<=0.005) statusLabel='Pronto para embarque';

    return `<article class="voucher-card">
      <div class="voucher-card-head">
        <div>
          <span class="eyebrow">VOUCHER #${escHtml(v.voucherNumber)}</span>
          <h3>${escHtml(v.name)}</h3>
          <p>${escHtml(v.date)} • ${v.passengers} passageiro(s) • ${escHtml(v.departure||'Horário não informado')}</p>
          <p class="voucher-passenger-summary">Inteira: ${Number(v.fullPassengers ?? v.passengers ?? 0)} • Meia: ${Number(v.halfPassengers||0)} • Cortesia: ${Number(v.courtesyPassengers||0)} • Free: ${Number(v.freePassengers||0)}</p>
        </div>
        <span class="voucher-status ${started?'started':remaining<=0.005?'ready':'pending'}">${statusLabel}</span>
      </div>

      <div class="voucher-detail-grid">
        <div><span>Embarque</span><strong>${escHtml(v.embarkation||'-')}</strong></div>
        <div><span>Agente</span><strong>${escHtml(v.agent||'-')}</strong></div>
        <div><span>Total</span><strong>${voucherMoney(v.total)}</strong></div>
        <div><span>Pago antes</span><strong>${voucherMoney(v.paid)}</strong></div>
        <div class="voucher-due"><span>Saldo da passagem</span><strong>${voucherMoney(remaining)}</strong></div>
      </div>

      <div class="voucher-card-actions">
        ${started
          ? `<button class="ghost" onclick="openTab('${v.tabId}')">Abrir comanda ${escHtml(v.tabNumber||'')}</button>`
          : `<button class="primary" onclick="openVoucherArrival('${v.id}')">${remaining>0.005?'Receber saldo e iniciar comanda':'Iniciar comanda do barco'}</button>`
        }
        ${window.currentProfile?.role==='MASTER'?`
          <button class="ghost" onclick="editVoucher('${v.id}')">Editar</button>
          <button class="danger" onclick="deleteVoucherPermanently('${v.id}')">Apagar</button>
        `:''}
      </div>
    </article>`;
  }).join('');
}

window.openVoucherArrival=function(voucherId){
  const v=state.vouchers.find(x=>x.id===voucherId);
  if(!v) return;

  const paidNow=state.voucherPayments.filter(p=>p.voucherId===v.id).reduce((s,p)=>s+Number(p.amount||0),0);
  const remaining=Math.max(0,Number(v.due||0)-paidNow);

  openModal(`Embarque • Voucher #${v.voucherNumber}`,`
    <div class="voucher-arrival">
      <div class="voucher-arrival-summary">
        <div>
          <span class="eyebrow">PASSAGEIRO</span>
          <h3>${escHtml(v.name)}</h3>
          <p>${v.passengers} passageiro(s) • ${escHtml(v.departure||'')}</p><p class="voucher-passenger-summary">Inteira: ${Number(v.fullPassengers ?? v.passengers ?? 0)} • Meia: ${Number(v.halfPassengers||0)} • Cortesia: ${Number(v.courtesyPassengers||0)} • Free: ${Number(v.freePassengers||0)}</p>
        </div>
        <div class="voucher-arrival-due">
          <span>Saldo da passagem</span>
          <strong>${voucherMoney(remaining)}</strong>
        </div>
      </div>

      ${remaining>0.005?`
        <div class="mixed-payment-box">
          <div class="mixed-payment-head">
            <div><strong>Receber saldo do passeio</strong><small>Este recebimento fica separado da comanda de consumo.</small></div>
          </div>
          <div class="mixed-payment-grid">
            <label><span>Cartão</span><div class="money-input-wrap"><span>R$</span><input id="voucherPayCard" type="number" min="0" step="0.01" value="0.00" oninput="updateVoucherArrivalPayment(${remaining})"></div></label>
            <label><span>PIX</span><div class="money-input-wrap"><span>R$</span><input id="voucherPayPix" type="number" min="0" step="0.01" value="0.00" oninput="updateVoucherArrivalPayment(${remaining})"></div></label>
            <label><span>Dinheiro</span><div class="money-input-wrap"><span>R$</span><input id="voucherPayCash" type="number" min="0" step="0.01" value="0.00" oninput="updateVoucherArrivalPayment(${remaining})"></div></label>
          </div>
          <div class="mixed-payment-status">
            <div><span>Recebido agora</span><strong id="voucherPaidNow">${voucherMoney(0)}</strong></div>
            <div><span>Falta</span><strong id="voucherRemaining">${voucherMoney(remaining)}</strong></div>
          </div>
          <div id="voucherPaymentMessage" class="mixed-payment-message">Receba exatamente o saldo da passagem.</div>
        </div>
      `:''}

      <div class="voucher-start-comanda">
        <label>Número da comanda do barco
          <input id="voucherTabNumber" type="number" min="1" step="1" placeholder="Ex.: 18">
        </label>
        <small>Depois do acerto da passagem, esta será a comanda usada para consumos de bar/cozinha.</small>
      </div>

      <div class="checkout-actions">
        <button class="ghost" onclick="closeModal()">Cancelar</button>
        <button id="voucherStartButton" class="primary" onclick="settleVoucherAndStartTab('${v.id}')" ${remaining>0.005?'disabled':''}>Confirmar embarque e iniciar comanda</button>
      </div>
    </div>
  `);

  if(remaining<=0.005){
    const b=document.getElementById('voucherStartButton');
    if(b) b.disabled=false;
  }
};

window.updateVoucherArrivalPayment=function(total){
  const card=Math.max(0,Number(document.getElementById('voucherPayCard')?.value)||0);
  const pix=Math.max(0,Number(document.getElementById('voucherPayPix')?.value)||0);
  const cash=Math.max(0,Number(document.getElementById('voucherPayCash')?.value)||0);
  const paid=card+pix+cash;
  const remaining=total-paid;
  const balanced=Math.abs(remaining)<0.005;

  const paidEl=document.getElementById('voucherPaidNow');
  const remEl=document.getElementById('voucherRemaining');
  const msg=document.getElementById('voucherPaymentMessage');
  const btn=document.getElementById('voucherStartButton');

  if(paidEl) paidEl.textContent=voucherMoney(paid);
  if(remEl) remEl.textContent=voucherMoney(Math.abs(remaining)<0.005?0:remaining);
  if(btn) btn.disabled=!balanced;

  if(msg){
    msg.classList.remove('ok','error');
    if(balanced){
      msg.textContent='Saldo da passagem quitado. Pode iniciar a comanda.';
      msg.classList.add('ok');
    }else if(remaining>0){
      msg.textContent=`Ainda faltam ${voucherMoney(remaining)} da passagem.`;
    }else{
      msg.textContent=`Valor excede o saldo em ${voucherMoney(Math.abs(remaining))}.`;
      msg.classList.add('error');
    }
  }

  return {card,pix,cash,paid,remaining,balanced};
};

window.settleVoucherAndStartTab=function(voucherId){
  const v=state.vouchers.find(x=>x.id===voucherId);
  if(!v) return;

  const raw=document.getElementById('voucherTabNumber')?.value;
  const numeric=Number(raw);
  if(!Number.isInteger(numeric)||numeric<=0){
    return alert('Informe um número de comanda válido.');
  }

  const number=String(numeric);
  const today=new Date().toLocaleDateString('en-CA');
  const duplicate=state.tabs.some(t=>{
    if(t.status==='CANCELADA') return false;
    const d=new Date(t.createdAt).toLocaleDateString('en-CA');
    return d===today&&String(Number(t.number))===number;
  });
  if(duplicate) return alert(`A Comanda ${number} já existe hoje.`);

  const paidPreviously=state.voucherPayments.filter(p=>p.voucherId===v.id).reduce((s,p)=>s+Number(p.amount||0),0);
  const remaining=Math.max(0,Number(v.due||0)-paidPreviously);

  let split={card:0,pix:0,cash:0,paid:0,balanced:true};
  if(remaining>0.005){
    split=updateVoucherArrivalPayment(remaining);
    if(!split?.balanced) return alert('Quite exatamente o saldo da passagem antes de iniciar a comanda.');
  }

  const now=new Date().toISOString();

  [
    ['CARTAO',split.card],
    ['PIX',split.pix],
    ['DINHEIRO',split.cash]
  ].forEach(([method,amount])=>{
    if(Number(amount)>0){
      state.voucherPayments.push({
        id:id(),
        voucherId:v.id,
        voucherNumber:v.voucherNumber,
        method,
        amount:Number(amount),
        createdAt:now,
        createdBy:window.currentProfile?.id||null,
        createdByName:window.currentProfile?.full_name||'Usuário'
      });
    }
  });

  const tabId=id();
  state.tabs.push({
    id:tabId,
    number,
    customer:v.name,
    people:Number(v.passengers||1),
    fullPassengers:Number(v.fullPassengers ?? v.passengers ?? 0),
    halfPassengers:Number(v.halfPassengers||0),
    courtesyPassengers:Number(v.courtesyPassengers||0),
    freePassengers:Number(v.freePassengers||0),
    status:'ABERTA',
    createdAt:now,
    businessDate:selectedOperationalDate,
    closedAt:null,
    total:0,
    voucherId:v.id,
    voucherNumber:v.voucherNumber,
    agent:v.agent||'',
    agentId:v.agentId||findAgentByName(v.agent)?.id||null,
    createdBy:window.currentProfile?.id||null,
    createdByName:window.currentProfile?.full_name||'Usuário'
  });

  // Taxas automáticas do barco começam somente no momento do embarque.
  const fullCount=Number(v.fullPassengers ?? v.passengers ?? 0);
  const halfCount=Number(v.halfPassengers||0);
  const courtesyCount=Number(v.courtesyPassengers||0);
  const freeCount=Number(v.freePassengers||0);

  // Regras de taxas:
  // inteira e cortesia: couvert e sustentabilidade integrais;
  // meia: metade de cada taxa;
  // free/bebê: não paga nenhuma das duas taxas.
  const couvertTotal=(fullCount*12)+(halfCount*6)+(courtesyCount*12);
  const sustentabilidadeTotal=(fullCount*2)+(halfCount*1)+(courtesyCount*2);

  state.orders.push({
    id:id(),
    tabId,
    items:[
      {
        productId:'taxa-couvert-artistico',
        name:'Couvert artístico',
        category:'TAXAS',
        sector:'TAXAS',
        price:1,
        qty:couvertTotal,
        pricingNote:'Inteira/Cortesia R$ 12 • Meia R$ 6 • Free R$ 0'
      },
      {
        productId:'taxa-sustentabilidade',
        name:'Taxa de sustentabilidade',
        category:'TAXAS',
        sector:'TAXAS',
        price:1,
        qty:sustentabilidadeTotal,
        pricingNote:'Inteira/Cortesia R$ 2 • Meia R$ 1 • Free R$ 0'
      }
    ],
    total:couvertTotal+sustentabilidadeTotal,
    createdAt:now,
    status:'ENVIADO',
    automatic:true,
    createdBy:window.currentProfile?.id||null,
    createdByName:window.currentProfile?.full_name||'Sistema'
  });

  v.status='EMBARCADO';
  v.tabId=tabId;
  v.tabNumber=number;
  v.boardedAt=now;
  v.boardedBy=window.currentProfile?.id||null;
  v.boardedByName=window.currentProfile?.full_name||'Usuário';

  save();
  currentTabId=tabId;
  cart=[];
  closeModal();
  renderTabModal();
};


window.openAgentModal=function(agentId=null){
  if(window.currentProfile?.role!=='MASTER') return alert('Somente o MASTER pode cadastrar ou editar agentes.');
  const a=agentId?state.agents.find(x=>x.id===agentId):null;
  openModal(a?'Editar agente':'Novo agente',`
    <div class="agent-form">
      <div class="agent-edit-grid">
        <label>Nome do agente<input id="agentName" value="${escHtml(a?.name||'')}" placeholder="Ex.: João"></label>
        <label>Parceiro / Pousada<input id="agentPartner" value="${escHtml(a?.partner||'')}" placeholder="Ex.: Pousada A"></label>
        <label>Comissão (%)<input id="agentCommission" type="number" min="0" max="100" step="0.01" value="${Number(a?.commissionPercent||0)}"></label>
        <label>Banco<input id="agentBankName" value="${escHtml(a?.bankName||'')}" placeholder="Banco"></label>
        <label>Agência<input id="agentBankAgency" value="${escHtml(a?.bankAgency||'')}" placeholder="Agência"></label>
        <label>Conta<input id="agentBankAccount" value="${escHtml(a?.bankAccount||'')}" placeholder="Conta"></label>
        <label class="agent-wide">Chave PIX<input id="agentPixKey" value="${escHtml(a?.pixKey||'')}" placeholder="CPF, CNPJ, celular, e-mail ou chave aleatória"></label>
      </div>
      <label class="active-toggle"><input id="agentActive" type="checkbox" ${a?.active===false?'':'checked'}> Agente ativo</label>
      <div class="checkout-actions">
        <button class="ghost" onclick="closeModal()">Cancelar</button>
        <button class="primary" onclick="saveAgent('${a?.id||''}')">Salvar agente</button>
      </div>
    </div>
  `);
};

window.saveAgent=async function(agentId=''){
  if(window.currentProfile?.role!=='MASTER') return alert('Somente o MASTER pode alterar agentes.');
  const name=document.getElementById('agentName')?.value.trim();
  if(!name) return alert('Informe o nome do agente.');

  const duplicate=state.agents.some(a=>a.id!==agentId && normalizeAgentName(a.name)===normalizeAgentName(name));
  if(duplicate) return alert('Já existe um agente com esse nome.');

  const payload={
    name,
    partner:document.getElementById('agentPartner')?.value.trim()||'',
    commissionPercent:Math.max(0,Number(document.getElementById('agentCommission')?.value)||0),
    bankName:document.getElementById('agentBankName')?.value.trim()||'',
    bankAgency:document.getElementById('agentBankAgency')?.value.trim()||'',
    bankAccount:document.getElementById('agentBankAccount')?.value.trim()||'',
    pixKey:document.getElementById('agentPixKey')?.value.trim()||'',
    active:document.getElementById('agentActive')?.checked!==false,
    updatedAt:new Date().toISOString()
  };

  if(agentId){
    const a=state.agents.find(x=>x.id===agentId);
    if(!a) return alert('Agente não encontrado.');
    Object.assign(a,payload);
    state.vouchers.forEach(v=>{ if(v.agentId===agentId) v.agent=name; });
    state.tabs.forEach(t=>{ if(t.agentId===agentId) t.agent=name; });
  }else{
    state.agents.push({id:id(),...payload,createdAt:new Date().toISOString()});
  }

  await save();
  closeModal();
  showActionToast('Agente salvo com sucesso.','success');
};

window.deleteAgent=function(agentId){
  if(window.currentProfile?.role!=='MASTER') return alert('Somente o MASTER pode apagar agentes.');
  const a=state.agents.find(x=>x.id===agentId);
  if(!a) return;
  if(!confirm(`Apagar o agente ${a.name}?\n\nOs vouchers e comandas existentes continuarão com o nome registrado, mas o cadastro bancário e a comissão deste agente serão removidos.`)) return;
  state.agents=state.agents.filter(x=>x.id!==agentId);
  save();
  showActionToast('Agente apagado.','success');
};

window.searchAgents=function(){ renderAgents(); };

function renderAgents(){
  const box=document.getElementById('agentsList');
  if(!box) return;
  const q=(document.getElementById('agentSearch')?.value||'').trim().toLowerCase();
  const list=(state.agents||[]).filter(a=>!q || [a.name,a.partner,a.pixKey].some(v=>String(v||'').toLowerCase().includes(q)));

  box.innerHTML=list.length?list.map(a=>`
    <article class="agent-card ${a.active===false?'agent-inactive':''}">
      <div>
        <span class="eyebrow">${escHtml(a.partner||'AGENTE')}</span>
        <h3>${escHtml(a.name)}</h3>
        <p>${a.active===false?'Inativo':'Ativo'}${a.pixKey?` • PIX: ${escHtml(a.pixKey)}`:''}</p>
      </div>
      <div class="agent-stats">
        <div><span>Comissão</span><strong>${Number(a.commissionPercent||0).toLocaleString('pt-BR')}%</strong></div>
        <div><span>Banco</span><strong>${escHtml(a.bankName||'-')}</strong></div>
        <div><span>Conta</span><strong>${escHtml(a.bankAccount||'-')}</strong></div>
      </div>
      <div class="agent-actions">
        ${window.currentProfile?.role==='MASTER'?`<button class="ghost" onclick="openAgentModal('${a.id}')">Editar</button><button class="danger" onclick="deleteAgent('${a.id}')">Apagar</button>`:''}
      </div>
    </article>`).join(''):'<div class="voucher-empty">Nenhum agente encontrado.</div>';
}


window.filterCommissions=function(){ renderCommissions(); };


window.downloadCommissionReport=function(){
  if(window.currentProfile?.role!=='MASTER' && !isGestor()){
    return alert('Sem permissão para baixar o relatório de comissões.');
  }

  if(!window.jspdf?.jsPDF){
    return alert('O módulo de PDF ainda não carregou. Atualize a página e tente novamente.');
  }

  const summary=getCommissionSummary(selectedOperationalDate);
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});

  const pageW=210;
  const pageH=297;
  const margin=14;
  const purple=[76,35,107];
  const dark=[38,35,45];
  const muted=[105,100,115];
  const soft=[248,246,251];
  const line=[226,220,232];

  const brl=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const txt=(v,x,y,size=9,style='normal',color=dark,align='left')=>{
    doc.setFont('helvetica',style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(String(v??''),x,y,{align});
  };

  const ensureSpace=(needed,y)=>{
    if(y+needed>pageH-18){
      doc.addPage();
      return 18;
    }
    return y;
  };

  // Cabeçalho
  doc.setFillColor(...purple);
  doc.rect(0,0,pageW,31,'F');
  txt('AVENTURA TURISMO',margin,12,10,'bold',[255,255,255]);
  txt('RELATÓRIO DE COMISSÕES',margin,21,15,'bold',[255,255,255]);
  txt(new Date(`${selectedOperationalDate}T12:00:00`).toLocaleDateString('pt-BR'),
      pageW-margin,18,9,'bold',[255,255,255],'right');

  let y=40;

  // Resumo
  txt('RESUMO',margin,y,10,'bold',purple);
  y+=6;

  [
    ['Total de comissões',summary.total],
    ['A pagar',summary.pending],
    ['Já pago',summary.paid]
  ].forEach(([label,value],i)=>{
    const w=(pageW-(margin*2)-6)/3;
    const x=margin+i*(w+3);
    doc.setFillColor(...soft);
    doc.roundedRect(x,y,w,20,3,3,'F');
    txt(label,x+4,y+7,7,'normal',muted);
    txt(brl(value),x+4,y+15,10,'bold',dark);
  });

  y+=28;

  // Quem precisa receber
  txt('QUEM PRECISA RECEBER',margin,y,10,'bold',purple);
  y+=6;

  const pendingAgents=summary.agents.filter(a=>a.pending>0.005);

  if(!pendingAgents.length){
    txt('Nenhuma comissão pendente para esta data.',margin,y,9,'normal',muted);
    y+=10;
  }else{
    pendingAgents.forEach(x=>{
      y=ensureSpace(28,y);

      doc.setDrawColor(...line);
      doc.setFillColor(252,251,253);
      doc.roundedRect(margin,y,pageW-(margin*2),24,3,3,'FD');

      txt(x.agent.name,margin+4,y+7,9,'bold',dark);
      txt(x.agent.partner||'',margin+4,y+13,7,'normal',muted);

      const pix=x.agent.pixKey?`PIX: ${x.agent.pixKey}`:'PIX: não cadastrado';
      txt(pix,margin+4,y+19,7,'normal',muted);

      txt(`${x.passengers} passageiro(s)`,pageW-margin-4,y+7,7,'normal',muted,'right');
      txt(`Base: ${brl(x.base)}`,pageW-margin-4,y+13,7,'normal',muted,'right');
      txt(`A PAGAR: ${brl(x.pending)}`,pageW-margin-4,y+20,10,'bold',purple,'right');

      y+=29;
    });
  }

  y=ensureSpace(20,y);
  txt('DETALHAMENTO POR VOUCHER',margin,y,10,'bold',purple);
  y+=5;

  const rows=summary.rows.map(r=>[
    `#${r.voucher.voucherNumber||''}`,
    r.agent.name,
    String(Number(r.voucher.passengers||0)),
    brl(r.base),
    `${Number(r.percent).toLocaleString('pt-BR')}%`,
    brl(r.amount),
    r.paid?'PAGO':'PENDENTE'
  ]);

  if(doc.autoTable){
    doc.autoTable({
      startY:y,
      head:[['Voucher','Agente','Pax','Base','%','Comissão','Status']],
      body:rows.length?rows:[['Nenhuma comissão','','','','','','']],
      margin:{left:margin,right:margin,bottom:16},
      theme:'grid',
      styles:{
        font:'helvetica',
        fontSize:7,
        cellPadding:2,
        lineColor:line,
        lineWidth:.2,
        textColor:dark
      },
      headStyles:{
        fillColor:purple,
        textColor:[255,255,255],
        fontStyle:'bold'
      },
      alternateRowStyles:{fillColor:[249,247,251]},
      columnStyles:{
        2:{halign:'center',cellWidth:12},
        3:{halign:'right',cellWidth:26},
        4:{halign:'center',cellWidth:13},
        5:{halign:'right',cellWidth:27},
        6:{halign:'center',cellWidth:19}
      }
    });
  }

  const pages=doc.getNumberOfPages();
  for(let i=1;i<=pages;i++){
    doc.setPage(i);
    doc.setDrawColor(...line);
    doc.line(margin,pageH-12,pageW-margin,pageH-12);
    txt('Aventura Turismo - Comissões',margin,pageH-7,7,'normal',muted);
    txt(`Página ${i} de ${pages}`,pageW-margin,pageH-7,7,'normal',muted,'right');
  }

  doc.save(`relatorio-comissoes-${selectedOperationalDate}.pdf`);
};

function renderCommissions(){
  const box=document.getElementById('commissionsList');
  const summaryBox=document.getElementById('commissionsSummary');
  if(!box || !summaryBox) return;

  const dateKey=selectedOperationalDate;
  const all=getCommissionRows(dateKey);
  const agentFilter=document.getElementById('commissionAgentFilter')?.value||'ALL';
  const statusFilter=document.getElementById('commissionStatusFilter')?.value||'PENDENTE';

  const agentSelect=document.getElementById('commissionAgentFilter');
  if(agentSelect){
    const current=agentSelect.value||'ALL';
    const agents=[...new Map(all.map(r=>[r.agent.id,r.agent])).values()]
      .sort((a,b)=>String(a.name).localeCompare(String(b.name),'pt-BR'));
    agentSelect.innerHTML='<option value="ALL">Todos</option>'+
      agents.map(a=>`<option value="${a.id}">${escHtml(a.name)}${a.partner?` • ${escHtml(a.partner)}`:''}</option>`).join('');
    agentSelect.value=[...agentSelect.options].some(o=>o.value===current)?current:'ALL';
  }

  const filtered=all.filter(r=>{
    if(agentFilter!=='ALL' && r.agent.id!==agentFilter) return false;
    if(statusFilter==='PENDENTE' && r.paid) return false;
    if(statusFilter==='PAGO' && !r.paid) return false;
    return true;
  });

  const summary=getCommissionSummary(dateKey);
  summaryBox.innerHTML=`
    <div><span>Total de comissões</span><strong>${money(summary.total)}</strong></div>
    <div><span>A pagar</span><strong>${money(summary.pending)}</strong></div>
    <div><span>Já pago</span><strong>${money(summary.paid)}</strong></div>
  `;

  box.innerHTML=filtered.length?filtered.map(r=>{
    const v=r.voucher;
    const formula=`${Number(v.passengers||0)} passageiro(s) • base ${money(r.base)} × ${Number(r.percent).toLocaleString('pt-BR')}%`;
    return `<article class="commission-card">
      <div>
        <span class="eyebrow">VOUCHER #${escHtml(v.voucherNumber||'')}</span>
        <h3>${escHtml(r.agent.name)}</h3>
        <p>${escHtml(r.agent.partner||'')} • ${escHtml(v.name||'Passageiro')}</p>
        <p>${formula}</p>
        ${r.agent.pixKey?`<p><strong>PIX:</strong> ${escHtml(r.agent.pixKey)}</p>`:''}
        ${r.agent.bankName||r.agent.bankAccount?`<p><strong>Banco:</strong> ${escHtml(r.agent.bankName||'-')} • Ag. ${escHtml(r.agent.bankAgency||'-')} • Cc. ${escHtml(r.agent.bankAccount||'-')}</p>`:''}
      </div>
      <div class="commission-values">
        <div><span>Base</span><strong>${money(r.base)}</strong></div>
        <div><span>Comissão</span><strong>${Number(r.percent).toLocaleString('pt-BR')}%</strong></div>
        <div><span>A receber</span><strong>${money(r.amount)}</strong></div>
      </div>
      <div class="commission-actions">
        <span class="commission-status ${r.paid?'paid':'pending'}">${r.paid?'PAGO':'PENDENTE'}</span>
        ${window.currentProfile?.role==='MASTER'
          ? `<button class="${r.paid?'ghost':'primary'}" onclick="setCommissionPaid('${v.id}',${r.paid?'false':'true'})">${r.paid?'Reabrir':'Marcar pago'}</button>`
          : ''}
      </div>
    </article>`;
  }).join(''):'<div class="voucher-empty">Nenhuma comissão encontrada para este dia/filtro.</div>';
}

window.showReportSection=function(section){
  document.querySelectorAll('.report-subtab').forEach(b=>b.classList.toggle('active',b.dataset.reportSection===section));
  document.getElementById('dailyReport')?.classList.toggle('hidden',section!=='operacional');
  document.getElementById('commissionReport')?.classList.toggle('hidden',section!=='comissoes');
  localStorage.setItem('aventura_report_section',section);
  if(section==='comissoes') renderCommissionReport();
};

function renderCommissionReport(){
  const box=document.getElementById('commissionReport');
  if(!box) return;

  const summary=getCommissionSummary(selectedOperationalDate);
  const dateLabel=new Date(`${selectedOperationalDate}T12:00:00`).toLocaleDateString('pt-BR');

  box.innerHTML=`
    <div class="daily-report-toolbar">
      <div>
        <strong>Comissões do dia selecionado</strong>
        <small>${dateLabel}</small>
      </div>
    </div>

    <div class="cards commission-report-cards">
      <article class="card"><span>Total de comissões</span><strong>${money(summary.total)}</strong></article>
      <article class="card"><span>A pagar</span><strong>${money(summary.pending)}</strong></article>
      <article class="card"><span>Já pago</span><strong>${money(summary.paid)}</strong></article>
    </div>

    <div class="report-divider"><strong>QUEM PRECISA RECEBER</strong></div>

    ${summary.agents.length?summary.agents.map(x=>`
      <div class="commission-report-agent">
        <div>
          <strong>${escHtml(x.agent.name)}</strong>
          <small>${escHtml(x.agent.partner||'')}</small>
          ${x.agent.pixKey?`<small>PIX: ${escHtml(x.agent.pixKey)}</small>`:''}
          ${x.agent.bankName||x.agent.bankAccount?`<small>${escHtml(x.agent.bankName||'-')} • Ag. ${escHtml(x.agent.bankAgency||'-')} • Cc. ${escHtml(x.agent.bankAccount||'-')}</small>`:''}
        </div>
        <div class="commission-report-values">
          <span>${x.passengers} passageiro(s)</span>
          <span>Base: ${money(x.base)}</span>
          <strong>A pagar: ${money(x.pending)}</strong>
        </div>
      </div>
    `).join(''):'<small>Nenhuma comissão de agente para esta data.</small>'}

    <div class="report-divider"><strong>DETALHAMENTO POR VOUCHER</strong></div>
    ${summary.rows.length?summary.rows.map(r=>`
      <div class="report-row commission-detail-row">
        <span>
          #${escHtml(r.voucher.voucherNumber||'')} • ${escHtml(r.agent.name)}<br>
          <small>${Number(r.voucher.passengers||0)} passageiro(s) • ${money(r.base)} × ${Number(r.percent).toLocaleString('pt-BR')}%</small>
        </span>
        <strong>${money(r.amount)} ${r.paid?'• PAGO':'• PENDENTE'}</strong>
      </div>
    `).join(''):'<small>Nenhum voucher com comissão.</small>'}
  `;
}

function renderAll(){
  if(!document.getElementById('todayLabel'))return;
  const selectedDateObj=new Date(`${selectedOperationalDate}T12:00:00`);
  document.getElementById('todayLabel').textContent=selectedDateObj.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  const dayTabs=getDayTabs(selectedOperationalDate);
  const open=dayTabs
    .filter(t=>t.status==='ABERTA')
    .sort((a,b)=>Number(a.number)-Number(b.number));
  const closed=dayTabs
    .filter(t=>t.status==='FECHADA')
    .sort((a,b)=>Number(a.number)-Number(b.number));
  const totalClosed=closed.reduce((s,t)=>s+t.total,0);
  const selectedIds=new Set(dayTabs.map(t=>t.id));
  const dayOrders=state.orders.filter(o=>selectedIds.has(o.tabId)&&o.status!=='CANCELADO');
  const dayPayments=state.payments.filter(p=>selectedIds.has(p.tabId));
  const sectorSales=sector=>dayOrders.reduce((sum,o)=>sum+o.items.filter(i=>i.sector===sector).reduce((s,i)=>s+i.qty*i.price,0),0);
  document.getElementById('openTabs').textContent=open.length;document.getElementById('ordersToday').textContent=dayOrders.length;document.getElementById('salesToday').textContent=money(totalClosed);document.getElementById('barSales').textContent=money(sectorSales('BAR'));document.getElementById('kitchenSales').textContent=money(sectorSales('COZINHA'));
  document.getElementById('dashboardTabs').innerHTML=open.length?open.slice(0,6).map(t=>`<div class="list-item"><div><strong>Comanda ${t.number}</strong><br><small>${t.customer||'Sem responsável'} • ${t.people||1} pessoa(s)</small></div><button class="ghost" onclick="openTab('${t.id}')">Abrir</button></div>`).join(''):'<small>Nenhuma comanda aberta.</small>';
  const low=state.products.filter(p=>p.stock<=p.min);document.getElementById('criticalStock').innerHTML=low.length?low.map(p=>`<div class="list-item"><div><strong>${p.name}</strong><br><small>${p.sector}</small></div><strong class="low">${p.stock}</strong></div>`).join(''):'<small>Estoque dentro dos mínimos.</small>';
  document.getElementById('tabsGrid').innerHTML=open.map(t=>{const total=state.orders.filter(o=>o.tabId===t.id&&o.status!=='CANCELADO').reduce((s,o)=>s+o.total,0);return `<article class="tab-card"><div class="panel-head"><div><h3>Comanda ${t.number}</h3><small>${t.customer||'Sem responsável'} • ${t.people||1} pessoa(s)${t.agent?` • Agente: ${escHtml(t.agent)}`:''}</small></div><span class="pill">ABERTA</span></div><div class="value">${money(total)}</div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="primary" onclick="openTab('${t.id}')">Lançar pedido</button>${canManageComanda()?`<button class="ghost" onclick="editTab('${t.id}')">Editar</button><button class="danger" onclick="deleteTabPermanently('${t.id}')">Apagar comanda</button>`:''}</div></article>`}).join('')||'<small>Nenhuma comanda aberta.</small>';
  document.getElementById('productsBody').innerHTML=state.products.map(p=>`<tr><td><strong>${p.name}</strong></td><td>${p.sector}</td><td>${money(p.price)}</td><td class="${p.stock<=p.min?'low':''}">${p.stock}</td><td><button class="danger" onclick="deleteProduct('${p.id}')">Excluir</button></td></tr>`).join('');
  document.getElementById('stockCards').innerHTML=state.products.map(p=>`<article class="stock-card"><small>${p.sector}</small><h3>${p.name}</h3><strong class="${p.stock<=p.min?'low':''}">${p.stock}</strong><p>Mínimo: ${p.min}</p><button class="ghost" onclick="stockAdjust('${p.id}',1)">+ Entrada</button> <button class="ghost" onclick="stockAdjust('${p.id}',-1)">- Saída</button></article>`).join('');
  const byMethod=m=>dayPayments.filter(p=>p.method===m).reduce((s,p)=>s+p.amount,0);
  document.getElementById('cashTotal').textContent=money(byMethod('DINHEIRO'));document.getElementById('pixTotal').textContent=money(byMethod('PIX'));document.getElementById('cardTotal').textContent=money(byMethod('CARTAO'));document.getElementById('receivedTotal').textContent=money(dayPayments.reduce((s,p)=>s+p.amount,0));
  document.getElementById('closedTabs').innerHTML=closed.length?closed.map(t=>`<div class="list-item"><div><strong>Comanda ${t.number}</strong><br><small>${t.customer||'Sem responsável'} • ${t.people||1} pessoa(s)</small></div><strong>${money(t.total)}</strong></div>`).join(''):'<small>Nenhuma comanda fechada.</small>';
  let daily;
  try{
    daily=getTodayOperationalData(selectedOperationalDate);
  }catch(err){
    console.error('Erro ao montar relatório diário:',err);
    const reportBox=document.getElementById('dailyReport');
    if(reportBox){
      reportBox.innerHTML='<div class="users-load-error"><strong>Erro ao carregar relatório.</strong><span>Atualize a página. Se persistir, verifique o console.</span></div>';
    }
    daily={
      people:0,open:[],closed:[],avgDuration:0,barSales:0,kitchenSales:0,
      couvert:0,sustentabilidade:0,serviceFee:0,pix:0,cash:0,card:0,
      avgTicket:0,totalReceived:0
    };
  }
  document.getElementById('dailyReport').innerHTML=`
    <div class="daily-report-toolbar">
      <div><strong>Resumo operacional de hoje</strong><small>${new Date(`${selectedOperationalDate}T12:00:00`).toLocaleDateString('pt-BR')}</small></div>
      ${isGestor()?'<button class="primary" onclick="downloadDailyReport()">Baixar relatório em PDF</button>':''}
    </div>
    <div class="report-row"><span>Pessoas registradas</span><strong>${daily.people}</strong></div>
    <div class="report-row"><span>Comandas abertas</span><strong>${daily.open.length}</strong></div>
    <div class="report-row"><span>Comandas fechadas</span><strong>${daily.closed.length}</strong></div>
    <div class="report-row"><span>Tempo médio das comandas</span><strong>${daily.avgDuration.toFixed(0)} min</strong></div>
    <div class="report-row"><span>Vendas BAR</span><strong>${money(daily.barSales)}</strong></div>
    <div class="report-row"><span>Vendas COZINHA</span><strong>${money(daily.kitchenSales)}</strong></div>
    <div class="report-row"><span>Couvert artístico</span><strong>${money(daily.couvert)}</strong></div>
    <div class="report-row"><span>Sustentabilidade</span><strong>${money(daily.sustentabilidade)}</strong></div>
    <div class="report-row"><span>Taxa de serviço</span><strong>${money(daily.serviceFee)}</strong></div>
    <div class="report-row"><span>PIX</span><strong>${money(daily.pix)}</strong></div>
    <div class="report-row"><span>Dinheiro</span><strong>${money(daily.cash)}</strong></div>
    <div class="report-row"><span>Cartão</span><strong>${money(daily.card)}</strong></div>
    <div class="report-row"><span>Ticket médio</span><strong>${money(daily.avgTicket)}</strong></div>
    <div class="report-row"><span>Total recebido</span><strong>${money(daily.totalReceived)}</strong></div>
    <div class="report-divider"><strong>PASSAGENS / VOUCHERS</strong></div>
    <div class="report-row"><span>Passagens cadastradas</span><strong>${daily.passages?.count||0}</strong></div>
    <div class="report-row"><span>Passageiros</span><strong>${daily.passages?.passengers||0}</strong></div>
    <div class="report-row"><span>Passageiros inteira</span><strong>${daily.passages?.fullPassengers||0}</strong></div>
    <div class="report-row"><span>Passageiros meia</span><strong>${daily.passages?.halfPassengers||0}</strong></div>
    <div class="report-row"><span>Passageiros cortesia</span><strong>${daily.passages?.courtesyPassengers||0}</strong></div>
    <div class="report-row"><span>Passageiros free / bebê</span><strong>${daily.passages?.freePassengers||0}</strong></div>
    <div class="report-row"><span>Valor total das passagens</span><strong>${money(daily.passages?.passageTotal||0)}</strong></div>
    <div class="report-row"><span>Pago antes do embarque</span><strong>${money(daily.passages?.paidBefore||0)}</strong></div>
    <div class="report-row"><span>Recebido no barco</span><strong>${money(daily.passages?.receivedOnBoard||0)}</strong></div>
    <div class="report-row"><span>Barco • Dinheiro</span><strong>${money(daily.passages?.cash||0)}</strong></div>
    <div class="report-row"><span>Barco • PIX</span><strong>${money(daily.passages?.pix||0)}</strong></div>
    <div class="report-row"><span>Barco • Cartão</span><strong>${money(daily.passages?.card||0)}</strong></div>
    <div class="report-row"><span>Saldo pendente de passagens</span><strong>${money(daily.passages?.pending||0)}</strong></div>
    <div class="report-divider"><strong>REPASSES</strong></div>
    <div class="report-row report-row-highlight"><span>Taxa de serviço 10% - TOTAL DA EQUIPE</span><strong>${money(daily.serviceFee)}</strong></div>
    <div class="report-row"><span>Carol - 1/3 da taxa de serviço</span><strong>${money(daily.serviceCarol)}</strong></div>
    <div class="report-row"><span>Hiago - 1/3 da taxa de serviço</span><strong>${money(daily.serviceHiago)}</strong></div>
    <div class="report-row"><span>João - 1/3 da taxa de serviço</span><strong>${money(daily.serviceJoao)}</strong></div>
    <div class="report-row"><span>Couvert artístico bruto</span><strong>${money(daily.couvert)}</strong></div>
    <div class="report-row"><span>Taxa máquina sobre couvert (10%)</span><strong>${money(daily.couvertMachineFee)}</strong></div>
    <div class="report-row"><span>Dimas - líquido do couvert</span><strong>${money(daily.couvertDimas)}</strong></div>`;

  const opDate=document.getElementById('operationalDate');
  if(opDate) opDate.value=selectedOperationalDate;
  const opStatus=document.getElementById('operationalDayStatus');
  if(opStatus){
    const isToday=selectedDateIsToday();
    opStatus.textContent=isToday?'DIA ATUAL':'HISTÓRICO';
    opStatus.className=`operational-status ${isToday?'current':'history'}`;
  }
  const opNav=document.getElementById('operationalCalendar');
  if(opNav){
    opNav.classList.toggle('master-calendar-hidden',window.currentProfile?.role!=='MASTER');
  }

  renderVouchers();
  document.getElementById('companyName').value=state.settings.company;document.getElementById('boatName').value=state.settings.boat;document.getElementById('printBridgeUrl').value=state.settings.printBridge;
}

window.addEventListener('DOMContentLoaded',async()=>{
  wireTabs();
  document.getElementById('btnOpenModal').onclick=()=>openNewTabModal();

  const restoreView=()=>{
    const saved=localStorage.getItem('aventura_current_view')||'dashboard';
    const btn=document.querySelector(`.tab[data-view="${saved}"]`);
    const allowed = saved!=='usuarios' || window.currentProfile?.role==='MASTER';
    if(btn && allowed) showView(saved);
    else showView('dashboard');

    if(saved==='relatorios'){
      const section=localStorage.getItem('aventura_report_section')||'operacional';
      setTimeout(()=>showReportSection(section),0);
    }
  };

  const status=document.getElementById('connectionStatus');
  if(status) status.textContent='Verificando servidor...';

  const hasLocalServer=await detectLocalServer();

  if(hasLocalServer){
    try{
      await loadLocalServerState();
      startLocalServerSync();
      startRemoteStatusMonitor();
      if(status) status.textContent='SQLite local • sincronizado';
      restoreView();
    }catch(err){
      console.error(err);
      if(status) status.textContent='SQLite local • erro';
      renderAll();
      restoreView();
    }
  }else{
    renderAll();
    restoreView();
  }
});

window.addEventListener('aventura-auth-ready',async()=>{
  // No modo offline, todos os celulares e o PC usam o mesmo SQLite via /api/state.
  if(localServerReady || await detectLocalServer()){
    if(!localServerReady){
      try{
        await loadLocalServerState();
        startLocalServerSync();
      }catch(err){
        console.error(err);
      }
    }
    const status=document.getElementById('connectionStatus');
    if(status) status.textContent='SQLite local • sincronizado';
    return;
  }

  const status=document.getElementById('connectionStatus');
  if(status) status.textContent='Sincronizando...';
  await loadCloudState();
  if(status) status.textContent='Acesso remoto • Supabase';
  setRemoteBadge('Nuvem • conectada','ok');
});



window.openUpdateCenter=async function(){
  if(window.currentProfile?.role!=='MASTER'){
    return alert('Somente o MASTER pode atualizar o sistema.');
  }

  openModal('Atualização do sistema',`
    <div class="update-center">
      <div class="update-current">
        <span>Versão instalada</span>
        <strong>${window.AVENTURA_VERSION||'desconhecida'}</strong>
      </div>
      <div id="updateCenterStatus" class="update-center-status">Verificando versão oficial...</div>
      <div id="updateCenterActions" class="checkout-actions"></div>
      <div class="update-center-note">
        <strong>Importante</strong>
        <span>A atualização troca apenas os arquivos do sistema. O banco SQLite, comandas, vouchers, configurações de nuvem e credenciais locais são preservados.</span>
      </div>
    </div>
  `);

  await checkSystemUpdate(true);
};

window.checkSystemUpdate=async function(showInModal=false){
  const statusEl=document.getElementById('updateCenterStatus');
  const actionsEl=document.getElementById('updateCenterActions');

  const setStatus=(msg,kind='info')=>{
    if(statusEl){
      statusEl.textContent=msg;
      statusEl.className=`update-center-status ${kind}`;
    }
  };

  try{
    setStatus('Consultando a versão oficial...','info');

    const res=await fetch('/api/update-check',{cache:'no-store'});
    const data=await res.json();

    if(!res.ok || !data.ok){
      throw new Error(data.error||'Não foi possível verificar atualização.');
    }

    if(!data.configured){
      setStatus('Atualizador ainda não configurado neste notebook.','warning');
      if(actionsEl){
        actionsEl.innerHTML='<button class="ghost" onclick="closeModal()">Fechar</button>';
      }
      return data;
    }

    if(data.available){
      setStatus(`Nova versão disponível: ${data.latestVersion}`,'success');
      if(actionsEl){
        actionsEl.innerHTML=`
          <button class="ghost" onclick="checkSystemUpdate(true)">Verificar novamente</button>
          <button id="installUpdateBtn" class="primary" onclick="installSystemUpdate('${data.latestVersion}')">Atualizar para ${data.latestVersion}</button>
        `;
      }
    }else{
      setStatus(`Sistema atualizado. Versão atual: ${data.currentVersion}`,'success');
      if(actionsEl){
        actionsEl.innerHTML='<button class="ghost" onclick="closeModal()">Fechar</button>';
      }
    }

    return data;
  }catch(err){
    console.error(err);
    setStatus(`Erro ao verificar atualização: ${err?.message||err}`,'error');
    if(actionsEl){
      actionsEl.innerHTML='<button class="ghost" onclick="checkSystemUpdate(true)">Tentar novamente</button>';
    }
    return null;
  }
};

window.installSystemUpdate=async function(latestVersion){
  if(window.currentProfile?.role!=='MASTER'){
    return alert('Somente o MASTER pode atualizar o sistema.');
  }

  if(!confirm(
    `Atualizar o sistema para ${latestVersion}?\n\n`+
    `O banco SQLite e os dados operacionais serão preservados.\n`+
    `O servidor será atualizado e você precisará reiniciá-lo quando a tela solicitar.`
  )) return;

  const btn=document.getElementById('installUpdateBtn');
  setButtonBusy(btn,true,'Atualizando...');
  showActionToast('Baixando atualização oficial...','info',3000);

  try{
    const res=await fetch('/api/update-install',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({expectedVersion:latestVersion})
    });

    const data=await res.json();
    if(!res.ok || !data.ok){
      throw new Error(data.error||'Falha ao instalar atualização.');
    }

    showActionToast(`Atualização ${data.version} instalada.`,'success',5000);

    const statusEl=document.getElementById('updateCenterStatus');
    const actionsEl=document.getElementById('updateCenterActions');

    if(statusEl){
      statusEl.textContent=`${data.version} instalada. Reinicie o servidor para concluir.`;
      statusEl.className='update-center-status success';
    }

    if(actionsEl){
      actionsEl.innerHTML=`
        <button class="primary" onclick="location.reload()">Recarregar página</button>
      `;
    }

    alert(
      `Atualização ${data.version} instalada.\n\n`+
      `Se o servidor.js também foi atualizado, feche a janela preta e execute novamente:\n\n`+
      `cd C:\\AVENTURA-OFFLINE\nnode server.js`
    );

  }catch(err){
    console.error(err);
    showActionToast(`Erro na atualização: ${err?.message||err}`,'error',7000);
    alert(`Não foi possível atualizar.\n\n${err?.message||err}`);
    setButtonBusy(btn,false);
  }
};


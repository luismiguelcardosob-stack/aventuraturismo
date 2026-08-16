const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const id=()=>crypto.randomUUID();

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

const defaults={
  menuVersion:MENU_VERSION,
  products:structuredClone(MENU_PRODUCTS),
  tabs:[],orders:[],payments:[],
  settings:{company:'Aventura Turismo',boat:'Capitão Gancho',printBridge:'http://localhost:8787'}
};

let state=JSON.parse(localStorage.getItem('aventura_pdv')||'null')||defaults;
let currentTabId=null;
let cart=[];
let lastSentOrderId=null;
let orderReviewLocked=false;

let cloudReady=false;
let savingCloud=false;
let pendingCloudSave=false;
let realtimeChannel=null;

function save(){
  localStorage.setItem('aventura_pdv',JSON.stringify(state));
  renderAll();
  if(cloudReady) saveCloudState();
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

window.createTab=function(){
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
  const today=new Date().toLocaleDateString('en-CA');

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

  save();
  closeModal();
  showView('comandas');
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

  openModal(`Comanda ${tab.number}`,`
    <div class="comanda-order-layout">
      <div class="comanda-order-main">
        <div class="comanda-order-header">
          <div>
            <span class="eyebrow">COMANDA ${tab.number}</span>
            <h3>${tab.customer||'Sem responsável'}</h3>
            <p>${tab.people||1} pessoa(s) • Consumo lançado: ${money(historical)}</p>
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

        <div class="comanda-secondary-actions">
          ${window.hasPermission&&window.hasPermission('caixa')
            ? '<button class="ghost" onclick="openCheckout()">Fechar comanda</button>'
            : '<span class="checkout-warning">Somente o Caixa pode fechar a comanda.</span>'}
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
  if(!cart.length) return;

  for(const line of cart){
    const p=state.products.find(x=>x.id===line.productId);
    if(p&&p.stock<line.qty) return alert(`Estoque insuficiente: ${p.name}`);
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

  // Trava a tela no resumo antes de sincronizar.
  lastSentOrderId=order.id;
  orderReviewLocked=true;

  save();
  cart=[];
  updateStableCart();
  showSentOrderInline(order);
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

  const area=document.getElementById('sentOrderArea');
  if(area){
    area.classList.add('hidden');
    area.innerHTML='';
  }

  const first=document.querySelector('.order-menu-scroll');
  first?.scrollTo({top:0,behavior:'smooth'});
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

window.openCheckout=function(){
  if(window.hasPermission && !window.hasPermission('caixa')){
    alert('Somente usuários com acesso ao Caixa podem fechar comandas.');
    return;
  }

  const tab=state.tabs.find(t=>t.id===currentTabId);
  if(!tab) return;

  const orders=state.orders.filter(o=>o.tabId===currentTabId && o.status!=='CANCELADO');
  const itemsMap={};

  for(const order of orders){
    for(const item of order.items){
      const key=item.productId || item.name;
      if(!itemsMap[key]){
        itemsMap[key]={name:item.name,qty:0,price:item.price,total:0};
      }
      itemsMap[key].qty += Number(item.qty||0);
      itemsMap[key].total += Number(item.qty||0)*Number(item.price||0);
    }
  }

  const items=Object.values(itemsMap);
  const subtotal=items.reduce((s,i)=>s+i.total,0);

  const automaticFees=orders
    .filter(o=>o.automatic)
    .reduce((sum,o)=>sum+Number(o.total||0),0);

  const productBase=Math.max(0,subtotal-automaticFees);
  const serviceFee=productBase*0.10;
  const total=subtotal+serviceFee;

  const lines=items.length
    ? items.map(i=>`
      <div class="checkout-item">
        <div><strong>${i.qty}x ${i.name}</strong><small>${money(i.price)} cada</small></div>
        <strong>${money(i.total)}</strong>
      </div>`).join('')
    : '<small>Nenhum consumo lançado.</small>';

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
          <strong>${money(total)}</strong>
        </div>
      </div>

      <div class="checkout-items-list">${lines}</div>

      <div class="checkout-summary">
        <div><span>Produtos/consumos</span><strong>${money(productBase)}</strong></div>
        <div><span>Couvert + sustentabilidade</span><strong>${money(automaticFees)}</strong></div>
        <div><span>Taxa de serviço (10% somente produtos)</span><strong>${money(serviceFee)}</strong></div>
        <div class="checkout-summary-total"><span>Total final</span><strong>${money(total)}</strong></div>
      </div>

      <div class="checkout-payment">
        <label>
          <span>Forma de pagamento</span>
          <select id="checkoutPaymentMethod">
            <option value="PIX">PIX</option>
            <option value="DINHEIRO">Dinheiro</option>
            <option value="CARTAO">Cartão</option>
          </select>
        </label>
      </div>

      <div class="checkout-actions">
        <button class="ghost" onclick="printCustomerReceipt()">Imprimir / visualizar nota</button>
        <button class="ghost" onclick="renderTabModal()">Voltar</button>
        <button class="primary" onclick="confirmCloseTab()">Confirmar pagamento e fechar</button>
      </div>
    </div>
  `);
};

window.printCustomerReceipt=function(){
  if(window.hasPermission && !window.hasPermission('caixa')){
    alert('Sem permissão para acessar o Caixa.');
    return;
  }

  const tab=state.tabs.find(t=>t.id===currentTabId);
  if(!tab) return;

  const orders=state.orders.filter(o=>o.tabId===currentTabId && o.status!=='CANCELADO');
  const itemsMap={};

  for(const order of orders){
    for(const item of order.items){
      const key=item.productId || item.name;
      if(!itemsMap[key]) itemsMap[key]={name:item.name,qty:0,price:item.price,total:0};
      itemsMap[key].qty+=Number(item.qty||0);
      itemsMap[key].total+=Number(item.qty||0)*Number(item.price||0);
    }
  }

  const items=Object.values(itemsMap);
  const subtotal=items.reduce((s,i)=>s+i.total,0);
  const automaticFees=orders.filter(o=>o.automatic).reduce((sum,o)=>sum+Number(o.total||0),0);
  const productBase=Math.max(0,subtotal-automaticFees);
  const serviceFee=productBase*0.10;
  const total=subtotal+serviceFee;

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
      ${items.map(i=>`
        <div class="receipt-line">
          <span>${i.qty}x ${i.name}</span>
          <strong>${money(i.total)}</strong>
        </div>`).join('')}
      <hr>
      <div class="receipt-line"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
      <div class="receipt-line"><span>Taxa de serviço 10%</span><strong>${money(serviceFee)}</strong></div>
      <div class="receipt-service-note">10% calculados somente sobre produtos/consumos; couvert e sustentabilidade não entram na base.</div>
      <hr>
      <div class="receipt-total"><span>TOTAL</span><strong>${money(total)}</strong></div>
      <small>Prévia para conferência do cliente.</small>
    </div>
    <div class="checkout-actions">
      <button class="ghost" onclick="openCheckout()">Voltar ao fechamento</button>
      <button class="primary" onclick="window.print()">Imprimir pelo navegador</button>
    </div>
  `);
};

window.confirmCloseTab=function(){
  if(window.hasPermission && !window.hasPermission('caixa')){
    alert('Somente usuários com acesso ao Caixa podem fechar comandas.');
    return;
  }

  const tab=state.tabs.find(t=>t.id===currentTabId);
  if(!tab) return;

  const closingOrders=state.orders.filter(o=>o.tabId===currentTabId && o.status!=='CANCELADO');
  const subtotal=closingOrders.reduce((s,o)=>s+Number(o.total||0),0);
  const automaticFees=closingOrders.filter(o=>o.automatic).reduce((s,o)=>s+Number(o.total||0),0);
  const productBase=Math.max(0,subtotal-automaticFees);
  const serviceFee=productBase*0.10;
  const total=subtotal+serviceFee;

  const method=document.getElementById('checkoutPaymentMethod')?.value;
  if(!method) return alert('Selecione a forma de pagamento.');

  tab.status='FECHADA';
  tab.closedAt=new Date().toISOString();
  tab.subtotal=subtotal;
  tab.serviceFee=serviceFee;
  tab.total=total;
  tab.closedBy=window.currentProfile?.id||null;
  tab.closedByName=window.currentProfile?.full_name||'Usuário';

  state.payments.push({
    id:id(),
    tabId:tab.id,
    method,
    amount:total,
    subtotal,
    serviceFee,
    createdAt:new Date().toISOString(),
    createdBy:window.currentProfile?.id||null,
    createdByName:window.currentProfile?.full_name||'Usuário'
  });

  save();
  currentTabId=null;
  closeModal();
  showView('caixa');
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

function renderAll(){
  if(!document.getElementById('todayLabel'))return;
  document.getElementById('todayLabel').textContent=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  const open=state.tabs
    .filter(t=>t.status==='ABERTA')
    .sort((a,b)=>Number(a.number)-Number(b.number));
  const closed=state.tabs
    .filter(t=>t.status==='FECHADA')
    .sort((a,b)=>Number(a.number)-Number(b.number));
  const totalClosed=closed.reduce((s,t)=>s+t.total,0);
  const sectorSales=sector=>state.orders.reduce((sum,o)=>sum+o.items.filter(i=>i.sector===sector).reduce((s,i)=>s+i.qty*i.price,0),0);
  document.getElementById('openTabs').textContent=open.length;document.getElementById('ordersToday').textContent=state.orders.length;document.getElementById('salesToday').textContent=money(totalClosed);document.getElementById('barSales').textContent=money(sectorSales('BAR'));document.getElementById('kitchenSales').textContent=money(sectorSales('COZINHA'));
  document.getElementById('dashboardTabs').innerHTML=open.length?open.slice(0,6).map(t=>`<div class="list-item"><div><strong>Comanda ${t.number}</strong><br><small>${t.customer||'Sem responsável'} • ${t.people||1} pessoa(s)</small></div><button class="ghost" onclick="openTab('${t.id}')">Abrir</button></div>`).join(''):'<small>Nenhuma comanda aberta.</small>';
  const low=state.products.filter(p=>p.stock<=p.min);document.getElementById('criticalStock').innerHTML=low.length?low.map(p=>`<div class="list-item"><div><strong>${p.name}</strong><br><small>${p.sector}</small></div><strong class="low">${p.stock}</strong></div>`).join(''):'<small>Estoque dentro dos mínimos.</small>';
  document.getElementById('tabsGrid').innerHTML=open.map(t=>{const total=state.orders.filter(o=>o.tabId===t.id&&o.status!=='CANCELADO').reduce((s,o)=>s+o.total,0);return `<article class="tab-card"><div class="panel-head"><div><h3>Comanda ${t.number}</h3><small>${t.customer||'Sem responsável'} • ${t.people||1} pessoa(s)</small></div><span class="pill">ABERTA</span></div><div class="value">${money(total)}</div><button class="primary" onclick="openTab('${t.id}')">Lançar pedido</button></article>`}).join('')||'<small>Nenhuma comanda aberta.</small>';
  document.getElementById('productsBody').innerHTML=state.products.map(p=>`<tr><td><strong>${p.name}</strong></td><td>${p.sector}</td><td>${money(p.price)}</td><td class="${p.stock<=p.min?'low':''}">${p.stock}</td><td><button class="danger" onclick="deleteProduct('${p.id}')">Excluir</button></td></tr>`).join('');
  document.getElementById('stockCards').innerHTML=state.products.map(p=>`<article class="stock-card"><small>${p.sector}</small><h3>${p.name}</h3><strong class="${p.stock<=p.min?'low':''}">${p.stock}</strong><p>Mínimo: ${p.min}</p><button class="ghost" onclick="stockAdjust('${p.id}',1)">+ Entrada</button> <button class="ghost" onclick="stockAdjust('${p.id}',-1)">- Saída</button></article>`).join('');
  const byMethod=m=>state.payments.filter(p=>p.method===m).reduce((s,p)=>s+p.amount,0);
  document.getElementById('cashTotal').textContent=money(byMethod('DINHEIRO'));document.getElementById('pixTotal').textContent=money(byMethod('PIX'));document.getElementById('cardTotal').textContent=money(byMethod('CARTAO'));document.getElementById('receivedTotal').textContent=money(state.payments.reduce((s,p)=>s+p.amount,0));
  document.getElementById('closedTabs').innerHTML=closed.length?closed.map(t=>`<div class="list-item"><div><strong>Comanda ${t.number}</strong><br><small>${t.customer||'Sem responsável'} • ${t.people||1} pessoa(s)</small></div><strong>${money(t.total)}</strong></div>`).join(''):'<small>Nenhuma comanda fechada.</small>';
  document.getElementById('dailyReport').innerHTML=`<div class="report-row"><span>Comandas abertas</span><strong>${open.length}</strong></div><div class="report-row"><span>Comandas fechadas</span><strong>${closed.length}</strong></div><div class="report-row"><span>Pedidos</span><strong>${state.orders.length}</strong></div><div class="report-row"><span>Vendas BAR</span><strong>${money(sectorSales('BAR'))}</strong></div><div class="report-row"><span>Vendas COZINHA</span><strong>${money(sectorSales('COZINHA'))}</strong></div><div class="report-row"><span>Total recebido</span><strong>${money(state.payments.reduce((s,p)=>s+p.amount,0))}</strong></div>`;
  document.getElementById('companyName').value=state.settings.company;document.getElementById('boatName').value=state.settings.boat;document.getElementById('printBridgeUrl').value=state.settings.printBridge;
}

window.addEventListener('DOMContentLoaded',()=>{wireTabs();document.getElementById('btnOpenModal').onclick=()=>openNewTabModal();renderAll();});
window.addEventListener('aventura-auth-ready',async()=>{
  document.getElementById('connectionStatus').textContent='Sincronizando...';
  await loadCloudState();
  document.getElementById('connectionStatus').textContent='Supabase • sincronizado';
});

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
            <small>${tab.people||1} pessoa(s) × R$ 12,00</small>
          </div>
          <div class="fee-toggle-end">
            <strong id="closingCouvert">${money(base.couvert)}</strong>
            <input id="toggleCouvert" type="checkbox" checked onchange="updateClosingFees()">
          </div>
        </label>

        <label class="fee-toggle-row">
          <div>
            <strong>Taxa de sustentabilidade</strong>
            <small>${tab.people||1} pessoa(s) × R$ 2,00</small>
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


function getTodayOperationalData(){
  const today=new Date().toLocaleDateString('en-CA');
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
  return {
    today,todaysTabs,people,open,closed,couvert,sustentabilidade,productSales,barSales,kitchenSales,extrasSales,serviceFee,totalReceived,
    pix:byMethod('PIX'),cash:byMethod('DINHEIRO'),card:byMethod('CARTAO'),products,avgDuration,
    avgTicket:closed.length?totalReceived/closed.length:0,avgPerPerson:people?totalReceived/people:0
  };
}

window.downloadDailyReport=function(){
  if(!isGestor()) return alert('Somente MASTER ou GESTOR podem baixar o relatório completo do dia.');

  if(!window.jspdf?.jsPDF){
    alert('O módulo de PDF ainda não carregou. Atualize a página e tente novamente.');
    return;
  }

  const d=getTodayOperationalData();
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

  text(new Date().toLocaleDateString('pt-BR',{
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
  let daily;
  try{
    daily=getTodayOperationalData();
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
      <div><strong>Resumo operacional de hoje</strong><small>${new Date().toLocaleDateString('pt-BR')}</small></div>
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
    <div class="report-row"><span>Total recebido</span><strong>${money(daily.totalReceived)}</strong></div>`;
  document.getElementById('companyName').value=state.settings.company;document.getElementById('boatName').value=state.settings.boat;document.getElementById('printBridgeUrl').value=state.settings.printBridge;
}

window.addEventListener('DOMContentLoaded',()=>{wireTabs();document.getElementById('btnOpenModal').onclick=()=>openNewTabModal();renderAll();});
window.addEventListener('aventura-auth-ready',async()=>{
  document.getElementById('connectionStatus').textContent='Sincronizando...';
  await loadCloudState();
  document.getElementById('connectionStatus').textContent='Supabase • sincronizado';
});

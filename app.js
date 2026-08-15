const money=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const id=()=>crypto.randomUUID();

const defaults={
  products:[
    {id:id(),name:'Água',sector:'BAR',price:6,stock:80,min:20},
    {id:id(),name:'Coca-Cola',sector:'BAR',price:8,stock:60,min:15},
    {id:id(),name:'Heineken',sector:'BAR',price:12,stock:120,min:30},
    {id:id(),name:'Caipirinha',sector:'BAR',price:22,stock:40,min:10},
    {id:id(),name:'Batata frita',sector:'COZINHA',price:28,stock:30,min:8},
    {id:id(),name:'Porção de peixe',sector:'COZINHA',price:55,stock:25,min:6},
    {id:id(),name:'Hambúrguer',sector:'COZINHA',price:32,stock:20,min:5},
    {id:id(),name:'Misto quente',sector:'COZINHA',price:18,stock:25,min:5}
  ],
  tabs:[],orders:[],payments:[],
  settings:{company:'Aventura Turismo',boat:'Capitão Gancho',printBridge:'http://localhost:8787'}
};

let state=JSON.parse(localStorage.getItem('aventura_pdv')||'null')||defaults;
let currentTabId=null;
let cart=[];

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
    localStorage.setItem('aventura_pdv',JSON.stringify(state));
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
          if(exists) renderTabModal();
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
window.closeModal=()=>document.getElementById('modal').classList.add('hidden');

window.openNewTabModal=function(){
  if(window.hasPermission&&!window.hasPermission('comandas'))return alert('Sem permissão.');

  openModal('Nova comanda',`
    <div class="single-comanda-form">
      <label>
        <span>Número da comanda</span>
        <input id="newTabNumber" type="number" min="1" step="1" inputmode="numeric" placeholder="Ex.: 1" autofocus>
      </label>
      <small>Digite apenas o número. O sistema criará automaticamente “Comanda X”.</small>
    </div>
    <div class="checkout">
      <button class="primary" onclick="createTab()">Criar comanda</button>
    </div>
  `);

  setTimeout(()=>document.getElementById('newTabNumber')?.focus(),50);
};

window.createTab=function(){
  const raw=document.getElementById('newTabNumber')?.value;
  const numeric=Number(raw);

  if(!Number.isInteger(numeric) || numeric<=0){
    return alert('Digite um número de comanda válido. Ex.: 1, 2, 10, 38.');
  }

  const number=String(numeric);

  // Comanda não pode ser duplicada no mesmo dia operacional.
  const today=new Date().toLocaleDateString('en-CA');
  const duplicate=state.tabs.some(t=>{
    if(t.status==='CANCELADA') return false;
    const tabDate=new Date(t.createdAt).toLocaleDateString('en-CA');
    return tabDate===today && String(Number(t.number))===number;
  });

  if(duplicate){
    return alert(`A Comanda ${number} já existe hoje. Abra a comanda existente em vez de criar outra.`);
  }

  state.tabs.push({
    id:id(),
    number,
    customer:'',
    status:'ABERTA',
    createdAt:new Date().toISOString(),
    closedAt:null,
    total:0,
    createdBy:window.currentProfile?.id||null,
    createdByName:window.currentProfile?.full_name||'Usuário'
  });

  save();
  closeModal();
  showView('comandas');
};

window.openTab=function(tabId){
  if(window.hasPermission&&!window.hasPermission('comandas'))return alert('Sem permissão.');
  currentTabId=tabId;cart=[];renderTabModal();
};

function renderTabModal(){
  const tab=state.tabs.find(t=>t.id===currentTabId);
  const existing=state.orders.filter(o=>o.tabId===currentTabId&&o.status!=='CANCELADO');
  const historical=existing.reduce((s,o)=>s+o.total,0);
  const cartTotal=cart.reduce((s,l)=>s+l.qty*l.price,0);
  const productButtons=state.products.map(p=>`<button class="product-btn" onclick="addProduct('${p.id}')"><strong>${p.name}</strong><small>${p.sector} • ${money(p.price)} • est. ${p.stock}</small></button>`).join('');
  const cartLines=cart.length?cart.map((l,i)=>`<div class="order-line"><span>${l.qty}x ${l.name}</span><strong>${money(l.qty*l.price)}</strong><button class="danger" onclick="removeCart(${i})">×</button></div>`).join(''):'<small>Nenhum item novo.</small>';
  const history=existing.length?existing.map(o=>`<div class="list-item"><div><strong>${new Date(o.createdAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</strong><br><small>${o.items.map(i=>`${i.qty}x ${i.name}`).join(', ')}</small></div><strong>${money(o.total)}</strong></div>`).join(''):'<small>Sem pedidos enviados.</small>';
  openModal(`Comanda ${tab.number}`,`<div class="panel-head"><div><strong>Comanda ${tab.number}</strong><br><small>Total já enviado: ${money(historical)}</small></div><span class="pill">${tab.status}</span></div><h4>Novo pedido</h4><div class="product-picker">${productButtons}</div><div class="order-lines">${cartLines}</div><div class="checkout"><strong>Novo pedido: ${money(cartTotal)}</strong><button class="primary" onclick="sendOrder()" ${cart.length?'':'disabled'}>Enviar e imprimir</button></div><h4>Pedidos enviados</h4><div class="list">${history}</div><div class="checkout">
      ${window.hasPermission && window.hasPermission('caixa')
        ? '<button class="primary" onclick="openCheckout()">Fechar comanda</button>'
        : '<span class="checkout-warning">Somente usuários com acesso ao Caixa podem fechar esta comanda.</span>'}
    </div>`);
}

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
  if(!items.length) return '';
  return `<div class="print-preview-ticket">
    <div class="print-preview-sector">${sector}</div>
    <strong>${state.settings.company}</strong>
    <span>${state.settings.boat}</span>
    <hr>
    <strong>COMANDA ${tab.number}</strong>
    <span>${tab.customer||'Passageiro'}</span>
    <span>${new Date(order.createdAt).toLocaleString('pt-BR')}</span>
    <hr>
    ${items.map(i=>`<div class="print-item"><b>${i.qty}x</b><span>${i.name}</span></div>`).join('')}
    <hr>
    <small>Lançado por: ${order.createdByName||'Usuário'}</small>
  </div>`;
}

function showPrintPreview(order){
  const tab=state.tabs.find(t=>t.id===order.tabId);
  const bar=order.items.filter(i=>i.sector==='BAR');
  const cozinha=order.items.filter(i=>i.sector==='COZINHA');
  openModal('Divisão para impressão',
    `<div class="print-preview-note"><strong>PRÉVIA DE IMPRESSÃO</strong><span>As impressoras estão desativadas por enquanto. Esta é exatamente a divisão que será enviada futuramente.</span></div>
     <div class="print-preview-grid">
       ${bar.length?receiptHtml('BAR',bar,tab,order):'<div class="print-preview-empty"><strong>BAR</strong><span>Nenhum item para o bar.</span></div>'}
       ${cozinha.length?receiptHtml('COZINHA',cozinha,tab,order):'<div class="print-preview-empty"><strong>COZINHA</strong><span>Nenhum item para a cozinha.</span></div>'}
     </div>
     <div class="checkout">
       <button class="ghost" onclick="renderTabModal()">Voltar para a comanda</button>
       <button class="primary" onclick="closeModal()">Concluir</button>
     </div>`);
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
  const total=items.reduce((s,i)=>s+i.total,0);

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
          <p>${tab.customer||'Passageiro'}</p>
        </div>
        <div class="checkout-total-box">
          <span>Total a pagar</span>
          <strong>${money(total)}</strong>
        </div>
      </div>

      <div class="checkout-items-list">${lines}</div>

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
  const total=items.reduce((s,i)=>s+i.total,0);

  openModal(`Nota • Comanda ${tab.number}`,`
    <div class="customer-receipt">
      <div class="receipt-center">
        <strong>${state.settings.company}</strong>
        <span>${state.settings.boat}</span>
        <span>COMANDA ${tab.number}</span>
        <span>${tab.customer||'Passageiro'}</span>
      </div>
      <hr>
      ${items.map(i=>`
        <div class="receipt-line">
          <span>${i.qty}x ${i.name}</span>
          <strong>${money(i.total)}</strong>
        </div>`).join('')}
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

  const total=state.orders
    .filter(o=>o.tabId===currentTabId && o.status!=='CANCELADO')
    .reduce((s,o)=>s+o.total,0);

  const method=document.getElementById('checkoutPaymentMethod')?.value;
  if(!method) return alert('Selecione a forma de pagamento.');

  tab.status='FECHADA';
  tab.closedAt=new Date().toISOString();
  tab.total=total;
  tab.closedBy=window.currentProfile?.id||null;
  tab.closedByName=window.currentProfile?.full_name||'Usuário';

  state.payments.push({
    id:id(),
    tabId:tab.id,
    method,
    amount:total,
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
  document.getElementById('dashboardTabs').innerHTML=open.length?open.slice(0,6).map(t=>`<div class="list-item"><div><strong>Comanda ${t.number}</strong><br><small>${t.customer||'Comanda ativa'}</small></div><button class="ghost" onclick="openTab('${t.id}')">Abrir</button></div>`).join(''):'<small>Nenhuma comanda aberta.</small>';
  const low=state.products.filter(p=>p.stock<=p.min);document.getElementById('criticalStock').innerHTML=low.length?low.map(p=>`<div class="list-item"><div><strong>${p.name}</strong><br><small>${p.sector}</small></div><strong class="low">${p.stock}</strong></div>`).join(''):'<small>Estoque dentro dos mínimos.</small>';
  document.getElementById('tabsGrid').innerHTML=open.map(t=>{const total=state.orders.filter(o=>o.tabId===t.id&&o.status!=='CANCELADO').reduce((s,o)=>s+o.total,0);return `<article class="tab-card"><div class="panel-head"><div><h3>Comanda ${t.number}</h3><small>${t.customer||'Comanda ativa'}</small></div><span class="pill">ABERTA</span></div><div class="value">${money(total)}</div><button class="primary" onclick="openTab('${t.id}')">Lançar pedido</button></article>`}).join('')||'<small>Nenhuma comanda aberta.</small>';
  document.getElementById('productsBody').innerHTML=state.products.map(p=>`<tr><td><strong>${p.name}</strong></td><td>${p.sector}</td><td>${money(p.price)}</td><td class="${p.stock<=p.min?'low':''}">${p.stock}</td><td><button class="danger" onclick="deleteProduct('${p.id}')">Excluir</button></td></tr>`).join('');
  document.getElementById('stockCards').innerHTML=state.products.map(p=>`<article class="stock-card"><small>${p.sector}</small><h3>${p.name}</h3><strong class="${p.stock<=p.min?'low':''}">${p.stock}</strong><p>Mínimo: ${p.min}</p><button class="ghost" onclick="stockAdjust('${p.id}',1)">+ Entrada</button> <button class="ghost" onclick="stockAdjust('${p.id}',-1)">- Saída</button></article>`).join('');
  const byMethod=m=>state.payments.filter(p=>p.method===m).reduce((s,p)=>s+p.amount,0);
  document.getElementById('cashTotal').textContent=money(byMethod('DINHEIRO'));document.getElementById('pixTotal').textContent=money(byMethod('PIX'));document.getElementById('cardTotal').textContent=money(byMethod('CARTAO'));document.getElementById('receivedTotal').textContent=money(state.payments.reduce((s,p)=>s+p.amount,0));
  document.getElementById('closedTabs').innerHTML=closed.length?closed.map(t=>`<div class="list-item"><div><strong>Comanda ${t.number}</strong><br><small>${t.customer||'Comanda ativa'}</small></div><strong>${money(t.total)}</strong></div>`).join(''):'<small>Nenhuma comanda fechada.</small>';
  document.getElementById('dailyReport').innerHTML=`<div class="report-row"><span>Comandas abertas</span><strong>${open.length}</strong></div><div class="report-row"><span>Comandas fechadas</span><strong>${closed.length}</strong></div><div class="report-row"><span>Pedidos</span><strong>${state.orders.length}</strong></div><div class="report-row"><span>Vendas BAR</span><strong>${money(sectorSales('BAR'))}</strong></div><div class="report-row"><span>Vendas COZINHA</span><strong>${money(sectorSales('COZINHA'))}</strong></div><div class="report-row"><span>Total recebido</span><strong>${money(state.payments.reduce((s,p)=>s+p.amount,0))}</strong></div>`;
  document.getElementById('companyName').value=state.settings.company;document.getElementById('boatName').value=state.settings.boat;document.getElementById('printBridgeUrl').value=state.settings.printBridge;
}

window.addEventListener('DOMContentLoaded',()=>{wireTabs();document.getElementById('btnOpenModal').onclick=()=>openNewTabModal();renderAll();});
window.addEventListener('aventura-auth-ready',async()=>{
  document.getElementById('connectionStatus').textContent='Sincronizando...';
  await loadCloudState();
  document.getElementById('connectionStatus').textContent='Supabase • sincronizado';
});

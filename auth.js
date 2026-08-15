(() => {
  const cfg = window.AVENTURA_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey) {
    alert("Supabase não configurado.");
    return;
  }

  window.sb = window.supabase.createClient(cfg.url, cfg.anonKey);
  window.currentProfile = null;

  const ALL = {dashboard:true,comandas:true,produtos:true,estoque:true,caixa:true,relatorios:true,configuracoes:true};
  const $ = id => document.getElementById(id);

  function showLogin(msg=""){
    $("loginScreen")?.classList.remove("hidden");
    $("appShell")?.classList.add("hidden");
    if($("loginError")){
      $("loginError").textContent=msg;
      $("loginError").classList.toggle("hidden",!msg);
    }
  }

  function showApp(){
    $("loginScreen")?.classList.add("hidden");
    $("appShell")?.classList.remove("hidden");
  }

  function allowed(p,key){
    if(!p || p.active===false) return false;
    if(p.role==="MASTER") return true;
    return Boolean(p.permissions?.[key]);
  }

  window.hasPermission = key => allowed(window.currentProfile,key);

  async function fetchProfile(user){
    const {data,error}=await window.sb.from("user_profiles").select("*").eq("id",user.id).single();
    if(error) throw error;
    return data;
  }

  function applyPermissions(){
    const p=window.currentProfile;
    const master=p?.role==="MASTER";

    document.querySelectorAll("[data-permission]").forEach(el=>{
      el.classList.toggle("permission-hidden",!allowed(p,el.dataset.permission));
    });
    document.querySelectorAll(".master-only").forEach(el=>{
      el.classList.toggle("permission-hidden",!master);
    });

    if($("loggedUser")) $("loggedUser").textContent=`${p?.full_name||"Usuário"}${master?" • MASTER":""}`;

    const active=document.querySelector(".tab.active");
    if(active?.classList.contains("permission-hidden")){
      document.querySelector(".tab:not(.permission-hidden)")?.click();
    }
  }

  async function enterApp(user){
    try{
      const profile=await fetchProfile(user);
      if(!profile.active){
        await window.sb.auth.signOut();
        showLogin("Seu acesso está bloqueado.");
        return;
      }
      window.currentProfile=profile;
      showApp();
      applyPermissions();
      window.dispatchEvent(new CustomEvent("aventura-auth-ready",{detail:profile}));
    }catch(e){
      console.error(e);
      showLogin("Usuário sem perfil de acesso. Execute o SQL de atualização.");
    }
  }

  async function init(){
    const {data:{session}}=await window.sb.auth.getSession();
    if(session?.user) await enterApp(session.user); else showLogin();

    $("loginForm")?.addEventListener("submit",async e=>{
      e.preventDefault();
      const btn=$("loginButton");
      btn.disabled=true; btn.textContent="Entrando...";
      const {data,error}=await window.sb.auth.signInWithPassword({
        email:$("loginEmail").value.trim(),
        password:$("loginPassword").value
      });
      btn.disabled=false; btn.textContent="Entrar";
      if(error){showLogin("E-mail ou senha inválidos.");return;}
      await enterApp(data.user);
    });

    $("btnLogout")?.addEventListener("click",async()=>{
      await window.sb.auth.signOut();
      location.reload();
    });
  }

  function esc(s){
    return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }

  window.loadUsers=async function(){
    const box=$("usersAccessList");
    if(!box || window.currentProfile?.role!=="MASTER") return;
    box.innerHTML="<small>Carregando...</small>";

    const {data,error}=await window.sb.from("user_profiles")
      .select("id,full_name,email,role,active,permissions,created_at")
      .order("created_at",{ascending:true});

    if(error){box.innerHTML=`<small>Erro: ${esc(error.message)}</small>`;return;}

    const labels={dashboard:"Painel",comandas:"Comandas",produtos:"Produtos",estoque:"Estoque",caixa:"Caixa",relatorios:"Relatórios",configuracoes:"Configurações"};

    box.innerHTML=data.map(u=>{
      const master=u.role==="MASTER";
      const perms=master?ALL:(u.permissions||{});
      return `<article class="user-access-card">
        <div class="user-access-head">
          <div><strong>${esc(u.full_name||"Usuário")}</strong><small>${esc(u.email||"")}</small></div>
          <div class="user-access-actions">
            <span class="pill">${master?"MASTER":"USUÁRIO"}</span>
            ${master?"":`<label class="active-toggle"><input type="checkbox" ${u.active?"checked":""} onchange="setUserActive('${u.id}',this.checked)"><span>${u.active?"Ativo":"Bloqueado"}</span></label>`}
          </div>
        </div>
        <div class="permissions-grid">
          ${Object.entries(labels).map(([k,v])=>`<label class="permission-switch ${master?"disabled-switch":""}"><input type="checkbox" ${perms[k]?"checked":""} ${master?"disabled":""} onchange="setUserPermission('${u.id}','${k}',this.checked)"><span>${v}</span></label>`).join("")}
        </div>
      </article>`;
    }).join("");
  };

  window.setUserPermission=async function(uid,key,value){
    if(window.currentProfile?.role!=="MASTER") return;
    const {data}=await window.sb.from("user_profiles").select("permissions,role").eq("id",uid).single();
    if(!data || data.role==="MASTER") return;
    const permissions={...(data.permissions||{}),[key]:value};
    const {error}=await window.sb.from("user_profiles").update({permissions,updated_at:new Date().toISOString()}).eq("id",uid);
    if(error){alert("Não foi possível alterar.");await loadUsers();}
  };

  window.setUserActive=async function(uid,value){
    if(window.currentProfile?.role!=="MASTER") return;
    const {data}=await window.sb.from("user_profiles").select("role").eq("id",uid).single();
    if(data?.role==="MASTER") return;
    const {error}=await window.sb.from("user_profiles").update({active:value,updated_at:new Date().toISOString()}).eq("id",uid);
    if(error) alert("Não foi possível alterar.");
    await loadUsers();
  };

  window.addEventListener("DOMContentLoaded",init);
})();
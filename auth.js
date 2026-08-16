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
    document.body.classList.remove("authenticated","recovering");
    $("loginScreen")?.classList.remove("hidden");
    $("recoveryScreen")?.classList.add("hidden");
    $("appShell")?.classList.add("hidden");
    if($("loginError")){
      $("loginError").textContent=msg;
      $("loginError").classList.toggle("hidden",!msg);
    }
  }

  function showApp(){
    document.body.classList.add("authenticated");
    $("loginScreen")?.classList.add("hidden");
    $("appShell")?.classList.remove("hidden");
  }

  function allowed(p,key){
    if(!p || p.active===false) return false;
    const role=p.role||'GARCOM';
    if(role==='MASTER'||role==='GESTOR') return true;
    if(role==='GERENTE') return ['dashboard','comandas','estoque','caixa','relatorios'].includes(key);
    if(role==='GARCOM'||role==='USER') return ['comandas'].includes(key);
    return false;
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


  function setLoginError(message=""){
    const el=$("loginError");
    if(!el) return;
    el.textContent=message;
    el.classList.toggle("hidden",!message);
  }

  function setLoginSuccess(message=""){
    const el=$("loginSuccess");
    if(!el) return;
    el.textContent=message;
    el.classList.toggle("hidden",!message);
  }

  function showRecovery(){
    document.body.classList.remove("authenticated");
    document.body.classList.add("recovering");
    $("loginScreen")?.classList.add("hidden");
    $("recoveryScreen")?.classList.remove("hidden");
    $("appShell")?.classList.add("hidden");
  }

  function togglePasswordField(inputId,buttonId){
    const input=$(inputId);
    const button=$(buttonId);
    if(!input||!button) return;
    const showing=input.type==="text";
    input.type=showing?"password":"text";
    button.textContent=showing?"Mostrar":"Ocultar";
    button.setAttribute("aria-label",showing?"Mostrar senha":"Ocultar senha");
  }

  async function init(){
    // Detecta retorno do link de recuperação de senha.
    const hash=window.location.hash||"";
    const search=window.location.search||"";
    const recoveryInUrl=hash.includes("type=recovery") || search.includes("type=recovery");

    const {data:{session}}=await window.sb.auth.getSession();

    if(recoveryInUrl){
      showRecovery();
    }else if(session?.user){
      await enterApp(session.user);
    }else{
      showLogin();
    }

    // Supabase dispara PASSWORD_RECOVERY quando a pessoa abre o link recebido por e-mail.
    window.sb.auth.onAuthStateChange(async(event,sessionNow)=>{
      if(event==="PASSWORD_RECOVERY"){
        showRecovery();
        return;
      }

      if(event==="SIGNED_OUT"){
        window.currentProfile=null;
        showLogin();
        return;
      }
    });

    $("togglePassword")?.addEventListener("click",()=>togglePasswordField("loginPassword","togglePassword"));
    $("toggleNewPassword")?.addEventListener("click",()=>togglePasswordField("newPassword","toggleNewPassword"));

    const passwordInput=$("loginPassword");
    const capsWarning=$("capsLockWarning");

    const updateCapsLock=(event)=>{
      if(!capsWarning) return;
      const capsOn=event.getModifierState && event.getModifierState("CapsLock");
      capsWarning.classList.toggle("hidden",!capsOn);
    };

    passwordInput?.addEventListener("keydown",updateCapsLock);
    passwordInput?.addEventListener("keyup",updateCapsLock);
    passwordInput?.addEventListener("blur",()=>capsWarning?.classList.add("hidden"));

    $("loginForm")?.addEventListener("submit",async e=>{
      e.preventDefault();

      const btn=$("loginButton");
      const email=$("loginEmail")?.value.trim().toLowerCase();
      const password=$("loginPassword")?.value||"";

      setLoginError("");
      setLoginSuccess("");

      if(!email){
        setLoginError("Informe seu e-mail.");
        $("loginEmail")?.focus();
        return;
      }

      if(!password){
        setLoginError("Informe sua senha.");
        $("loginPassword")?.focus();
        return;
      }

      btn.disabled=true;
      btn.textContent="Entrando...";

      try{
        const {data,error}=await window.sb.auth.signInWithPassword({email,password});

        if(error){
          let message="Não foi possível entrar.";
          const lower=(error.message||"").toLowerCase();

          if(lower.includes("invalid login credentials")){
            message="E-mail ou senha incorretos.";
          }else if(lower.includes("email not confirmed")){
            message="Seu e-mail ainda não foi confirmado.";
          }else if(lower.includes("too many requests")){
            message="Muitas tentativas. Aguarde um momento e tente novamente.";
          }

          setLoginError(message);
          return;
        }

        if(!data?.user){
          setLoginError("Login não concluído. Tente novamente.");
          return;
        }

        setLoginSuccess("Login confirmado. Abrindo o sistema...");
        await enterApp(data.user);

      }catch(err){
        console.error(err);
        setLoginError("Ocorreu um erro ao entrar. Tente novamente.");
      }finally{
        btn.disabled=false;
        btn.textContent="Entrar";
      }
    });

    $("forgotPasswordButton")?.addEventListener("click",async()=>{
      const email=$("loginEmail")?.value.trim().toLowerCase();

      setLoginError("");
      setLoginSuccess("");

      if(!email){
        setLoginError("Digite seu e-mail acima antes de clicar em “Esqueci minha senha”.");
        $("loginEmail")?.focus();
        return;
      }

      const button=$("forgotPasswordButton");
      button.disabled=true;
      button.textContent="Enviando...";

      try{
        const redirectTo=window.location.origin + window.location.pathname;

        const {error}=await window.sb.auth.resetPasswordForEmail(email,{redirectTo});

        if(error){
          console.error(error);
          setLoginError("Não foi possível enviar o e-mail de recuperação. Confira o endereço e tente novamente.");
          return;
        }

        setLoginSuccess("Enviamos um link de recuperação para seu e-mail. Abra o e-mail e clique no link para criar uma nova senha.");
      }catch(err){
        console.error(err);
        setLoginError("Erro ao solicitar recuperação de senha.");
      }finally{
        button.disabled=false;
        button.textContent="Esqueci minha senha";
      }
    });

    $("recoveryForm")?.addEventListener("submit",async e=>{
      e.preventDefault();

      const password=$("newPassword")?.value||"";
      const confirm=$("confirmNewPassword")?.value||"";
      const btn=$("recoveryButton");
      const errorEl=$("recoveryError");
      const successEl=$("recoverySuccess");

      const setError=msg=>{
        errorEl.textContent=msg;
        errorEl.classList.toggle("hidden",!msg);
      };
      const setSuccess=msg=>{
        successEl.textContent=msg;
        successEl.classList.toggle("hidden",!msg);
      };

      setError("");
      setSuccess("");

      if(password.length<6){
        setError("A nova senha precisa ter pelo menos 6 caracteres.");
        return;
      }

      if(password!==confirm){
        setError("As duas senhas não são iguais.");
        return;
      }

      btn.disabled=true;
      btn.textContent="Salvando...";

      try{
        const {error}=await window.sb.auth.updateUser({password});

        if(error){
          setError("Não foi possível alterar a senha. Abra novamente o link de recuperação recebido por e-mail.");
          return;
        }

        setSuccess("Senha alterada com sucesso. Você já pode voltar ao login.");
        history.replaceState(null,"",window.location.pathname);
      }catch(err){
        console.error(err);
        setError("Erro ao alterar a senha.");
      }finally{
        btn.disabled=false;
        btn.textContent="Salvar nova senha";
      }
    });

    $("backToLoginButton")?.addEventListener("click",async()=>{
      await window.sb.auth.signOut();
      history.replaceState(null,"",window.location.pathname);
      showLogin();
      $("loginPassword").value="";
      $("loginEmail")?.focus();
    });

    $("btnLogout")?.addEventListener("click",async()=>{
      await window.sb.auth.signOut();
      window.currentProfile=null;
      location.reload();
    });
  }

  window.loadUsers=async function(){
    const box=$("usersAccessList");
    if(!box || window.currentProfile?.role!=="MASTER") return;
    box.innerHTML="<small>Carregando...</small>";

    const {data,error}=await window.sb.from("user_profiles")
      .select("id,full_name,email,role,active,permissions,created_at")
      .order("created_at",{ascending:true});

    if(error){box.innerHTML=`<small>Erro: ${esc(error.message)}</small>`;return;}

    const roleLabels={MASTER:"MASTER",GESTOR:"GESTOR",GERENTE:"GERENTE",GARCOM:"GARÇOM",USER:"GARÇOM"};

    box.innerHTML=data.map(u=>{
      const master=u.role==="MASTER";
      const normalizedRole=u.role==="USER"?"GARCOM":u.role;
      return `<article class="user-access-card">
        <div class="user-access-head">
          <div><strong>${esc(u.full_name||"Usuário")}</strong><small>${esc(u.email||"")}</small></div>
          <div class="user-access-actions">
            <span class="pill">${roleLabels[normalizedRole]||normalizedRole}</span>
            ${master?"":`<select class="role-select" onchange="setUserRole('${u.id}',this.value)">
              <option value="GARCOM" ${normalizedRole==="GARCOM"?"selected":""}>Garçom</option>
              <option value="GERENTE" ${normalizedRole==="GERENTE"?"selected":""}>Gerente</option>
              <option value="GESTOR" ${normalizedRole==="GESTOR"?"selected":""}>Gestor</option>
            </select>
            <label class="active-toggle"><input type="checkbox" ${u.active?"checked":""} onchange="setUserActive('${u.id}',this.checked)"><span>${u.active?"Ativo":"Bloqueado"}</span></label>`}
          </div>
        </div>
        <div class="profile-access-summary">${
          normalizedRole==="GARCOM"?"Comandas e pedidos. Pode abrir e fechar comanda.":
          normalizedRole==="GERENTE"?"Comandas, pedidos, Caixa e Estoque.":
          normalizedRole==="GESTOR"?"Acesso operacional completo.":
          "Administrador MASTER do sistema."
        }</div>
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


  window.toggleCreateUser=function(show){
    if(window.currentProfile?.role!=="MASTER") return;
    const panel=$("createUserPanel");
    if(!panel) return;
    panel.classList.toggle("hidden",!show);
    if(show) $("newUserName")?.focus();
    else {
      $("createUserForm")?.reset();
      const dash=document.querySelector('[data-new-perm="dashboard"]');
      if(dash) dash.checked=true;
      if($("createUserMessage")) $("createUserMessage").textContent="";
    }
  };

  window.createSystemUser=async function(event){
    event?.preventDefault();
    if(window.currentProfile?.role!=="MASTER") return;

    const name=$("newUserName")?.value.trim();
    const email=$("newUserEmail")?.value.trim().toLowerCase();
    const password=$("newUserPassword")?.value || "";
    const msg=$("createUserMessage");
    const btn=$("createUserBtn");

    if(!name || !email || password.length<6){
      if(msg) msg.textContent="Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.";
      return;
    }

    const role=$("newUserRole")?.value||"GARCOM";

    if(btn){btn.disabled=true;btn.textContent="Criando...";}
    if(msg) msg.textContent="Criando usuário...";

    try{
      const {data,error}=await window.sb.functions.invoke("admin-create-user",{
        body:{full_name:name,email,password,role}
      });
      if(error) throw error;
      if(!data?.ok) throw new Error(data?.error || "Não foi possível criar o usuário.");

      if(msg) msg.textContent="Usuário criado com sucesso.";
      $("createUserForm")?.reset();
      const dash=document.querySelector('[data-new-perm="dashboard"]');
      if(dash) dash.checked=true;
      await loadUsers();
      setTimeout(()=>toggleCreateUser(false),700);
    }catch(err){
      let detail=err?.message || "Erro ao criar usuário.";
      try{
        if(err?.context){
          const body=await err.context.json();
          detail=body?.error || detail;
        }
      }catch(_){}
      if(msg) msg.textContent=detail;
    }finally{
      if(btn){btn.disabled=false;btn.textContent="Criar usuário";}
    }
  };


  window.setUserRole=async function(uid,role){
    if(window.currentProfile?.role!=="MASTER") return;
    if(!["GARCOM","GERENTE","GESTOR"].includes(role)) return;

    const {data}=await window.sb.from("user_profiles").select("role").eq("id",uid).single();
    if(data?.role==="MASTER") return;

    const {error}=await window.sb.from("user_profiles")
      .update({role,updated_at:new Date().toISOString()})
      .eq("id",uid);

    if(error) alert("Não foi possível alterar o perfil.");
    await loadUsers();
  };

  window.addEventListener("DOMContentLoaded",init);
})();
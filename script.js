(function(){
  "use strict";

  var PHASES = [
    {
      id: "fundamentos", title: "Fundamentos Web", sub: "Base sólida de HTML, CSS e lógica antes de acelerar.",
      nodes: [
        {t:"HTML5 semântico", d:"Estrutura acessível, landmarks e formulários bem construídos.", xp:20},
        {t:"CSS moderno", d:"Grid, Flexbox, container queries e variáveis CSS na prática.", xp:20},
        {t:"JavaScript ES2023+", d:"Async/await, módulos, destructuring e as APIs do navegador.", xp:25},
        {t:"Git avançado", d:"Rebase, cherry-pick, branches e fluxo de PR em equipe.", xp:15},
        {t:"Lógica e estrutura de dados", d:"Listas, filas, pilhas, árvores e complexidade (Big O).", xp:25}
      ]
    },
    {
      id: "frontend", title: "Front-end Avançado", sub: "De páginas para aplicações — interfaces robustas e testadas.",
      nodes: [
        {t:"TypeScript", d:"Tipagem estática aplicada a projetos reais e a bibliotecas.", xp:25},
        {t:"React", d:"Componentes, hooks, contexto e ciclo de renderização.", xp:30},
        {t:"Next.js", d:"Rotas, SSR/SSG, server actions e otimização de imagens.", xp:30},
        {t:"Gerenciamento de estado", d:"Zustand, Redux ou Context — quando usar cada um.", xp:20},
        {t:"Acessibilidade e performance", d:"WCAG, Lighthouse, lazy loading e Core Web Vitals.", xp:20}
      ]
    },
    {
      id: "backend", title: "Back-end & APIs", sub: "Servidores, autenticação e contratos de API bem desenhados.",
      nodes: [
        {t:"Node.js + Express/NestJS", d:"Arquitetura de API REST, middlewares e injeção de dependência.", xp:30},
        {t:"Python + FastAPI", d:"APIs assíncronas, validação com Pydantic e docs automáticas.", xp:25},
        {t:"Autenticação e autorização", d:"JWT, OAuth2, sessões e controle de permissões por papel.", xp:25},
        {t:"REST, GraphQL e WebSockets", d:"Escolher o protocolo certo para cada tipo de dado em tempo real.", xp:25},
        {t:"Documentação de API", d:"OpenAPI/Swagger e contratos versionados para o time.", xp:15}
      ]
    },
    {
      id: "dados", title: "Banco de Dados", sub: "Modelar, consultar e escalar onde os dados realmente moram.",
      nodes: [
        {t:"PostgreSQL e modelagem relacional", d:"Normalização, índices, chaves estrangeiras e joins eficientes.", xp:25},
        {t:"ORMs (Prisma / SQLAlchemy)", d:"Migrations, seeds e queries tipadas sem perder controle do SQL.", xp:20},
        {t:"NoSQL (MongoDB / Redis)", d:"Quando trocar tabelas por documentos ou cache em memória.", xp:20},
        {t:"Transações e integridade", d:"ACID, locks e consistência em operações concorrentes.", xp:20}
      ]
    },
    {
      id: "arquitetura", title: "Arquitetura & Qualidade", sub: "Código que continua bom depois que o time cresce.",
      nodes: [
        {t:"Testes automatizados", d:"Unitários, integração e end-to-end com cobertura que importa.", xp:25},
        {t:"SOLID e Clean Architecture", d:"Separar regras de negócio de detalhes de infraestrutura.", xp:25},
        {t:"Design Patterns", d:"Padrões que resolvem problemas reais, não decoração no código.", xp:20},
        {t:"Code review eficaz", d:"Dar e receber feedback técnico que melhora o sistema.", xp:15}
      ]
    },
    {
      id: "cloud", title: "Cloud & DevOps", sub: "Tirar o projeto da sua máquina e colocá-lo de pé em produção.",
      nodes: [
        {t:"Docker", d:"Containers, imagens enxutas e docker-compose para o ambiente completo.", xp:25},
        {t:"CI/CD", d:"Pipelines de build, teste e deploy automático a cada push.", xp:25},
        {t:"Deploy em nuvem", d:"Railway, AWS ou GCP — domínio, variáveis de ambiente e escalonamento.", xp:25},
        {t:"Observabilidade", d:"Logs estruturados, métricas e alertas antes que o usuário reclame.", xp:20}
      ]
    },
    {
      id: "especializacao", title: "Especialização & Portfólio", sub: "Aplicar tudo em sistemas reais e se diferenciar no mercado.",
      nodes: [
        {t:"Sistemas distribuídos", d:"Filas de mensagens, cache distribuído e consistência eventual.", xp:30},
        {t:"Segurança de aplicações", d:"OWASP Top 10, sanitização de dados e proteção contra ataques comuns.", xp:25},
        {t:"Projeto full-stack completo", d:"Um sistema seu do zero ao deploy — como o LabSync ou o SmartBox.", xp:35},
        {t:"Contribuição open source", d:"Um PR real aceito em um repositório público.", xp:30}
      ]
    }
  ];

  var STORAGE_KEY = "trilha-fullstack-progress-v1";
  var totalXP = 0;
  PHASES.forEach(function(p){ p.nodes.forEach(function(n){ totalXP += n.xp; }); });

  var LEVELS = [
    {min:0, name:"Iniciante"},
    {min:60, name:"Aprendiz"},
    {min:150, name:"Desenvolvedor"},
    {min:280, name:"Avançado"},
    {min:400, name:"Especialista"}
  ];

  function loadState(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return {done:{}, checkins:[]};
      var parsed = JSON.parse(raw);
      return {done: parsed.done || {}, checkins: parsed.checkins || []};
    }catch(e){ return {done:{}, checkins:[]}; }
  }
  function saveState(state){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }catch(e){}
  }

  var state = loadState();

  function todayStr(){ return new Date().toISOString().slice(0,10); }

  function computeStreak(checkins){
    if(!checkins.length) return 0;
    var set = {}; checkins.forEach(function(d){ set[d]=true; });
    var streak = 0; var cur = new Date();
    while(true){
      var key = cur.toISOString().slice(0,10);
      if(set[key]){ streak++; cur.setDate(cur.getDate()-1); }
      else break;
    }
    return streak;
  }

  function nodeId(phaseId, idx){ return phaseId + "-" + idx; }

  function earnedXP(){
    var sum = 0;
    PHASES.forEach(function(p){
      p.nodes.forEach(function(n, i){
        if(state.done[nodeId(p.id,i)]) sum += n.xp;
      });
    });
    return sum;
  }

  function levelFor(xp){
    var current = LEVELS[0];
    for(var i=0;i<LEVELS.length;i++){ if(xp >= LEVELS[i].min) current = LEVELS[i]; }
    return current.name;
  }

  var toastTimer = null;
  function showToast(msg){
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ el.classList.remove("show"); }, 1900);
  }

  function render(){
    var trail = document.getElementById("trail");
    trail.innerHTML = "";
    var pillsWrap = document.getElementById("phasePills");
    pillsWrap.innerHTML = "";

    PHASES.forEach(function(phase, pIdx){
      var phaseDone = phase.nodes.every(function(n,i){ return !!state.done[nodeId(phase.id,i)]; });
      var pill = document.createElement("span");
      pill.className = "pill" + (phaseDone ? " done" : "");
      pill.textContent = (pIdx+1) + ". " + phase.title;
      pillsWrap.appendChild(pill);

      var heading = document.createElement("div");
      heading.className = "phase-heading";
      heading.innerHTML = '<span class="phase-num">FASE ' + (pIdx+1) + '</span><span class="phase-title">' + phase.title + '</span>';
      trail.appendChild(heading);

      var sub = document.createElement("p");
      sub.className = "phase-sub";
      sub.textContent = phase.sub;
      trail.appendChild(sub);

      var path = document.createElement("div");
      path.className = "path";

      phase.nodes.forEach(function(n, i){
        var id = nodeId(phase.id, i);
        var done = !!state.done[id];

        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "node";
        btn.setAttribute("data-done", done ? "true" : "false");
        btn.setAttribute("aria-pressed", done ? "true" : "false");

        var dot = document.createElement("div");
        dot.className = "node-dot";
        dot.textContent = done ? "✓" : String(i+1);

        var body = document.createElement("div");
        body.className = "node-body";
        body.innerHTML =
          '<div class="node-top"><span class="node-title">' + n.t + '</span><span class="xp-chip">+' + n.xp + ' XP</span></div>' +
          '<div class="node-desc">' + n.d + '</div>';

        btn.appendChild(dot);
        btn.appendChild(body);

        btn.addEventListener("click", function(){
          var nowDone = !state.done[id];
          state.done[id] = nowDone;
          if(nowDone){
            var t = todayStr();
            if(state.checkins.indexOf(t) === -1) state.checkins.push(t);
            showToast("✓ Check-in registrado — " + n.t);
          }else{
            showToast("Marcado como pendente");
          }
          saveState(state);
          render();
        });

        path.appendChild(btn);
      });

      trail.appendChild(path);
    });

    var xp = earnedXP();
    var pct = Math.round((xp/totalXP)*100);
    document.getElementById("xpFill").style.width = pct + "%";
    document.getElementById("xpLabel").textContent = xp + " / " + totalXP + " XP";
    document.getElementById("pctLabel").textContent = pct + "%";
    document.getElementById("levelTag").textContent = "NÍVEL · " + levelFor(xp).toUpperCase();
    document.getElementById("streakTag").textContent = "🔥 " + computeStreak(state.checkins) + (computeStreak(state.checkins) === 1 ? " dia seguido" : " dias seguidos");
  }

  document.getElementById("resetBtn").addEventListener("click", function(){
    if(confirm("Reiniciar todo o progresso da trilha?")){
      state = {done:{}, checkins:[]};
      saveState(state);
      render();
      showToast("Progresso reiniciado");
    }
  });

  var themeToggle = document.getElementById("themeToggle");
  function applyTheme(t){
    if(t === "light"){ document.documentElement.setAttribute("data-theme","light"); themeToggle.textContent = "◑"; }
    else{ document.documentElement.removeAttribute("data-theme"); themeToggle.textContent = "◐"; }
  }
  var savedTheme = null;
  try{ savedTheme = localStorage.getItem("trilha-theme"); }catch(e){}
  applyTheme(savedTheme);
  themeToggle.addEventListener("click", function(){
    var isLight = document.documentElement.getAttribute("data-theme") === "light";
    var next = isLight ? "dark" : "light";
    applyTheme(next);
    try{ localStorage.setItem("trilha-theme", next); }catch(e){}
  });

  render();
})();

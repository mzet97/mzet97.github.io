(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- clock + year ---------- */
  var clock = document.getElementById("clock");
  function tick() {
    if (clock) clock.textContent = new Date().toLocaleTimeString("pt-BR", { hour12: false });
  }
  tick();
  setInterval(tick, 1000);
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- phosphor toggle (green / amber) ---------- */
  var toggle = document.getElementById("theme-toggle");
  try {
    if (window.localStorage.getItem("mz-phosphor") === "amber") document.body.classList.add("amber");
  } catch (e) { /* storage unavailable */ }
  function syncToggle() {
    if (toggle) toggle.textContent = document.body.classList.contains("amber") ? "FÓSFORO: ÂMBAR" : "FÓSFORO: VERDE";
  }
  syncToggle();
  if (toggle) {
    toggle.addEventListener("click", function () {
      var amber = document.body.classList.toggle("amber");
      try { window.localStorage.setItem("mz-phosphor", amber ? "amber" : "green"); } catch (e) { /* ignore */ }
      syncToggle();
    });
  }

  /* ---------- boot sequence ---------- */
  var boot = document.getElementById("boot");
  var bootText = document.getElementById("boot-text");
  var bootLines = [
    "./MATHEUS_ROOT — v2.0",
    "[ OK ] mounting /dev/carreira ......... 7+ anos",
    "[ OK ] loading .NET/C# ................ OK",
    "[ OK ] loading React/TypeScript ....... OK",
    "[ OK ] aws lambda x52 ................. OK",
    "[ OK ] cyclonedds/rust ................ OK",
    "",
    "> SISTEMA INICIADO",
    "root@matheus:~$ ./matheus.exe --senior",
    ""
  ];
  var bootTimer = null;
  function endBoot() {
    if (bootTimer) { clearTimeout(bootTimer); bootTimer = null; }
    if (boot) boot.classList.add("done");
    document.removeEventListener("keydown", endBoot);
  }
  if (boot && bootText) {
    if (reduced) {
      bootText.textContent = bootLines.join("\n");
      bootTimer = setTimeout(endBoot, 400);
    } else {
      var li = 0, ci = 0, out = "";
      (function typeBoot() {
        if (li >= bootLines.length) { bootTimer = setTimeout(endBoot, 650); return; }
        var line = bootLines[li];
        if (ci <= line.length) {
          bootText.textContent = out + line.slice(0, ci);
          ci++;
          bootTimer = setTimeout(typeBoot, line.length ? 7 : 30);
        } else {
          out += line + "\n";
          li++; ci = 0;
          bootTimer = setTimeout(typeBoot, 55);
        }
      })();
    }
    boot.addEventListener("click", endBoot);
    document.addEventListener("keydown", endBoot);
    setTimeout(endBoot, 6000); /* never trap the visitor */
  }

  /* ---------- F-keys ---------- */
  var fTargets = { F1: "sobre", F2: "experiencia", F3: "skills", F4: "projeto", F5: "formacao", F6: "contato" };
  document.addEventListener("keydown", function (ev) {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    if (ev.key === "F9") { ev.preventDefault(); window.open("assets/CV_Matheus_Zeitune_Senior_Software_Engineer.pdf", "_blank"); return; }
    var id = fTargets[ev.key];
    if (!id) return;
    var el = document.getElementById(id);
    if (el) { ev.preventDefault(); el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }); }
  });

  /* ---------- terminal ---------- */
  var out = document.getElementById("term-out");
  var form = document.getElementById("term-form");
  var input = document.getElementById("term-input");
  if (!out || !form || !input) return;

  var SECTIONS = { sobre: "sobre", experiencia: "experiencia", skills: "skills", projeto: "projeto", formacao: "formacao", contato: "contato" };
  var ANSWERS = {
    help: "COMANDOS: HELP · DIR · SOBRE · EXPERIENCIA · SKILLS · PROJETO · FORMACAO · CONTATO · SOCIAL · CLEAR\nF1–F6 navegam pelas seções. F9 baixa o CV.PDF.",
    dir: "./MATHEUS_ROOT\n  ./sobre       ./experiencia   ./skills\n  ./open_source ./formacao      ./contato\n  cv.pdf  <— digite o nome da seção para abrir",
    sobre: "MATHEUS ZEITUNE — Engenheiro de Software Sênior, 7+ anos.\n.NET/C# · React/TypeScript · AWS/Azure · microsserviços e Micro Frontends.\nAbrindo ./sobre…",
    experiencia: "V8.TECH/Banco BMG (atual) · ACT Digital/BTG · Flamengo · First Decision · Meta · Brilliant Machine · MTSLAB · Marlin.\nAbrindo ./experiencia…",
    skills: "C#/.NET 6/8 · React/TypeScript · AWS Lambda/SQS/SNS · Azure/AKS · SQL Server/PostgreSQL · RabbitMQ/Redis · OWASP/JWT/OIDC · OpenTelemetry/xUnit/Jest/Playwright.\nAbrindo ./skills…",
    projeto: "CYCLONE DDS PARA RUST — bindings Rust para Eclipse Cyclone DDS (QoS, async, IDL). Crate cyclonedds: 2.000+ downloads no crates.io.\nAbrindo ./open_source…",
    formacao: "Mestrado UERJ (em andamento) · Eng. Computação UVA · Pós Eng. Software · Pós Mobile · Tecnólogo UniCarioca.\nAbrindo ./formacao…",
    contato: "TEL (21) 99497-0893\nMAIL matheus.zeitune.developer@outlook.com\nLINKEDIN linkedin.com/in/matheus-zeitune\nGITHUB github.com/mzet97\nAbrindo ./contato…",
    social: "GITHUB   https://github.com/mzet97\nLINKEDIN https://linkedin.com/in/matheus-zeitune\nCRATES   https://crates.io/crates/cyclonedds",
    whoami: "matheus zeitune — senior software engineer (.net/c# · react/typescript), rio de janeiro, rj.",
    exit: "NÃO HÁ SAÍDA. O CV CONTINUA NA TELA. :)"
  };

  function print(text, echo) {
    var div = document.createElement("div");
    if (echo) { div.className = "echo"; div.textContent = "root@matheus:~$ " + echo; }
    else div.textContent = text;
    out.appendChild(div);
    out.scrollTop = out.scrollHeight;
  }
  function go(id) {
    var el = document.getElementById(id);
    if (el) setTimeout(function () { el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }); }, 350);
  }
  function run(raw) {
    var cmd = (raw || "").trim().toLowerCase();
    print(null, raw);
    if (!cmd) return;
    if (cmd === "clear" || cmd === "cls") { out.innerHTML = ""; return; }
    if (ANSWERS[cmd]) {
      print(ANSWERS[cmd]);
      if (SECTIONS[cmd]) go(SECTIONS[cmd]);
      return;
    }
    print("Comando não reconhecido: '" + cmd.toUpperCase() + "'. Digite HELP.");
  }

  print("./terminal pronto. Digite HELP e pressione ENTER — ou só role a página.");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    run(input.value);
    input.value = "";
    input.focus();
  });
  document.querySelectorAll("[data-cmd]").forEach(function (btn) {
    btn.addEventListener("click", function () { run(btn.getAttribute("data-cmd")); input.focus(); });
  });
  out.parentElement.addEventListener("click", function () { input.focus(); });
})();

(function(){
  const $ = (s)=>document.querySelector(s);

  // 상단 UI 갱신
  // 외부 UI 지표
  window.setUITime  = (v)=>{ const el=$("#ui-time");  if(el) el.textContent=String(v??"0.0초"); };
  window.setUIScore = (v)=>{ const el=$("#ui-score"); if(el) el.textContent=String(v??0); };
  window.setUILives = (v)=>{ const el=$("#ui-lives"); if(el) el.textContent=String(v??0); };
  window.setUILevel = (v)=>{ const el=$("#ui-level"); if(el) el.textContent=String(v??1); };

  // 무적 남은 시간(초) 표시: 0이면 숨김
  window.setUIInvincible = (msLeft)=>{
    const pill = document.getElementById("pill-inv");
    const val  = document.getElementById("ui-inv");
    const sec = Math.max(0, (msLeft||0)/1000);
    if (pill && val){
      if (sec > 0){
        val.textContent = sec.toFixed(1) + "초";
        pill.classList.remove("hidden");
      }else{
        pill.classList.add("hidden");
      }
    }
  };

  // 상단 시계
  let clockStart = 0, clockRaf = 0, running = false;
  function tick(){
    if(!running) return;
    const t = (performance.now() - clockStart) / 1000;
    window.setUITime(t.toFixed(1) + "초");
    clockRaf = requestAnimationFrame(tick);
  }
  function startClock(){ running = true; clockStart = performance.now(); cancelAnimationFrame(clockRaf); clockRaf = requestAnimationFrame(tick); }
  function stopClock(){ running = false; cancelAnimationFrame(clockRaf); }
  window.startClock = startClock;
  window.stopClock  = stopClock;

  // 재시작 연타 방지
  let starting = false;
  function setBtnDisabled(disabled){
    const btn = $("#btnRestart");
    if(btn){ btn.disabled = disabled; btn.style.opacity = disabled ? ".6" : "1"; }
  }
  const sleep = (ms)=>new Promise(r=>setTimeout(r, ms));

  // 예능형 3초 카운트다운(배경 없음)
  async function countdownStart(){
    if (starting) return;         // 이미 진행 중이면 무시
    starting = true;
    setBtnDisabled(true);

    const cd = $("#countdown");
    if(cd){
      cd.classList.remove("hidden");
      cd.textContent = "3"; await sleep(1000);
      cd.textContent = "2"; await sleep(1000);
      cd.textContent = "1"; await sleep(900);
      cd.textContent = "시작!"; await sleep(400);
      cd.classList.add("hidden");
    }

    window.startGame?.();
    window.startClock?.();

    starting = false;
    setBtnDisabled(false);
  }

  // 최초 1회 스케일만 계산하고 잠금
  let scaleLocked = false;
  function fitStage(){
    if (scaleLocked) return; // 이미 잠겼으면 더 이상 바꾸지 않음

    const stage = document.querySelector("#game-stage");
    const wrap  = document.querySelector(".stage-wrap");
    const topbar= document.querySelector(".stage-topbar");
    const viewport = document.querySelector(".viewport");
    if(!stage || !wrap) return;

    const cs = getComputedStyle(stage);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop)  + parseFloat(cs.paddingBottom);
    const bdX  = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
    const bdY  = parseFloat(cs.borderTopWidth)  + parseFloat(cs.borderBottomWidth);

    const vpPadBottom = parseFloat(getComputedStyle(viewport).paddingBottom || "0");
    const topbarBottom = topbar ? topbar.getBoundingClientRect().bottom : wrap.getBoundingClientRect().top;
    const bottomSafe = 56;

    const availH = Math.max(0, window.innerHeight - topbarBottom - vpPadBottom - bottomSafe);
    const availW = Math.max(0, wrap.clientWidth);

    const baseW = 480, baseH = 800;
    const stretchX = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--stretchX')) || 1;

    const innerAvailW = Math.max(0, availW - (padX + bdX));
    const innerAvailH = Math.max(0, availH - (padY + bdY));
    let s = Math.min(1, innerAvailW / (baseW * stretchX), innerAvailH / baseH) - 0.003;
    s = Math.max(0, isFinite(s) ? s : 1);

    // 적용
    document.documentElement.style.setProperty("--scale", s.toString());
    stage.style.width  = `${baseW*s*stretchX + padX + bdX}px`;
    stage.style.height = `${baseH*s + padY + bdY}px`;

    // 여기서 잠금
    scaleLocked = true;
  }

  window.addEventListener("DOMContentLoaded", ()=>{
    const btn = document.querySelector("#btnRestart");
    if(btn){
      btn.addEventListener("click", async ()=>{
        if (typeof window.resetGame === "function") window.resetGame();
        await countdownStart();
      });
    }
    fitStage();       // 처음에 한 번만 맞추고
    countdownStart(); // 3초 후 시작
  });

  // 리사이즈에 반응하지 않음(잠금 유지)
  // window.addEventListener("resize", fitStage);
  // window.addEventListener("orientationchange", fitStage);
})();
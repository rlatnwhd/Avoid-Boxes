(function(){
  const $ = (s)=>document.querySelector(s);
  const sleep = (ms)=>new Promise(r=>setTimeout(r, ms));
  const getQueryMode = ()=> (new URLSearchParams(location.search).get("mode")||"").toLowerCase();

  // 간단 카운트다운 → 기본 startGame()
  async function countdownThenStartDefault(){
    if (typeof window.resetGame === "function") window.resetGame();
    const cd = $("#countdown");
    if (cd){
      cd.classList.remove("hidden");
      cd.textContent="3"; await sleep(1000);
      cd.textContent="2"; await sleep(1000);
      cd.textContent="1"; await sleep(900);
      cd.textContent="시작!"; await sleep(400);
      cd.classList.add("hidden");
    }
    window.startGame && window.startGame();
  }

  function restartByMode(mode){
    switch(mode){
      case "up":      $("#btnUpMode")?.click();     break;
      case "meteor":  $("#btnMeteorMode")?.click(); break;
      case "leaf":    $("#btnLeafMode")?.click();   break;
      case "chaos":   // chaos는 기본 루프 위에 훅이 얹혀 동작 → 기본 시작
      case "default":
      default:
        countdownThenStartDefault();
        break;
    }
  }

  window.addEventListener("DOMContentLoaded", ()=>{
    // 메인 화면 버튼
    $("#btnToMenu")?.addEventListener("click", ()=>{ location.href = "index.html"; });

    // 재시작 버튼: 기존 리스너 제거를 위해 노드 교체
    const oldBtn = $("#btnRestart");
    if (!oldBtn) return;
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.replaceWith(newBtn);

    newBtn.addEventListener("click", ()=>{
      const cur = (window.__CURRENT_MODE || getQueryMode() || "default").toLowerCase();
      restartByMode(cur);
    });
  });
})();
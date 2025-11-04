(function(){
  const getMode = ()=>{
    const p = new URLSearchParams(location.search);
    return (p.get("mode")||"default").toLowerCase();
  };

  function waitFor(fn, timeout=3000, interval=40){
    return new Promise((resolve, reject)=>{
      const t0 = performance.now();
      const id = setInterval(()=>{
        const v = fn();
        if (v){ clearInterval(id); resolve(v); }
        else if (performance.now() - t0 > timeout){ clearInterval(id); reject(new Error("timeout")); }
      }, interval);
    });
  }

  async function startSelectedMode(){
    const mode = getMode();

    try{
      await waitFor(()=> typeof window.resetGame === "function");
      await waitFor(()=> document.querySelector("#btnRestart"));

      // 기본/정신없는: 기본 카운트다운으로 시작
      if (mode === "default" || mode === "chaos"){
        // 재시작 버튼 트리거로 기존 플로우 유지
        document.querySelector("#btnRestart").click();
        return;
      }

      // 실험 모드들: 숨김 버튼 클릭으로 시작
      const idMap = { up: "#btnUpMode", meteor: "#btnMeteorMode", leaf: "#btnLeafMode" };
      const sel = idMap[mode];
      if (!sel) return;

      await waitFor(()=> document.querySelector(sel));
      try{ window.resetGame(); }catch{}
      setTimeout(()=>{ const btn = document.querySelector(sel); btn && btn.click(); }, 30);
    }catch(e){
      console.warn("mode launcher fallback:", e);
    }
  }

  window.addEventListener("DOMContentLoaded", startSelectedMode);
})();
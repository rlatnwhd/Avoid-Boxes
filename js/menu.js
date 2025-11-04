(function(){
  const $ = (s)=>document.querySelector(s);
  const $all = (s)=>Array.from(document.querySelectorAll(s));

  const desc = {
    default: {
      title: "기본 모드",
      html: `
        가장 클래식한 생존 모드입니다. 위에서 떨어지는 박스를 피하면서 오래 버티세요.
        <ul>
          <li>조작: ← → (또는 A/D)로 좌우 이동합니다.</li>
          <li>진행: 다양한 박스가 위에서 계속 떨어집니다.</li>
          <li>난이도: 시간이 지날수록 <b>더 자주</b> 떨어지고 <b>더 빨라집니다</b>.</li>
          <li>점수: <b>0.5초마다 +1점</b>. <b>5초마다 코인</b>이 빠르게 떨어지고, 먹으면 <b>+10점</b></li>
          <li>종료: 박스에 닿으면 즉시 게임 오버입니다.</li>
          <li>팁: 빈 공간을 미리 보고 이동하세요. 코인은 욕심내다 부딪히지 않도록 주의!</li>
        </ul>
      `
    },
    up: {
      title: "업모드",
      html: `
        바닥에서 <b>빛줄기</b>가 먼저 나타나 위치를 알려주고, <b>1~2초 뒤</b> 같은 자리에서 박스가 위로 튀어 오릅니다.
        <ul>
          <li>조작: ← → (또는 A/D)로 좌우 이동합니다.</li>
          <li>예고: 바닥의 빛줄기가 보이면 그 <b>세로 줄</b>에서 빨리 벗어나세요.</li>
          <li>난이도: 시간이 지날수록 <b>생성 간격이 짧아집니다</b> (더 자주 올라옴).</li>
          <li>점수: 자동 점수 + 코인 드랍은 기본 모드와 동일합니다.</li>
        </ul>
      `
    },
    meteor: {
      title: "메테오 모드",
      html: `
        반투명한 <b>붉은 경로</b>가 <b>2초</b> 동안 안쪽부터 차오르고, 꽉 차면 <b>같은 너비</b>의 메테오가 초고속으로 떨어집니다.
        <ul>
          <li>동시 예고: 경로가 <b>최대 2개</b>까지 동시에 나타납니다.</li>
          <li>기본 낙하: 메테오와 별개로 <b>기본 박스</b>도 계속 떨어집니다.</li>
          <li>난이도: 시간이 지날수록 낙하 속도가 빠릅니다.</li>
          <li>점수: 자동 점수 + 코인 드랍은 동일합니다.</li>
          <li>주의: 붉은 경로가 보이면 그 열을 피해 이동하세요. 경로 너비 = 메테오 너비입니다.</li>
        </ul>
      `
    },
    leaf: {
      title: "낙엽 모드",
      html: `
        낙엽처럼 좌우로 <b>물결치며</b> 가볍게 <b>회전</b>하면서 떨어집니다.
        <ul>
          <li>궤적: 사인 파동처럼 흔들리며 내려와 움직임이 읽기 어렵습니다.</li>
          <li>난이도: 시간이 지날수록 중력/종단속도가 올라 더 빨라집니다.</li>
          <li>점수: 자동 점수 + 코인 드랍은 동일합니다.</li>
          <li>팁: 흔들림이 반대로 돌아올 여유 공간을 확보해 두세요.</li>
        </ul>
      `
    },
    chaos: {
      title: "정신없는 모드",
      html: `
        기본 모드로 시작해서 <b>5초마다</b> 다른 패턴으로 바뀝니다. 화면은 <b>재시작하지 않고</b> 그대로 이어지며,
        바뀌기 전 오브젝트는 계속 남아 새 패턴과 <b>겹쳐서</b> 진행됩니다.
        <ul>
          <li>전환 예시: 기본 → 낙엽 → 메테오 → 업모드 …(무작위)</li>
          <li>겹침 규칙: 이전에 떨어지던 박스/메테오는 사라지지 않습니다.</li>
          <li>난이도: 게임 시간이 지날수록 속도/주기가 빨라지는 흐름을 유지합니다.</li>
          <li>점수: 자동 점수와 5초마다 코인 드랍(+10)은 동일하게 유지됩니다.</li>
          <li>팁: 패턴 전환 직후 첫 스폰을 먼저 보고 안전한 쪽으로 이동하세요.</li>
        </ul>
      `
    }
  };

  let selected = null;

  function pick(mode){
    selected = mode;
    $all(".mode-btn").forEach(b=> b.classList.toggle("active", b.dataset.mode === mode));
    const d = desc[mode];
    $("#modeTitle").textContent = d.title;
    $("#modeDesc").innerHTML = d.html;
    $("#btnStart").disabled = false;
  }

  window.addEventListener("DOMContentLoaded", ()=>{
    $all(".mode-btn").forEach(btn=>{
      btn.addEventListener("click", ()=> pick(btn.dataset.mode));
    });
    $("#btnStart").addEventListener("click", ()=>{
      if (!selected) return;
      const url = new URL(location.href);
      url.pathname = url.pathname.replace(/index\.html?$/i, "game.html");
      // 새 탭 없이 이동
      location.href = `game.html?mode=${encodeURIComponent(selected)}`;
    });
  });
})();
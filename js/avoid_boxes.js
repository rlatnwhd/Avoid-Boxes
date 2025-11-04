// ========================================
// Avoid Boxes 게임 JavaScript 코드
// 떨어지는 상자를 피하는 2D 게임
// ========================================

// ========================================
// Canvas 설정
// ========================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ========================================
// 플레이어 설정
// ========================================
let player = {
  x: 180,
  y: 450,
  width: 40,
  height: 20,
  speed: 5
};
window.player = player; // 전역 노출(입력 보조용)

// 라이트 테마(캔버스 내부)
const THEME = {
  bg: "#f6f8fd",
  frame: "#cbd3e3",
  playerStroke: "#111"
};

// 플레이어는 항상 하단에 붙이기
const PLAYER_BOTTOM_MARGIN = 16;
function stickPlayerToBottom(player, canvas){
  if(!player || !canvas) return;
  player.y = canvas.height - player.height - PLAYER_BOTTOM_MARGIN;
}

// ========================================
// 게임 상태 관리 변수
// ========================================
let obstacles = [];
let gameOver = false;
let startTime = 0;
let elapsedTime = 0;
let frameCount = 0;
let started = false;
let rafId = 0;

// ========================================
// 키보드 입력 처리(Arrow/WASD)
// ========================================
let keys = { left:false, right:false };
document.addEventListener("keydown", (e)=>{
  const k = e.key;
  if (k === "ArrowLeft" || k === "a" || k === "A") { keys.left = true; e.preventDefault(); }
  if (k === "ArrowRight"|| k === "d" || k === "D") { keys.right = true; e.preventDefault(); }
});
document.addEventListener("keyup", (e)=>{
  const k = e.key;
  if (k === "ArrowLeft" || k === "a" || k === "A") { keys.left = false; e.preventDefault(); }
  if (k === "ArrowRight"|| k === "d" || k === "D") { keys.right = false; e.preventDefault(); }
});

// 플레이어 이동
function movePlayer() {
  if (keys.left)  player.x -= player.speed;
  if (keys.right) player.x += player.speed;
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// 배경
function paintBackground(ctx, w, h){
  ctx.fillStyle = THEME.bg;
  ctx.fillRect(0, 0, w, h);
}

// 안쪽 테두리(위/아래 동일 1px)
function drawFrame(){
  ctx.save();
  ctx.strokeStyle = THEME.frame;
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
  ctx.restore();
}

// 플레이어
function drawPlayer() {
  ctx.fillStyle = "#111"; // 블랙
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.lineWidth = 1;
  ctx.strokeStyle = THEME.playerStroke;
  ctx.strokeRect(player.x + 0.5, player.y + 0.5, player.width - 1, player.height - 1);
}

// 장애물
function drawObstacles() {
  obstacles.forEach(ob => {
    ctx.fillStyle = ob.color;
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
    ob.y += ob.speed;
  });
}
function getRandomColor() {
  const r = Math.floor(Math.random() * 156) + 100;
  const g = Math.floor(Math.random() * 156) + 100;
  const b = Math.floor(Math.random() * 156) + 100;
  const average = (r + g + b) / 3;
  const maxDiff = Math.max(Math.abs(r-g), Math.abs(r-b), Math.abs(g-b));
  if (average < 150 && maxDiff < 50) return getRandomColor();
  return `rgb(${r}, ${g}, ${b})`;
}
function generateObstacle() {
  const x = Math.random() * (canvas.width - 40);
  obstacles.push({ x, y:0, width:40, height:20, speed: 2 + Math.random()*2, color:getRandomColor() });
}

// 충돌
function checkCollision(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// 메인 루프
function update() {
  if (gameOver || !started) return;

  elapsedTime = (performance.now() - startTime) / 1000;

  movePlayer();
  stickPlayerToBottom(player, canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paintBackground(ctx, canvas.width, canvas.height);

  // 점수 시스템
  const now = performance.now();
  updateScoreSystem(now);

  drawObstacles();
  drawPlayer();
  drawFrame(); // 맨 위에 테두리

  // 충돌 체크
  for (let ob of obstacles) {
    if (checkCollision(player, ob)) {
      gameOver = true;
      window.stopClock?.();
      const finalSec = elapsedTime.toFixed(1);
      window.setUITime?.(`${finalSec}초`);
      cancelAnimationFrame(rafId);
      alert(`Game Over! 생존 시간: ${finalSec}초`);
      return;
    }
  }

  obstacles = obstacles.filter(ob => ob.y < canvas.height);
  frameCount++;
  if (frameCount % 30 === 0) generateObstacle();

  rafId = requestAnimationFrame(update);
}

// 시작/재시작 제어
function startGame(){
  // 초기화
  obstacles = [];
  gameOver = false;
  frameCount = 0;
  startTime = performance.now();
  elapsedTime = 0;
  player.x = (canvas.width - player.width) / 2;
  stickPlayerToBottom(player, canvas);

  // 첫 화면 페인트
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paintBackground(ctx, canvas.width, canvas.height);
  drawFrame();

  started = true;
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(update);

  window.setUITime?.("0.0초");
  window.startClock?.();

  // 점수 시스템 시작
  resetScoreSystem();
  startScoreSystem();
}
window.startGame = startGame;

// 외부에서 호출하는 재시작(카운트다운은 ui.js가 수행)
window.resetGame = function(){
  // 루프 중지
  cancelAnimationFrame(rafId);
  started = false;
  gameOver = false;

  // 상태 초기화
  obstacles = [];
  frameCount = 0;
  elapsedTime = 0;

  // 시간/시계 초기화
  window.stopClock?.();
  window.setUITime?.("0.0초");

  // 점수 시스템 초기화
  resetScoreSystem();

  // 캔버스 완전 클리어(플레이어 포함 아무것도 그리지 않음)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paintBackground(ctx, canvas.width, canvas.height);
  drawFrame();
};

// 첫 로드 시 캔버스만 그림(카운트다운은 ui.js가 시작)
paintBackground(ctx, canvas.width, canvas.height);
drawFrame();

// ========================================
// 점수 시스템(공용)
// ========================================
let score = 0;
let scoreRunning = false;
let scoreLastTick = 0;          // 자동 점수 +1 주기(0.5초)
let scoreLastDropAt = 0;        // 드랍 코인 주기(5초)
let scoreDrops = [];            // 드랍 코인들
let scoreFloaters = [];         // 플로팅 텍스트

const SCORE_TICK_MS = 500;      // 0.5초마다 +1점
const SCORE_DROP_INTERVAL = 5000; // 5초마다 드랍
const SCORE_DROP_SPEED = 3.8;   // 코인 낙하 속도(조금 빠름)

function resetScoreSystem(){
  score = 0;
  scoreRunning = false;
  scoreLastTick = 0;
  scoreLastDropAt = 0;
  scoreDrops = [];
  scoreFloaters = [];
  window.setUIScore?.(0);
}
function startScoreSystem(){
  scoreRunning = true;
  const now = performance.now();
  scoreLastTick = now;
  scoreLastDropAt = now;
}

// 코인 드랍(10점)
function spawnScoreDrop(){
  const size = 18;
  const x = Math.random() * (canvas.width - size);
  scoreDrops.push({
    x, y: -size, w: size, h: size,
    vy: SCORE_DROP_SPEED + Math.random()*0.8
  });
}

// 코인 그리기(골드)
function drawCoin(x, y, r){
  const g = ctx.createRadialGradient(x, y, 2, x, y, r);
  g.addColorStop(0,  "rgba(255,245,170,1)");
  g.addColorStop(0.6,"rgba(255,215,80,0.95)");
  g.addColorStop(1,  "rgba(255,180,0,0.95)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2);
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(185,120,0,0.9)";
  ctx.stroke();
}

// +10 플로팅 텍스트
function spawnFloater(text, x, y){
  scoreFloaters.push({
    text, x, y0: y, born: performance.now(), life: 650 // 0.65초 빠르게 사라짐
  });
}
function drawFloaters(now){
  for (let i = scoreFloaters.length - 1; i >= 0; i--){
    const f = scoreFloaters[i];
    const p = (now - f.born) / f.life; // 0~1
    if (p >= 1){ scoreFloaters.splice(i,1); continue; }
    const y = f.y0 - 36 * p;              // 상승량 살짝 ↑
    const a = 1 - p;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    ctx.font = "900 26px Pretendard, system-ui, sans-serif"; // 크기 크게
    // 외곽선으로 선명하게
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(12,90,42,0.9)";
    ctx.strokeText(f.text, f.x, y);
    ctx.fillStyle = "#22c55e"; // 밝은 초록
    ctx.fillText(f.text, f.x, y);
    ctx.restore();
  }
}

// 점수 시스템 업데이트/그리기(모든 모드 루프에서 호출)
function updateScoreSystem(now){
  // 자동 점수
  if (scoreRunning){
    while (now - scoreLastTick >= SCORE_TICK_MS){
      score += 1;
      scoreLastTick += SCORE_TICK_MS;
      window.setUIScore?.(score);
    }
    if (now - scoreLastDropAt >= SCORE_DROP_INTERVAL){
      spawnScoreDrop();
      scoreLastDropAt = now;
    }
  }

  // 드랍 코인 업데이트/그리기
  for (let i = scoreDrops.length - 1; i >= 0; i--){
    const d = scoreDrops[i];
    d.y += d.vy;

    // 코인
    drawCoin(d.x + d.w/2, d.y + d.h/2, d.w/2);

    // 플레이어와 충돌 시 점수 +10
    if (checkCollision(player, {x:d.x, y:d.y, width:d.w, height:d.h})){
      score += 10;
      window.setUIScore?.(score);
      spawnFloater("+10", player.x + player.width/2, player.y - 6);
      scoreDrops.splice(i, 1);
      continue;
    }

    // 화면 밖 제거
    if (d.y > canvas.height + 40){
      scoreDrops.splice(i, 1);
    }
  }

  // 플로팅 텍스트
  drawFloaters(now);
}

// 전역 노출(다른 모드 IIFE에서 안전 호출)
window.updateScoreSystem = updateScoreSystem;
window.startScoreSystem  = startScoreSystem;
window.resetScoreSystem  = resetScoreSystem;

// ====== 아래부터 추가: 업모드(바닥 예고 빛 → 아래에서 위로) ======
(function(){
  const $ = (s)=>document.querySelector(s);
  const sleep = (ms)=>new Promise(r=>setTimeout(r, ms));

  // 업모드 상태
  const UpMode = {
    active: false,
    rafId: 0,
    ups: [],         // 위로 올라오는 박스들
    tele: [],        // 바닥 예고 빛줄기
    lastTele: 0
  };

  // 예고 빛 생성
  function spawnTelegraph(now){
    const w = 40;
    const x = Math.random() * (canvas.width - w);
    const delay = 1000 + Math.random()*1000;  // 1~2초 후 박스 등장
    UpMode.tele.push({
      x, width:w, created: now, delay
    });
  }

  // 예고 빛 그리기(아래 밝고 위로 갈수록 투명)
  function drawTelegraphs(now){
    // 높이/강도 살짝 상향
    const H = Math.min(300, canvas.height * 0.48);
    const bottom = canvas.height - 1;
    const COL = "255, 211, 77"; // 따뜻한 노랑

    for (let i = UpMode.tele.length - 1; i >= 0; i--){
      const t = UpMode.tele[i];
      const age = now - t.created;
      const appear = Math.min(1, age / 250);                           // 0.25초 페이드인
      const disappear = Math.max(0, 1 - Math.max(0, age - t.delay + 200) / 200); // 등장 직전 살짝 페이드아웃
      const alpha = Math.max(0, Math.min(1, appear * disappear));

      ctx.save();

      // 1) 바닥 글로우(밝은 배경에서도 존재감 ↑)
      ctx.globalAlpha = 0.65 * alpha;
      ctx.fillStyle = `rgba(${COL}, 0.9)`;
      ctx.filter = "blur(6px)";
      ctx.fillRect(t.x - 4, bottom - 8, t.width + 8, 10);
      ctx.filter = "none";

      // 2) 메인 기둥(강한 그라디언트)
      const g = ctx.createLinearGradient(t.x, bottom, t.x, bottom - H);
      g.addColorStop(0.00, `rgba(${COL}, ${0.85 * alpha})`);
      g.addColorStop(0.25, `rgba(${COL}, ${0.55 * alpha})`);
      g.addColorStop(0.60, `rgba(${COL}, ${0.20 * alpha})`);
      g.addColorStop(1.00, `rgba(${COL}, 0)`);
      ctx.shadowColor = `rgba(${COL}, ${0.45 * alpha})`;
      ctx.shadowBlur = 18;
      ctx.fillStyle = g;
      ctx.fillRect(t.x, bottom - H, t.width, H);

      // 3) 코어 스트립(중앙에 더 밝게)
      ctx.shadowBlur = 0;
      const coreW = Math.max(4, t.width * 0.45);
      const coreX = t.x + (t.width - coreW) / 2;
      const g2 = ctx.createLinearGradient(coreX, bottom, coreX, bottom - H);
      g2.addColorStop(0.00, `rgba(255, 245, 170, ${0.95 * alpha})`);
      g2.addColorStop(0.30, `rgba(255, 245, 170, ${0.40 * alpha})`);
      g2.addColorStop(1.00, `rgba(255, 245, 170, 0)`);
      ctx.fillStyle = g2;
      ctx.fillRect(coreX, bottom - H, coreW, H);

      ctx.restore();

      // 딜레이 끝났으면 박스 스폰
      if (age >= t.delay){
        UpMode.ups.push({
          x: t.x,
          y: canvas.height - 20,
          width: t.width,
          height: 20,
          speed: 2 + Math.random()*2,
          color: getRandomColor()
        });
        UpMode.tele.splice(i, 1); // 빛 제거
      }
    }
  }

  // 위로 올라오는 박스들 업데이트/그리기
  function drawUpObstacles(){
    for (let i = UpMode.ups.length - 1; i >= 0; i--){
      const ob = UpMode.ups[i];
      ctx.fillStyle = ob.color;
      ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
      ob.y -= ob.speed;                            // 위로 이동
      if (ob.y + ob.height < 0) UpMode.ups.splice(i, 1); // 화면 위로 나가면 제거
    }
  }

  // 모드 루프
  function loop(){
    if(!UpMode.active) return;

    // 플레이어 이동/하단 고정
    movePlayer();
    stickPlayerToBottom(player, canvas);

    // 캔버스 페인트
    ctx.clearRect(0,0,canvas.width,canvas.height);
    paintBackground(ctx, canvas.width, canvas.height);

    updateScoreSystem(performance.now());

    // 예고 빛/업박스
    const now = performance.now();
    drawTelegraphs(now);
    drawUpObstacles();

    // 플레이어
    drawPlayer();
    drawFrame();

    // 충돌 체크
    for (const ob of UpMode.ups){
      if (checkCollision(player, ob)){
        UpMode.stop(true);
        return;
      }
    }

    // 주기적으로 예고 빛 생성(과하지 않게)
    if (now - UpMode.lastTele > 600){
      if (UpMode.tele.length < 4) spawnTelegraph(now);
      UpMode.lastTele = now;
    }

    UpMode.rafId = requestAnimationFrame(loop);
  }

  UpMode.start = function(){
    try{ cancelAnimationFrame(rafId); }catch{}
    UpMode.active = true;
    // 현재 모드 기록
    window.__CURRENT_MODE = "up";
    UpMode.ups.length = 0;
    UpMode.tele.length = 0;
    UpMode.lastTele = performance.now();

    // 공용 타이머/시간 초기화
    startTime = performance.now();
    elapsedTime = 0;
    window.setUITime?.("0.0초");
    window.startClock?.();

    // 첫 화면
    ctx.clearRect(0,0,canvas.width,canvas.height);
    paintBackground(ctx, canvas.width, canvas.height);
    drawFrame();

    resetScoreSystem();
    startScoreSystem();

    UpMode.rafId = requestAnimationFrame(loop);
  };

  UpMode.stop = function(byCollision){
    if (!UpMode.active) return;
    UpMode.active = false;
    cancelAnimationFrame(UpMode.rafId);

    if (byCollision){
      window.stopClock?.();
      const finalSec = ((performance.now() - startTime)/1000).toFixed(1);
      window.setUITime?.(`${finalSec}초`);
      alert(`Game Over! 생존 시간: ${finalSec}초`);
    }
  };

  // resetGame이 호출될 때 업모드도 함께 정지되도록 후킹(기본 로직은 그대로 수행)
  const __origReset = window.resetGame;
  window.resetGame = function(){
    UpMode.stop(false);
    __origReset && __origReset();
  };

  // 업모드용 카운트다운(버튼 연타 방지, 숫자만 표시)
  let modeStarting = false;
  async function countdownThenStartUpMode(){
    if (modeStarting) return;
    modeStarting = true;
    const btnRestart = $("#btnRestart");
    const btnUp = $("#btnUpMode");
    if(btnRestart) btnRestart.disabled = true;
    if(btnUp) btnUp.disabled = true;

    // 캔버스 정리
    if (typeof window.resetGame === "function") window.resetGame();

    const cd = $("#countdown");
    if (cd){
      cd.classList.remove("hidden");
      cd.textContent = "3"; await sleep(1000);
      cd.textContent = "2"; await sleep(1000);
      cd.textContent = "1"; await sleep(900);
      cd.textContent = "시작!"; await sleep(400);
      cd.classList.add("hidden");
    }

    UpMode.start();

    if(btnRestart) btnRestart.disabled = false;
    if(btnUp) btnUp.disabled = false;
    modeStarting = false;
  }

  // 버튼 연결
  document.addEventListener("DOMContentLoaded", ()=>{
    const btnUp = $("#btnUpMode");
    if(btnUp){
      btnUp.addEventListener("click", countdownThenStartUpMode);
    }
  });
})();

// ====== 메테오 모드(기본 낙하 + 투명 경로 2개 + 초고속 낙하) ======
(function(){
  const $ = (s)=>document.querySelector(s);

  const MeteorMode = {
    active:false,
    rafId:0,
    teles:[],         // 복수 경로
    meteors:[],
    lastImpact: 0
  };

  function spawnTelegraph(now){
    const W = Math.floor(120 + Math.random()*60); // 120~180px로 더 넓게
    const x = Math.max(0, Math.min(canvas.width - W, Math.floor(Math.random() * (canvas.width - W))));
    return { x, width: W, created: now, fillDur: 2000 }; // 2초 채움
  }

  // 더 투명한 경로(뒤가 보이도록), 2개 이상 처리
  function drawTelegraphs(now){
    for (let i = MeteorMode.teles.length - 1; i >= 0; i--){
      const t = MeteorMode.teles[i];
      const p = Math.min(1, (now - t.created) / t.fillDur); // 0~1

      const h = canvas.height;
      const cx = t.x + t.width/2;

      // 베이스 띠(투명)
      const base = ctx.createLinearGradient(t.x, 0, t.x + t.width, 0);
      base.addColorStop(0,   "rgba(255, 60, 60, 0.12)");
      base.addColorStop(0.5, "rgba(255, 60, 60, 0.18)");
      base.addColorStop(1,   "rgba(255, 60, 60, 0.12)");
      ctx.fillStyle = base;
      ctx.fillRect(t.x, 0, t.width, h);

      // 코어 채움(안쪽→바깥), 투명도 낮춤
      const coreW = Math.max(6, t.width * p);
      const coreX = cx - coreW/2;
      const core = ctx.createLinearGradient(coreX, 0, coreX + coreW, 0);
      core.addColorStop(0,   "rgba(220, 0, 0, 0.40)");
      core.addColorStop(0.5, "rgba(255, 0, 0, 0.55)");
      core.addColorStop(1,   "rgba(220, 0, 0, 0.40)");
      ctx.fillStyle = core;
      ctx.fillRect(coreX, 0, coreW, h);

      // 채움 완료 → 초고속 메테오
      if (p >= 1){
        const mW = t.width;                                  // 경로와 동일 너비
        const mH = Math.max(26, Math.round(mW * 0.18));      // 높이는 비율로(가독)
        MeteorMode.meteors.push({
          x: t.x,                                            // 경로와 동일 위치
          y: -mH,                                            // 화면 위에서 진입
          width: mW,
          height: mH,
          vy: 42 + Math.random()*24,                         // 매우 빠르게
          color: "rgba(255,80,80,0.9)"
        });
        MeteorMode.teles.splice(i, 1); // 경로 제거
      }
    }
  }

  function drawMeteors(now){
    for (let i=MeteorMode.meteors.length-1;i>=0;i--){
      const m = MeteorMode.meteors[i];
      ctx.fillStyle = m.color;
      ctx.fillRect(m.x, m.y, m.width, m.height);
      // 얇은 꼬리
      ctx.fillStyle = "rgba(255,100,100,0.22)";
      ctx.fillRect(m.x, m.y - 12, m.width, 10);

      m.y += m.vy;

      if (checkCollision(player, m)){ MeteorMode.stop(true); return; }
      if (m.y >= canvas.height){
        MeteorMode.meteors.splice(i,1);
        MeteorMode.lastImpact = now;
      }
    }
  }

  function loop(){
    if(!MeteorMode.active) return;

    movePlayer();
    stickPlayerToBottom(player, canvas);

    ctx.clearRect(0,0,canvas.width,canvas.height);
    paintBackground(ctx, canvas.width, canvas.height);

    const now = performance.now();

    // 점수/아이템/무적 UI
    window.updateScoreSystem?.(now);
    window.updateAndDrawItems?.(now);
    window.updateInvincibleUI?.(now);

    // 기본 낙하 장애물도 함께 진행
    drawObstacles();
    if (!(typeof isInvincible === "function" && isInvincible())){
      for (const ob of obstacles){
        if (checkCollision(player, ob)){ MeteorMode.stop(true); return; }
      }
    }

    // 메테오 경로/낙하
    if (MeteorMode.teles) drawTelegraphs(now);
    drawMeteors(now);

    drawPlayer();
    drawFrame();

    // 기본 장애물 스폰/정리
    frameCount++;
    if (frameCount % 30 === 0) generateObstacle();
    obstacles = obstacles.filter(ob => ob.y < canvas.height);

    // “메테오가 떨어지고 3초 후” 스케줄
    const canSchedule = MeteorMode.teles.length===0 && MeteorMode.meteors.length===0 &&
                        (now - MeteorMode.lastImpact >= 3000);
    if (canSchedule){
      const t1 = spawnTelegraph(now);
      let t2 = spawnTelegraph(now);
      if (Math.abs((t1.x + t1.width/2) - (t2.x + t2.width/2)) < Math.max(t1.width, t2.width)*0.6){
        t2 = spawnTelegraph(now);
      }
      MeteorMode.teles.push(t1, t2);
    }

    MeteorMode.rafId = requestAnimationFrame(loop);
  }

  MeteorMode.start = function(){
    try{ cancelAnimationFrame(rafId); }catch{}
    MeteorMode.active = true;
    // 현재 모드 기록
    window.__CURRENT_MODE = "meteor";
    MeteorMode.teles = [];
    MeteorMode.meteors.length = 0;
    MeteorMode.lastImpact = performance.now() - 3000;

    // 기본 상태 초기화
    obstacles = [];
    frameCount = 0;
    gameOver = false;
    startTime = performance.now();
    elapsedTime = 0;
    player.x = (canvas.width - player.width) / 2;
    stickPlayerToBottom(player, canvas);

    // UI/타이머/점수
    window.setUITime?.("0.0초");
    window.startClock?.();
    window.resetScoreSystem?.();
    window.startScoreSystem?.();

    ctx.clearRect(0,0,canvas.width,canvas.height);
    paintBackground(ctx, canvas.width, canvas.height);
    drawFrame();

    MeteorMode.rafId = requestAnimationFrame(loop);
  };

  MeteorMode.stop = function(byCollision){
    if(!MeteorMode.active) return;
    MeteorMode.active = false;
    cancelAnimationFrame(MeteorMode.rafId);

    if (byCollision){
      window.stopClock?.();
      const finalSec = ((performance.now() - startTime)/1000).toFixed(1);
      window.setUITime?.(`${finalSec}초`);
      alert(`Game Over! 생존 시간: ${finalSec}초`);
    }
  };

  // resetGame 체인
  const prevReset = window.resetGame;
  window.resetGame = function(){
    MeteorMode.stop(false);
    prevReset && prevReset();
  };

  // 버튼 연결(기존 카운트다운 로직 그대로 사용)
  document.addEventListener("DOMContentLoaded", ()=>{
    const btnM = $("#btnMeteorMode");
    if(btnM){
      btnM.addEventListener("click", async ()=>{
        if (typeof window.resetGame === "function") window.resetGame();
        const cd = document.querySelector("#countdown");
        if (cd){
          cd.classList.remove("hidden");
          cd.textContent="3"; await new Promise(r=>setTimeout(r,1000));
          cd.textContent="2"; await new Promise(r=>setTimeout(r,1000));
          cd.textContent="1"; await new Promise(r=>setTimeout(r,900));
          cd.textContent="시작!"; await new Promise(r=>setTimeout(r,400));
          cd.classList.add("hidden");
        }
        MeteorMode.start();
      });
    }
  });
})();

// ====== 낙엽(포물선) 모드: 좌우로 흘러가는 포물선 궤적의 박스 ======
(function(){
  const $ = (s)=>document.querySelector(s);
  const sleep = (ms)=>new Promise(r=>setTimeout(r, ms));

  const LeafMode = {
    active:false,
    rafId:0,
    leaves:[],
    lastSpawn:0,
    spawnGap: 420 // ms 기준(처음 간격). 루프 프레임과 무관
  };

  function spawnLeaf(now){
    // 폭/높이 약간 랜덤
    const w = 32 + Math.floor(Math.random()*14);
    const h = 14 + Math.floor(Math.random()*8);

    // 중심(기준) x, 화면 안에서 시작
    const baseX = Math.random() * (canvas.width - w);

    // 수평 드리프트(아주 느리게), 파동 진폭/주파수/위상
    const drift = (Math.random() < 0.5 ? -1 : 1) * (0.10 + Math.random()*0.20); // px/frame 기준
    const amp   = 22 + Math.random()*38;        // 물결 진폭
    const wHz   = 0.006 + Math.random()*0.007;  // 물결 각속도(밀리초 단위)
    const phase = Math.random()*Math.PI*2;

    // 낙하 물리(가속 + 종단속도), 프레임 독립 계산용 last
    const g   = 0.35 + Math.random()*0.25;      // 중력(프레임 기준)
    const vt  = 3.2 + Math.random()*1.8;        // 종단속도
    const vy0 = 0;

    // 회전(낙엽 느낌)
    const tiltA = 0.25 + Math.random()*0.55;    // 최대 라디안
    const tiltW = 0.006 + Math.random()*0.007;  // 각속도
    const tiltP = Math.random()*Math.PI*2;

    LeafMode.leaves.push({
      x: baseX, y: -h-6, width:w, height:h,
      // 파라미터
      baseX, drift, amp, wHz: wHz, phase,
      // 물리
      vy: vy0, g, vt,
      // 회전
      tiltA, tiltW, tiltP,
      // 시간
      age: 0, last: now,
      color: getRandomColor()
    });
  }

  function drawLeaves(now){
    for (let i = LeafMode.leaves.length - 1; i >= 0; i--){
      const b = LeafMode.leaves[i];

      // 프레임 독립 시간 스텝
      const dt = Math.max(0, now - b.last);
      const k  = dt / 16.6667;     // 60fps 기준 배율
      b.last = now;
      b.age += dt;

      // 낙하(가속→종단속도)
      b.vy = Math.min(b.vt, b.vy + b.g * k);
      b.y  += b.vy * k;

      // 기준 x는 아주 느린 드리프트
      b.baseX += b.drift * k;

      // 물결(사인) 궤적: 기준 + 진폭*sin(ωt+φ)
      const wave = b.amp * Math.sin(b.wHz * b.age + b.phase);
      b.x = b.baseX + wave;

      // 회전(펄럭임)
      const ang = b.tiltA * Math.sin(b.tiltW * b.age + b.tiltP);

      // 그리기(회전 사각형)
      ctx.save();
      ctx.translate(b.x + b.width/2, b.y + b.height/2);
      ctx.rotate(ang);
      ctx.fillStyle = b.color;
      ctx.fillRect(-b.width/2, -b.height/2, b.width, b.height);
      ctx.restore();

      // 충돌(무적이면 무시). 회전 AABB 근사
      const invNow = (typeof window.isInvincible === "function") ? window.isInvincible() : false;
      if (!invNow){
        const ca = Math.abs(Math.cos(ang)), sa = Math.abs(Math.sin(ang));
        const aabbW = ca*b.width + sa*b.height;
        const aabbH = sa*b.width + ca*b.height;
        const aabbX = b.x + b.width/2  - aabbW/2;
        const aabbY = b.y + b.height/2 - aabbH/2;
        if (checkCollision(player, {x:aabbX,y:aabbY,width:aabbW,height:aabbH})){
          LeafMode.stop(true);
          return;
        }
      }

      // 화면 밖 정리
      const margin = 100;
      if (b.y > canvas.height + 40 || b.x < -margin || b.x > canvas.width + margin){
        LeafMode.leaves.splice(i, 1);
      }
    }
  }

  function loop(){
    if(!LeafMode.active) return;

    movePlayer();
    stickPlayerToBottom(player, canvas);

    ctx.clearRect(0,0,canvas.width,canvas.height);
    paintBackground(ctx, canvas.width, canvas.height);

    const now = performance.now();
    // 점수/아이템/무적 UI 호출
    window.updateScoreSystem?.(now);
    window.updateAndDrawItems?.(now);
    window.updateInvincibleUI?.(now);

    drawLeaves(now);

    drawPlayer();
    drawFrame();

    if (now - LeafMode.lastSpawn >= LeafMode.spawnGap){
      spawnLeaf(now);
      LeafMode.lastSpawn = now;
      LeafMode.spawnGap = 360 + Math.random()*180;
    }

    LeafMode.rafId = requestAnimationFrame(loop);
  }

  LeafMode.start = function(){
    try{ cancelAnimationFrame(rafId); }catch{}
    LeafMode.active = true;
    // 현재 모드 기록
    window.__CURRENT_MODE = "leaf";
    LeafMode.leaves.length = 0;
    LeafMode.lastSpawn = performance.now();

    // 상태/타이머
    obstacles = [];
    gameOver = false;
    frameCount = 0;
    startTime = performance.now();
    elapsedTime = 0;
    player.x = (canvas.width - player.width) / 2;
    stickPlayerToBottom(player, canvas);

    // 점수 시작
    window.resetScoreSystem?.();
    window.startScoreSystem?.();

    window.setUITime?.("0.0초");
    window.startClock?.();

    ctx.clearRect(0,0,canvas.width,canvas.height);
    paintBackground(ctx, canvas.width, canvas.height);
    drawFrame();

    LeafMode.rafId = requestAnimationFrame(loop);
  };

  LeafMode.stop = function(byCollision){
    if(!LeafMode.active) return;
    LeafMode.active = false;
    cancelAnimationFrame(LeafMode.rafId);

    if (byCollision){
      window.stopClock?.();
      const finalSec = ((performance.now() - startTime)/1000).toFixed(1);
      window.setUITime?.(`${finalSec}초`);
      alert(`Game Over! 생존 시간: ${finalSec}초`);
    }
  };

  // resetGame 체인(기존 reset 흐름 보존)
  const prevReset = window.resetGame;
  window.resetGame = function(){
    LeafMode.stop(false);
    prevReset && prevReset();
  };

  // 버튼: 3초 카운트다운 후 시작(연타 방지)
  let starting = false;
  document.addEventListener("DOMContentLoaded", ()=>{
    const btn = $("#btnLeafMode");
    if(!btn) return;

    btn.addEventListener("click", async ()=>{
      if (starting) return;
      starting = true;
      btn.disabled = true;

      // 다른 모드/루프 정지 + 캔버스 정리
      if (typeof window.resetGame === "function") window.resetGame();

      const cd = document.getElementById("countdown");
      if (cd){
        cd.classList.remove("hidden");
        cd.textContent = "3"; await sleep(1000);
        cd.textContent = "2"; await sleep(1000);
        cd.textContent = "1"; await sleep(900);
        cd.textContent = "시작!"; await sleep(400);
        cd.classList.add("hidden");
      }

      LeafMode.start();
      btn.disabled = false;
      starting = false;
    });
  });
})();

// ========================================
// Chaos 모드 컨트롤러(파일 내 추가 전용, 기존 로직 불변)
// - 5초마다 모드 전환(직전 모드 제외, 랜덤)
// - leaf/up에서는 기본 박스 신규 스폰 차단(기존 낙하물 유지)
// - 충돌은 기본 엔진으로 위임(더미 장애물 1프레임 삽입)
// - 게임오버 후에는 즉시 중지
// ========================================
(function(){
  const params = new URLSearchParams(location.search);
  if ((params.get("mode")||"").toLowerCase() !== "chaos") return;

  const MODES = ["default","leaf","meteor","up"];

  const CHAOS = {
    on:false,
    cur:"default",
    nextAt:0,
    interval:5000,
    // up
    upTele:[], upUps:[],
    // meteor
    mtTele:[], mtMets:[],
    // leaf
    leaves:[], lastLeaf:0, leafGap:420,
    // 종료 위임 플래그
    pendingKill:false
  };

  // 기본 상자 스폰 차단용 래퍼(leaf/up 때만 막음)
  const origGen = window.generateObstacle;
  let baseSpawnAllowed = true;
  if (typeof origGen === "function"){
    window.generateObstacle = function(){
      if (baseSpawnAllowed) return origGen.apply(this, arguments);
    };
  }
  const setBaseSpawnByMode = (m)=>{ baseSpawnAllowed = !(m === "leaf" || m === "up"); };

  // 시작/재시작 동기화
  function resetChaos(now = performance.now()){
    CHAOS.cur = "default";
    CHAOS.nextAt = now + CHAOS.interval;
    CHAOS.upTele.length = 0; CHAOS.upUps.length = 0;
    CHAOS.mtTele.length = 0; CHAOS.mtMets.length = 0;
    CHAOS.leaves.length = 0; CHAOS.lastLeaf = 0; CHAOS.leafGap = 420;
    CHAOS.pendingKill = false;
    setBaseSpawnByMode("default");
  }
  (function hookResets(){
    const prevReset = window.resetGame;
    window.resetGame = function(){
      resetChaos();
      return prevReset && prevReset.apply(this, arguments);
    };
    const prevStart = window.startGame;
    if (typeof prevStart === "function"){
      window.startGame = function(){
        resetChaos();
        return prevStart.apply(this, arguments);
      };
    }
  })();

  const invOn = ()=> (typeof window.isInvincible === "function") && window.isInvincible();

  // 기본 엔진의 게임오버 루틴으로 우회
  function routeToNativeGameOverOnce(){
    if (CHAOS.pendingKill) return;
    CHAOS.pendingKill = true;
    try {
      // window.obstacles 아님! top-level let obstacles 사용
      obstacles.push({
        x: player.x,
        y: player.y,
        width: player.width,
        height: player.height,
        speed: 0,
        color: "#000",
        __chaosKill: true
      });
    } catch (e) {
      // 폴백: 최후 수단으로 기본 종료 흐름 모사
      try { window.stopClock?.(); } catch {}
      gameOver = true;
      cancelAnimationFrame(rafId);
      const sec = (typeof elapsedTime === "number"
        ? elapsedTime
        : ((performance.now() - startTime) / 1000)).toFixed(1);
      window.setUITime?.(`${sec}초`);
      alert(`Game Over! 생존 시간: ${sec}초`);
    }
  }

  // 난이도 멀티(기존 타임라인 사용)
  function diffMult(now){
    const rampMs = 60000;
    let t = 0;
    if (typeof window.startTime === "number") t = Math.max(0, now - window.startTime) / rampMs;
    else if (typeof window.elapsedTime === "number") t = Math.max(0, window.elapsedTime*1000) / rampMs;
    return 1 + (2.2 - 1) * Math.min(1, t);
  }

  // -------- 업(바닥 예고 → 상승) --------
  function upSpawnTele(now){
    const w = 40 + Math.floor(Math.random()*20);
    const x = Math.random() * (canvas.width - w);
    const delay = 1000 + Math.random()*1000;
    CHAOS.upTele.push({ x, width:w, created: now, delay });
  }
  function upDraw(now, mult){
    const H = Math.min(300, canvas.height * 0.48);
    const bottom = canvas.height - 1;
    const COL = "255, 211, 77";

    for (let i = CHAOS.upTele.length - 1; i >= 0; i--){
      const t = CHAOS.upTele[i];
      const age = now - t.created;
      const appear = Math.min(1, age / 250);
      const disappear = Math.max(0, 1 - Math.max(0, age - t.delay + 200) / 200);
      const alpha = Math.max(0, Math.min(1, appear * disappear));

      ctx.save();
      ctx.globalAlpha = 0.65 * alpha;
      ctx.fillStyle = `rgba(${COL}, 0.9)`;
      ctx.filter = "blur(6px)";
      ctx.fillRect(t.x - 4, bottom - 8, t.width + 8, 10);
      ctx.filter = "none";

      const g = ctx.createLinearGradient(t.x, bottom, t.x, bottom - H);
      g.addColorStop(0.00, `rgba(${COL}, ${0.85 * alpha})`);
      g.addColorStop(0.25, `rgba(${COL}, ${0.55 * alpha})`);
      g.addColorStop(0.60, `rgba(${COL}, ${0.20 * alpha})`);
      g.addColorStop(1.00, `rgba(${COL}, 0)`);
      ctx.shadowColor = `rgba(${COL}, ${0.45 * alpha})`;
      ctx.shadowBlur = 18;
      ctx.fillStyle = g;
      ctx.fillRect(t.x, bottom - H, t.width, H);

      // 코어
      ctx.shadowBlur = 0;
      const coreW = Math.max(4, t.width * 0.45);
      const coreX = t.x + (t.width - coreW) / 2;
      const g2 = ctx.createLinearGradient(coreX, bottom, coreX, bottom - H);
      g2.addColorStop(0.00, `rgba(255, 245, 170, ${0.95 * alpha})`);
      g2.addColorStop(0.30, `rgba(255, 245, 170, ${0.40 * alpha})`);
      g2.addColorStop(1.00, `rgba(255, 245, 170, 0)`);
      ctx.fillStyle = g2;
      ctx.fillRect(coreX, bottom - H, coreW, H);
      ctx.restore();

      if (age >= t.delay){
        CHAOS.upUps.push({
          x: t.x, y: canvas.height - 20, width: t.width, height: 20,
          speed: (2 + Math.random()*2) * mult,
          color: "rgba(255,160,60,1)"
        });
        CHAOS.upTele.splice(i, 1);
      }
    }

    for (let i = CHAOS.upUps.length - 1; i >= 0; i--){
      const ob = CHAOS.upUps[i];
      ctx.fillStyle = ob.color;
      ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
      ob.y -= ob.speed;
      if (!invOn() && checkCollision(player, ob)){ routeToNativeGameOverOnce(); return; }
      if (ob.y + ob.height < 0) CHAOS.upUps.splice(i, 1);
    }
  }

  // -------- 메테오(경로 → 낙하) --------
  function mtSpawnTele(now){
    const W = Math.floor(120 + Math.random()*60);
    const x = Math.max(0, Math.min(canvas.width - W, Math.floor(Math.random() * (canvas.width - W))));
    CHAOS.mtTele.push({ x, width: W, created: now, fillDur: 2000 });
  }
  function mtDraw(now, mult){
    for (let i = CHAOS.mtTele.length - 1; i >= 0; i--){
      const t = CHAOS.mtTele[i];
      const p = Math.min(1, (now - t.created) / t.fillDur);
      const h = canvas.height;

      const base = ctx.createLinearGradient(t.x, 0, t.x + t.width, 0);
      base.addColorStop(0,   "rgba(255, 60, 60, 0.12)");
      base.addColorStop(0.5, "rgba(255, 60, 60, 0.18)");
      base.addColorStop(1,   "rgba(255, 60, 60, 0.12)");
      ctx.fillStyle = base;
      ctx.fillRect(t.x, 0, t.width, h);

      const cx = t.x + t.width/2;
      const coreW = Math.max(6, t.width * p);
      const coreX = cx - coreW/2;
      const core = ctx.createLinearGradient(coreX, 0, coreX + coreW, 0);
      core.addColorStop(0,   "rgba(220, 0, 0, 0.40)");
      core.addColorStop(0.5, "rgba(255, 0, 0, 0.55)");
      core.addColorStop(1,   "rgba(220, 0, 0, 0.40)");
      ctx.fillStyle = core;
      ctx.fillRect(coreX, 0, coreW, h);

      if (p >= 1){
        const mW = t.width;
        const mH = Math.max(26, Math.round(mW * 0.18));
        CHAOS.mtMets.push({
          x: t.x, y: -mH, width: mW, height: mH,
          vy: (42 + Math.random()*24) * mult,
          color: "rgba(255,80,80,0.9)"
        });
        CHAOS.mtTele.splice(i, 1);
      }
    }

    for (let i = CHAOS.mtMets.length - 1; i >= 0; i--){
      const m = CHAOS.mtMets[i];
      ctx.fillStyle = m.color;
      ctx.fillRect(m.x, m.y, m.width, m.height);
      ctx.fillStyle = "rgba(255,100,100,0.22)";
      ctx.fillRect(m.x, m.y - 12, m.width, 10);
      m.y += m.vy;

      if (!invOn() && checkCollision(player, m)){ routeToNativeGameOverOnce(); return; }
      if (m.y >= canvas.height) CHAOS.mtMets.splice(i, 1);
    }
  }

  // -------- 낙엽(물결 궤적 + 회전) --------
  function leafSpawn(now, mult){
    const w = 32 + Math.floor(Math.random()*14);
    const h = 14 + Math.floor(Math.random()*8);
    const baseX = Math.random() * (canvas.width - w);
    const drift = (Math.random() < 0.5 ? -1 : 1) * (0.10 + Math.random()*0.20);
    const amp   = 22 + Math.random()*38;
    const wHz   = 0.006 + Math.random()*0.006;
    const phase = Math.random()*Math.PI*2;
    const g     = (0.35 + Math.random()*0.25) * mult;
    const vt    = (3.2 + Math.random()*1.8)   * mult;
    const tiltA = 0.25 + Math.random()*0.55;
    const tiltW = 0.006 + Math.random()*0.007;
    const tiltP = Math.random()*Math.PI*2;

    CHAOS.leaves.push({
      x: baseX, y: -h-6, width:w, height:h,
      baseX, drift, amp, wHz, phase,
      vy: 0, g, vt,
      tiltA, tiltW, tiltP,
      age: 0, last: now,
      color: "rgba(60,120,220,0.9)"
    });
  }
  function leafDraw(now){
    for (let i = CHAOS.leaves.length - 1; i >= 0; i--){
      const b = CHAOS.leaves[i];
      const dt = Math.max(0, now - b.last); const k = dt / 16.6667;
      b.last = now; b.age += dt;

      b.vy = Math.min(b.vt, b.vy + b.g * k);
      b.y  += b.vy * k;
      b.baseX += b.drift * k;
      const wave = b.amp * Math.sin(b.wHz * b.age + b.phase);
      b.x = b.baseX + wave;
      const ang = b.tiltA * Math.sin(b.tiltW * b.age + b.tiltP);

      ctx.save();
      ctx.translate(b.x + b.width/2, b.y + b.height/2);
      ctx.rotate(ang);
      ctx.fillStyle = b.color;
      ctx.fillRect(-b.width/2, -b.height/2, b.width, b.height);
      ctx.restore();

      if (!invOn()){
        const ca = Math.abs(Math.cos(ang)), sa = Math.abs(Math.sin(ang));
        const aabbW = ca*b.width + sa*b.height;
        const aabbH = sa*b.width + ca*b.height;
        const aabbX = b.x + b.width/2  - aabbW/2;
        const aabbY = b.y + b.height/2 - aabbH/2;
        if (checkCollision(player, {x:aabbX,y:aabbY,width:aabbW,height:aabbH})){ routeToNativeGameOverOnce(); return; }
      }

      const margin = 100;
      if (b.y > canvas.height + 40 || b.x < -margin || b.x > canvas.width + margin){
        CHAOS.leaves.splice(i, 1);
      }
    }
  }

  // 모드 전환
  function pickNextMode(){
    const others = MODES.filter(m => m !== CHAOS.cur);
    return others[Math.floor(Math.random()*others.length)];
  }
  function switchMode(now){
    CHAOS.cur = pickNextMode();
    CHAOS.nextAt = now + CHAOS.interval;
    setBaseSpawnByMode(CHAOS.cur);

    const mult = diffMult(now);
    if (CHAOS.cur === "leaf"){ for(let i=0;i<2;i++) leafSpawn(now, mult); }
    else if (CHAOS.cur === "meteor"){ mtSpawnTele(now); mtSpawnTele(now); }
    else if (CHAOS.cur === "up"){ upSpawnTele(now); upSpawnTele(now); }
  }

  // drawFrame 훅
  const origDrawFrame = window.drawFrame || function(){};
  window.drawFrame = function(){
    if (!CHAOS.on){ CHAOS.on = true; resetChaos(); }
    // 게임오버 이후엔 즉시 원래 루프만 돌고 종료
    if (window.gameOver === true) return origDrawFrame.apply(this, arguments);

    const now = performance.now();
    const mult = diffMult(now);

    // 현재 모드만 신규 스폰(leaf/up 외엔 기본 스폰 허용)
    setBaseSpawnByMode(CHAOS.cur);
    if (CHAOS.cur === "leaf"){
      if (CHAOS.lastLeaf === 0) CHAOS.lastLeaf = now;
      if (now - CHAOS.lastLeaf >= CHAOS.leafGap){
        leafSpawn(now, mult);
        CHAOS.lastLeaf = now;
        CHAOS.leafGap = 360 + Math.random()*180;
      }
    } else if (CHAOS.cur === "meteor"){
      if (CHAOS.mtTele.length === 0 && CHAOS.mtMets.length === 0){
        mtSpawnTele(now); mtSpawnTele(now);
      }
    } else if (CHAOS.cur === "up"){
      if (CHAOS.upTele.length < 3) upSpawnTele(now);
    }

    // 잔여 진행/렌더
    leafDraw(now);
    mtDraw(now, mult);
    upDraw(now, mult);

    // 5초마다 전환
    if (now >= CHAOS.nextAt) switchMode(now);

    return origDrawFrame.apply(this, arguments);
  };
})();

(function(){
  const getQueryMode = ()=> (new URLSearchParams(location.search).get("mode")||"").toLowerCase();
  // 첫 로드 시 카오스면 현재 모드 지정
  if (getQueryMode() === "chaos") window.__CURRENT_MODE = "chaos";
  // 기본 startGame 래핑
  const __origStart = window.startGame;
  if (typeof __origStart === "function"){
    window.startGame = function(){
      // 카오스가 아니면 기본 모드로 표기, 카오스면 유지
      if (getQueryMode() !== "chaos") window.__CURRENT_MODE = "default";
      return __origStart.apply(this, arguments);
    };
  }
})();
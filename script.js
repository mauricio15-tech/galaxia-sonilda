<script>
(() => {
"use strict";

const intro = document.querySelector("#intro");
const start = document.querySelector("#start");
const scene = document.querySelector("#scene");
const canvas = document.querySelector("#stars");
const flowersBox = document.querySelector("#flowers");
const bursts = document.querySelector("#bursts");
const quote = document.querySelector("#quote");
const replay = document.querySelector("#replay");

console.log("INTRO:", intro);
console.log("START:", start);
console.log("SCENE:", scene);
console.log("FLOWERS:", flowersBox);

if (!intro || !start || !scene || !canvas || !flowersBox) {
  console.error("Falta algún elemento HTML necesario.");
  return;
}

const ctx = canvas.getContext("2d",{alpha:true});

let W=0,H=0,dpr=1;
let stars=[];
let flowers=[];
let raf=0;
let running=false;
let t0=0;

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

function resize(){
  W=innerWidth;
  H=innerHeight;
  dpr=Math.min(devicePixelRatio||1,2);

  canvas.width=Math.floor(W*dpr);
  canvas.height=Math.floor(H*dpr);

  ctx.setTransform(dpr,0,0,dpr,0,0);
  buildStars();
}

function buildStars(){
  const n=Math.min(210,Math.max(90,Math.floor(W*H/7600)));

  stars=Array.from({length:n},()=>({
    x:Math.random()*W,
    y:Math.random()*H,
    r:.25+Math.random()*1.35,
    a:.25+Math.random()*.7,
    p:Math.random()*7,
    s:.2+Math.random()*.8
  }));
}

function draw(t){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle="#fff";

  for(const s of stars){
    ctx.globalAlpha=s.a*(.7+.3*Math.sin(t*s.s*.002+s.p));
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.r,0,7);
    ctx.fill();
  }

  ctx.globalAlpha=1;
}

function makeFlowers(){
  flowersBox.innerHTML="";
  flowers=[];

  const count=Math.min(30,Math.max(16,Math.round(W/14)));
  const maxR=Math.min(W,H)*.47;

  for(let i=0;i<count;i++){
    const el=document.createElement("div");

    el.className="flower";
    el.textContent="🌻";

    flowersBox.appendChild(el);

    flowers.push({
      el,
      a:Math.random()*7,
      r:maxR*(.30+Math.random()*.72),
      v:(.00016+Math.random()*.00025)*(Math.random()<.5?-1:1),
      p:Math.random()*7,
      s:.65+Math.random()*.6
    });
  }
}

function animate(t){
  if(!running)return;

  draw(t);

  const cx=W/2;
  const cy=H*.48;
  const e=t-t0;

  flowers.forEach(f=>{
    const a=f.a+e*f.v;
    const r=f.r*(1+.045*Math.sin(e*.001+f.p));

    const x=cx+Math.cos(a)*r;
    const y=cy+Math.sin(a)*r*.58;

    const sc=f.s*(.88+.12*Math.sin(e*.0011+f.p));

    f.el.style.transform=
      `translate(${x-cx}px,${y-cy}px) scale(${sc}) rotate(${a*57.3+90}deg)`;
  });

  raf=requestAnimationFrame(animate);
}

function burst(x,y){
  scene.classList.add("touched");

  for(let i=0;i<7;i++){
    const s=document.createElement("div");

    s.className="spark";
    s.style.left=x+"px";
    s.style.top=y+"px";

    const a=Math.random()*Math.PI*2;
    const r=35+Math.random()*75;

    s.animate(
      [
        {
          transform:"translate(0,0) scale(1)",
          opacity:1
        },
        {
          transform:`translate(${Math.cos(a)*r}px,${Math.sin(a)*r}px) scale(0)`,
          opacity:0
        }
      ],
      {
        duration:700+Math.random()*450,
        easing:"cubic-bezier(.1,.7,.2,1)"
      }
    );

    bursts.appendChild(s);

    setTimeout(()=>s.remove(),1300);
  }
}

function startExperience(){
  console.log("BOTÓN START PRESIONADO");

  intro.classList.add("hide");
  scene.classList.add("active");
  scene.setAttribute("aria-hidden","false");

  running=true;
  t0=performance.now();

  makeFlowers();

  cancelAnimationFrame(raf);
  raf=requestAnimationFrame(animate);

  setTimeout(()=>{
    if(quote) quote.classList.add("show");
  },reduced?500:6200);
}

function restart(){
  if(quote) quote.classList.remove("show");

  makeFlowers();
  t0=performance.now();

  setTimeout(()=>{
    if(quote) quote.classList.add("show");
  },reduced?400:6200);
}

start.addEventListener("click",startExperience);

if(replay){
  replay.addEventListener("click",e=>{
    e.stopPropagation();
    restart();
  });
}

scene.addEventListener("pointerdown",e=>{
  if(e.target.closest("button"))return;
  burst(e.clientX,e.clientY);
});

addEventListener("resize",resize,{passive:true});

addEventListener(
  "orientationchange",
  ()=>setTimeout(resize,250),
  {passive:true}
);

resize();

const bgMusic=document.getElementById("bgMusic");

if(bgMusic){
  bgMusic.volume=.55;

  const startMusic=()=>{
    bgMusic.play().catch(()=>{});
  };

  document.addEventListener("click",startMusic,{once:true});
  document.addEventListener("touchstart",startMusic,{
    once:true,
    passive:true
  });
}

})();
</script>

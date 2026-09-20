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

console.log("Página cargada");
console.log("intro:", intro);
console.log("start:", start);
console.log("scene:", scene);

if (!intro || !start || !scene || !canvas || !flowersBox) {
    console.error("Falta un elemento del HTML");
    return;
}

const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;
let dpr = 1;
let stars = [];
let flowers = [];
let running = false;
let t0 = 0;
let raf = 0;

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = W * dpr;
    canvas.height = H * dpr;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = [];

    const n = Math.min(
        210,
        Math.max(90, Math.floor(W * H / 7600))
    );

    for (let i = 0; i < n; i++) {
        stars.push({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 0.3 + Math.random() * 1.3,
            a: 0.25 + Math.random() * 0.7
        });
    }
}

function drawStars() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#fff";

    for (const s of stars) {
        ctx.globalAlpha = s.a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
}

function makeFlowers() {
    flowersBox.innerHTML = "";
    flowers = [];

    const count = Math.min(
        30,
        Math.max(16, Math.round(W / 14))
    );

    const maxR = Math.min(W, H) * 0.47;

    for (let i = 0; i < count; i++) {
        const el = document.createElement("div");

        el.className = "flower";
        el.textContent = "🌻";

        flowersBox.appendChild(el);

        flowers.push({
            el: el,
            a: Math.random() * Math.PI * 2,
            r: maxR * (0.30 + Math.random() * 0.72),
            v: (0.00016 + Math.random() * 0.00025) *
               (Math.random() < 0.5 ? -1 : 1),
            p: Math.random() * Math.PI * 2,
            s: 0.65 + Math.random() * 0.6
        });
    }
}

function animate(t) {
    if (!running) return;

    drawStars();

    const cx = W / 2;
    const cy = H * 0.48;
    const e = t - t0;

    flowers.forEach(f => {
        const a = f.a + e * f.v;

        const r =
            f.r *
            (1 + 0.045 * Math.sin(e * 0.001 + f.p));

        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.58;

        const scale =
            f.s *
            (0.88 + 0.12 * Math.sin(e * 0.0011 + f.p));

        f.el.style.transform =
            `translate(${x - cx}px,${y - cy}px) scale(${scale}) rotate(${a * 57.3 + 90}deg)`;
    });

    raf = requestAnimationFrame(animate);
}

function startExperience() {
    console.log("ENTRAR PRESIONADO");

    intro.classList.add("hide");

    scene.classList.add("active");
    scene.setAttribute("aria-hidden", "false");

    running = true;
    t0 = performance.now();

    makeFlowers();

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(animate);

    setTimeout(() => {
        if (quote) {
            quote.classList.add("show");
        }
    }, 6200);
}

function restart() {
    if (quote) {
        quote.classList.remove("show");
    }

    makeFlowers();

    t0 = performance.now();
}

start.addEventListener("click", startExperience);

if (replay) {
    replay.addEventListener("click", e => {
        e.stopPropagation();
        restart();
    });
}

scene.addEventListener("pointerdown", e => {
    if (e.target.closest("button")) return;

    bursts.innerHTML += `
        <div class="spark"
        style="left:${e.clientX}px;top:${e.clientY}px"></div>
    `;

    setTimeout(() => {
        const sparks = bursts.querySelectorAll(".spark");
        sparks.forEach(s => s.remove());
    }, 1000);
});

window.addEventListener("resize", resize);

resize();

const bgMusic = document.getElementById("bgMusic");

if (bgMusic) {
    bgMusic.volume = 0.55;

    document.addEventListener("click", () => {
        bgMusic.play().catch(() => {});
    }, { once: true });
}

})();

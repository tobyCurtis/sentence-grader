// Small, self-contained original canvas confetti implementation; no CDN or network.
(function (root) {
  'use strict';
  root.SentenceConfetti = function celebrate() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:2147483646';
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    const colors = ['#efc66a','#f69e8e','#a997ec','#9dd7c1','#f5d974','#7dc5eb'];
    const pieces = Array.from({ length: 170 }, () => ({
      x: Math.random() * canvas.width, y: -Math.random() * canvas.height * .6,
      dx: (Math.random() - .5) * 5 * devicePixelRatio,
      dy: (2 + Math.random() * 4) * devicePixelRatio,
      w: (3 + Math.random() * 6) * devicePixelRatio,
      h: (5 + Math.random() * 7) * devicePixelRatio,
      phase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    const started = performance.now();
    function frame(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.x += p.dx + Math.sin(p.phase += .05) * devicePixelRatio;
        p.y += p.dy;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.phase);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
      if (now - started < 4300) requestAnimationFrame(frame);
      else canvas.remove();
    }
    requestAnimationFrame(frame);
  };
})(globalThis);

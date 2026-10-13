/* ============================================================
   4D CHART UNIVERSE — 16 live neon chart engines
   4th dimension = TIME (scrub / freeze / chaos)
   ============================================================ */
(function () {
  'use strict';

  var PALETTE = ['#00f0ff', '#ff2d95', '#7b2dff', '#ffd000', '#8dff2d', '#48f7ff', '#ff7ad9', '#ffb347'];
  var state = { t: 0, scale: 1, frozen: false, chaos: 0 };
  var tip = null;

  function wave(t, seed, i) {
    return (
      Math.sin(t * 0.80 + seed * 7.3 + i * 1.7) * 0.52 +
      Math.sin(t * 0.53 + seed * 3.1 + i * 3.2) * 0.33 +
      Math.sin(t * 1.31 + seed * 1.9 + i * 0.9) * 0.15
    );
  }
  function nrm(v) { return 0.5 + 0.5 * Math.max(-1, Math.min(1, v)); }

  function fit(c) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = c.clientWidth || 300, h = c.clientHeight || 190;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    }
    var ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }

  function glowStroke(ctx, color, blur, width, path) {
    ctx.save();
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.shadowColor = color; ctx.shadowBlur = blur;
    ctx.beginPath(); path(ctx); ctx.stroke();
    ctx.restore();
  }
  function grid(ctx, w, h, cols, rows) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,240,255,.09)'; ctx.lineWidth = 1;
    for (var i = 0; i <= cols; i++) {
      var x = (w / cols) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (var j = 0; j <= rows; j++) {
      var y = (h / rows) * j; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.restore();
  }
  function clear(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(8,14,34,.55)'); g.addColorStop(1, 'rgba(3,6,16,.55)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }

  /* ---------------- chart draw dispatch ---------------- */
  var DRAW = {
    line: function (ctx, w, h, t, seed) {
      clear(ctx, w, h); grid(ctx, w, h, 8, 5);
      for (var s = 0; s < 3; s++) {
        var pts = [], i;
        for (i = 0; i < 22; i++) {
          var x = (w - 24) * (i / 21) + 12;
          var y = h * 0.5 - wave(t * (1 + s * 0.22), seed + s * 2.2, i * 0.55) * h * 0.34;
          pts.push([x, y]);
        }
        (function (pts, s) {
          glowStroke(ctx, PALETTE[s], 16, 2.4, function (c) {
            c.moveTo(pts[0][0], pts[0][1]);
            for (var k = 1; k < pts.length; k++) c.lineTo(pts[k][0], pts[k][1]);
          });
        })(pts, s);
        for (i = 0; i < pts.length; i += 3) {
          ctx.fillStyle = PALETTE[s]; ctx.shadowColor = PALETTE[s]; ctx.shadowBlur = 12;
          ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], 2.6, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        }
      }
    },
    area: function (ctx, w, h, t, seed) {
      clear(ctx, w, h); grid(ctx, w, h, 8, 5);
      for (var s = 0; s < 2; s++) {
        var base = h * (0.62 - s * 0.16);
        ctx.save();
        var grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, s ? 'rgba(255,45,149,.55)' : 'rgba(0,240,255,.5)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.moveTo(0, h);
        for (var i = 0; i <= 30; i++) {
          var x = w * (i / 30);
          var y = base - wave(t * (1 + s * 0.3), seed + s * 3, i * 0.4) * h * 0.26;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h); ctx.closePath(); ctx.fill(); ctx.restore();
        glowStroke(ctx, s ? '#ff2d95' : '#00f0ff', 14, 2, function (c) {
          c.moveTo(0, base);
          for (var i = 0; i <= 30; i++) {
            var x = w * (i / 30);
            var y = base - wave(t * (1 + s * 0.3), seed + s * 3, i * 0.4) * h * 0.26;
            c.lineTo(x, y);
          }
        });
      }
    },
    bar: function (ctx, w, h, t, seed) {
      clear(ctx, w, h); grid(ctx, w, h, 10, 5);
      var n = 11, bw = (w - 30) / n;
      for (var i = 0; i < n; i++) {
        var v = nrm(wave(t * 1.1, seed + i * 0.7, i));
        var bh = 12 + v * (h - 36);
        var x = 15 + i * bw, y = h - 12 - bh;
        var g = ctx.createLinearGradient(0, y, 0, y + bh);
        g.addColorStop(0, PALETTE[i % 5]); g.addColorStop(1, 'rgba(10,20,50,.15)');
        ctx.fillStyle = g;
        ctx.shadowColor = PALETTE[i % 5]; ctx.shadowBlur = 14;
        ctx.fillRect(x + 2, y, bw - 5, bh); ctx.shadowBlur = 0;
      }
    },
    stack: function (ctx, w, h, t, seed) {
      clear(ctx, w, h); grid(ctx, w, h, 7, 5);
      var n = 6, bw = (w - 28) / n;
      for (var i = 0; i < n; i++) {
        var acc = 0;
        for (var s = 0; s < 3; s++) {
          var v = 8 + nrm(wave(t * (0.9 + s * 0.2), seed + s * 2 + i, i * 1.3)) * (h / 5.4);
          var x = 14 + i * bw, y = h - 12 - acc - v;
          ctx.fillStyle = PALETTE[s];
          ctx.shadowColor = PALETTE[s]; ctx.shadowBlur = 10;
          ctx.fillRect(x + 3, y, bw - 7, v - 2); ctx.shadowBlur = 0;
          acc += v;
        }
      }
    },
    pie: function (ctx, w, h, t, seed) {
      clear(ctx, w, h);
      var cx = w / 2, cy = h / 2 + 4, r = Math.min(w, h) * 0.33;
      var vals = [], total = 0, i;
      for (i = 0; i < 5; i++) { vals.push(1 + nrm(wave(t * 0.7, seed + i, i * 2))); total += vals[i]; }
      var a0 = -Math.PI / 2 + t * 0.15;
      /* 3D depth under-layer */
      for (i = 0; i < 5; i++) {
        var a1 = a0 + (vals[i] / total) * Math.PI * 2;
        ctx.fillStyle = 'rgba(20,8,40,.85)';
        ctx.beginPath(); ctx.moveTo(cx, cy + 12); ctx.arc(cx, cy + 12, r, a0, a1); ctx.closePath(); ctx.fill();
        a0 = a1;
      }
      a0 = -Math.PI / 2 + t * 0.15;
      for (i = 0; i < 5; i++) {
        var a2 = a0 + (vals[i] / total) * Math.PI * 2;
        ctx.fillStyle = PALETTE[i];
        ctx.shadowColor = PALETTE[i]; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a2 - 0.03); ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;
        a0 = a2;
      }
    },
    donut: function (ctx, w, h, t, seed) {
      clear(ctx, w, h);
      var cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.34;
      var vals = [], total = 0, i;
      for (i = 0; i < 4; i++) { vals.push(1 + nrm(wave(t * 0.6, seed + i * 3, i))); total += vals[i]; }
      var a0 = t * 0.2;
      for (i = 0; i < 4; i++) {
        var a1 = a0 + (vals[i] / total) * Math.PI * 2;
        glowStroke(ctx, PALETTE[i], 16, r * 0.34, function (c) {
          c.arc(cx, cy, r * 0.78, a0 + 0.02, a1 - 0.02);
        });
        a0 = a1;
      }
      var pct = Math.round(50 + 48 * nrm(wave(t * 0.9, seed + 9, 2)));
      ctx.fillStyle = '#00f0ff'; ctx.font = '700 26px Orbitron, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 18;
      ctx.fillText(pct + '%', cx, cy); ctx.shadowBlur = 0;
    },
    radar: function (ctx, w, h, t, seed) {
      clear(ctx, w, h);
      var cx = w / 2, cy = h / 2 + 4, R = Math.min(w, h) * 0.36, axes = 6, i, j;
      ctx.strokeStyle = 'rgba(0,240,255,.18)';
      for (j = 1; j <= 3; j++) {
        ctx.beginPath();
        for (i = 0; i <= axes; i++) {
          var a = (Math.PI * 2 * i) / axes - Math.PI / 2;
          var r = (R * j) / 3;
          if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        ctx.stroke();
      }
      for (var s = 0; s < 2; s++) {
        ctx.save();
        ctx.beginPath();
        for (i = 0; i <= axes; i++) {
          var ang = (Math.PI * 2 * i) / axes - Math.PI / 2;
          var rv = R * (0.3 + 0.66 * nrm(wave(t * (1 + s * 0.4), seed + s * 4, i * 1.4 + s)));
          var x = cx + Math.cos(ang) * rv, y = cy + Math.sin(ang) * rv;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = s ? 'rgba(255,45,149,.22)' : 'rgba(0,240,255,.22)';
        ctx.strokeStyle = s ? '#ff2d95' : '#00f0ff'; ctx.lineWidth = 2;
        ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 14;
        ctx.fill(); ctx.stroke(); ctx.restore();
      }
    },
    scatter: function (ctx, w, h, t, seed) {
      clear(ctx, w, h); grid(ctx, w, h, 8, 5);
      var i, sx = 0, sy = 0, sxx = 0, sxy = 0, n = 34;
      var pts = [];
      for (i = 0; i < n; i++) {
        var x = 18 + ((i * 47.3) % 1) * 0 + (w - 36) * ((i * 0.137 + 0.05) % 1);
        var y = h / 2 - wave(t * 0.7, seed + i * 0.31, i * 0.9) * h * 0.3 + Math.sin(i * 2.2) * 8;
        pts.push([x, y]);
        sx += x; sy += y; sxx += x * x; sxy += x * y;
      }
      var m = (n * sxy - sx * sy) / (n * sxx - sx * sx), b = (sy - m * sx) / n;
      glowStroke(ctx, '#ffd000', 12, 2, function (c) {
        c.moveTo(10, m * 10 + b); c.lineTo(w - 10, m * (w - 10) + b);
      });
      for (i = 0; i < n; i++) {
        var col = PALETTE[i % 4];
        ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], 3.2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      }
    },
    bubble: function (ctx, w, h, t, seed) {
      clear(ctx, w, h);
      for (var i = 0; i < 11; i++) {
        var ph = t * 0.6 + i * 1.3;
        var x = w * (0.12 + 0.76 * nrm(wave(t * 0.4, seed + i * 1.7, i)));
        var y = h * (0.18 + 0.64 * nrm(wave(t * 0.5, seed + i * 2.3, i * 2)));
        var r = 8 + nrm(wave(t * 0.8, seed + i, i * 3)) * 24;
        var col = PALETTE[i % 5];
        var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
        g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r + Math.sin(ph) * 2, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    },
    heatmap: function (ctx, w, h, t, seed) {
      clear(ctx, w, h);
      var cols = 9, rows = 5, gx = w / cols, gy = h / rows;
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var v = nrm(wave(t * 0.9, seed + i * 0.6 + j * 2.1, i + j * 1.7));
          var hue = 190 + v * 140;
          ctx.fillStyle = 'hsla(' + hue + ',95%,' + (28 + v * 42) + '%,.92)';
          ctx.shadowColor = 'hsla(' + hue + ',95%,60%,.8)'; ctx.shadowBlur = 12;
          ctx.fillRect(i * gx + 2, j * gy + 2, gx - 4, gy - 4);
          ctx.shadowBlur = 0;
        }
      }
    },
    gauge: function (ctx, w, h, t, seed) {
      clear(ctx, w, h);
      var cx = w / 2, cy = h * 0.62, R = Math.min(w, h) * 0.4;
      glowStroke(ctx, 'rgba(0,240,255,.25)', 8, 12, function (c) {
        c.arc(cx, cy, R, Math.PI * 0.8, Math.PI * 2.2);
      });
      var v = nrm(wave(t * 0.85, seed + 4, 1));
      glowStroke(ctx, v > 0.72 ? '#ff2d95' : '#00f0ff', 22, 12, function (c) {
        c.arc(cx, cy, R, Math.PI * 0.8, Math.PI * 0.8 + v * Math.PI * 1.4);
      });
      var ang = Math.PI * 0.8 + v * Math.PI * 1.4;
      glowStroke(ctx, '#ffd000', 16, 3.4, function (c) {
        c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ang) * R * 0.82, cy + Math.sin(ang) * R * 0.82);
      });
      ctx.fillStyle = '#ffd000'; ctx.font = '700 22px Orbitron, sans-serif';
      ctx.textAlign = 'center'; ctx.shadowColor = '#ffd000'; ctx.shadowBlur = 16;
      ctx.fillText(Math.round(v * 100) + '%', cx, cy + 34); ctx.shadowBlur = 0;
    },
    candle: function (ctx, w, h, t, seed) {
      clear(ctx, w, h); grid(ctx, w, h, 10, 5);
      var n = 13, bw = (w - 26) / n, price = h * 0.5;
      for (var i = 0; i < n; i++) {
        var d = wave(t * 0.9, seed + i * 0.83, i * 1.1);
        var open = price, close = price + d * 26;
        price = close;
        var hi = Math.min(open, close) - 8 - Math.abs(d) * 6;
        var lo = Math.max(open, close) + 8 + Math.abs(wave(t, seed + i, i * 2)) * 6;
        var up = close < open;
        var col = up ? '#8dff2d' : '#ff2d95';
        var x = 13 + i * bw;
        hi = Math.max(10, Math.min(h - 12, hi)); lo = Math.max(10, Math.min(h - 12, lo));
        var top = Math.min(open, close), bot = Math.max(open, close);
        glowStroke(ctx, col, 10, 1.6, function (c) {
          c.moveTo(x + bw / 2, hi); c.lineTo(x + bw / 2, lo);
        });
        ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 12;
        ctx.fillRect(x + 2.5, top, bw - 6, Math.max(3, bot - top)); ctx.shadowBlur = 0;
      }
    },
    polar: function (ctx, w, h, t, seed) {
      clear(ctx, w, h);
      var cx = w / 2, cy = h / 2 + 2, R = Math.min(w, h) * 0.38, n = 12;
      ctx.strokeStyle = 'rgba(0,240,255,.15)';
      for (var j = 1; j <= 3; j++) {
        ctx.beginPath(); ctx.arc(cx, cy, (R * j) / 3, 0, Math.PI * 2); ctx.stroke();
      }
      for (var i = 0; i < n; i++) {
        var a0 = (Math.PI * 2 * i) / n + t * 0.1, a1 = (Math.PI * 2 * (i + 0.86)) / n + t * 0.1;
        var r = R * (0.28 + 0.7 * nrm(wave(t * 1.05, seed + i * 1.1, i)));
        var col = PALETTE[i % 6];
        ctx.fillStyle = col; ctx.globalAlpha = 0.8;
        ctx.shadowColor = col; ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
    },
    funnel: function (ctx, w, h, t, seed) {
      clear(ctx, w, h);
      var n = 5, gap = 6, bh = (h - 20 - gap * (n - 1)) / n;
      for (var i = 0; i < n; i++) {
        var topW = w * (0.82 - i * 0.14) * (0.9 + 0.1 * nrm(wave(t * 0.7, seed + i, i)));
        var botW = w * (0.82 - (i + 1) * 0.14) * (0.9 + 0.1 * nrm(wave(t * 0.7, seed + i + 1, i + 1)));
        var y = 10 + i * (bh + gap);
        var cx = w / 2, col = PALETTE[i % 5];
        var grad = ctx.createLinearGradient(cx - topW / 2, 0, cx + topW / 2, 0);
        grad.addColorStop(0, col); grad.addColorStop(1, 'rgba(20,10,40,.2)');
        ctx.fillStyle = grad; ctx.shadowColor = col; ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(cx - topW / 2, y); ctx.lineTo(cx + topW / 2, y);
        ctx.lineTo(cx + botW / 2, y + bh); ctx.lineTo(cx - botW / 2, y + bh);
        ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      }
    },
    waterfall: function (ctx, w, h, t, seed) {
      clear(ctx, w, h); grid(ctx, w, h, 8, 5);
      var n = 8, bw = (w - 26) / n, acc = h * 0.5;
      for (var i = 0; i < n; i++) {
        var d = wave(t * 1.15, seed + i * 1.3, i * 1.6) * 34;
        var x = 13 + i * bw;
        var y0 = acc, y1 = acc - d;
        acc = y1;
        var up = d > 0, col = up ? '#8dff2d' : '#ff2d95';
        var top = Math.min(y0, y1);
        ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 12;
        ctx.fillRect(x + 3, top, bw - 8, Math.max(3, Math.abs(d))); ctx.shadowBlur = 0;
        if (i < n - 1) {
          ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(x + 3, y1); ctx.lineTo(x + bw + 3, y1); ctx.stroke(); ctx.setLineDash([]);
        }
      }
    },
    network: function (ctx, w, h, t, seed) {
      clear(ctx, w, h);
      var cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.33, nodes = [], i;
      nodes.push([cx, cy]);
      for (i = 0; i < 8; i++) {
        var a = (Math.PI * 2 * i) / 8 + t * 0.12;
        nodes.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
      }
      for (i = 1; i < nodes.length; i++) {
        var pulse = 0.35 + 0.65 * nrm(wave(t * 1.4, seed + i, i));
        ctx.strokeStyle = 'rgba(0,240,255,' + (0.16 + pulse * 0.5) + ')';
        ctx.lineWidth = 1.4; ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 8 * pulse;
        ctx.beginPath(); ctx.moveTo(nodes[0][0], nodes[0][1]); ctx.lineTo(nodes[i][0], nodes[i][1]); ctx.stroke();
        if (i > 1) {
          ctx.beginPath(); ctx.moveTo(nodes[i][0], nodes[i][1]); ctx.lineTo(nodes[i === nodes.length - 1 ? 1 : i + 1][0], nodes[i === nodes.length - 1 ? 1 : i + 1][1]); ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }
      for (i = 0; i < nodes.length; i++) {
        var col = i === 0 ? '#ffd000' : PALETTE[i % 5];
        var r = i === 0 ? 12 : 7 + 3 * nrm(wave(t, seed + i, i));
        ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 16;
        ctx.beginPath(); ctx.arc(nodes[i][0], nodes[i][1], r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      }
    }
  };

  /* ---------------- manager ---------------- */
  var charts = [];
  function init() {
    tip = document.getElementById('chart-tip');
    var canvases = document.querySelectorAll('canvas[data-chart]');
    canvases.forEach(function (c) {
      var type = c.getAttribute('data-chart');
      charts.push({ canvas: c, type: type, seed: charts.length * 3.7 + 1.3, el: c.parentElement });
    });

    /* toolbar wiring */
    var slider = document.getElementById('time-warp');
    var readout = document.getElementById('warp-readout');
    if (slider) {
      slider.addEventListener('input', function () {
        state.scale = Number(slider.value) / 100;
        if (readout) readout.textContent = state.scale.toFixed(2) + '×';
      });
    }
    var chaosBtn = document.getElementById('chaos-btn');
    if (chaosBtn) chaosBtn.addEventListener('click', function () {
      state.chaos = Math.random() * 1000;
      charts.forEach(function (ch) { ch.seed = Math.random() * 40 + state.chaos; });
      if (window.UltraToast) window.UltraToast('4D CHAOS FIELD RESEEDED');
    });
    var freezeBtn = document.getElementById('freeze-btn');
    if (freezeBtn) freezeBtn.addEventListener('click', function () {
      state.frozen = !state.frozen;
      freezeBtn.textContent = state.frozen ? '▶ RESUME TIME' : '❄ FREEZE TIME';
      if (window.UltraToast) window.UltraToast(state.frozen ? 'TIME FROZEN — 4TH DIMENSION HELD' : 'TIME FLOWS AGAIN');
    });

    /* tooltips */
    charts.forEach(function (ch) {
      ch.canvas.addEventListener('mousemove', function (ev) {
        if (!tip) return;
        var r = ch.canvas.getBoundingClientRect();
        var px = ((ev.clientX - r.left) / r.width).toFixed(2);
        var py = (1 - (ev.clientY - r.top) / r.height).toFixed(2);
        tip.textContent = ch.type.toUpperCase() + '  //  X ' + px + '  Y ' + py + '  T ' + state.t.toFixed(2);
        tip.style.opacity = '1';
        tip.style.left = (ev.clientX + 16) + 'px';
        tip.style.top = (ev.clientY + 12) + 'px';
      });
      ch.canvas.addEventListener('mouseleave', function () {
        if (tip) tip.style.opacity = '0';
      });
    });

    /* pause offscreen charts */
    var vis = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var rec = charts.find(function (c) { return c.canvas === e.target; });
        if (rec) rec.visible = e.isIntersecting;
      });
    }, { rootMargin: '120px' });
    charts.forEach(function (ch) { vis.observe(ch.canvas); });

    requestAnimationFrame(loop);
  }

  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!state.frozen) state.t += dt * state.scale;
    for (var i = 0; i < charts.length; i++) {
      var ch = charts[i];
      if (ch.visible === false) continue;
      var fitR = fit(ch.canvas);
      var fn = DRAW[ch.type];
      if (fn) fn(fitR.ctx, fitR.w, fitR.h, state.t, ch.seed);
    }
    requestAnimationFrame(loop);
  }

  window.UltraCharts = {
    reseed: function () {
      charts.forEach(function (ch) { ch.seed = Math.random() * 40; });
    },
    time: function () { return state.t; }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ============================================================
   ULTRA MAX LEVEL // DEEP CORE ENGINE
   3D characters · 3D objects · 3D models · 4D geometry · raw
   ============================================================ */
(function () {
  'use strict';

  /* ================= utilities ================= */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(t) { return t * t * (3 - 2 * t); }

  var toastEl, toastTimer;
  function toast(msg) {
    toastEl = toastEl || document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }
  window.UltraToast = toast;

  /* ================= loader ================= */
  var LOAD_LINES = [
    'BOOT // deep-core v9.infinity',
    'MOUNTING 4D GEOMETRY ENGINE…',
    'FORGING 3D CHARACTERS [NEO-7 · LUMINA · TITAN-X]',
    'ASSEMBLING 3D OBJECT VAULT [8 ARTIFACTS]',
    'SPINNING 16-CHART 4D UNIVERSE',
    'WELDING 3D MODELS [MECH · SERPENT · CITY · KNOT]',
    'IGNITING BLOOM + AFTERIMAGE PIPELINE',
    'SCANNING FOR DEEP SECRET CHANNEL…',
    'ALL SYSTEMS MAX LEVEL ✅'
  ];
  function runLoader() {
    var loader = document.getElementById('loader');
    var pct = document.getElementById('load-pct');
    var log = document.getElementById('load-log');
    if (!loader) return;
    var p = 0, li = 0;
    var iv = setInterval(function () {
      p = Math.min(100, p + Math.random() * 13 + 5);
      if (pct) pct.textContent = Math.floor(p) + '%';
      if (log && li < LOAD_LINES.length && p > (li + 1) * (90 / LOAD_LINES.length)) {
        var d = document.createElement('div');
        d.textContent = '> ' + LOAD_LINES[li++];
        log.appendChild(d);
      }
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(function () {
          loader.classList.add('done');
          document.body.classList.add('ready');
        }, 420);
      }
    }, 170);
  }

  /* ================= cursor / magnetic / reveal ================= */
  function initCursor() {
    var dot = document.getElementById('cursor');
    var ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    }, { passive: true });
    (function trail() {
      rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(trail);
    })();
    document.querySelectorAll('a,button,input,.card,.chart-card,.file-card,.gem,.chip-btn').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('hot'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('hot'); });
    });
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + dx * 0.14 + 'px,' + dy * 0.18 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  function initReveal() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          en.target.querySelectorAll('.bar i[data-w]').forEach(function (bar) {
            bar.style.width = bar.getAttribute('data-w') + '%';
          });
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  function initHud() {
    var clock = document.getElementById('hud-clock');
    setInterval(function () {
      if (clock) clock.textContent = new Date().toTimeString().slice(0, 8);
    }, 1000);
    var progress = document.getElementById('progress');
    var links = document.querySelectorAll('nav.hud-nav a');
    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href');
      if (id && id[0] === '#') {
        var el = document.querySelector(id);
        if (el) sections.push({ el: el, a: a });
      }
    });
    function onScroll() {
      var max = document.documentElement.scrollHeight - innerHeight;
      if (progress) progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
      var best = sections[0], bestD = 1e9;
      sections.forEach(function (s) {
        var d = Math.abs(s.el.getBoundingClientRect().top - 90);
        if (d < bestD) { bestD = d; best = s; }
      });
      if (best) links.forEach(function (a) { a.classList.toggle('active', a === best.a); });
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ================= audio (optional synth) ================= */
  var audio = { ctx: null, master: null, on: false, started: false };
  function ensureAudio() {
    if (audio.ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audio.ctx = new AC();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = 0;
    audio.master.connect(audio.ctx.destination);
    var o1 = audio.ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 55;
    var o2 = audio.ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 55.6;
    var o3 = audio.ctx.createOscillator(); o3.type = 'triangle'; o3.frequency.value = 110.2;
    var filt = audio.ctx.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 220; filt.Q.value = 2;
    var g = audio.ctx.createGain(); g.gain.value = 0.16;
    o1.connect(filt); o2.connect(filt); o3.connect(filt); filt.connect(g); g.connect(audio.master);
    var lfo = audio.ctx.createOscillator(); lfo.frequency.value = 0.07;
    var lfoG = audio.ctx.createGain(); lfoG.gain.value = 90;
    lfo.connect(lfoG); lfoG.connect(filt.frequency);
    o1.start(); o2.start(); o3.start(); lfo.start();
  }
  function blip(freq, dur) {
    if (!audio.ctx || !audio.on) return;
    var t = audio.ctx.currentTime;
    var o = audio.ctx.createOscillator(), g = audio.ctx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.16));
    o.connect(g); g.connect(audio.master);
    o.start(t); o.stop(t + (dur || 0.16) + 0.02);
  }
  function initAudioToggle() {
    var btn = document.getElementById('sound-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      ensureAudio();
      if (!audio.ctx) { toast('AUDIO ENGINE UNAVAILABLE'); return; }
      audio.on = !audio.on;
      btn.classList.toggle('on', audio.on);
      var t = audio.ctx.currentTime;
      audio.master.gain.cancelScheduledValues(t);
      audio.master.gain.linearRampToValueAtTime(audio.on ? 0.22 : 0, t + 0.5);
      toast(audio.on ? 'SYNTH ENGINE ONLINE' : 'SYNTH ENGINE MUTED');
      blip(660, 0.2);
    });
  }

  /* ================= secret unlock ================= */
  function initSecret() {
    var overlay = document.getElementById('unlock');
    var unlocked = false;
    try { unlocked = localStorage.getItem('ultra_secret') === '1'; } catch (e) { }

    function unlock() {
      if (overlay) overlay.classList.add('show');
      try { localStorage.setItem('ultra_secret', '1'); } catch (e) { }
      var foot = document.getElementById('foot-secret');
      if (foot) { foot.textContent = 'DEEP VAULT →'; foot.style.opacity = '1'; }
      toast('CLEARANCE ACCEPTED — VAULT UNLOCKED');
      blip(880, 0.3); blip(1320, 0.4);
    }
    if (unlocked) {
      var foot = document.getElementById('foot-secret');
      if (foot) { foot.textContent = 'DEEP VAULT →'; foot.style.opacity = '1'; }
    }

    var codeBtn = document.getElementById('code-btn');
    var codeInput = document.getElementById('code-input');
    var CODES = ['ULTRA', 'SECRET', 'MAX', '4D', 'AYESH', 'VAULT', 'DEEP', '9999', 'LEVEL'];
    function tryCode() {
      if (!codeInput) return;
      var v = (codeInput.value || '').trim().toUpperCase();
      if (CODES.indexOf(v) !== -1) { unlock(); }
      else { toast('ACCESS DENIED — SIGNAL OBSCURED'); codeInput.value = ''; blip(180, 0.25); }
    }
    if (codeBtn) codeBtn.addEventListener('click', tryCode);
    if (codeInput) codeInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryCode(); });

    /* konami */
    var K = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var ki = 0;
    addEventListener('keydown', function (e) {
      var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === K[ki]) {
        ki++;
        if (ki === K.length) { ki = 0; unlock(); }
      } else ki = (k === K[0]) ? 1 : 0;
    });

    /* hidden gem */
    var gem = document.getElementById('secret-gem');
    if (gem) {
      var hits = 0;
      gem.addEventListener('click', function () {
        hits++;
        blip(440 + hits * 120, 0.12);
        if (hits >= 3) unlock();
        else toast('THE GEM HUMS… (' + hits + '/3)');
      });
    }
  }

  /* ============================================================
     THREE.JS WORLD
     ============================================================ */
  function initWorld() {
    if (!window.THREE || !window.THREE_POST) {
      console.warn('Three.js bundle missing — DOM-only mode.');
      return;
    }
    var T = window.THREE;
    var P = window.THREE_POST;
    var canvas = document.getElementById('world');
    if (!canvas) return;

    var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    var scene = new T.Scene();
    scene.background = new T.Color(0x02030a);
    scene.fog = new T.FogExp2(0x04060f, 0.0075);

    var camera = new T.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 600);
    camera.position.set(0, 2, 38);

    /* lights */
    scene.add(new T.AmbientLight(0x223355, 1.1));
    var key = new T.DirectionalLight(0xbfe8ff, 1.25);
    key.position.set(20, 30, 25);
    scene.add(key);
    var PL = [];
    [[0x00f0ff, 30, 18, 0, 26], [0xff2d95, -34, -70, -14, 30], [0x7b2dff, 30, -150, 16, 30],
     [0xffd000, -28, -230, -12, 30], [0x8dff2d, 22, -310, 14, 28], [0xff2d95, 0, -390, 10, 26]
    ].forEach(function (d) {
      var pl = new T.PointLight(d[0], 2.2, d[4] * 3, 1.6);
      pl.position.set(d[1], d[2], d[3]);
      scene.add(pl);
      PL.push(pl);
    });

    /* ---------- shared textures ---------- */
    function dotTexture() {
      var cv = document.createElement('canvas'); cv.width = cv.height = 64;
      var g = cv.getContext('2d');
      var rg = g.createRadialGradient(32, 32, 2, 32, 32, 30);
      rg.addColorStop(0, 'rgba(255,255,255,1)');
      rg.addColorStop(0.35, 'rgba(160,220,255,.6)');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
      return new T.CanvasTexture(cv);
    }
    var TEX_DOT = dotTexture();

    function labelSprite(text, color) {
      var cv = document.createElement('canvas');
      cv.width = 512; cv.height = 128;
      var g = cv.getContext('2d');
      g.clearRect(0, 0, 512, 128);
      g.font = '700 54px Orbitron, "Share Tech Mono", sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = color; g.shadowBlur = 26;
      g.fillStyle = color;
      g.fillText(text, 256, 64);
      g.fillText(text, 256, 64);
      var tex = new T.CanvasTexture(cv);
      var spr = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.95 }));
      spr.scale.set(9, 2.25, 1);
      return spr;
    }

    function windowTexture() {
      var cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
      var g = cv.getContext('2d');
      g.fillStyle = '#040818'; g.fillRect(0, 0, 64, 64);
      for (var y = 4; y < 64; y += 8) {
        for (var x = 4; x < 64; x += 8) {
          if (Math.random() > 0.42) {
            g.fillStyle = Math.random() > 0.5 ? 'rgba(0,240,255,.95)' : 'rgba(255,45,149,.85)';
            g.fillRect(x, y, 4, 4);
          }
        }
      }
      var t = new T.CanvasTexture(cv);
      t.wrapS = t.wrapT = T.RepeatWrapping;
      return t;
    }

    /* ---------- starfield + galaxy ---------- */
    function buildStars() {
      var N = 2600;
      var pos = new Float32Array(N * 3);
      var col = new Float32Array(N * 3);
      var c1 = new T.Color(0x00f0ff), c2 = new T.Color(0xff2d95), c3 = new T.Color(0xbfe8ff), cTmp = new T.Color();
      for (var i = 0; i < N; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 260;
        pos[i * 3 + 1] = 60 - Math.random() * 540;
        pos[i * 3 + 2] = -160 + Math.random() * 220;
        var r = Math.random();
        cTmp.copy(r < 0.4 ? c1 : (r < 0.7 ? c3 : c2));
        col[i * 3] = cTmp.r; col[i * 3 + 1] = cTmp.g; col[i * 3 + 2] = cTmp.b;
      }
      var geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      geo.setAttribute('color', new T.BufferAttribute(col, 3));
      var mat = new T.PointsMaterial({
        size: 1.35, map: TEX_DOT, vertexColors: true, transparent: true,
        opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: true
      });
      return new T.Points(geo, mat);
    }
    scene.add(buildStars());

    var galaxy = (function () {
      var N = 2200;
      var pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
      var a = new T.Color(0x7b2dff), b = new T.Color(0x00f0ff), c = new T.Color(0xff2d95), tmp = new T.Color();
      for (var i = 0; i < N; i++) {
        var arm = i % 3, r = Math.pow(Math.random(), 0.7) * 42;
        var ang = (r * 0.14) + arm * (Math.PI * 2 / 3) + (Math.random() - 0.5) * 0.55;
        pos[i * 3] = Math.cos(ang) * r;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 4.2 * (1 - r / 60);
        pos[i * 3 + 2] = Math.sin(ang) * r;
        tmp.copy(r < 14 ? c : (r < 28 ? b : a));
        col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
      }
      var geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      geo.setAttribute('color', new T.BufferAttribute(col, 3));
      var mat = new T.PointsMaterial({
        size: 1.7, map: TEX_DOT, vertexColors: true, transparent: true,
        opacity: 0.75, depthWrite: false, blending: T.AdditiveBlending
      });
      var pts = new T.Points(geo, mat);
      pts.rotation.x = 0.42;
      return pts;
    })();
    galaxy.position.set(0, -6, -26);
    scene.add(galaxy);

    /* floating debris along the journey */
    var debris = [];
    (function () {
      var geos = [new T.TetrahedronGeometry(0.9), new T.BoxGeometry(1, 1, 1), new T.OctahedronGeometry(1)];
      for (var i = 0; i < 64; i++) {
        var m = new T.Mesh(
          geos[i % 3],
          new T.MeshStandardMaterial({
            color: 0x14244a, metalness: 0.85, roughness: 0.35,
            emissive: i % 5 === 0 ? 0x00f0ff : 0x0a1030, emissiveIntensity: i % 5 === 0 ? 0.5 : 0.12
          })
        );
        m.position.set((Math.random() - 0.5) * 90, 20 - Math.random() * 470, -30 + Math.random() * 46);
        m.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        var s = 0.5 + Math.random() * 1.6;
        m.scale.setScalar(s);
        scene.add(m);
        debris.push(m);
      }
    })();

    /* ============================================================
       4D TESSERACT (hypercube) — rotates in XW/YW/ZW, projects 4D→3D
       ============================================================ */
    function buildTesseract(scale, colorA, colorB) {
      var verts4 = [];
      for (var i = 0; i < 16; i++) {
        verts4.push([(i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1, (i & 8) ? 1 : -1]);
      }
      var edges = [];
      for (i = 0; i < 16; i++) {
        for (var b = 0; b < 4; b++) {
          var j = i ^ (1 << b);
          if (j > i) edges.push([i, j]);
        }
      }
      var positions = new Float32Array(edges.length * 2 * 3);
      var colors = new Float32Array(edges.length * 2 * 3);
      var geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(positions, 3));
      geo.setAttribute('color', new T.BufferAttribute(colors, 3));
      var mat = new T.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.95,
        blending: T.AdditiveBlending, depthWrite: false
      });
      var lines = new T.LineSegments(geo, mat);

      var nodeGeo = new T.SphereGeometry(0.13 * scale, 10, 10);
      var nodeMat = new T.MeshBasicMaterial({ color: colorB });
      var nodes = new T.InstancedMesh(nodeGeo, nodeMat, 16);
      var dummy = new T.Object3D();
      var cA = new T.Color(colorA), cB = new T.Color(colorB), cT = new T.Color();

      function project4(v, ang, dist) {
        var x = v[0], y = v[1], z = v[2], w = v[3], c, s, n;
        c = Math.cos(ang.xw); s = Math.sin(ang.xw);
        n = x * c - w * s; w = x * s + w * c; x = n;
        c = Math.cos(ang.yw); s = Math.sin(ang.yw);
        n = y * c - w * s; w = y * s + w * c; y = n;
        c = Math.cos(ang.zw); s = Math.sin(ang.zw);
        n = z * c - w * s; w = z * s + w * c; z = n;
        c = Math.cos(ang.xy); s = Math.sin(ang.xy);
        n = x * c - y * s; y = x * s + y * c; x = n;
        var k = dist / (dist - w);
        return [x * k * scale, y * k * scale, z * k * scale];
      }

      var group = new T.Group();
      group.add(lines);
      group.add(nodes);

      group.userData.update = function (t) {
        var ang = {
          xw: t * 0.42, yw: t * 0.31, zw: t * 0.23, xy: t * 0.14
        };
        var proj = [];
        for (var k = 0; k < 16; k++) proj.push(project4(verts4[k], ang, 3.1));
        for (k = 0; k < edges.length; k++) {
          var p0 = proj[edges[k][0]], p1 = proj[edges[k][1]];
          positions[k * 6 + 0] = p0[0]; positions[k * 6 + 1] = p0[1]; positions[k * 6 + 2] = p0[2];
          positions[k * 6 + 3] = p1[0]; positions[k * 6 + 4] = p1[1]; positions[k * 6 + 5] = p1[2];
          var dz = (p0[2] + p1[2]) * 0.5 / scale;
          cT.copy(cA).lerp(cB, clamp((dz + 3) / 6, 0, 1));
          colors[k * 6 + 0] = cT.r; colors[k * 6 + 1] = cT.g; colors[k * 6 + 2] = cT.b;
          colors[k * 6 + 3] = cT.r; colors[k * 6 + 4] = cT.g; colors[k * 6 + 5] = cT.b;
        }
        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;
        for (k = 0; k < 16; k++) {
          dummy.position.set(proj[k][0], proj[k][1], proj[k][2]);
          dummy.scale.setScalar(0.8 + 0.4 * Math.sin(t * 3 + k));
          dummy.updateMatrix();
          nodes.setMatrixAt(k, dummy.matrix);
        }
        nodes.instanceMatrix.needsUpdate = true;
      };
      return group;
    }

    /* ============================================================
       3D CHARACTER builder
       ============================================================ */
    function buildCharacter(opts) {
      var g = new T.Group();
      var glow = new T.Color(opts.glow);
      var matP = new T.MeshStandardMaterial({
        color: opts.primary, metalness: 0.72, roughness: 0.32,
        emissive: glow, emissiveIntensity: 0.22
      });
      var matS = new T.MeshStandardMaterial({
        color: opts.secondary, metalness: 0.85, roughness: 0.28,
        emissive: glow, emissiveIntensity: 0.12
      });
      var matGlow = new T.MeshBasicMaterial({ color: glow });
      var bulk = opts.bulk || 1;

      var body = new T.Group();
      g.add(body);

      /* legs */
      var legs = [];
      [-1, 1].forEach(function (side) {
        var hip = new T.Group();
        hip.position.set(side * 0.62 * bulk, 2.35 * bulk, 0);
        var thigh = new T.Mesh(new T.BoxGeometry(0.55 * bulk, 1.35 * bulk, 0.6 * bulk), matP);
        thigh.position.y = -0.62 * bulk;
        hip.add(thigh);
        var knee = new T.Group();
        knee.position.y = -1.28 * bulk;
        hip.add(knee);
        var kneeBall = new T.Mesh(new T.SphereGeometry(0.32 * bulk, 12, 12), matS);
        knee.add(kneeBall);
        var shin = new T.Mesh(new T.BoxGeometry(0.48 * bulk, 1.3 * bulk, 0.52 * bulk), matP);
        shin.position.y = -0.72 * bulk;
        knee.add(shin);
        var foot = new T.Mesh(new T.BoxGeometry(0.6 * bulk, 0.28 * bulk, 1.05 * bulk), matS);
        foot.position.set(0, -1.42 * bulk, 0.22 * bulk);
        knee.add(foot);
        var ankleGlow = new T.Mesh(new T.BoxGeometry(0.5 * bulk, 0.07 * bulk, 0.12 * bulk), matGlow);
        ankleGlow.position.set(0, -1.2 * bulk, 0.34 * bulk);
        knee.add(ankleGlow);
        body.add(hip);
        legs.push({ hip: hip, knee: knee, side: side });
      });

      /* pelvis + torso */
      var pelvis = new T.Mesh(new T.BoxGeometry(1.35 * bulk, 0.62 * bulk, 0.85 * bulk), matS);
      pelvis.position.y = 2.55 * bulk;
      body.add(pelvis);
      var torso = new T.Mesh(new T.BoxGeometry(1.7 * bulk, 1.85 * bulk, 1.0 * bulk), matP);
      torso.position.y = 3.75 * bulk;
      body.add(torso);
      var chestPlate = new T.Mesh(new T.BoxGeometry(1.15 * bulk, 1.1 * bulk, 0.16 * bulk), matS);
      chestPlate.position.set(0, 3.85 * bulk, 0.56 * bulk);
      body.add(chestPlate);
      var core = new T.Mesh(new T.SphereGeometry(0.34 * bulk, 16, 16), matGlow);
      core.position.set(0, 3.9 * bulk, 0.7 * bulk);
      body.add(core);
      var coreLight = new T.PointLight(glow, 1.6, 14, 1.8);
      coreLight.position.copy(core.position);
      body.add(coreLight);

      /* shoulder pads + arms */
      var arms = [];
      [-1, 1].forEach(function (side) {
        var sh = new T.Group();
        sh.position.set(side * 1.12 * bulk, 4.42 * bulk, 0);
        var pad = new T.Mesh(new T.SphereGeometry(0.5 * bulk, 14, 14), matS);
        pad.scale.set(1.15, 0.85, 1.1);
        sh.add(pad);
        var padGlow = new T.Mesh(new T.BoxGeometry(0.7 * bulk, 0.08 * bulk, 0.16 * bulk), matGlow);
        padGlow.position.y = 0.42 * bulk;
        sh.add(padGlow);
        var upper = new T.Mesh(new T.BoxGeometry(0.42 * bulk, 1.15 * bulk, 0.48 * bulk), matP);
        upper.position.y = -0.72 * bulk;
        sh.add(upper);
        var elbow = new T.Group();
        elbow.position.y = -1.3 * bulk;
        sh.add(elbow);
        var eBall = new T.Mesh(new T.SphereGeometry(0.26 * bulk, 10, 10), matS);
        elbow.add(eBall);
        var fore = new T.Mesh(new T.BoxGeometry(0.38 * bulk, 1.05 * bulk, 0.42 * bulk), matP);
        fore.position.y = -0.62 * bulk;
        elbow.add(fore);
        var hand = new T.Mesh(new T.SphereGeometry(0.3 * bulk, 12, 12), matS);
        hand.position.y = -1.22 * bulk;
        elbow.add(hand);
        var handGlow = new T.Mesh(new T.SphereGeometry(0.16 * bulk, 10, 10), matGlow);
        handGlow.position.y = -1.22 * bulk;
        handGlow.position.z = 0.22 * bulk;
        elbow.add(handGlow);
        body.add(sh);
        arms.push({ sh: sh, elbow: elbow, side: side });
      });

      /* head */
      var neck = new T.Mesh(new T.CylinderGeometry(0.26 * bulk, 0.32 * bulk, 0.4 * bulk, 12), matS);
      neck.position.y = 4.85 * bulk;
      body.add(neck);
      var headG = new T.Group();
      headG.position.y = 5.5 * bulk;
      body.add(headG);
      var skull = new T.Mesh(new T.BoxGeometry(1.05 * bulk, 1.0 * bulk, 1.0 * bulk), matP);
      headG.add(skull);
      var visor = new T.Mesh(new T.BoxGeometry(0.92 * bulk, 0.3 * bulk, 0.1 * bulk), matGlow);
      visor.position.set(0, 0.1 * bulk, 0.52 * bulk);
      headG.add(visor);
      var eyeL = new T.Mesh(new T.SphereGeometry(0.1 * bulk, 10, 10), matGlow);
      eyeL.position.set(-0.22 * bulk, 0.12 * bulk, 0.58 * bulk);
      headG.add(eyeL);
      var eyeR = eyeL.clone();
      eyeR.position.x = 0.22 * bulk;
      headG.add(eyeR);
      var crest = new T.Mesh(new T.BoxGeometry(0.14 * bulk, 0.34 * bulk, 0.9 * bulk), matS);
      crest.position.y = 0.62 * bulk;
      headG.add(crest);
      [-1, 1].forEach(function (s) {
        var ear = new T.Mesh(new T.CylinderGeometry(0.17 * bulk, 0.17 * bulk, 0.12 * bulk, 12), matS);
        ear.rotation.z = Math.PI / 2;
        ear.position.x = s * 0.58 * bulk;
        headG.add(ear);
      });
      var antenna = new T.Mesh(new T.CylinderGeometry(0.03 * bulk, 0.03 * bulk, 0.75 * bulk, 8), matS);
      antenna.position.set(0.35 * bulk, 0.85 * bulk, 0);
      antenna.rotation.z = -0.35;
      headG.add(antenna);
      var antennaTip = new T.Mesh(new T.SphereGeometry(0.09 * bulk, 8, 8), matGlow);
      antennaTip.position.set(0.48 * bulk, 1.18 * bulk, 0);
      headG.add(antennaTip);

      /* style extras */
      if (opts.crest === 'horns') {
        [-1, 1].forEach(function (s) {
          var horn = new T.Mesh(new T.ConeGeometry(0.18 * bulk, 1.1 * bulk, 10), matS);
          horn.position.set(s * 0.45 * bulk, 0.85 * bulk, -0.1 * bulk);
          horn.rotation.z = s * -0.55;
          headG.add(horn);
        });
        var belt = new T.Mesh(new T.BoxGeometry(1.5 * bulk, 0.3 * bulk, 0.95 * bulk), matS);
        belt.position.y = 2.55 * bulk;
        body.add(belt);
      }
      if (opts.crest === 'crystal') {
        for (var ci = 0; ci < 7; ci++) {
          var shard = new T.Mesh(new T.ConeGeometry(0.16 * bulk, 1.1 * bulk + Math.random() * 0.8, 6), matGlow);
          var ax = (Math.random() - 0.5) * 1.6 * bulk;
          var ay = 3.2 * bulk + Math.random() * 1.9 * bulk;
          shard.position.set(ax, ay, -0.72 * bulk - Math.random() * 0.5);
          shard.rotation.set(Math.PI / 2 + (Math.random() - 0.5), 0, (Math.random() - 0.5) * 1.2);
          body.add(shard);
        }
        var halo = new T.Mesh(new T.TorusGeometry(0.95 * bulk, 0.05 * bulk, 10, 40), matGlow);
        halo.position.y = 6.45 * bulk;
        halo.rotation.x = Math.PI / 2;
        body.add(halo);
      }

      g.userData.update = function (t) {
        var ph = opts.phase || 0;
        body.position.y = Math.sin(t * 1.15 + ph) * 0.14;
        body.rotation.y = Math.sin(t * 0.32 + ph) * 0.18;
        headG.rotation.y = Math.sin(t * 0.55 + ph) * 0.55;
        headG.rotation.x = Math.sin(t * 0.4 + ph * 1.3) * 0.16;
        arms.forEach(function (a, i) {
          a.sh.rotation.x = Math.sin(t * 1.05 + ph + i * Math.PI) * 0.32 - 0.12;
          a.sh.rotation.z = a.side * (0.16 + Math.sin(t * 0.8 + ph) * 0.07);
          a.elbow.rotation.x = -0.55 + Math.sin(t * 1.2 + ph + i * 1.7) * 0.28;
        });
        legs.forEach(function (l, i) {
          l.hip.rotation.x = Math.sin(t * 1.05 + ph + i * Math.PI) * 0.16;
          l.knee.rotation.x = 0.12 + Math.max(0, Math.sin(t * 1.05 + ph + i * Math.PI)) * 0.22;
        });
        var pulse = 1 + Math.sin(t * 3.1 + ph) * 0.14;
        core.scale.setScalar(pulse);
        coreLight.intensity = 1.25 + Math.sin(t * 3.1 + ph) * 0.55;
        matGlow.color.copy(glow).multiplyScalar(0.85 + 0.3 * Math.sin(t * 2.4 + ph));
      };
      return g;
    }

    /* platforms for characters */
    function buildPlatform(color, lightColor) {
      var grp = new T.Group();
      var base = new T.Mesh(
        new T.CylinderGeometry(3.4, 3.9, 0.55, 42),
        new T.MeshStandardMaterial({ color: 0x0c1834, metalness: 0.9, roughness: 0.28 })
      );
      grp.add(base);
      var ring = new T.Mesh(
        new T.TorusGeometry(3.25, 0.09, 12, 64),
        new T.MeshBasicMaterial({ color: color })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.32;
      grp.add(ring);
      var ring2 = new T.Mesh(new T.TorusGeometry(2.35, 0.05, 10, 48), new T.MeshBasicMaterial({ color: lightColor, transparent: true, opacity: 0.8 }));
      ring2.rotation.x = Math.PI / 2;
      ring2.position.y = 0.34;
      grp.add(ring2);
      return grp;
    }

    /* ============================================================
       ZONE 0 — HERO
       ============================================================ */
    var animators = [];
    var heroTesseract = buildTesseract(2.6, 0x00f0ff, 0xff2d95);
    heroTesseract.position.set(0, 3, -6);
    scene.add(heroTesseract);
    animators.push(heroTesseract.userData.update);

    var heroCore = new T.Mesh(
      new T.IcosahedronGeometry(1.7, 2),
      new T.MeshStandardMaterial({ color: 0x0a1e4a, emissive: 0x00f0ff, emissiveIntensity: 1.35, metalness: 0.4, roughness: 0.25 })
    );
    heroCore.position.copy(heroTesseract.position);
    scene.add(heroCore);
    animators.push(function (t) {
      heroCore.rotation.y = t * 0.6;
      heroCore.rotation.x = t * 0.24;
      heroCore.scale.setScalar(1 + Math.sin(t * 2.2) * 0.09);
    });

    var heroRings = new T.Group();
    heroRings.position.copy(heroTesseract.position);
    for (var hr = 0; hr < 3; hr++) {
      var ringMesh = new T.Mesh(
        new T.TorusGeometry(6.2 + hr * 1.5, 0.07 + hr * 0.02, 12, 90),
        new T.MeshBasicMaterial({ color: hr === 1 ? 0xff2d95 : 0x00f0ff, transparent: true, opacity: 0.75 })
      );
      ringMesh.rotation.set(hr * 0.9, hr * 0.6, hr * 0.4);
      heroRings.add(ringMesh);
    }
    scene.add(heroRings);
    animators.push(function (t) {
      heroRings.rotation.y = t * 0.22;
      heroRings.rotation.z = Math.sin(t * 0.2) * 0.35;
    });

    /* two flanking hero characters */
    var heroCharL = buildCharacter({ primary: 0x11335f, secondary: 0x0a1830, glow: 0x00f0ff, bulk: 1.05, crest: 'none', phase: 0 });
    heroCharL.position.set(-14.5, -2, 2);
    heroCharL.rotation.y = 0.55;
    scene.add(heroCharL);
    animators.push(heroCharL.userData.update);
    var heroCharR = buildCharacter({ primary: 0x4a0f36, secondary: 0x26081e, glow: 0xff2d95, bulk: 1.05, crest: 'none', phase: 2.1 });
    heroCharR.position.set(14.5, -2, 2);
    heroCharR.rotation.y = -0.55;
    scene.add(heroCharR);
    animators.push(heroCharR.userData.update);

    /* ============================================================
       ZONE 1 — 3D CHARACTER LAB
       ============================================================ */
    var ZONE_CHARS_Y = -80;
    var charDefs = [
      { x: -13, z: 0, glow: 0x00f0ff, primary: 0x11335f, secondary: 0x0a1830, crest: 'none', name: 'NEO-7', color: '#00f0ff' },
      { x: 0, z: -4, glow: 0xff2d95, primary: 0x4a0f36, secondary: 0x26081e, crest: 'crystal', name: 'LUMINA', color: '#ff2d95' },
      { x: 13, z: 0, glow: 0xffd000, primary: 0x4a3808, secondary: 0x241c04, crest: 'horns', name: 'TITAN-X', color: '#ffd000' }
    ];
    charDefs.forEach(function (d, i) {
      var plat = buildPlatform(d.glow, 0xffffff);
      plat.position.set(d.x, ZONE_CHARS_Y - 7.2, d.z);
      scene.add(plat);
      var ch = buildCharacter({ primary: d.primary, secondary: d.secondary, glow: d.glow, bulk: i === 2 ? 1.28 : 1, crest: d.crest, phase: i * 1.9 });
      ch.position.set(d.x, ZONE_CHARS_Y - 6.7, d.z);
      scene.add(ch);
      animators.push(ch.userData.update);
      var lbl = labelSprite(d.name, d.color);
      lbl.position.set(d.x, ZONE_CHARS_Y + 6.4, d.z);
      scene.add(lbl);
    });

    /* drones around characters */
    for (var di = 0; di < 6; di++) {
      (function (i) {
        var drone = new T.Group();
        var ball = new T.Mesh(new T.SphereGeometry(0.42, 14, 14), new T.MeshStandardMaterial({
          color: 0x12244c, metalness: 0.9, roughness: 0.25, emissive: 0x00f0ff, emissiveIntensity: 0.4
        }));
        drone.add(ball);
        var orb = new T.Mesh(new T.SphereGeometry(0.16, 10, 10), new T.MeshBasicMaterial({ color: i % 2 ? 0xff2d95 : 0x00f0ff }));
        orb.position.y = 0.55;
        drone.add(orb);
        var halo = new T.Mesh(new T.TorusGeometry(0.7, 0.045, 8, 32), new T.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.7 }));
        halo.rotation.x = Math.PI / 2;
        drone.add(halo);
        drone.position.set(-18 + i * 7.5, ZONE_CHARS_Y + 2, 6);
        scene.add(drone);
        animators.push(function (t) {
          var a = t * 0.6 + i * 1.15;
          drone.position.x = -18 + i * 7.5 + Math.cos(a) * 2.4;
          drone.position.y = ZONE_CHARS_Y + 2 + Math.sin(t * 1.1 + i) * 1.3;
          drone.position.z = 6 + Math.sin(a) * 2.2;
          halo.rotation.z = t * 2 + i;
          drone.rotation.y = t * 1.5 + i;
        });
      })(di);
    }

    /* ============================================================
       ZONE 2 — 3D OBJECT VAULT
       ============================================================ */
    var ZONE_OBJ_Y = -160;

    function pedestal(x, z, color, label) {
      var grp = new T.Group();
      var p = new T.Mesh(
        new T.CylinderGeometry(2.1, 2.5, 1.2, 28),
        new T.MeshStandardMaterial({ color: 0x0c1834, metalness: 0.92, roughness: 0.3 })
      );
      grp.add(p);
      var r = new T.Mesh(new T.TorusGeometry(1.85, 0.07, 10, 48), new T.MeshBasicMaterial({ color: color }));
      r.rotation.x = Math.PI / 2;
      r.position.y = 0.62;
      grp.add(r);
      var lbl = labelSprite(label, '#' + new T.Color(color).getHexString());
      lbl.position.y = 5.6;
      lbl.scale.set(6.4, 1.6, 1);
      grp.add(lbl);
      grp.position.set(x, ZONE_OBJ_Y - 4.5, z);
      scene.add(grp);
      return grp;
    }

    var objAnim = [];
    function addObject(x, z, color, label, buildFn) {
      pedestal(x, z, color, label);
      var o = buildFn();
      o.position.set(x, ZONE_OBJ_Y - 1, z);
      scene.add(o);
      objAnim.push(o);
      return o;
    }

    addObject(-15, 6, 0x00f0ff, 'VOID CRYSTAL', function () {
      var g = new T.Group();
      var core = new T.Mesh(new T.IcosahedronGeometry(1.65, 0), new T.MeshStandardMaterial({
        color: 0x0a2c4a, emissive: 0x00c8ff, emissiveIntensity: 1.1, metalness: 0.35, roughness: 0.2, flatShading: true
      }));
      g.add(core);
      for (var i = 0; i < 7; i++) {
        var shard = new T.Mesh(new T.ConeGeometry(0.22, 1.4 + Math.random(), 6), new T.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.85 }));
        var a = (i / 7) * Math.PI * 2;
        shard.position.set(Math.cos(a) * 2.3, (Math.random() - 0.5) * 1.6, Math.sin(a) * 2.3);
        shard.rotation.set(Math.PI / 2 + Math.random(), 0, a);
        g.add(shard);
      }
      return g;
    });

    addObject(-5, -6, 0xffd000, 'PHOTON BLADE', function () {
      var g = new T.Group();
      var blade = new T.Mesh(new T.BoxGeometry(0.42, 5.6, 0.12), new T.MeshBasicMaterial({ color: 0xffe066 }));
      blade.position.y = 1.6;
      g.add(blade);
      var tip = new T.Mesh(new T.ConeGeometry(0.21, 0.9, 4), new T.MeshBasicMaterial({ color: 0xfff3b0 }));
      tip.position.y = 4.85;
      tip.rotation.y = Math.PI / 4;
      g.add(tip);
      var guard = new T.Mesh(new T.BoxGeometry(1.8, 0.22, 0.5), new T.MeshStandardMaterial({
        color: 0x8a6a10, metalness: 0.95, roughness: 0.25, emissive: 0x442e00, emissiveIntensity: 0.4
      }));
      guard.position.y = -1.35;
      g.add(guard);
      var hilt = new T.Mesh(new T.CylinderGeometry(0.19, 0.22, 1.5, 12), new T.MeshStandardMaterial({
        color: 0x221a08, metalness: 0.9, roughness: 0.4
      }));
      hilt.position.y = -2.25;
      g.add(hilt);
      var gem = new T.Mesh(new T.SphereGeometry(0.24, 12, 12), new T.MeshBasicMaterial({ color: 0xff2d95 }));
      gem.position.y = -1.12;
      g.add(gem);
      var light = new T.PointLight(0xffd000, 2.2, 16, 1.7);
      light.position.y = 1.4;
      g.add(light);
      return g;
    });

    addObject(5, 6, 0x8dff2d, 'GEAR TRINITY', function () {
      var g = new T.Group();
      for (var i = 0; i < 3; i++) {
        var gear = new T.Group();
        var torus = new T.Mesh(new T.TorusGeometry(1.65 - i * 0.42, 0.17, 10, 36), new T.MeshStandardMaterial({
          color: 0x1c3a10, metalness: 0.92, roughness: 0.3, emissive: 0x3fa010, emissiveIntensity: 0.35
        }));
        gear.add(torus);
        var teeth = 12 - i * 2;
        for (var k = 0; k < teeth; k++) {
          var tooth = new T.Mesh(new T.BoxGeometry(0.3, 0.42, 0.32), torus.material);
          var a = (k / teeth) * Math.PI * 2;
          tooth.position.set(Math.cos(a) * (1.65 - i * 0.42), Math.sin(a) * (1.65 - i * 0.42), 0);
          tooth.rotation.z = a;
          gear.add(tooth);
        }
        gear.position.z = i * 0.55 - 0.55;
        gear.rotation.x = i * 0.5;
        g.add(gear);
      }
      return g;
    });

    addObject(15, -6, 0xff2d95, 'QUANTUM POTION', function () {
      var g = new T.Group();
      var glass = new T.Mesh(new T.SphereGeometry(1.85, 28, 28), new T.MeshStandardMaterial({
        color: 0x3a0a28, metalness: 0.25, roughness: 0.12, transparent: true, opacity: 0.42,
        emissive: 0xff2d95, emissiveIntensity: 0.5
      }));
      g.add(glass);
      for (var i = 0; i < 9; i++) {
        var drop = new T.Mesh(new T.SphereGeometry(0.16 + Math.random() * 0.2, 10, 10), new T.MeshBasicMaterial({ color: 0xff6ad0, transparent: true, opacity: 0.9 }));
        drop.position.set((Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 2.4);
        g.add(drop);
      }
      var halo = new T.Mesh(new T.TorusGeometry(2.35, 0.08, 10, 56), new T.MeshBasicMaterial({ color: 0xff2d95 }));
      halo.rotation.x = Math.PI / 2.4;
      g.add(halo);
      var neck = new T.Mesh(new T.CylinderGeometry(0.42, 0.62, 0.9, 16), new T.MeshStandardMaterial({
        color: 0x123a56, metalness: 0.85, roughness: 0.3
      }));
      neck.position.y = 2.05;
      g.add(neck);
      return g;
    });

    addObject(-15, -6, 0x7b2dff, 'RINGED PLANET', function () {
      var g = new T.Group();
      var planet = new T.Mesh(new T.SphereGeometry(1.9, 32, 32), new T.MeshStandardMaterial({
        color: 0x2a1a66, metalness: 0.25, roughness: 0.55, emissive: 0x4422aa, emissiveIntensity: 0.42
      }));
      g.add(planet);
      for (var i = 0; i < 2; i++) {
        var ring = new T.Mesh(new T.TorusGeometry(2.9 + i * 0.55, 0.13, 10, 72), new T.MeshBasicMaterial({
          color: i ? 0x00f0ff : 0x9a6bff, transparent: true, opacity: 0.85
        }));
        ring.rotation.x = Math.PI / 2.15 + i * 0.08;
        g.add(ring);
      }
      var moonPivot = new T.Group();
      g.add(moonPivot);
      var moon = new T.Mesh(new T.SphereGeometry(0.45, 14, 14), new T.MeshStandardMaterial({
        color: 0x8899bb, metalness: 0.6, roughness: 0.45, emissive: 0x223355, emissiveIntensity: 0.4
      }));
      moon.position.x = 4.3;
      moonPivot.add(moon);
      moonPivot.rotation.x = 0.42;
      g.userData.moonPivot = moonPivot;
      return g;
    });

    addObject(-5, 6, 0x00f0ff, 'TIME HOURGLASS', function () {
      var g = new T.Group();
      var glassMat = new T.MeshStandardMaterial({
        color: 0x77d8ff, metalness: 0.15, roughness: 0.08, transparent: true, opacity: 0.3
      });
        var top = new T.Mesh(new T.ConeGeometry(1.55, 1.9, 24), glassMat);
      top.position.y = 1.15;
      g.add(top);
      var bot = new T.Mesh(new T.ConeGeometry(1.55, 1.9, 24), glassMat);
      bot.position.y = -1.15;
      bot.rotation.x = Math.PI;
      g.add(bot);
      var capT = new T.Mesh(new T.CylinderGeometry(1.75, 1.75, 0.28, 26), new T.MeshStandardMaterial({
        color: 0x0c2c44, metalness: 0.9, roughness: 0.3, emissive: 0x00f0ff, emissiveIntensity: 0.3
      }));
      capT.position.y = 2.25;
      g.add(capT);
      var capB = capT.clone();
      capB.position.y = -2.25;
      g.add(capB);
      var sand = new T.Mesh(new T.ConeGeometry(1.05, 1.35, 18), new T.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.75 }));
      sand.position.y = 1.15;
      g.add(sand);
      var sand2 = new T.Mesh(new T.ConeGeometry(1.15, 0.9, 18), new T.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.75 }));
      sand2.position.y = -1.55;
      sand2.rotation.x = Math.PI;
      g.add(sand2);
      return g;
    });

    addObject(5, -6, 0xffd000, 'FRACTAL CUBE', function () {
      var g = new T.Group();
      for (var i = 0; i < 5; i++) {
        var size = 3.2 - i * 0.58;
        var cube = new T.Mesh(new T.BoxGeometry(size, size, size), new T.MeshStandardMaterial({
          color: 0x2c2208, metalness: 0.9, roughness: 0.25,
          emissive: i % 2 ? 0xffd000 : 0xff2d95, emissiveIntensity: 0.32,
          wireframe: i % 2 === 1
        }));
        cube.rotation.set(i * 0.4, i * 0.55, i * 0.3);
        cube.userData.spin = (i % 2 ? -1 : 1) * (0.22 + i * 0.1);
        g.add(cube);
      }
      return g;
    });

    addObject(15, 6, 0xff2d95, 'CHAOS KNOT', function () {
      var g = new T.Group();
      var knot = new T.Mesh(new T.TorusKnotGeometry(1.75, 0.5, 120, 16, 3, 8), new T.MeshStandardMaterial({
        color: 0x4a0f36, metalness: 0.88, roughness: 0.22, emissive: 0xff2d95, emissiveIntensity: 0.55
      }));
      g.add(knot);
      var ghost = new T.Mesh(new T.TorusKnotGeometry(1.75, 0.62, 90, 12, 3, 8), new T.MeshBasicMaterial({
        color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.35
      }));
      g.add(ghost);
      return g;
    });

    /* animate objects */
    animators.push(function (t) {
      objAnim.forEach(function (o, i) {
        o.rotation.y = t * (0.32 + (i % 3) * 0.12) * (i % 2 ? -1 : 1);
        o.position.y = ZONE_OBJ_Y - 1 + Math.sin(t * 1.1 + i * 1.3) * 0.55;
        if (o.userData.moonPivot) o.userData.moonPivot.rotation.y = t * 1.2;
        o.children.forEach(function (c) {
          if (c.userData.spin) {
            c.rotation.x += c.userData.spin * 0.016;
            c.rotation.y += c.userData.spin * 0.011;
          }
        });
      });
    });

    /* ============================================================
       ZONE 3 — 4D CHART SPACE (3D charts + mini tesseract)
       ============================================================ */
    var ZONE_CHART_Y = -240;

    /* ground grid */
    var gridHelper = new T.GridHelper(64, 32, 0x00f0ff, 0x0a2c4a);
    gridHelper.position.set(0, ZONE_CHART_Y - 8, 0);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.35;
    scene.add(gridHelper);

    /* 3D BAR CHART */
    var bars = [];
    (function () {
      var g = new T.Group();
      for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 3; j++) {
          var mat = new T.MeshStandardMaterial({
            color: 0x0a2038, metalness: 0.7, roughness: 0.3,
            emissive: (i + j) % 2 ? 0x00c8ff : 0x7b2dff, emissiveIntensity: 0.65
          });
          var bar = new T.Mesh(new T.BoxGeometry(1.15, 1, 1.15), mat);
          bar.position.set(i * 1.6 - 5.6, ZONE_CHART_Y - 5.4, j * 1.6 - 1.6);
          bar.scale.y = 2 + (i * 0.37 + j * 0.91) % 3;
          bar.userData.base = bar.scale.y;
          scene.add(bar);
          bars.push(bar);
        }
      }
    })();

    /* 3D LINE CHARTS (glowing tubes) */
    var tubes = [];
    for (var ti = 0; ti < 3; ti++) {
      (function (i) {
        var pts = [];
        for (var k = 0; k < 22; k++) {
          pts.push(new T.Vector3(
            k * 0.62 - 6.5,
            Math.sin(k * 0.42 + i * 1.2) * 1.6,
            Math.cos(k * 0.3 + i) * 1.35
          ));
        }
        var curve = new T.CatmullRomCurve3(pts);
        var tube = new T.Mesh(new T.TubeGeometry(curve, 90, 0.11 + i * 0.03, 10, false), new T.MeshBasicMaterial({
          color: [0x00f0ff, 0xff2d95, 0xffd000][i], transparent: true, opacity: 0.95
        }));
        tube.position.set(-12, ZONE_CHART_Y + 4 + i * 1.1, -8 - i * 2.2);
        scene.add(tube);
        tubes.push(tube);
      })(ti);
    }

    /* 3D PIE / DONUT */
    var pieGroup = new T.Group();
    pieGroup.position.set(13, ZONE_CHART_Y + 3, -4);
    for (var pi = 0; pi < 5; pi++) {
      var seg = new T.Mesh(
        new T.CylinderGeometry(3.1, 3.1, 0.85, 42, 1, false, (pi / 5) * Math.PI * 2, (Math.PI * 2 / 5) * 0.86),
        new T.MeshStandardMaterial({
          color: 0x101c3a, metalness: 0.65, roughness: 0.32,
          emissive: [0x00f0ff, 0xff2d95, 0x7b2dff, 0xffd000, 0x8dff2d][pi], emissiveIntensity: 0.8
        })
      );
      seg.position.x = Math.cos((pi / 5) * Math.PI * 2 + 0.5) * 0.35;
      seg.position.z = Math.sin((pi / 5) * Math.PI * 2 + 0.5) * 0.35;
      pieGroup.add(seg);
    }
    scene.add(pieGroup);

    /* 3D RADAR (cones + loops) */
    var radarGroup = new T.Group();
    radarGroup.position.set(-13, ZONE_CHART_Y + 2.5, -4);
    for (var ri = 0; ri < 2; ri++) {
      var cone = new T.Mesh(new T.ConeGeometry(3.2, 4.2, 6, 1, true), new T.MeshBasicMaterial({
        color: ri ? 0xff2d95 : 0x00f0ff, transparent: true, opacity: 0.16, side: T.DoubleSide
      }));
      cone.position.y = 1.9;
      radarGroup.add(cone);
    }
    var radarRing = new T.Mesh(new T.TorusGeometry(3.3, 0.06, 8, 64), new T.MeshBasicMaterial({ color: 0x00f0ff }));
    radarRing.rotation.x = Math.PI / 2;
    radarGroup.add(radarRing);
    scene.add(radarGroup);

    /* 4D scatter cloud */
    var scatter = (function () {
      var N = 420;
      var pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
      var c = new T.Color();
      for (var i = 0; i < N; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 16;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
        c.setHSL(0.52 + Math.random() * 0.28, 0.95, 0.6);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      var geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      geo.setAttribute('color', new T.BufferAttribute(col, 3));
      var pts = new T.Points(geo, new T.PointsMaterial({
        size: 0.34, map: TEX_DOT, vertexColors: true, transparent: true,
        opacity: 0.95, depthWrite: false, blending: T.AdditiveBlending
      }));
      pts.position.set(0, ZONE_CHART_Y + 8, -12);
      scene.add(pts);
      return pts;
    })();

    var chartTesseract = buildTesseract(1.6, 0x7b2dff, 0x00f0ff);
    chartTesseract.position.set(0, ZONE_CHART_Y + 9, -10);
    scene.add(chartTesseract);
    animators.push(function (t) {
      chartTesseract.userData.update(t * 1.2);
    });

    animators.push(function (t) {
      bars.forEach(function (b, i) {
        b.scale.y = 1.6 + Math.abs(Math.sin(t * 1.1 + i * 0.53)) * 4.4;
        b.position.y = ZONE_CHART_Y - 5.4 + b.scale.y / 2;
      });
      tubes.forEach(function (tb, i) {
        tb.rotation.y = Math.sin(t * 0.35 + i) * 0.35;
        tb.position.y = ZONE_CHART_Y + 4 + i * 1.1 + Math.sin(t * 0.9 + i * 1.4) * 0.6;
      });
      pieGroup.rotation.y = t * 0.32;
      pieGroup.rotation.x = Math.sin(t * 0.4) * 0.18;
      radarGroup.rotation.y = t * 0.55;
      radarRing.scale.setScalar(1 + Math.sin(t * 1.8) * 0.09);
      scatter.rotation.y = t * 0.12;
      scatter.rotation.x = Math.sin(t * 0.2) * 0.25;
    });

    /* ============================================================
       ZONE 4 — 3D MODEL FOUNDRY
       ============================================================ */
    var ZONE_MDL_Y = -320;

    /* --- WAR MECH (big procedural) --- */
    var mech = new T.Group();
    (function () {
      var mP = new T.MeshStandardMaterial({ color: 0x16294e, metalness: 0.88, roughness: 0.3, emissive: 0x0a2c4a, emissiveIntensity: 0.3 });
      var mS = new T.MeshStandardMaterial({ color: 0x0a1830, metalness: 0.92, roughness: 0.26 });
      var mG = new T.MeshBasicMaterial({ color: 0xff2d95 });
      function box(w, h, d, mat, x, y, z) {
        var m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
        m.position.set(x, y, z);
        return m;
      }
      /* torso */
      mech.add(box(6.2, 5.2, 3.6, mP, 0, 12, 0));
      mech.add(box(4.2, 2.2, 1.1, mS, 0, 12.6, 2.05));
      mech.add(box(1.5, 1.5, 0.5, mG, 0, 12.8, 2.6));
      /* cockpit */
      var cockpit = new T.Mesh(new T.SphereGeometry(1.65, 20, 20), new T.MeshStandardMaterial({
        color: 0x123a56, metalness: 0.5, roughness: 0.18, emissive: 0x00f0ff, emissiveIntensity: 0.65
      }));
      cockpit.position.set(0, 15.6, 0.6);
      mech.add(cockpit);
      /* head */
      var head = box(2.2, 1.7, 2.1, mS, 0, 17.1, 0.4);
      mech.add(head);
      mech.add(box(1.9, 0.42, 0.18, mG, 0, 17.25, 1.5));
      /* shoulders + cannons */
      [-1, 1].forEach(function (s) {
        mech.add(box(3.1, 2.7, 3.1, mP, s * 5.1, 13.6, 0));
        var cannon = new T.Mesh(new T.CylinderGeometry(0.55, 0.65, 4.6, 14), mS);
        cannon.rotation.x = Math.PI / 2 - 0.16;
        cannon.position.set(s * 5.1, 15.6, 1.4);
        mech.add(cannon);
        var muzzle = new T.Mesh(new T.CylinderGeometry(0.62, 0.62, 0.5, 14), mG);
        muzzle.rotation.x = Math.PI / 2 - 0.16;
        muzzle.position.set(s * 5.1, 16, 3.6);
        mech.add(muzzle);
        /* arms */
        mech.add(box(1.9, 5.2, 1.9, mP, s * 5.2, 9.4, 0.2));
        mech.add(box(2.25, 1.6, 2.25, mS, s * 5.2, 6.4, 0.2));
      });
      /* legs */
      [-1, 1].forEach(function (s) {
        mech.add(box(2.5, 5, 2.7, mP, s * 2.35, 5.1, 0));
        mech.add(box(2.2, 4.6, 2.4, mS, s * 2.35, 1.2, 0.25));
        mech.add(box(2.8, 1.1, 4.2, mS, s * 2.35, -1.35, 1.05));
        var kneeGlow = box(2.3, 0.34, 0.28, mG, s * 2.35, 3.35, 1.5);
        mech.add(kneeGlow);
      });
      /* backpack thrusters */
      [-1, 1].forEach(function (s) {
        var th = new T.Mesh(new T.CylinderGeometry(0.85, 1.15, 2.2, 14), mS);
        th.position.set(s * 1.85, 13.2, -2.4);
        th.rotation.x = 0.42;
        mech.add(th);
        var flame = new T.Mesh(new T.ConeGeometry(0.75, 2.4, 12), new T.MeshBasicMaterial({
          color: 0x00f0ff, transparent: true, opacity: 0.75
        }));
        flame.position.set(s * 1.85, 11.6, -3.4);
        flame.rotation.x = Math.PI - 0.42;
        flame.userData.flame = true;
        mech.add(flame);
      });
      var mechLight = new T.PointLight(0xff2d95, 2.4, 30, 1.6);
      mechLight.position.set(0, 13, 5);
      mech.add(mechLight);
    })();
    mech.position.set(-16, ZONE_MDL_Y - 6, -2);
    mech.rotation.y = 0.55;
    scene.add(mech);

    /* turntable under mech */
    var turntable = new T.Group();
    turntable.position.set(-16, ZONE_MDL_Y - 7.6, -2);
    var disc = new T.Mesh(new T.CylinderGeometry(9.5, 10.2, 0.85, 56), new T.MeshStandardMaterial({
      color: 0x0c1834, metalness: 0.92, roughness: 0.3
    }));
    turntable.add(disc);
    var discRing = new T.Mesh(new T.TorusGeometry(8.9, 0.12, 12, 80), new T.MeshBasicMaterial({ color: 0xff2d95 }));
    discRing.rotation.x = Math.PI / 2;
    discRing.position.y = 0.5;
    turntable.add(discRing);
    scene.add(turntable);

    /* --- VOID SERPENT --- */
    var serpent = new T.Group();
    var serpentSegs = [];
    (function () {
      for (var i = 0; i < 24; i++) {
        var r = 1.55 * (1 - i / 32);
        var seg = new T.Mesh(new T.SphereGeometry(Math.max(0.35, r), 14, 14), new T.MeshStandardMaterial({
          color: 0x2c0a44, metalness: 0.72, roughness: 0.32,
          emissive: 0x7b2dff, emissiveIntensity: 0.62
        }));
        serpent.add(seg);
        serpentSegs.push(seg);
      }
      var head = new T.Group();
      var skull = new T.Mesh(new T.ConeGeometry(1.15, 2.5, 14), new T.MeshStandardMaterial({
        color: 0x3a0f5c, metalness: 0.75, roughness: 0.28, emissive: 0x9a3bff, emissiveIntensity: 0.7
      }));
      skull.rotation.x = Math.PI / 2;
      head.add(skull);
      [-1, 1].forEach(function (s) {
        var eye = new T.Mesh(new T.SphereGeometry(0.24, 10, 10), new T.MeshBasicMaterial({ color: 0xff2d95 }));
        eye.position.set(s * 0.5, 0.35, 0.85);
        head.add(eye);
        var horn = new T.Mesh(new T.ConeGeometry(0.16, 1.1, 8), new T.MeshBasicMaterial({ color: 0xff2d95 }));
        horn.position.set(s * 0.55, 0.75, -0.15);
        horn.rotation.x = -0.85;
        head.add(horn);
      });
      serpent.add(head);
      serpent.userData.head = head;
      serpent.position.set(16, ZONE_MDL_Y + 4, -4);
      scene.add(serpent);
    })();

    /* --- NEON CITY BLOCK --- */
    var city = new T.Group();
    (function () {
      var winTex = windowTexture();
      var mat = new T.MeshStandardMaterial({
        color: 0x0a1830, metalness: 0.85, roughness: 0.4,
        emissive: 0xffffff, emissiveIntensity: 0.85,
        emissiveMap: winTex, map: winTex
      });
      var N = 90;
      var geo = new T.BoxGeometry(1, 1, 1);
      var inst = new T.InstancedMesh(geo, mat, N);
      var dummy = new T.Object3D();
      for (var i = 0; i < N; i++) {
        var gx = (i % 10) - 4.5;
        var gz = Math.floor(i / 10) - 4;
        var h = 2 + Math.pow(Math.random(), 1.6) * 12;
        dummy.position.set(gx * 2.4, h / 2, gz * 2.4);
        dummy.scale.set(1.7, h, 1.7);
        dummy.updateMatrix();
        inst.setMatrixAt(i, dummy.matrix);
      }
      city.add(inst);
    })();
    city.position.set(14, ZONE_MDL_Y - 9, -2);
    scene.add(city);

    /* --- CHRONO TORUS KNOT --- */
    var bigKnot = new T.Group();
    (function () {
      var solid = new T.Mesh(new T.TorusKnotGeometry(4.2, 1.15, 180, 22, 3, 8), new T.MeshStandardMaterial({
        color: 0x123a56, metalness: 0.85, roughness: 0.22,
        emissive: 0x00c8ff, emissiveIntensity: 0.7
      }));
      bigKnot.add(solid);
      var ghost = new T.Mesh(new T.TorusKnotGeometry(4.2, 1.5, 110, 14, 3, 8), new T.MeshBasicMaterial({
        color: 0xff2d95, wireframe: true, transparent: true, opacity: 0.3
      }));
      bigKnot.add(ghost);
      bigKnot.userData.ghost = ghost;
    })();
    bigKnot.position.set(0, ZONE_MDL_Y + 9, -10);
    scene.add(bigKnot);

    animators.push(function (t) {
      mech.rotation.y = 0.55 + t * 0.14;
      turntable.rotation.y = t * 0.14;
      mech.children.forEach(function (c) {
        if (c.userData.flame) {
          c.scale.setScalar(0.85 + Math.sin(t * 11 + c.position.x) * 0.3);
        }
      });
      /* serpent swim */
      for (var i = 0; i < serpentSegs.length; i++) {
        var a = t * 0.85 - i * 0.34;
        serpentSegs[i].position.set(
          Math.sin(a) * 7.5,
          Math.sin(a * 0.7 + 1.2) * 3.6,
          Math.cos(a * 0.85) * 5.2
        );
      }
      var h = serpent.userData.head;
      if (h && serpentSegs[0]) {
        h.position.copy(serpentSegs[0].position);
        var nxt = serpentSegs[1].position;
        h.lookAt(nxt.x, nxt.y, nxt.z);
        h.rotateY(Math.PI);
      }
      serpent.rotation.y = t * 0.12;
      city.rotation.y = -t * 0.1;
      bigKnot.rotation.y = t * 0.3;
      bigKnot.rotation.x = Math.sin(t * 0.4) * 0.4;
      bigKnot.userData.ghost.rotation.y = -t * 0.42;
    });

    /* labels for model zone */
    var mdlLabels = [
      ['WAR-MECH', '#ff2d95', -16, ZONE_MDL_Y + 14, -2],
      ['VOID SERPENT', '#7b2dff', 16, ZONE_MDL_Y + 14, -4],
      ['NEON CITY', '#00f0ff', 14, ZONE_MDL_Y + 4, -2],
      ['CHRONO KNOT', '#ffd000', 0, ZONE_MDL_Y + 18, -10]
    ];
    mdlLabels.forEach(function (d) {
      var s = labelSprite(d[0], d[1]);
      s.position.set(d[2], d[3], d[4]);
      s.scale.set(10, 2.5, 1);
      scene.add(s);
    });

    /* ============================================================
       POST-PROCESSING
       ============================================================ */
    var composer = new P.EffectComposer(renderer);
    composer.addPass(new P.RenderPass(scene, camera));
    var bloom = new P.UnrealBloomPass(new T.Vector2(innerWidth, innerHeight), 0.82, 0.55, 0.22);
    composer.addPass(bloom);
    var afterimage = new P.AfterimagePass(0.72);
    composer.addPass(afterimage);
    composer.addPass(new P.OutputPass());

    /* ============================================================
       CAMERA RIG — scroll-driven descent through zones
       ============================================================ */
    var ZONES = [
      { sel: '#hero', y: 2, z: 38 },
      { sel: '#characters', y: ZONE_CHARS_Y + 2, z: 27 },
      { sel: '#objects', y: ZONE_OBJ_Y + 1, z: 30 },
      { sel: '#charts', y: ZONE_CHART_Y + 3, z: 32 },
      { sel: '#models', y: ZONE_MDL_Y + 6, z: 33 },
      { sel: '#secret', y: ZONE_MDL_Y - 26, z: 30 }
    ];
    var zoneEls = ZONES.map(function (z) {
      var el = document.querySelector(z.sel);
      return { el: el, y: z.y, z: z.z, center: 0 };
    });
    function measureZones() {
      zoneEls.forEach(function (z) {
        if (z.el) {
          var r = z.el.getBoundingClientRect();
          z.center = r.top + window.scrollY + z.el.offsetHeight * 0.5;
        }
      });
    }
    measureZones();
    addEventListener('resize', function () {
      measureZones();
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      composer.setSize(innerWidth, innerHeight);
      bloom.setSize(innerWidth, innerHeight);
    });

    var camY = zoneEls[0].y, camZ = zoneEls[0].z, targetY = camY, targetZ = camZ;
    var mouse = { x: 0, y: 0 }, look = { x: 0, y: 0 };
    addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / innerWidth) * 2 - 1;
      mouse.y = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });

    function computeCameraTarget() {
      var sc = scrollY + innerHeight * 0.5;
      var a = zoneEls[0], b = zoneEls[zoneEls.length - 1];
      for (var i = 0; i < zoneEls.length - 1; i++) {
        if (sc >= zoneEls[i].center && sc <= zoneEls[i + 1].center) {
          a = zoneEls[i]; b = zoneEls[i + 1];
          break;
        }
        if (sc > zoneEls[zoneEls.length - 1].center) {
          a = b = zoneEls[zoneEls.length - 1];
        }
        if (sc < zoneEls[0].center) { a = b = zoneEls[0]; }
      }
      var span = Math.max(1, b.center - a.center);
      var k = smooth(clamp((sc - a.center) / span, 0, 1));
      targetY = lerp(a.y, b.y, k);
      targetZ = lerp(a.z, b.z, k);
    }

    /* warp button */
    var warpBoost = 0;
    var warpBtn = document.getElementById('warp-btn');
    if (warpBtn) warpBtn.addEventListener('click', function () {
      warpBoost = 1;
      toast('HYPER WARP ENGAGED');
      blip(990, 0.25);
    });

    /* ============================================================
       MAIN LOOP
       ============================================================ */
    var clock = new T.Clock();
    var elapsed = 0;
    var fpsEl = document.getElementById('st-fps');
    var frames = 0, fpsTimer = 0;

    function animate() {
      requestAnimationFrame(animate);
      var dt = Math.min(0.05, clock.getDelta());
      elapsed += dt;
      var t = elapsed;

      /* fps */
      frames++;
      fpsTimer += dt;
      if (fpsTimer >= 0.5) {
        if (fpsEl) fpsEl.textContent = Math.round(frames / fpsTimer);
        frames = 0; fpsTimer = 0;
      }

      computeCameraTarget();
      var k = 1 - Math.exp(-dt * 3.2);
      camY = lerp(camY, targetY, k);
      camZ = lerp(camZ, targetZ, k);
      look.x = lerp(look.x, mouse.x * 3.2, 0.045);
      look.y = lerp(look.y, -mouse.y * 2.2, 0.045);
      camera.position.set(look.x, camY + look.y * 0.35 + Math.sin(t * 0.5) * 0.35, camZ);
      camera.lookAt(look.x * 0.4, camY - 3.2 + look.y, 0);

      /* world animations */
      galaxy.rotation.y = t * 0.022;
      animators.forEach(function (fn) { fn(t); });
      debris.forEach(function (d, i) {
        d.rotation.x += dt * (0.12 + (i % 5) * 0.05);
        d.rotation.y += dt * (0.1 + (i % 3) * 0.06);
      });
      PL.forEach(function (pl, i) {
        pl.intensity = 1.9 + Math.sin(t * 1.1 + i * 1.7) * 0.7;
      });

      /* warp fx */
      if (warpBoost > 0.001) {
        warpBoost *= Math.pow(0.25, dt);
        camera.fov = 58 + warpBoost * 26;
        camera.updateProjectionMatrix();
        bloom.strength = 0.82 + warpBoost * 1.5;
        if (afterimage.uniforms && afterimage.uniforms.damp) {
          afterimage.uniforms.damp.value = 0.72 + warpBoost * 0.22;
        }
      }

      composer.render();
    }

    measureZones();
    setTimeout(measureZones, 400);
    setTimeout(measureZones, 1500);
    animate();
  }

  /* ================= boot ================= */
  function boot() {
    runLoader();
    initCursor();
    initReveal();
    initHud();
    initAudioToggle();
    initSecret();
    try { initWorld(); } catch (err) {
      console.warn('3D world unavailable:', err);
      toast('2D MODE — WEBGL UNAVAILABLE');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

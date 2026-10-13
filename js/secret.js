/* ============================================================
   DEEP VAULT // SECRET PAGE ENGINE
   matrix rain · 4D tesseract temple · guardian · terminal
   ============================================================ */
(function () {
  'use strict';

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  var toastEl, toastTimer;
  function toast(msg) {
    toastEl = toastEl || document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2600);
  }

  /* ================= cursor + reveal + progress ================= */
  function initChrome() {
    var dot = document.getElementById('cursor');
    var ring = document.getElementById('cursor-ring');
    if (dot && ring) {
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
      document.querySelectorAll('a,button,input,.file-card').forEach(function (el) {
        el.addEventListener('mouseenter', function () { ring.classList.add('hot'); });
        el.addEventListener('mouseleave', function () { ring.classList.remove('hot'); });
      });
    }
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.14 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.18 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) en.target.classList.add('in'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

    var progress = document.getElementById('progress');
    addEventListener('scroll', function () {
      var max = document.documentElement.scrollHeight - innerHeight;
      if (progress) progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ================= matrix rain ================= */
  function initMatrix() {
    var canvas = document.getElementById('matrix');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var cols = [], fontSize = 16, W = 0, H = 0;
    function resize() {
      W = canvas.width = innerWidth;
      H = canvas.height = innerHeight;
      var n = Math.ceil(W / fontSize);
      cols = [];
      for (var i = 0; i < n; i++) cols.push(Math.random() * -60);
    }
    resize();
    addEventListener('resize', resize);
    var GLYPHS = 'アイウエオカキクケコサシスセソ0123456789ABCDEF∞◈◆※ΨΩ4D';
    function draw() {
      ctx.fillStyle = 'rgba(1,2,8,.12)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = fontSize + 'px "Share Tech Mono", monospace';
      for (var i = 0; i < cols.length; i++) {
        var ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        var x = i * fontSize, y = cols[i] * fontSize;
        ctx.fillStyle = Math.random() > 0.972 ? '#ffd000' : '#00f0ff';
        ctx.globalAlpha = Math.random() > 0.94 ? 1 : 0.72;
        ctx.fillText(ch, x, y);
        ctx.globalAlpha = 1;
        if (y > H && Math.random() > 0.975) cols[i] = Math.random() * -40;
        cols[i] += 0.55;
      }
      requestAnimationFrame(draw);
    }
    draw();
  }

  /* ================= terminal ================= */
  function initTerminal() {
    var body = document.getElementById('term-live');
    var input = document.getElementById('term-input');
    if (!body || !input) return;

    function out(html, cls) {
      var d = document.createElement('div');
      if (cls) d.className = cls;
      d.innerHTML = html;
      body.appendChild(d);
      body.parentElement.scrollTop = body.parentElement.scrollHeight;
    }
    function scramble(text, cb) {
      var chars = '█▓▒░#%&@$4D∞◈';
      var frame = 0, total = 16;
      var iv = setInterval(function () {
        frame++;
        var s = '';
        for (var i = 0; i < text.length; i++) {
          s += (i < (frame / total) * text.length) ? text[i] : chars[(Math.random() * chars.length) | 0];
        }
        if (frame >= total) {
          clearInterval(iv);
          out('<span class="ok">' + text + '</span>');
          if (cb) cb();
        }
      }, 32);
    }

    var COMMANDS = {
      help: function () {
        out('<span class="warn">commands:</span> HELP · DECODE &lt;text&gt; · STATUS · 4D · FREE · UNLOCK · WHOAMI · CLEAR');
      },
      decode: function (args) {
        var text = args.join(' ') || 'THE PAGE IS ALIVE';
        scramble(text.toUpperCase());
      },
      status: function () {
        out('CORE ........ <span class="ok">MAX LEVEL</span>');
        out('4D ENGINE ... <span class="ok">STABLE (98.7%)</span>');
        out('CHARACTERS .. <span class="ok">3 AWAKE</span>');
        out('OBJECTS ..... <span class="ok">8 ORBITING</span>');
        out('CHARTS ...... <span class="ok">16 STREAMING</span>');
        out('SECRET ...... <span class="warn">YOU ARE INSIDE IT</span>');
      },
      '4d': function () {
        out('<span class="ok">tesseract spin burst fired — look at the temple</span>');
        if (window.SecretBurst) window.SecretBurst();
        toast('4D BURST RELEASED');
      },
      free: function () {
        out('<span class="ok">there is no paywall in the void. you are already free.</span>');
      },
      unlock: function () {
        out('<span class="ok">vault chain re-confirmed. welcome back, operator.</span>');
        toast('VAULT CHAIN RE-CONFIRMED');
      },
      whoami: function () {
        out('<span class="warn">guest@ultra</span> — clearance: <span class="ok">LEVEL ∞ (honorary)</span>');
      },
      clear: function () {
        body.innerHTML = '';
      }
    };

    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var raw = (input.value || '').trim();
      out('<span class="p">$</span> ' + raw.replace(/</g, '&lt;'));
      input.value = '';
      if (!raw) return;
      var parts = raw.split(/\s+/);
      var cmd = parts[0].toLowerCase();
      if (cmd === 'clear') { COMMANDS.clear(); return; }
      if (COMMANDS[cmd]) COMMANDS[cmd](parts.slice(1));
      else {
        out('<span class="warn">command not found in this dimension — try HELP</span>');
      }
    });

    /* typing intro */
    setTimeout(function () {
      scramble('DECRYPTION COMPLETE — SECTOR 4D IS YOURS', function () {
        out('<span class="warn">type HELP to interrogate the vault shell</span>');
      });
    }, 700);
  }

  /* ============================================================
     THREE.JS SECRET SCENE
     ============================================================ */
  function initScene() {
    if (!window.THREE || !window.THREE_POST) return;
    var T = window.THREE, P = window.THREE_POST;
    var canvas = document.getElementById('secret-world');
    if (!canvas) return;

    var renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    var scene = new T.Scene();
    scene.background = new T.Color(0x010208);
    scene.fog = new T.FogExp2(0x03040c, 0.012);

    var camera = new T.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 400);
    camera.position.set(0, 4, 30);

    scene.add(new T.AmbientLight(0x221133, 1.2));
    var key = new T.DirectionalLight(0xff88cc, 1.1);
    key.position.set(12, 20, 18);
    scene.add(key);
    var p1 = new T.PointLight(0xff2d95, 3, 60, 1.6); p1.position.set(0, 6, 8); scene.add(p1);
    var p2 = new T.PointLight(0x00f0ff, 2.6, 60, 1.6); p2.position.set(-14, -4, -6); scene.add(p2);
    var p3 = new T.PointLight(0x7b2dff, 2.4, 60, 1.6); p3.position.set(14, 10, -10); scene.add(p3);

    /* --- tesseract (4D hypercube, rotating in XW/YW/ZW) --- */
    function buildTesseract(scale, colorA, colorB) {
      var verts4 = [], edges = [], i, b, j;
      for (i = 0; i < 16; i++) verts4.push([(i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1, (i & 8) ? 1 : -1]);
      for (i = 0; i < 16; i++) for (b = 0; b < 4; b++) { j = i ^ (1 << b); if (j > i) edges.push([i, j]); }
      var positions = new Float32Array(edges.length * 6);
      var colors = new Float32Array(edges.length * 6);
      var geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(positions, 3));
      geo.setAttribute('color', new T.BufferAttribute(colors, 3));
      var lines = new T.LineSegments(geo, new T.LineBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.95,
        blending: T.AdditiveBlending, depthWrite: false
      }));
      var nodeMat = new T.MeshBasicMaterial({ color: colorB });
      var nodes = new T.InstancedMesh(new T.SphereGeometry(0.16 * scale, 10, 10), nodeMat, 16);
      var dummy = new T.Object3D();
      var cA = new T.Color(colorA), cB = new T.Color(colorB), cT = new T.Color();
      var group = new T.Group();
      group.add(lines); group.add(nodes);
      group.userData.update = function (t, spin) {
        var ang = { xw: t * 0.45 * spin, yw: t * 0.32 * spin, zw: t * 0.24 * spin, xy: t * 0.12 * spin };
        var proj = [];
        for (var k = 0; k < 16; k++) {
          var v = verts4[k];
          var x = v[0], y = v[1], z = v[2], w = v[3], c, s, n;
          c = Math.cos(ang.xw); s = Math.sin(ang.xw); n = x * c - w * s; w = x * s + w * c; x = n;
          c = Math.cos(ang.yw); s = Math.sin(ang.yw); n = y * c - w * s; w = y * s + w * c; y = n;
          c = Math.cos(ang.zw); s = Math.sin(ang.zw); n = z * c - w * s; w = z * s + w * c; z = n;
          c = Math.cos(ang.xy); s = Math.sin(ang.xy); n = x * c - y * s; y = x * s + y * c; x = n;
          var kk = 3.1 / (3.1 - w);
          proj.push([x * kk * scale, y * kk * scale, z * kk * scale]);
        }
        for (k = 0; k < edges.length; k++) {
          var p0 = proj[edges[k][0]], p1 = proj[edges[k][1]];
          positions[k * 6] = p0[0]; positions[k * 6 + 1] = p0[1]; positions[k * 6 + 2] = p0[2];
          positions[k * 6 + 3] = p1[0]; positions[k * 6 + 4] = p1[1]; positions[k * 6 + 5] = p1[2];
          var dz = clamp((p0[2] + p1[2]) * 0.25 / scale, -1, 1);
          cT.copy(cA).lerp(cB, (dz + 1) / 2);
          colors[k * 6] = cT.r; colors[k * 6 + 1] = cT.g; colors[k * 6 + 2] = cT.b;
          colors[k * 6 + 3] = cT.r; colors[k * 6 + 4] = cT.g; colors[k * 6 + 5] = cT.b;
        }
        geo.attributes.position.needsUpdate = true;
        geo.attributes.color.needsUpdate = true;
        for (k = 0; k < 16; k++) {
          dummy.position.set(proj[k][0], proj[k][1], proj[k][2]);
          dummy.scale.setScalar(0.85 + 0.35 * Math.sin(t * 3 + k));
          dummy.updateMatrix();
          nodes.setMatrixAt(k, dummy.matrix);
        }
        nodes.instanceMatrix.needsUpdate = true;
      };
      return group;
    }

    var tesseract = buildTesseract(3.4, 0xff2d95, 0x00f0ff);
    tesseract.position.set(0, 3, -4);
    scene.add(tesseract);

    /* orbit rings */
    var rings = new T.Group();
    for (var i = 0; i < 4; i++) {
      var r = new T.Mesh(
        new T.TorusGeometry(9 + i * 1.9, 0.09, 12, 100),
        new T.MeshBasicMaterial({ color: i % 2 ? 0xff2d95 : 0x00f0ff, transparent: true, opacity: 0.7 })
      );
      r.rotation.set(i * 0.7, i * 0.45, i * 0.3);
      rings.add(r);
    }
    rings.position.copy(tesseract.position);
    scene.add(rings);

    /* guardian — compact data titan */
    var guardian = new T.Group();
    (function () {
      var mP = new T.MeshStandardMaterial({ color: 0x2c0a44, metalness: 0.8, roughness: 0.3, emissive: 0xff2d95, emissiveIntensity: 0.4 });
      var mG = new T.MeshBasicMaterial({ color: 0x00f0ff });
      var torso = new T.Mesh(new T.BoxGeometry(2.6, 3.2, 1.6), mP);
      torso.position.y = 3.4;
      guardian.add(torso);
      var core = new T.Mesh(new T.SphereGeometry(0.55, 16, 16), mG);
      core.position.set(0, 3.6, 0.95);
      guardian.add(core);
      var head = new T.Mesh(new T.BoxGeometry(1.5, 1.4, 1.4), mP);
      head.position.y = 5.9;
      guardian.add(head);
      var visor = new T.Mesh(new T.BoxGeometry(1.25, 0.32, 0.12), mG);
      visor.position.set(0, 6.0, 0.78);
      guardian.add(visor);
      [-1, 1].forEach(function (s) {
        var arm = new T.Mesh(new T.BoxGeometry(0.72, 2.7, 0.72), mP);
        arm.position.set(s * 1.95, 3.5, 0);
        arm.rotation.z = s * 0.18;
        guardian.add(arm);
        var halo = new T.Mesh(new T.TorusGeometry(1.35, 0.05, 8, 42), mG);
        halo.position.y = 7.15;
        halo.rotation.x = Math.PI / 2;
        guardian.add(halo);
        var shard = new T.Mesh(new T.ConeGeometry(0.3, 1.7, 6), mG);
        shard.position.set(s * 1.1, 5.2, -1.05);
        shard.rotation.x = -2.6;
        guardian.add(shard);
      });
      var skirt = new T.Mesh(new T.ConeGeometry(2.1, 2.4, 8, 1, true), new T.MeshBasicMaterial({
        color: 0x7b2dff, transparent: true, opacity: 0.35, side: T.DoubleSide
      }));
      skirt.position.y = 0.9;
      guardian.add(skirt);
    })();
    guardian.position.set(0, -3.2, 4);
    scene.add(guardian);

    /* data storm particles */
    var storm = (function () {
      var N = 900;
      var pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
      var c = new T.Color();
      for (var i = 0; i < N; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 70;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
        c.setHSL(Math.random() > 0.5 ? 0.88 : 0.52, 0.95, 0.62);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      var geo = new T.BufferGeometry();
      geo.setAttribute('position', new T.BufferAttribute(pos, 3));
      geo.setAttribute('color', new T.BufferAttribute(col, 3));
      var cv = document.createElement('canvas'); cv.width = cv.height = 64;
      var g = cv.getContext('2d');
      var rg = g.createRadialGradient(32, 32, 2, 32, 32, 30);
      rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(0, 0, 64, 64);
      var mat = new T.PointsMaterial({
        size: 0.42, map: new T.CanvasTexture(cv), vertexColors: true,
        transparent: true, opacity: 0.9, depthWrite: false, blending: T.AdditiveBlending
      });
      return new T.Points(geo, mat);
    })();
    scene.add(storm);

    /* data cubes */
    var cubes = [];
    for (var ci = 0; ci < 18; ci++) {
      var cube = new T.Mesh(new T.BoxGeometry(1.2, 1.2, 1.2), new T.MeshStandardMaterial({
        color: 0x0a1830, metalness: 0.85, roughness: 0.3,
        emissive: ci % 2 ? 0xff2d95 : 0x00f0ff, emissiveIntensity: 0.6, wireframe: ci % 3 === 0
      }));
      cube.position.set((Math.random() - 0.5) * 36, (Math.random() - 0.5) * 22, (Math.random() - 0.5) * 22);
      scene.add(cube);
      cubes.push(cube);
    }

    /* post fx */
    var composer = new P.EffectComposer(renderer);
    composer.addPass(new P.RenderPass(scene, camera));
    var bloom = new P.UnrealBloomPass(new T.Vector2(innerWidth, innerHeight), 1.05, 0.6, 0.2);
    composer.addPass(bloom);
    var afterimage = new P.AfterimagePass(0.68);
    composer.addPass(afterimage);
    var glitch = new P.GlitchPass(64);
    glitch.enabled = false;
    composer.addPass(glitch);
    composer.addPass(new P.OutputPass());

    /* time machine */
    var timeScale = 1;
    var slider = document.getElementById('tm-slider');
    var readout = document.getElementById('tm-readout');
    if (slider) {
      slider.addEventListener('input', function () {
        timeScale = Number(slider.value) / 100;
        if (readout) readout.textContent = timeScale.toFixed(2);
      });
    }
    function glitchBurst(ms) {
      glitch.enabled = true;
      glitch.goWild = true;
      setTimeout(function () { glitch.enabled = false; glitch.goWild = false; }, ms);
    }
    var chaosBtn = document.getElementById('tm-chaos');
    if (chaosBtn) chaosBtn.addEventListener('click', function () {
      burst = 2.2;
      glitchBurst(900);
      toast('TIMELINE SHATTERED');
    });

    var burst = 0;
    window.SecretBurst = function () { burst = 2.4; };

    var panicBtn = document.getElementById('panic-btn');
    if (panicBtn) panicBtn.addEventListener('click', function () {
      burst = 3;
      glitchBurst(1400);
      toast('PANIC GLITCH PROTOCOL');
    });

    /* camera */
    var mouse = { x: 0, y: 0 };
    addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / innerWidth) * 2 - 1;
      mouse.y = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });

    addEventListener('resize', function () {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      composer.setSize(innerWidth, innerHeight);
      bloom.setSize(innerWidth, innerHeight);
    });

    var elapsed = 0;
    var clock = new T.Clock();
    var lookX = 0, lookY = 0;

    function animate() {
      requestAnimationFrame(animate);
      var dt = Math.min(0.05, clock.getDelta());
      elapsed += dt * timeScale;
      var t = elapsed;

      if (burst > 0.001) {
        burst *= Math.pow(0.35, dt);
        tesseract.scale.setScalar(1 + burst * 0.25);
        bloom.strength = 1.05 + burst * 1.3;
      } else {
        tesseract.scale.setScalar(1);
        bloom.strength = 1.05;
      }

      tesseract.userData.update(t, 1 + burst * 1.5);
      rings.rotation.y = t * 0.24;
      rings.rotation.z = Math.sin(t * 0.18) * 0.4;
      guardian.rotation.y = Math.sin(t * 0.35) * 0.55;
      guardian.position.y = -3.2 + Math.sin(t * 0.9) * 0.45;
      storm.rotation.y = t * 0.05;
      storm.rotation.x = Math.sin(t * 0.12) * 0.2;

      cubes.forEach(function (c, i) {
        c.rotation.x += dt * (0.2 + (i % 4) * 0.12) * timeScale;
        c.rotation.y += dt * (0.16 + (i % 3) * 0.1) * timeScale;
        c.position.y += Math.sin(t * 0.8 + i) * dt * 1.2;
      });

      lookX = lerp(lookX, mouse.x * 4, 0.05);
      lookY = lerp(lookY, -mouse.y * 2.6, 0.05);
      camera.position.set(lookX, 4 + lookY * 0.5 + Math.sin(t * 0.4) * 0.5, 30 + Math.sin(t * 0.22) * 1.6);
      camera.lookAt(0, 2.4, -2);

      composer.render();
    }
    animate();
  }

  function boot() {
    initChrome();
    initMatrix();
    initTerminal();
    try { initScene(); } catch (err) {
      console.warn('Secret 3D scene unavailable:', err);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

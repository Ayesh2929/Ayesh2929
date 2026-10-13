(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const prefersFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.documentElement.classList.add("js-enabled");

  // Mobile navigation stays keyboard- and screen-reader-friendly.
  const menuButton = document.querySelector(".menu-toggle");
  const primaryNav = document.querySelector(".primary-nav");
  if (menuButton && primaryNav) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      primaryNav.classList.toggle("is-open", !isOpen);
      menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    });

    primaryNav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        primaryNav.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open navigation");
      }
    });
  }

  // Mark the current document in the shared navigation.
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const pathParts = path.split("/").filter(Boolean);
  const leaf = pathParts.at(-1);
  const currentPage = path === "/"
    ? "home"
    : leaf === "index.html"
      ? pathParts.at(-2) || "home"
      : leaf;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    if (link.dataset.nav === currentPage) link.setAttribute("aria-current", "page");
  });

  // Scroll progress is purely decorative; content remains complete without it.
  const progressBar = document.querySelector(".scroll-progress");
  let scrollQueued = false;
  const updateScrollProgress = () => {
    if (!progressBar) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, ratio))})`;
    scrollQueued = false;
  };
  if (progressBar) {
    updateScrollProgress();
    window.addEventListener("scroll", () => {
      if (!scrollQueued) {
        scrollQueued = true;
        window.requestAnimationFrame(updateScrollProgress);
      }
    }, { passive: true });
    window.addEventListener("resize", updateScrollProgress, { passive: true });
  }

  // Reveal sections as they enter the viewport; reduced-motion users see them immediately.
  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -28px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // A gentle pointer parallax gives cards depth without moving the page itself.
  if (prefersFinePointer && !reducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const ry = (x - 0.5) * 5.5;
        const rx = (0.5 - y) * 4.5;
        card.style.setProperty("--tilt-x", `${rx.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${ry.toFixed(2)}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  const HYPERCUBE_VERTICES = [];
  for (let mask = 0; mask < 16; mask += 1) {
    HYPERCUBE_VERTICES.push([
      mask & 1 ? 1 : -1,
      mask & 2 ? 1 : -1,
      mask & 4 ? 1 : -1,
      mask & 8 ? 1 : -1,
    ]);
  }
  const HYPERCUBE_EDGES = [];
  for (let i = 0; i < HYPERCUBE_VERTICES.length; i += 1) {
    for (let j = i + 1; j < HYPERCUBE_VERTICES.length; j += 1) {
      let differences = 0;
      for (let axis = 0; axis < 4; axis += 1) {
        if (HYPERCUBE_VERTICES[i][axis] !== HYPERCUBE_VERTICES[j][axis]) differences += 1;
      }
      if (differences === 1) HYPERCUBE_EDGES.push([i, j]);
    }
  }

  const rotatePlane = (point, i, j, angle) => {
    const result = point.slice();
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const a = result[i];
    const b = result[j];
    result[i] = a * c - b * s;
    result[j] = a * s + b * c;
    return result;
  };

  const createSeededStars = (count, seed) => {
    let state = seed >>> 0;
    const random = () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
    return Array.from({ length: count }, () => ({
      x: random(),
      y: random(),
      radius: 0.45 + random() * 1.3,
      phase: random() * Math.PI * 2,
      hue: random() > 0.78 ? "98, 231, 242" : "177, 167, 255",
    }));
  };

  function initTesseract(canvas) {
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    const sceneKey = canvas.dataset.tesseract || "scene";
    const controls = document.querySelector(`[data-controls="${sceneKey}"]`);
    const isCompact = canvas.dataset.compact === "true";
    const defaults = {
      angles: { xy: 0.62, zw: 1.05, xw: 0.34, yz: -0.48 },
      perspective: 4.25,
      zoom: 1,
      speed: isCompact ? 0.28 : 0.2,
      running: !reducedMotion,
    };
    const state = {
      angles: { ...defaults.angles },
      perspective: defaults.perspective,
      zoom: defaults.zoom,
      speed: defaults.speed,
      running: defaults.running,
      dragging: false,
      pointerId: null,
      lastPointer: null,
      visible: true,
      width: 0,
      height: 0,
      dpr: 1,
      lastFrame: 0,
      fpsTime: 0,
      fpsFrames: 0,
      raf: 0,
    };
    const stars = createSeededStars(isCompact ? 52 : 96, sceneKey.length * 739 + canvas.clientWidth);
    const motionButton = controls?.querySelector("[data-motion-toggle]");
    const fpsReadout = controls?.querySelector("[data-fps]");

    const updateMotionButton = () => {
      if (!motionButton) return;
      motionButton.textContent = state.running ? "Pause motion" : "Resume motion";
      motionButton.setAttribute("aria-pressed", String(state.running));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      state.width = rect.width;
      state.height = rect.height;
      state.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(rect.width * state.dpr);
      const pixelHeight = Math.round(rect.height * state.dpr);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      render();
    };

    const projectVertex = (source) => {
      let point = source.slice();
      point = rotatePlane(point, 0, 1, state.angles.xy);
      point = rotatePlane(point, 2, 3, state.angles.zw);
      point = rotatePlane(point, 0, 3, state.angles.xw);
      point = rotatePlane(point, 1, 2, state.angles.yz);

      const denominator4 = Math.max(1.2, state.perspective - point[3]);
      const scale4 = state.perspective / denominator4;
      const x3 = point[0] * scale4;
      const y3 = point[1] * scale4;
      const z3 = point[2] * scale4;
      const cameraDistance = 5.3;
      const denominator3 = Math.max(1.3, cameraDistance - z3);
      const cameraScale = 4.1 / denominator3;
      const fit = Math.min(state.width, state.height) * 0.25 * state.zoom;
      return {
        x: state.width * 0.5 + x3 * cameraScale * fit,
        y: state.height * 0.51 + y3 * cameraScale * fit,
        z: z3,
        w: point[3],
      };
    };

    function render() {
      if (!state.width || !state.height) return;
      const width = state.width;
      const height = state.height;
      const cx = width * 0.5;
      const cy = height * 0.51;

      ctx.save();
      ctx.clearRect(0, 0, width, height);
      const backdrop = ctx.createLinearGradient(0, 0, width, height);
      backdrop.addColorStop(0, "#0a0c19");
      backdrop.addColorStop(0.52, "#090b17");
      backdrop.addColorStop(1, "#060812");
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.65);
      glow.addColorStop(0, "rgba(87, 65, 174, 0.20)");
      glow.addColorStop(0.45, "rgba(28, 44, 95, 0.08)");
      glow.addColorStop(1, "rgba(6, 8, 18, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Subtle instrument grid and stars establish scale without obscuring the mesh.
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(123, 139, 197, 0.075)";
      const grid = isCompact ? 42 : 48;
      for (let x = 0; x < width; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(width, y + 0.5);
        ctx.stroke();
      }

      const time = performance.now() * 0.001;
      for (const star of stars) {
        const pulse = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(time * 0.7 + star.phase));
        ctx.fillStyle = `rgba(${star.hue}, ${0.13 + pulse * 0.43})`;
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Orbit paths are a 3D cue; the central object is the projected 4D model.
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-0.16);
      ctx.scale(1, 0.29);
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.min(width * 0.39, height * 0.9), Math.min(width * 0.39, height * 0.9), 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(128, 105, 242, 0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.rotate(1.05);
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.min(width * 0.31, height * 0.72), Math.min(width * 0.31, height * 0.72), 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(76, 215, 233, 0.14)";
      ctx.stroke();
      ctx.restore();

      const projected = HYPERCUBE_VERTICES.map(projectVertex);
      const edgeList = HYPERCUBE_EDGES.map(([a, b]) => ({
        a: projected[a],
        b: projected[b],
        w: (HYPERCUBE_VERTICES[a][3] + HYPERCUBE_VERTICES[b][3]) * 0.5,
        z: (projected[a].z + projected[b].z) * 0.5,
      })).sort((a, b) => a.z - b.z);

      for (const edge of edgeList) {
        const color = Math.abs(edge.w) < 0.01
          ? "98, 231, 242"
          : edge.w > 0 ? "178, 132, 255" : "116, 145, 255";
        const depthAlpha = Math.max(0.28, Math.min(0.82, 0.52 + edge.z * 0.09));
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(edge.a.x, edge.a.y);
        ctx.lineTo(edge.b.x, edge.b.y);
        ctx.strokeStyle = `rgba(${color}, ${depthAlpha * 0.22})`;
        ctx.lineWidth = isCompact ? 6 : 8;
        ctx.shadowColor = `rgba(${color}, 0.7)`;
        ctx.shadowBlur = isCompact ? 10 : 15;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(edge.a.x, edge.a.y);
        ctx.lineTo(edge.b.x, edge.b.y);
        ctx.strokeStyle = `rgba(${color}, ${depthAlpha})`;
        ctx.lineWidth = isCompact ? 1.1 : 1.5;
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();
      }

      // Vertex nodes, with depth-aware scale and a soft emissive center.
      projected.forEach((point, index) => {
        const isOuterSlice = HYPERCUBE_VERTICES[index][3] > 0;
        const radius = (isOuterSlice ? 3.1 : 2.4) * (0.85 + Math.max(-0.2, point.z * 0.08));
        const nodeGlow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius * 4.8);
        nodeGlow.addColorStop(0, "rgba(172, 237, 255, 0.92)");
        nodeGlow.addColorStop(0.23, "rgba(98, 231, 242, 0.5)");
        nodeGlow.addColorStop(1, "rgba(98, 231, 242, 0)");
        ctx.fillStyle = nodeGlow;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius * 4.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = isOuterSlice ? "#eef0ff" : "#b6f4ff";
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Small orbiting 3D-like planets add scale to the central hypercube.
      const orbitAngle = time * 0.18;
      const orbSize = Math.max(4, Math.min(width, height) * 0.018);
      const orbs = [
        { x: cx + Math.cos(orbitAngle) * width * 0.34, y: cy + Math.sin(orbitAngle) * height * 0.25, r: orbSize, hue: "98, 231, 242" },
        { x: cx + Math.cos(orbitAngle + Math.PI) * width * 0.37, y: cy + Math.sin(orbitAngle + Math.PI) * height * 0.24, r: orbSize * 1.35, hue: "189, 141, 255" },
      ];
      for (const orb of orbs) {
        const orbGradient = ctx.createRadialGradient(orb.x - orb.r * 0.32, orb.y - orb.r * 0.38, orb.r * 0.05, orb.x, orb.y, orb.r * 1.3);
        orbGradient.addColorStop(0, "#f1f5ff");
        orbGradient.addColorStop(0.15, `rgba(${orb.hue}, 0.95)`);
        orbGradient.addColorStop(0.58, `rgba(${orb.hue}, 0.36)`);
        orbGradient.addColorStop(1, `rgba(${orb.hue}, 0)`);
        ctx.fillStyle = orbGradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Compact labels are part of the visual, while the canvas has accessible text in HTML.
      ctx.font = "9px ui-monospace, SFMono-Regular, Consolas, monospace";
      ctx.fillStyle = "rgba(169, 176, 211, 0.78)";
      ctx.textAlign = "left";
      ctx.fillText("4D HYPERCUBE / 16 VERTICES", 18, height - 18);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(98, 231, 242, 0.82)";
      ctx.fillText("32 EDGES · LIVE PROJECTION", width - 18, height - 18);
      ctx.restore();
    }

    function runFrame(now) {
      state.raf = 0;
      if (!state.visible || document.hidden) return;
      const delta = state.lastFrame ? Math.min((now - state.lastFrame) / 1000, 0.05) : 0;
      state.lastFrame = now;

      if (state.running) {
        state.angles.xy += delta * state.speed * 0.76;
        state.angles.zw += delta * state.speed * 0.53;
        state.angles.xw += delta * state.speed * 0.32;
        state.angles.yz -= delta * state.speed * 0.42;
      }
      render();

      state.fpsFrames += 1;
      state.fpsTime += delta;
      if (fpsReadout && state.fpsTime >= 0.8) {
        const fps = Math.round(state.fpsFrames / state.fpsTime);
        fpsReadout.textContent = `${Math.min(fps, 120)} fps`;
        state.fpsFrames = 0;
        state.fpsTime = 0;
      }
      if (state.running) state.raf = window.requestAnimationFrame(runFrame);
    }

    const drawOnce = () => {
      if (state.raf) return;
      state.raf = window.requestAnimationFrame((now) => {
        state.raf = 0;
        state.lastFrame = now;
        render();
      });
    };

    const start = () => {
      if (!state.visible || document.hidden) return;
      // A pending one-shot redraw can occupy this handle; replace it with the animation loop.
      if (state.raf) window.cancelAnimationFrame(state.raf);
      state.lastFrame = 0;
      state.raf = window.requestAnimationFrame(runFrame);
      updateMotionButton();
    };

    const stop = () => {
      if (state.raf) window.cancelAnimationFrame(state.raf);
      state.raf = 0;
      state.lastFrame = 0;
      drawOnce();
      updateMotionButton();
    };

    if (controls) {
      controls.querySelectorAll("[data-angle]").forEach((input) => {
        const key = input.dataset.angle;
        const output = controls.querySelector(`[data-angle-output="${key}"]`);
        const apply = () => {
          state.angles[key] = Number(input.value);
          if (output) output.value = `${Number(input.value).toFixed(2)} rad`;
          if (state.running) drawOnce(); else drawOnce();
        };
        input.addEventListener("input", apply);
        if (output) output.value = `${Number(input.value).toFixed(2)} rad`;
      });

      const perspective = controls.querySelector("[data-perspective]");
      perspective?.addEventListener("input", () => {
        state.perspective = Number(perspective.value);
        const output = controls.querySelector("[data-perspective-output]");
        if (output) output.value = state.perspective.toFixed(2);
        drawOnce();
      });

      const zoom = controls.querySelector("[data-zoom]");
      zoom?.addEventListener("input", () => {
        state.zoom = Number(zoom.value);
        const output = controls.querySelector("[data-zoom-output]");
        if (output) output.value = `${Math.round(state.zoom * 100)}%`;
        drawOnce();
      });

      const speed = controls.querySelector("[data-speed]");
      speed?.addEventListener("input", () => {
        state.speed = Number(speed.value);
        const output = controls.querySelector("[data-speed-output]");
        if (output) output.value = `${state.speed.toFixed(2)}×`;
      });

      motionButton?.addEventListener("click", () => {
        state.running = !state.running;
        if (state.running) start(); else stop();
        updateMotionButton();
      });

      controls.querySelector("[data-reset-scene]")?.addEventListener("click", () => {
        state.angles = { ...defaults.angles };
        state.perspective = defaults.perspective;
        state.zoom = defaults.zoom;
        state.speed = defaults.speed;
        controls.querySelectorAll("[data-angle]").forEach((input) => {
          input.value = String(state.angles[input.dataset.angle]);
          const output = controls.querySelector(`[data-angle-output="${input.dataset.angle}"]`);
          if (output) output.value = `${state.angles[input.dataset.angle].toFixed(2)} rad`;
        });
        if (perspective) perspective.value = String(state.perspective);
        if (zoom) zoom.value = String(state.zoom);
        if (speed) speed.value = String(state.speed);
        const perspectiveOutput = controls.querySelector("[data-perspective-output]");
        const zoomOutput = controls.querySelector("[data-zoom-output]");
        const speedOutput = controls.querySelector("[data-speed-output]");
        if (perspectiveOutput) perspectiveOutput.value = state.perspective.toFixed(2);
        if (zoomOutput) zoomOutput.value = `${Math.round(state.zoom * 100)}%`;
        if (speedOutput) speedOutput.value = `${state.speed.toFixed(2)}×`;
        drawOnce();
      });
    }

    canvas.addEventListener("pointerdown", (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      state.dragging = true;
      state.pointerId = event.pointerId;
      state.lastPointer = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture?.(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!state.dragging || event.pointerId !== state.pointerId) return;
      const dx = event.clientX - state.lastPointer.x;
      const dy = event.clientY - state.lastPointer.y;
      state.angles.xy += dx * 0.007;
      state.angles.xw += dy * 0.006;
      state.lastPointer = { x: event.clientX, y: event.clientY };
      drawOnce();
    });
    const endDrag = (event) => {
      if (event.pointerId !== state.pointerId) return;
      state.dragging = false;
      state.pointerId = null;
      state.lastPointer = null;
    };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("lostpointercapture", endDrag);

    canvas.addEventListener("keydown", (event) => {
      const delta = event.shiftKey ? 0.2 : 0.08;
      if (event.key === "ArrowLeft") state.angles.xy -= delta;
      else if (event.key === "ArrowRight") state.angles.xy += delta;
      else if (event.key === "ArrowUp") state.angles.xw -= delta;
      else if (event.key === "ArrowDown") state.angles.xw += delta;
      else if (event.code === "Space") {
        event.preventDefault();
        state.running = !state.running;
        if (state.running) start(); else stop();
        updateMotionButton();
        return;
      } else return;
      event.preventDefault();
      drawOnce();
    });

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener("resize", resize, { passive: true });
    }

    if ("IntersectionObserver" in window) {
      const sceneObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        state.visible = Boolean(entry?.isIntersecting);
        if (state.visible && state.running) start();
        else if (!state.visible && state.raf) {
          window.cancelAnimationFrame(state.raf);
          state.raf = 0;
        }
      }, { threshold: 0.02 });
      sceneObserver.observe(canvas);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (state.raf) window.cancelAnimationFrame(state.raf);
        state.raf = 0;
      } else if (state.running && state.visible) {
        start();
      } else {
        drawOnce();
      }
    });

    resize();
    updateMotionButton();
    if (state.running) start();
  }

  document.querySelectorAll("canvas[data-tesseract]").forEach(initTesseract);

  // Isometric, animated project-language chart. Values count selected repos, not skill.
  const chartRows = [
    { label: "TypeScript", short: "TS", value: 3, color: "#a78bfa" },
    { label: "JavaScript", short: "JS", value: 2, color: "#62e7f2" },
    { label: "CSS", short: "CSS", value: 2, color: "#80f2ca" },
    { label: "Shell", short: "SH", value: 1, color: "#ffc878" },
    { label: "Lua", short: "LUA", value: 1, color: "#ff89bd" },
    { label: "Python", short: "PY", value: 1, color: "#8bb7ff" },
  ];

  function initLanguageChart(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const readout = document.querySelector("[data-chart-readout]");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let progress = reducedMotion ? 1 : 0;
    let hovered = -1;
    let raf = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    function draw() {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);
      const left = 39;
      const right = 12;
      const bottom = height - 42;
      const plotHeight = Math.max(120, height - 94);
      const maxValue = 3;
      const slot = (width - left - right) / chartRows.length;
      const barWidth = Math.min(42, slot * 0.48);
      const depth = Math.min(12, barWidth * 0.32);
      const unit = plotHeight / maxValue;

      ctx.font = "9px ui-monospace, SFMono-Regular, Consolas, monospace";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let value = 0; value <= maxValue; value += 1) {
        const y = bottom - value * unit;
        ctx.beginPath();
        ctx.moveTo(left, y + 0.5);
        ctx.lineTo(width - right, y + 0.5);
        ctx.strokeStyle = value === 0 ? "rgba(181, 190, 228, 0.34)" : "rgba(181, 190, 228, 0.10)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "rgba(155, 163, 195, 0.68)";
        ctx.fillText(String(value), left - 10, y);
      }

      // Axis labels and depth guides.
      ctx.save();
      ctx.strokeStyle = "rgba(98, 231, 242, 0.12)";
      ctx.beginPath();
      ctx.moveTo(left, bottom);
      ctx.lineTo(left + depth, bottom - depth);
      ctx.lineTo(width - right, bottom - depth);
      ctx.stroke();
      ctx.restore();

      chartRows.forEach((row, index) => {
        const center = left + slot * (index + 0.5);
        const x = center - barWidth * 0.5;
        const barHeight = row.value * unit * progress;
        const top = bottom - barHeight;
        const lifted = hovered === index ? 4 : 0;
        const frontTop = top - lifted;

        // Right face: darker value of the bar colour.
        ctx.beginPath();
        ctx.moveTo(x + barWidth, frontTop);
        ctx.lineTo(x + barWidth + depth, frontTop - depth);
        ctx.lineTo(x + barWidth + depth, bottom - depth);
        ctx.lineTo(x + barWidth, bottom);
        ctx.closePath();
        ctx.fillStyle = shadeColor(row.color, -35);
        ctx.fill();
        ctx.strokeStyle = "rgba(220, 228, 255, 0.16)";
        ctx.stroke();

        // Front face.
        const frontGradient = ctx.createLinearGradient(x, frontTop, x, bottom);
        frontGradient.addColorStop(0, row.color);
        frontGradient.addColorStop(1, shadeColor(row.color, -18));
        ctx.fillStyle = frontGradient;
        ctx.fillRect(x, frontTop, barWidth, Math.max(0, bottom - frontTop));
        ctx.strokeStyle = hovered === index ? "rgba(255,255,255,0.8)" : "rgba(220, 228, 255, 0.2)";
        ctx.strokeRect(x + 0.5, frontTop + 0.5, barWidth - 1, Math.max(0, bottom - frontTop - 1));

        // Top face gives the columns their isometric 3D cut.
        ctx.beginPath();
        ctx.moveTo(x, frontTop);
        ctx.lineTo(x + depth, frontTop - depth);
        ctx.lineTo(x + barWidth + depth, frontTop - depth);
        ctx.lineTo(x + barWidth, frontTop);
        ctx.closePath();
        ctx.fillStyle = shadeColor(row.color, 20);
        ctx.fill();
        ctx.strokeStyle = "rgba(231, 236, 255, 0.42)";
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = hovered === index ? "#f4f3ff" : "rgba(180, 187, 214, 0.82)";
        ctx.font = "9px ui-monospace, SFMono-Regular, Consolas, monospace";
        ctx.fillText(row.short, center + depth * 0.3, bottom + 12);
        ctx.fillStyle = "rgba(223, 227, 247, 0.88)";
        ctx.textBaseline = "bottom";
        ctx.fillText(String(row.value), x + barWidth * 0.5, frontTop - depth - 7);
      });
    }

    function shadeColor(hex, percent) {
      const value = hex.replace("#", "");
      const parts = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
      const target = percent < 0 ? 0 : 255;
      const amount = Math.abs(percent) / 100;
      const adjusted = parts.map((channel) => Math.round(channel + (target - channel) * amount));
      return `rgb(${adjusted[0]}, ${adjusted[1]}, ${adjusted[2]})`;
    }

    const animate = () => {
      if (reducedMotion) {
        progress = 1;
        draw();
        return;
      }
      const start = performance.now();
      const step = (now) => {
        progress = Math.min(1, (now - start) / 820);
        const eased = 1 - Math.pow(1 - progress, 3);
        const previous = progress;
        progress = eased;
        draw();
        progress = previous;
        if (progress < 1) raf = window.requestAnimationFrame(step);
      };
      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(step);
    };

    canvas.addEventListener("pointermove", (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const left = 39;
      const slot = (width - left - 12) / chartRows.length;
      const index = Math.floor((x - left) / slot);
      hovered = index >= 0 && index < chartRows.length ? index : -1;
      if (readout) {
        readout.textContent = hovered >= 0
          ? `${chartRows[hovered].label}: detected in ${chartRows[hovered].value} of 3 selected repositories.`
          : "Hover over a column for its repository count.";
      }
      draw();
    });
    canvas.addEventListener("pointerleave", () => {
      hovered = -1;
      if (readout) readout.textContent = "Hover over a column for its repository count.";
      draw();
    });
    canvas.addEventListener("focus", () => {
      if (readout) readout.textContent = "Chart: TypeScript 3, JavaScript 2, CSS 2, Shell 1, Lua 1, Python 1 featured repositories.";
    });
    canvas.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      hovered = Math.max(0, Math.min(chartRows.length - 1, hovered + (event.key === "ArrowRight" ? 1 : -1)));
      if (readout) readout.textContent = `${chartRows[hovered].label}: detected in ${chartRows[hovered].value} of 3 selected repositories.`;
      draw();
    });

    if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener("resize", resize, { passive: true });
    resize();
    animate();
  }

  document.querySelectorAll("canvas[data-language-chart]").forEach(initLanguageChart);
})();

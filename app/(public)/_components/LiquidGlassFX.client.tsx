"use client";

import React, { useEffect, useRef } from "react";

/**
 * LiquidGlassFX — lightweight WebGL caustics/highlights overlay for the header panel.
 *
 * It does NOT refract DOM pixels (that's handled by CSS backdrop-filter),
 * but renders animated caustics/normal-like highlights to sell the "liquid glass" illusion.
 *
 * Safety/perf:
 * - Automatically pauses on tab hidden and on prefers-reduced-motion.
 * - Scales canvas to devicePixelRatio but caps to avoid huge 4K costs.
 */
export default function LiquidGlassFX({ intensity = 0.75 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const startTsRef = useRef<number>(0);
  const disposedRef = useRef(false);
  const backTexRef = useRef<WebGLTexture | null>(null);
  const backSizeRef = useRef<{w:number;h:number}>({w:1,h:1});
  const captureReadyRef = useRef<boolean>(false);
  const panelRectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return; // no animation

    const canvas = ref.current!;
    if (!canvas) return;
    const gl = (canvas.getContext("webgl", { antialias: false, alpha: true, depth: false, stencil: false, premultipliedAlpha: true }) ||
                canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return; // graceful fallback — no WebGL, just CSS glass
    glRef.current = gl;

    // Shaders
    const vertSrc = `
      attribute vec2 a_pos; // clip space
      varying vec2 v_uv;
      void main(){
        v_uv = (a_pos * 0.5) + 0.5; // [-1,1] -> [0,1]
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    // Domain warping + fbm for soft caustics + background refraction
    const fragSrc = `
      precision mediump float;
      varying vec2 v_uv;
      uniform vec2 u_res;
      uniform float u_time;
      uniform float u_intensity; // 0..1
      uniform sampler2D u_back;
      uniform vec2 u_backSize;

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p);
        float a=hash(i), b=hash(i+vec2(1.0,0.0)), c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0));
        vec2 u=f*f*(3.0-2.0*f);
        return mix(a,b,u.x)+ (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
      }
      float fbm(vec2 p){
        float v=0.0; float a=0.5;
        for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; }
        return v;
      }

      void main(){
        vec2 uv = v_uv;
        // aspect-correct scaling
        vec2 aspect = vec2(u_res.x / max(u_res.x,u_res.y), u_res.y / max(u_res.x,u_res.y));
        vec2 p = (uv - 0.5) * 2.0 * aspect;

        // domain warp
        float t = u_time * 0.08;
        vec2 q = p;
        q += 0.35*vec2(fbm(p*1.2 + t), fbm(p*1.1 - t));
        float n = fbm(q*2.2 + vec2(0.0, t*0.7));

        // derive pseudo-normal from noise field for refraction
        vec2 grad = vec2(
          fbm(q*2.2 + vec2(0.002, t*0.7)) - fbm(q*2.2 - vec2(0.002, t*0.7)),
          fbm(q*2.2 + vec2(0.0, t*0.7+0.002)) - fbm(q*2.2 + vec2(0.0, t*0.7-0.002))
        );
        vec2 normal = normalize(vec2(grad.x, grad.y) + 1e-5);

        // convert to soft caustics/highlights
        float c = smoothstep(0.55, 1.0, n);
        float rim = smoothstep(0.2, 0.9, length(p))*0.35;
        float glow = smoothstep(0.88, 1.0, n);

        // colorize slightly based on polar angle (subtle chroma)
        float ang = atan(p.y, p.x);
        vec3 tint = vec3(0.92 + 0.06*sin(ang*2.0), 0.95, 1.0);
        vec3 col = mix(vec3(0.85,0.9,1.0), tint, 0.35) * (c*0.9 + glow*0.6);

        // Refract background when provided
        vec2 backUV = uv;
        // scale refraction by intensity and noise steepness
        float refr = u_intensity * 0.025;
        backUV += normal * refr;
        // clamp and sample background (guard when no texture bound — returns black)
        backUV = clamp(backUV, vec2(0.0), vec2(1.0));
        vec4 back = texture2D(u_back, backUV);

        // final intensity and soft mask near edges
        float mask = smoothstep(0.0, 0.06, v_uv.y) * smoothstep(0.0, 0.06, 1.0 - v_uv.y);
        float alpha = clamp((c*0.5 + glow*0.45 + rim*0.18) * u_intensity, 0.0, 0.85) * mask;

        // blend refracted background with highlights (screen-ish)
        vec3 mixed = 1.0 - (1.0 - back.rgb) * (1.0 - col);
        gl_FragColor = vec4(mixed, alpha);
      }
    `;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("LiquidGlassFX shader error:", gl.getShaderInfoLog(sh));
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("LiquidGlassFX link error:", gl.getProgramInfoLog(prog));
    }

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    // fullscreen quad (clip space)
    const quad = new Float32Array([
      -1, -1,  1, -1, -1,  1,
       1, -1,  1,  1, -1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    gl.useProgram(prog);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uIntensity = gl.getUniformLocation(prog, "u_intensity");
    const uBack = gl.getUniformLocation(prog, "u_back");
    const uBackSize = gl.getUniformLocation(prog, "u_backSize");

    // Size & DPR
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const maxDpr = 1.75; // cap to avoid 4K overhead
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();

    // Background capture (optional via html2canvas)
    let captureTimer: number | null = null;
    let html2canvas: any = null;
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: false });

    const uploadBackground = (img: HTMLImageElement | HTMLCanvasElement) => {
      if (!gl) return;
      let tex = backTexRef.current;
      if (!tex) {
        tex = gl.createTexture();
        backTexRef.current = tex;
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.uniform1i(uBack, 0);
      gl.uniform2f(uBackSize, img.width, img.height);
      backSizeRef.current = { w: img.width, h: img.height };
      captureReadyRef.current = true;
    };

    const capture = async () => {
      if (!gl) return;
      try {
        if (!html2canvas) {
          // dynamic import to avoid SSR and initial payload
          const mod = await import(/* webpackChunkName: "html2canvas-chunk" */ "html2canvas").catch(() => null);
          html2canvas = mod?.default || null;
        }
        const panel = canvas.parentElement; // headerPanel container
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        panelRectRef.current = rect;
        const scale = Math.min(window.devicePixelRatio || 1, 1.5);
        const opts = {
          backgroundColor: null as any,
          scale,
          x: Math.max(0, Math.floor(rect.left + window.scrollX)),
          y: Math.max(0, Math.floor(rect.top + window.scrollY)),
          width: Math.floor(rect.width),
          height: Math.floor(rect.height),
          windowWidth: document.documentElement.clientWidth,
          windowHeight: document.documentElement.clientHeight,
          useCORS: true,
          removeContainer: true,
        };
        if (!html2canvas) return; // no lib — skip
        const shot: HTMLCanvasElement = await html2canvas(document.body, opts);
        // optional post-process: downscale for perf
        const maxW = 1200; const ratio = Math.min(1, maxW / shot.width);
        const dw = Math.max(1, Math.round(shot.width * ratio));
        const dh = Math.max(1, Math.round(shot.height * ratio));
        if (tempCtx) {
          tempCanvas.width = dw; tempCanvas.height = dh;
          tempCtx.clearRect(0,0,dw,dh);
          tempCtx.drawImage(shot, 0, 0, dw, dh);
          uploadBackground(tempCanvas);
        } else {
          uploadBackground(shot);
        }
      } catch (e) {
        // fail silently — fallback remains CSS-only
      }
    };

    const scheduleCapture = (delay = 60) => {
      if (captureTimer) window.clearTimeout(captureTimer);
      captureTimer = window.setTimeout(() => { capture(); }, delay);
    };

    // initial + on resize/scroll (debounced)
    scheduleCapture(10);
    const onScroll = () => scheduleCapture(80);
    const onResize = () => scheduleCapture(80);
    window.addEventListener("scroll", onScroll, { passive: true } as any);
    window.addEventListener("resize", onResize, { passive: true } as any);

    let running = true;
    const onVis = () => { running = !document.hidden; if (running){ startTsRef.current = performance.now(); loop(startTsRef.current); } };
    document.addEventListener("visibilitychange", onVis);

    const loop = (t0: number) => {
      if (disposedRef.current) return;
      if (!running) return;
      const t = (performance.now() - startTsRef.current) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform1f(uIntensity, intensity);
      if (captureReadyRef.current && backTexRef.current) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, backTexRef.current);
        gl.uniform1i(uBack, 0);
        gl.uniform2f(uBackSize, backSizeRef.current.w, backSizeRef.current.h);
      }
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(loop as FrameRequestCallback);
    };
    startTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop as FrameRequestCallback);

    const onResizeOnly = () => resize();
    window.addEventListener("resize", onResizeOnly, { passive: true } as any);

    return () => {
      disposedRef.current = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResizeOnly as any);
      window.removeEventListener("resize", onResize as any);
      window.removeEventListener("scroll", onScroll as any);
      document.removeEventListener("visibilitychange", onVis);
      try {
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteBuffer(buf);
        if (backTexRef.current) gl.deleteTexture(backTexRef.current), backTexRef.current = null;
      } catch {}
    };
  }, [intensity]);

  return (
    <canvas
      ref={ref}
      className="liquidFX"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        // blending controlled via shader alpha over backdrop-filtered panel
        mixBlendMode: "screen",
        opacity: 0.9,
      }}
      aria-hidden
    />
  );
}

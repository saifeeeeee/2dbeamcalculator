import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// AISC W-SECTION DATABASE (Imperial units: in, kip, ksi)
// ═══════════════════════════════════════════════════════════════════════════════
const AISC_W_SECTIONS = [
  { name:"W4x13",  d:4.16,  bf:4.060,  tf:0.345, tw:0.280, Ix:11.3,  Sx:5.46,  Zx:6.28,  weight:13  },
  { name:"W6x9",   d:5.90,  bf:3.940,  tf:0.215, tw:0.170, Ix:16.4,  Sx:5.56,  Zx:6.23,  weight:9   },
  { name:"W6x15",  d:5.99,  bf:5.990,  tf:0.260, tw:0.230, Ix:29.1,  Sx:9.72,  Zx:10.8,  weight:15  },
  { name:"W6x20",  d:6.20,  bf:6.020,  tf:0.365, tw:0.260, Ix:41.4,  Sx:13.4,  Zx:14.9,  weight:20  },
  { name:"W8x10",  d:7.89,  bf:3.940,  tf:0.205, tw:0.170, Ix:30.8,  Sx:7.81,  Zx:8.87,  weight:10  },
  { name:"W8x18",  d:8.14,  bf:5.250,  tf:0.330, tw:0.230, Ix:61.9,  Sx:15.2,  Zx:17.0,  weight:18  },
  { name:"W8x24",  d:7.93,  bf:6.495,  tf:0.400, tw:0.245, Ix:82.7,  Sx:20.9,  Zx:23.1,  weight:24  },
  { name:"W8x31",  d:8.00,  bf:7.995,  tf:0.435, tw:0.285, Ix:110,   Sx:27.5,  Zx:30.4,  weight:31  },
  { name:"W8x40",  d:8.25,  bf:8.070,  tf:0.560, tw:0.360, Ix:146,   Sx:35.5,  Zx:39.8,  weight:40  },
  { name:"W10x12", d:9.87,  bf:3.960,  tf:0.210, tw:0.190, Ix:53.8,  Sx:10.9,  Zx:12.6,  weight:12  },
  { name:"W10x22", d:10.17, bf:5.750,  tf:0.360, tw:0.240, Ix:118,   Sx:23.2,  Zx:26.0,  weight:22  },
  { name:"W10x33", d:9.73,  bf:7.960,  tf:0.435, tw:0.290, Ix:171,   Sx:35.0,  Zx:38.8,  weight:33  },
  { name:"W10x49", d:9.98,  bf:10.000, tf:0.560, tw:0.340, Ix:272,   Sx:54.6,  Zx:60.4,  weight:49  },
  { name:"W12x16", d:11.99, bf:3.990,  tf:0.265, tw:0.220, Ix:103,   Sx:17.1,  Zx:20.1,  weight:16  },
  { name:"W12x26", d:12.22, bf:6.490,  tf:0.380, tw:0.230, Ix:204,   Sx:33.4,  Zx:37.2,  weight:26  },
  { name:"W12x35", d:12.50, bf:6.560,  tf:0.520, tw:0.300, Ix:285,   Sx:45.6,  Zx:51.2,  weight:35  },
  { name:"W12x50", d:12.19, bf:8.080,  tf:0.640, tw:0.370, Ix:394,   Sx:64.7,  Zx:72.4,  weight:50  },
  { name:"W12x72", d:12.25, bf:12.040, tf:0.670, tw:0.430, Ix:597,   Sx:97.4,  Zx:108,   weight:72  },
  { name:"W14x22", d:13.74, bf:5.000,  tf:0.335, tw:0.230, Ix:199,   Sx:29.0,  Zx:33.2,  weight:22  },
  { name:"W14x30", d:13.84, bf:6.730,  tf:0.385, tw:0.270, Ix:291,   Sx:42.0,  Zx:47.3,  weight:30  },
  { name:"W14x48", d:13.79, bf:8.031,  tf:0.595, tw:0.340, Ix:484,   Sx:70.2,  Zx:78.4,  weight:48  },
  { name:"W14x68", d:14.04, bf:10.035, tf:0.720, tw:0.415, Ix:722,   Sx:103,   Zx:115,   weight:68  },
  { name:"W14x90", d:14.02, bf:14.520, tf:0.710, tw:0.440, Ix:999,   Sx:143,   Zx:157,   weight:90  },
  { name:"W16x26", d:15.69, bf:5.500,  tf:0.345, tw:0.250, Ix:301,   Sx:38.4,  Zx:44.2,  weight:26  },
  { name:"W16x36", d:15.86, bf:6.985,  tf:0.430, tw:0.295, Ix:448,   Sx:56.5,  Zx:64.0,  weight:36  },
  { name:"W16x57", d:16.43, bf:7.120,  tf:0.715, tw:0.430, Ix:758,   Sx:92.2,  Zx:105,   weight:57  },
  { name:"W18x35", d:17.70, bf:6.000,  tf:0.425, tw:0.300, Ix:510,   Sx:57.6,  Zx:66.5,  weight:35  },
  { name:"W18x46", d:18.06, bf:6.060,  tf:0.605, tw:0.360, Ix:712,   Sx:78.8,  Zx:90.7,  weight:46  },
  { name:"W18x65", d:18.35, bf:7.590,  tf:0.750, tw:0.450, Ix:1070,  Sx:117,   Zx:133,   weight:65  },
  { name:"W21x44", d:20.66, bf:6.500,  tf:0.450, tw:0.350, Ix:843,   Sx:81.6,  Zx:95.4,  weight:44  },
  { name:"W21x57", d:21.06, bf:6.555,  tf:0.650, tw:0.405, Ix:1170,  Sx:111,   Zx:129,   weight:57  },
  { name:"W24x55", d:23.57, bf:7.005,  tf:0.505, tw:0.395, Ix:1350,  Sx:114,   Zx:134,   weight:55  },
  { name:"W24x76", d:23.92, bf:8.990,  tf:0.680, tw:0.440, Ix:2100,  Sx:176,   Zx:200,   weight:76  },
  { name:"W27x84", d:26.71, bf:9.960,  tf:0.640, tw:0.460, Ix:2850,  Sx:213,   Zx:244,   weight:84  },
  { name:"W30x90", d:29.53, bf:10.400, tf:0.610, tw:0.470, Ix:3610,  Sx:245,   Zx:283,  weight:90  },
  { name:"W33x118",d:32.86, bf:11.480, tf:0.740, tw:0.550, Ix:5900,  Sx:359,   Zx:415,  weight:118 },
  { name:"W36x135",d:35.55, bf:11.950, tf:0.790, tw:0.600, Ix:7800,  Sx:439,   Zx:509,  weight:135 },
];

const BEAM_TYPES = { SS:"Simply Supported", CANT:"Cantilever", FIXED:"Fixed-Fixed", PROPPED:"Propped Cantilever", CUSTOM:"Custom Supports" };
const LOAD_TYPES  = { point:"Point Load", udl:"UDL", tri:"Triangular", moment:"Applied Moment" };
const DEFL_LIMITS = { "L/360":"Live load, floors", "L/300":"Total load, floors", "L/250":"General", "L/240":"Total load, roofs", "L/180":"Roof, snow/wind" };

// ═══════════════════════════════════════════════════════════════════════════════
// CROSS-SECTION Ix CALCULATORS — Returns { Ix, Sx, A, yc, label }
// ═══════════════════════════════════════════════════════════════════════════════
const SECTION_TYPES = {
  rect:    "Solid Rectangle",
  circle:  "Solid Circle",
  hollow_rect: "Hollow Rectangle (Box)",
  hollow_circle: "Hollow Circle (Pipe)",
  I_section: "I-Section (Custom)",
  T_section: "T-Section (Custom)",
  L_section: "L-Section (Angle)",
};

function calcIx(type, dims) {
  const d = dims;
  try {
    if (type === "rect") {
      const b = +d.b, h = +d.h;
      if (!b || !h || b <= 0 || h <= 0) return null;
      const Ix = (b * h**3) / 12;
      return { Ix, Sx: Ix/(h/2), A: b*h, yc: h/2, label:`b=${b}, h=${h}` };
    }
    if (type === "circle") {
      const r = +d.r;
      if (!r || r <= 0) return null;
      const Ix = Math.PI * r**4 / 4;
      return { Ix, Sx: Ix/r, A: Math.PI*r*r, yc: r, label:`r=${r}` };
    }
    if (type === "hollow_rect") {
      const b = +d.b, h = +d.h, t = +d.t;
      if (!b || !h || !t || t <= 0 || t >= Math.min(b,h)/2) return null;
      const bi = b - 2*t, hi = h - 2*t;
      const Ix = (b*h**3 - bi*hi**3) / 12;
      return { Ix, Sx: Ix/(h/2), A: b*h - bi*hi, yc: h/2, label:`b=${b}, h=${h}, t=${t}` };
    }
    if (type === "hollow_circle") {
      const ro = +d.ro, ri = +d.ri;
      if (!ro || !ri || ri >= ro || ro <= 0 || ri <= 0) return null;
      const Ix = Math.PI * (ro**4 - ri**4) / 4;
      return { Ix, Sx: Ix/ro, A: Math.PI*(ro*ro - ri*ri), yc: ro, label:`ro=${ro}, ri=${ri}` };
    }
    if (type === "I_section") {
      const bf = +d.bf, tf = +d.tf, tw = +d.tw, hw = +d.hw;
      if (!bf || !tf || !tw || !hw || bf <= 0 || tf <= 0 || tw <= 0 || hw <= 0) return null;
      const H = hw + 2*tf;
      const A = 2*bf*tf + tw*hw;
      const yc = H/2;
      const Ix = (bf*H**3)/12 - ((bf-tw)*hw**3)/12;
      return { Ix, Sx: Ix/yc, A, yc, label:`bf=${bf}, tf=${tf}, tw=${tw}, hw=${hw}` };
    }
    if (type === "T_section") {
      const bf = +d.bf, tf = +d.tf, tw = +d.tw, hw = +d.hw;
      if (!bf || !tf || !tw || !hw || bf <= 0 || tf <= 0 || tw <= 0 || hw <= 0) return null;
      const H = hw + tf;
      const A = bf*tf + tw*hw;
      const yc_bot = (bf*tf*(H-tf/2) + tw*hw*(hw/2)) / A;
      const yc_top = H - yc_bot;
      const Ix = (bf*tf**3/12 + bf*tf*(H-tf/2-yc_bot)**2) + (tw*hw**3/12 + tw*hw*(hw/2-yc_bot)**2);
      return { Ix, Sx: Ix/Math.max(yc_bot, yc_top), A, yc: yc_top, label:`bf=${bf}, tf=${tf}, tw=${tw}, hw=${hw}` };
    }
    if (type === "L_section") {
      const b = +d.b, h = +d.h, t = +d.t;
      if (!b || !h || !t || b <= 0 || h <= 0 || t <= 0) return null;
      const A = b*t + (h-t)*t;
      const yc_bot = (b*t*(t/2) + (h-t)*t*(t+(h-t)/2)) / A;
      const Ix = (b*t**3/12 + b*t*(yc_bot-t/2)**2) + (t*(h-t)**3/12 + t*(h-t)*(yc_bot-(t+(h-t)/2))**2);
      return { Ix, Sx: Ix/Math.max(yc_bot, h-yc_bot), A, yc: h-yc_bot, label:`b=${b}, h=${h}, t=${t}` };
    }
  } catch { return null; }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION PREVIEW CANVAS
// ═══════════════════════════════════════════════════════════════════════════════
function SectionCanvas({ type, dims, computed }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width, H = cv.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = "#1a1d27"; ctx.fillRect(0,0,W,H);
    if (!computed) {
      ctx.fillStyle = "#6b7280"; ctx.font = "12px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("Enter dimensions to preview", W/2, H/2); return;
    }
    const pad = 30;
    const d = dims;
    ctx.fillStyle = "#4f8ef7cc";
    ctx.strokeStyle = "#4f8ef7";
    ctx.lineWidth = 1.5;

    const scale = (val, max, avail) => (val / max) * avail;

    if (type === "rect") {
      const b = +d.b, h = +d.h, maxD = Math.max(b,h);
      const pw = W-2*pad, ph = H-2*pad;
      const sw = scale(b,maxD,pw), sh = scale(h,maxD,ph);
      const x = (W-sw)/2, y = (H-sh)/2;
      ctx.fillRect(x,y,sw,sh); ctx.strokeRect(x,y,sw,sh);
      ctx.strokeStyle="#3dd68c"; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(x,y+sh/2); ctx.lineTo(x+sw,y+sh/2); ctx.stroke();
      ctx.setLineDash([]);
    }
    if (type === "circle") {
      const r = +d.r, cx = W/2, cy = H/2;
      const sc = Math.min((W-2*pad),(H-2*pad))/(2*r);
      ctx.beginPath(); ctx.arc(cx,cy,r*sc,0,Math.PI*2);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle="#3dd68c"; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(cx-r*sc,cy); ctx.lineTo(cx+r*sc,cy); ctx.stroke();
      ctx.setLineDash([]);
    }
    if (type === "hollow_rect") {
      const b = +d.b, h = +d.h, t = +d.t;
      const maxD = Math.max(b,h), sc = Math.min((W-2*pad)/b,(H-2*pad)/h);
      const sw = b*sc, sh = h*sc, x = (W-sw)/2, y = (H-sh)/2;
      ctx.fillRect(x,y,sw,sh); ctx.strokeRect(x,y,sw,sh);
      ctx.fillStyle="#1a1d27";
      ctx.fillRect(x+t*sc, y+t*sc, (b-2*t)*sc, (h-2*t)*sc);
      ctx.strokeStyle="#4f8ef7"; ctx.strokeRect(x+t*sc, y+t*sc, (b-2*t)*sc, (h-2*t)*sc);
      ctx.strokeStyle="#3dd68c"; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(x,y+sh/2); ctx.lineTo(x+sw,y+sh/2); ctx.stroke();
      ctx.setLineDash([]);
    }
    if (type === "hollow_circle") {
      const ro = +d.ro, ri = +d.ri, cx = W/2, cy = H/2;
      const sc = Math.min((W-2*pad),(H-2*pad))/(2*ro);
      ctx.beginPath(); ctx.arc(cx,cy,ro*sc,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle="#1a1d27";
      ctx.beginPath(); ctx.arc(cx,cy,ri*sc,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle="#3dd68c"; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(cx-ro*sc,cy); ctx.lineTo(cx+ro*sc,cy); ctx.stroke();
      ctx.setLineDash([]);
    }
    if (type === "I_section") {
      const bf = +d.bf, tf = +d.tf, tw = +d.tw, hw = +d.hw;
      const H_tot = hw + 2*tf;
      const sc = Math.min((W-2*pad)/bf,(H-2*pad)/H_tot);
      const ox = (W-bf*sc)/2, oy = (H-H_tot*sc)/2;
      ctx.fillRect(ox,oy,bf*sc,tf*sc); ctx.strokeRect(ox,oy,bf*sc,tf*sc);
      ctx.fillRect(ox+(bf-tw)/2*sc,oy+tf*sc,tw*sc,hw*sc); ctx.strokeRect(ox+(bf-tw)/2*sc,oy+tf*sc,tw*sc,hw*sc);
      ctx.fillRect(ox,oy+(tf+hw)*sc,bf*sc,tf*sc); ctx.strokeRect(ox,oy+(tf+hw)*sc,bf*sc,tf*sc);
      ctx.strokeStyle="#3dd68c"; ctx.lineWidth=1; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(ox,oy+H_tot*sc/2); ctx.lineTo(ox+bf*sc,oy+H_tot*sc/2); ctx.stroke();
      ctx.setLineDash([]);
    }
    if (type === "T_section") {
      const bf = +d.bf, tf = +d.tf, tw = +d.tw, hw = +d.hw;
      const H_tot = hw + tf;
      const sc = Math.min((W-2*pad)/bf,(H-2*pad)/H_tot);
      const ox = (W-bf*sc)/2, oy = (H-H_tot*sc)/2;
      ctx.fillRect(ox,oy,bf*sc,tf*sc); ctx.strokeRect(ox,oy,bf*sc,tf*sc);
      ctx.fillRect(ox+(bf-tw)/2*sc,oy+tf*sc,tw*sc,hw*sc); ctx.strokeRect(ox+(bf-tw)/2*sc,oy+tf*sc,tw*sc,hw*sc);
      if (computed) {
        const yNA = oy + (H_tot - computed.yc) * sc;
        ctx.strokeStyle="#3dd68c"; ctx.lineWidth=1; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(ox, yNA); ctx.lineTo(ox+bf*sc, yNA); ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    if (type === "L_section") {
      const b = +d.b, h = +d.h, t = +d.t;
      const sc = Math.min((W-2*pad)/b,(H-2*pad)/h);
      const ox = (W-b*sc)/2, oy = (H-h*sc)/2;
      ctx.fillRect(ox,oy+h*sc-t*sc,b*sc,t*sc); ctx.strokeRect(ox,oy+h*sc-t*sc,b*sc,t*sc);
      ctx.fillRect(ox,oy,t*sc,h*sc); ctx.strokeRect(ox,oy,t*sc,h*sc);
      if (computed) {
        const yNA = oy + (h - computed.yc) * sc;
        ctx.strokeStyle="#3dd68c"; ctx.lineWidth=1; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(ox, yNA); ctx.lineTo(ox+b*sc, yNA); ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    if (computed) {
      ctx.fillStyle="#9ca3af"; ctx.font="10px monospace"; ctx.textAlign="center";
      ctx.fillText(`Ix = ${computed.Ix.toFixed(2)}`, W/2, H-8);
    }
  }, [type, dims, computed]);

  return <canvas ref={ref} width={200} height={180} style={{width:"100%",borderRadius:6,background:"#1a1d27"}}/>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEM MESH VISUALIZATION CANVAS
// Shows nodes, elements, constrained DOFs, and support symbols
// ═══════════════════════════════════════════════════════════════════════════════
function FEMMeshCanvas({ refinedNodes, supports, L, constrainedDOFs, nFree, uu }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!refinedNodes || !ref.current) return;
    const cv = ref.current;
    const container = cv.parentElement;

    const draw = () => {
    const dpr = window.devicePixelRatio || 2;
    const cssW = container ? container.clientWidth || 680 : 680;
    const cssH = Math.max(120, Math.min(140, cssW * 0.2));
    cv.width = cssW * dpr; cv.height = cssH * dpr;
    cv.style.width = cssW + "px"; cv.style.height = cssH + "px";
    const ctx = cv.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "#0b0d14"; ctx.fillRect(0, 0, cssW, cssH);

    const pad = { l: 24, r: 24 };
    const plotW = cssW - pad.l - pad.r;
    const beamY = Math.round(cssH * 0.44);
    const nNodes = refinedNodes.length;
    const nElems = nNodes - 1;
    const toX = x => pad.l + (x / L) * plotW;

    // Grid
    ctx.strokeStyle = "#14172a"; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 20; i++) {
      const x = pad.l + (i / 20) * plotW;
      ctx.beginPath(); ctx.moveTo(x, 15); ctx.lineTo(x, 110); ctx.stroke();
    }

    // Element segments (alternating tints)
    for (let e = 0; e < nElems; e++) {
      const x1 = toX(refinedNodes[e]);
      const x2 = toX(refinedNodes[e + 1]);
      ctx.fillStyle = e % 2 === 0 ? "#1a2d4f" : "#152540";
      ctx.fillRect(x1, beamY - 5, x2 - x1, 10);
      ctx.strokeStyle = e % 2 === 0 ? "#2a4a7a" : "#1e3a6a";
      ctx.lineWidth = 0.6; ctx.strokeRect(x1, beamY - 5, x2 - x1, 10);
    }

    // Beam outline
    ctx.strokeStyle = "#3d6cb5"; ctx.lineWidth = 1.5;
    ctx.strokeRect(toX(0), beamY - 5, plotW, 10);

    // Support symbols
    const sortedSups = [...supports].sort((a, b) => a.pos - b.pos);
    for (const sup of sortedSups) {
      const sx = toX(sup.pos);
      if (sup.type === "fixed") {
        ctx.strokeStyle = "#f97316"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(sx - 2, beamY - 14); ctx.lineTo(sx - 2, beamY + 14); ctx.stroke();
        ctx.lineWidth = 1.2;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath(); ctx.moveTo(sx - 2, beamY + i * 5); ctx.lineTo(sx - 13, beamY + i * 5 + 5); ctx.stroke();
        }
        ctx.fillStyle = "#f9731699"; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText("Fixed", sx - 2, beamY + 26);
        ctx.fillStyle = "#f97316";
        ctx.fillText(`x=${sup.pos}`, sx - 2, beamY + 35);
      } else {
        const col = sup.type === "pin" ? "#3dd68c" : "#f7a24f";
        ctx.strokeStyle = col; ctx.fillStyle = col + "33"; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx, beamY + 5); ctx.lineTo(sx - 9, beamY + 19); ctx.lineTo(sx + 9, beamY + 19);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        if (sup.type === "roller") {
          ctx.fillStyle = col; ctx.beginPath(); ctx.arc(sx - 6, beamY + 22, 3, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(sx + 6, beamY + 22, 3, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.beginPath(); ctx.moveTo(sx - 12, beamY + 22); ctx.lineTo(sx + 12, beamY + 22); ctx.stroke();
        }
        ctx.fillStyle = col; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText(sup.type[0].toUpperCase() + sup.type.slice(1), sx, beamY + 35);
      }
    }

    // Node markers
    for (let i = 0; i < nNodes; i++) {
      const nx = toX(refinedNodes[i]);
      const vC = constrainedDOFs && constrainedDOFs.includes(2 * i);
      const mC = constrainedDOFs && constrainedDOFs.includes(2 * i + 1);
      const isConstr = vC || mC;
      const isFull = vC && mC;
      const color = isFull ? "#f97316" : isConstr ? "#fbbf24" : "#4f8ef7";
      ctx.beginPath(); ctx.arc(nx, beamY, isConstr ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = color + "aa"; ctx.lineWidth = 1; ctx.stroke();
      // Node labels (only for small meshes)
      if (nNodes <= 22) {
        ctx.fillStyle = isConstr ? color : "#4a5568";
        ctx.font = "7px monospace"; ctx.textAlign = "center";
        ctx.fillText(i + 1, nx, beamY - 9);
      }
    }

    // Legend
    ctx.font = "8.5px monospace"; ctx.textAlign = "left";
    const drawDot = (cx, cy, col) => { ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); };
    drawDot(pad.l, 12, "#f97316"); ctx.fillStyle = "#f97316"; ctx.fillText("Fixed node", pad.l + 8, 16);
    drawDot(pad.l + 80, 12, "#fbbf24"); ctx.fillStyle = "#fbbf24"; ctx.fillText("Pin/Roller node", pad.l + 88, 16);
    drawDot(pad.l + 185, 12, "#4f8ef7"); ctx.fillStyle = "#4f8ef7"; ctx.fillText("Free node", pad.l + 193, 16);

    // Stats (right side)
    ctx.fillStyle = "#4a5568"; ctx.textAlign = "right";
    ctx.fillText(`${nElems} elements  ·  ${nNodes} nodes  ·  ${nNodes * 2} DOFs  ·  ${nFree} free`, cssW - pad.r, 16);

    };
    draw();
    const ro = new ResizeObserver(draw);
    if(container) ro.observe(container);
    return () => ro.disconnect();
  }, [refinedNodes, supports, L, constrainedDOFs, nFree]);

  return (
    <canvas ref={ref} width={680} height={140}
      style={{ width: "100%", borderRadius: 8, background: "#0b0d14", display: "block" }} />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIRECT STIFFNESS METHOD — UNIVERSAL BEAM SOLVER
// Handles ANY support configuration using finite element formulation
// ═══════════════════════════════════════════════════════════════════════════════

function beamElementStiffness(EI, L) {
  const k = EI / (L * L * L);
  return [
    [12*k,  6*L*k, -12*k,  6*L*k],
    [6*L*k, 4*L*L*k, -6*L*k, 2*L*L*k],
    [-12*k, -6*L*k, 12*k, -6*L*k],
    [6*L*k, 2*L*L*k, -6*L*k, 4*L*L*k]
  ];
}

function equivalentNodalLoadsPartial(type, w1, w2, a, b, L) {
  const F = [0, 0, 0, 0];
  if (b <= a) return F;

  if (type === "udl") {
    const w = w1;
    const intN1 = (x) => x - (x*x*x)/(L*L) + (x*x*x*x)/(2*L*L*L);
    const intN2 = (x) => (x*x)/2 - (2*x*x*x)/(3*L) + (x*x*x*x)/(4*L*L);
    const intN3 = (x) => (x*x*x)/(L*L) - (x*x*x*x)/(2*L*L*L);
    const intN4 = (x) => -(x*x*x)/(3*L) + (x*x*x*x)/(4*L*L);
    F[0] = w * (intN1(b) - intN1(a));
    F[1] = w * (intN2(b) - intN2(a));
    F[2] = w * (intN3(b) - intN3(a));
    F[3] = w * (intN4(b) - intN4(a));
  } else if (type === "tri") {
    const slope = (w2 - w1) / (b - a);
    const n = 20;
    const h = (b - a) / n;
    for (let dof = 0; dof < 4; dof++) {
      let sum = 0;
      for (let i = 0; i <= n; i++) {
        const x = a + i * h;
        const xi = x / L;
        const wx = w1 + slope * (x - a);
        let Nx;
        if (dof === 0) Nx = 1 - 3*xi*xi + 2*xi*xi*xi;
        else if (dof === 1) Nx = L * (xi - 2*xi*xi + xi*xi*xi);
        else if (dof === 2) Nx = 3*xi*xi - 2*xi*xi*xi;
        else Nx = L * (-xi*xi + xi*xi*xi);
        const weight = (i === 0 || i === n) ? 1 : (i % 2 === 0 ? 2 : 4);
        sum += weight * wx * Nx;
      }
      F[dof] = (sum * h / 3);
    }
  }
  return F;
}

function solveLinear(A, b) {
  const n = b.length;
  const aug = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(aug[r][col]) > Math.abs(aug[maxRow][col])) maxRow = r;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-30) continue;
    for (let r = col + 1; r < n; r++) {
      const factor = aug[r][col] / pivot;
      for (let c = col; c <= n; c++) {
        aug[r][c] -= factor * aug[col][c];
      }
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(aug[i][i]) < 1e-30) { x[i] = 0; continue; }
    let sum = aug[i][n];
    for (let j = i + 1; j < n; j++) sum -= aug[i][j] * x[j];
    x[i] = sum / aug[i][i];
  }
  return x;
}

function solveBeamStiffness(L, E, I, supports, loads, unitSys, meshDensity = 20) {
  const EI = unitSys === "imperial" 
    ? (E * I) / 144
    : (E * 1e6 * I * 1e-12);

  const sortedSupports = [...supports].sort((a, b) => a.pos - b.pos);
  for (let i = 1; i < sortedSupports.length; i++) {
    if (Math.abs(sortedSupports[i].pos - sortedSupports[i-1].pos) < 1e-6) {
      throw new Error(`Duplicate support positions at x = ${sortedSupports[i].pos}`);
    }
  }

  // Create nodes at support positions AND load boundaries/points
  const nodes = [0];
  for (const sup of sortedSupports) {
    if (sup.pos > 0 && sup.pos < L && !nodes.some(n => Math.abs(n - sup.pos) < 1e-6)) {
      nodes.push(sup.pos);
    }
  }
  for (const ld of loads) {
    if (ld.type === "point" || ld.type === "moment") {
      if (ld.a >= 0 && ld.a <= L && !nodes.some(n => Math.abs(n - ld.a) < 1e-6)) nodes.push(ld.a);
    } else {
      if (ld.a >= 0 && ld.a <= L && !nodes.some(n => Math.abs(n - ld.a) < 1e-6)) nodes.push(ld.a);
      if (ld.b >= 0 && ld.b <= L && !nodes.some(n => Math.abs(n - ld.b) < 1e-6)) nodes.push(ld.b);
    }
  }
  if (!nodes.some(n => Math.abs(n - L) < 1e-6)) nodes.push(L);
  nodes.sort((a, b) => a - b);

  // Subdivide each span
  const refinedNodes = [nodes[0]];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i], b = nodes[i+1];
    const span = b - a;
    const nSub = Math.max(2, Math.ceil(span / L * meshDensity));
    const dx = span / nSub;
    for (let j = 1; j <= nSub; j++) {
      const x = a + j * dx;
      if (!refinedNodes.some(n => Math.abs(n - x) < 1e-6)) refinedNodes.push(x);
    }
  }
  refinedNodes.sort((a, b) => a - b);

  const nNodes = refinedNodes.length;
  const nDof = nNodes * 2;

  let K = Array.from({length: nDof}, () => Array(nDof).fill(0));
  let F = Array(nDof).fill(0);

  for (let e = 0; e < nNodes - 1; e++) {
    const node1 = e, node2 = e + 1;
    const x1 = refinedNodes[node1], x2 = refinedNodes[node2];
    const Le = x2 - x1;
    const ke = beamElementStiffness(EI, Le);
    const gdof = [2*node1, 2*node1+1, 2*node2, 2*node2+1];

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        K[gdof[i]][gdof[j]] += ke[i][j];
      }
    }

    for (const ld of loads) {
      if (ld.type === "udl" || ld.type === "tri") {
        const loadStart = Math.max(ld.a, x1);
        const loadEnd = Math.min(ld.b, x2);
        if (loadStart < loadEnd - 1e-6) {
          let wStart, wEnd;
          if (ld.type === "udl") {
            wStart = ld.w1; wEnd = ld.w1;
          } else {
            const fStart = (loadStart - ld.a) / (ld.b - ld.a);
            wStart = ld.w1 + (ld.w2 - ld.w1) * fStart;
            const fEnd = (loadEnd - ld.a) / (ld.b - ld.a);
            wEnd = ld.w1 + (ld.w2 - ld.w1) * fEnd;
          }
          const aLocal = loadStart - x1;
          const bLocal = loadEnd - x1;
          const fe = equivalentNodalLoadsPartial(ld.type, wStart, wEnd, aLocal, bLocal, Le);
          for (let i = 0; i < 4; i++) F[gdof[i]] += fe[i];
        }
      }
    }
  }

  // Point loads / moments — apply directly if on a node, else consistent distribution
  for (const ld of loads) {
    if (ld.type === "point") {
      let onNode = -1;
      for (let i = 0; i < nNodes; i++) {
        if (Math.abs(refinedNodes[i] - ld.a) < 1e-6) { onNode = i; break; }
      }
      if (onNode >= 0) {
        F[2*onNode] += ld.P;
      } else {
        let elemIdx = -1;
        for (let e = 0; e < nNodes - 1; e++) {
          if (ld.a >= refinedNodes[e] - 1e-6 && ld.a <= refinedNodes[e+1] + 1e-6) { elemIdx = e; break; }
        }
        if (elemIdx >= 0) {
          const x1 = refinedNodes[elemIdx], x2 = refinedNodes[elemIdx+1];
          const Le = x2 - x1;
          const xi = (ld.a - x1) / Le;
          const N1 = 1 - 3*xi*xi + 2*xi*xi*xi;
          const N2 = Le * (xi - 2*xi*xi + xi*xi*xi);
          const N3 = 3*xi*xi - 2*xi*xi*xi;
          const N4 = Le * (-xi*xi + xi*xi*xi);
          const gdof = [2*elemIdx, 2*elemIdx+1, 2*(elemIdx+1), 2*(elemIdx+1)+1];
          F[gdof[0]] += N1 * ld.P;
          F[gdof[1]] += N2 * ld.P;
          F[gdof[2]] += N3 * ld.P;
          F[gdof[3]] += N4 * ld.P;
        }
      }
    } else if (ld.type === "moment") {
      let onNode = -1;
      for (let i = 0; i < nNodes; i++) {
        if (Math.abs(refinedNodes[i] - ld.a) < 1e-6) { onNode = i; break; }
      }
      if (onNode >= 0) {
        F[2*onNode+1] += ld.P;
      } else {
        let elemIdx = -1;
        for (let e = 0; e < nNodes - 1; e++) {
          if (ld.a >= refinedNodes[e] - 1e-6 && ld.a <= refinedNodes[e+1] + 1e-6) { elemIdx = e; break; }
        }
        if (elemIdx >= 0) {
          const x1 = refinedNodes[elemIdx], x2 = refinedNodes[elemIdx+1];
          const Le = x2 - x1;
          const xi = (ld.a - x1) / Le;
          const dN1 = (-6*xi + 6*xi*xi) / Le;
          const dN2 = 1 - 4*xi + 3*xi*xi;
          const dN3 = (6*xi - 6*xi*xi) / Le;
          const dN4 = -2*xi + 3*xi*xi;
          const gdof = [2*elemIdx, 2*elemIdx+1, 2*(elemIdx+1), 2*(elemIdx+1)+1];
          F[gdof[0]] += dN1 * ld.P;
          F[gdof[1]] += dN2 * ld.P;
          F[gdof[2]] += dN3 * ld.P;
          F[gdof[3]] += dN4 * ld.P;
        }
      }
    }
  }

  // Apply boundary conditions
  const constrainedDof = new Set();
  const supportReactions = [];
  for (const sup of sortedSupports) {
    let nearestNode = 0;
    let minDist = Math.abs(refinedNodes[0] - sup.pos);
    for (let i = 1; i < nNodes; i++) {
      const dist = Math.abs(refinedNodes[i] - sup.pos);
      if (dist < minDist) { minDist = dist; nearestNode = i; }
    }
    const vDof = 2 * nearestNode;
    if (!constrainedDof.has(vDof)) {
      constrainedDof.add(vDof);
      supportReactions.push({ dof: vDof, type: sup.type, pos: refinedNodes[nearestNode], node: nearestNode });
    }
    if (sup.type === "fixed") {
      const tDof = 2 * nearestNode + 1;
      if (!constrainedDof.has(tDof)) {
        constrainedDof.add(tDof);
        supportReactions.push({ dof: tDof, type: "fixed_moment", pos: refinedNodes[nearestNode], node: nearestNode });
      }
    }
  }

  const nConstraints = constrainedDof.size;
  if (nConstraints < 2) throw new Error("Beam is unstable: need at least 2 constraints.");
  const constraintPositions = new Set();
  for (const sr of supportReactions) {
    if (sr.type !== "fixed_moment") constraintPositions.add(sr.pos);
  }
  const hasMomentConstraint = supportReactions.some(sr => sr.type === "fixed_moment");
  if (!hasMomentConstraint && constraintPositions.size < 2) {
    throw new Error("Beam is a mechanism: need at least one fixed support OR supports at 2+ different positions.");
  }

  const freeDof = [];
  for (let i = 0; i < nDof; i++) if (!constrainedDof.has(i)) freeDof.push(i);
  const nFree = freeDof.length;
  const Kff = Array.from({length: nFree}, () => Array(nFree).fill(0));
  const Ff = Array(nFree).fill(0);
  for (let i = 0; i < nFree; i++) {
    Ff[i] = F[freeDof[i]];
    for (let j = 0; j < nFree; j++) Kff[i][j] = K[freeDof[i]][freeDof[j]];
  }

  const df = solveLinear(Kff, Ff);
  const d = Array(nDof).fill(0);
  for (let i = 0; i < nFree; i++) d[freeDof[i]] = df[i];

  // Compute reactions (positive = upward / counter-clockwise)
  const reactions = [];
  for (const sr of supportReactions) {
    const dof = sr.dof;
    let reaction = 0;
    for (let j = 0; j < nDof; j++) reaction += K[dof][j] * d[j];
    reaction -= F[dof];
    reactions.push({
      type: sr.type === "fixed_moment" ? "moment" : sr.type,
      pos: sr.pos,
      value: reaction,
      dof: dof,
      isMoment: sr.type === "fixed_moment"
    });
  }

  // Deflection & slope from shape functions
  const N = 1000;
  const dx = L / N;
  const xs = Array.from({length: N+1}, (_, i) => i * dx);
  const theta = new Array(N+1).fill(0);
  const delta = new Array(N+1).fill(0);

  for (let i = 0; i <= N; i++) {
    const x = xs[i];
    let elem = 0;
    for (let e = 0; e < nNodes - 1; e++) {
      if (x >= refinedNodes[e] - 1e-6 && x <= refinedNodes[e+1] + 1e-6) { elem = e; break; }
    }
    const node1 = elem, node2 = elem + 1;
    const x1 = refinedNodes[node1], x2 = refinedNodes[node2];
    const Le = x2 - x1;
    const xi = Math.max(0, Math.min(1, (x - x1) / Le));
    const H1 = 1 - 3*xi*xi + 2*xi*xi*xi;
    const H2 = Le * (xi - 2*xi*xi + xi*xi*xi);
    const H3 = 3*xi*xi - 2*xi*xi*xi;
    const H4 = Le * (-xi*xi + xi*xi*xi);
    const dH1 = (-6*xi + 6*xi*xi) / Le;
    const dH2 = 1 - 4*xi + 3*xi*xi;
    const dH3 = (6*xi - 6*xi*xi) / Le;
    const dH4 = -2*xi + 3*xi*xi;
    const v1 = d[2*node1], t1 = d[2*node1+1];
    const v2 = d[2*node2], t2 = d[2*node2+1];
    delta[i] = H1*v1 + H2*t1 + H3*v2 + H4*t2;
    theta[i] = dH1*v1 + dH2*t1 + dH3*v2 + dH4*t2;
  }

  // V and M by direct equilibrium
  const wIntegral = (x) => {
    let s = 0;
    for (const ld of loads) {
      if (ld.type === "udl" && x > ld.a + 1e-9) {
        s += ld.w1 * (Math.min(x, ld.b) - ld.a);
      }
      if (ld.type === "tri" && x > ld.a + 1e-9) {
        const xe = Math.min(x, ld.b), span = ld.b - ld.a, t = xe - ld.a;
        s += ld.w1 * t + (ld.w2 - ld.w1) * t * t / (2 * span);
      }
    }
    return s;
  };

  const wMoment = (x) => {
    let m = 0;
    for (const ld of loads) {
      if (ld.type === "udl" && x > ld.a + 1e-9) {
        const xe = Math.min(x, ld.b), a = ld.a, w = ld.w1;
        m += w * (x * (xe - a) - (xe * xe - a * a) / 2);
      }
      if (ld.type === "tri" && x > ld.a + 1e-9) {
        const xe = Math.min(x, ld.b), a = ld.a, span = ld.b - ld.a, t = xe - a;
        m += ld.w1 * (x * t - a * t - t * t / 2) +
             (ld.w2 - ld.w1) / span * (x * t * t / 2 - a * t * t / 2 - t * t * t / 3);
      }
    }
    return m;
  };

  const V = new Array(N+1).fill(0);
  const M = new Array(N+1).fill(0);

  for (let i = 0; i <= N; i++) {
    const x = xs[i];
    let Vx = 0, Mx = 0;
    for (const r of reactions) {
      if (!r.isMoment && r.pos <= x + 1e-9) {
        Vx += r.value;
        Mx += r.value * (x - r.pos);
      }
      if (r.isMoment && r.pos <= x + 1e-9) {
        Mx += r.value;
      }
    }
    Vx += wIntegral(x);
    Mx += wMoment(x);
    for (const ld of loads) {
      if (ld.type === "point" && ld.a <= x + 1e-9) {
        Vx += ld.P;
        Mx += ld.P * (x - ld.a);
      }
      if (ld.type === "moment" && ld.a <= x + 1e-9) {
        Mx += ld.P;
      }
    }
    V[i] = Vx;
    M[i] = Mx;
  }

  const scale = unitSys === "imperial" ? 12 : 1000;
  for (let i = 0; i <= N; i++) delta[i] *= scale;

  // === FEM NODAL OUTPUT DATA ===
  const deltaScale = unitSys === "imperial" ? 12 : 1000;
  const nodalDisp = refinedNodes.map((xn, i) => ({
    x: xn,
    node: i + 1,
    delta: d[2 * i] * deltaScale,
    theta: d[2 * i + 1],
    vConstr: constrainedDof.has(2 * i),
    mConstr: constrainedDof.has(2 * i + 1),
  }));

  // Key structural nodes for the display table
  const keyPosSet = new Set([0, L]);
  for (const sup of sortedSupports) keyPosSet.add(sup.pos);
  for (const ld of loads) {
    keyPosSet.add(ld.a);
    if (ld.b !== undefined) keyPosSet.add(ld.b);
  }
  const keyNodes = nodalDisp.filter(nd =>
    [...keyPosSet].some(kp => Math.abs(nd.x - kp) < 1e-6)
  );

  const arrAbsMax = a => { let m = 0; for (let i = 0; i < a.length; i++) { const v = Math.abs(a[i]); if (v > m) m = v; } return m; };
  const arrMin = a => { let m = 0; for (let i = 0; i < a.length; i++) if (a[i] < m) m = a[i]; return m; };
  const arrMax = a => { let m = 0; for (let i = 0; i < a.length; i++) if (a[i] > m) m = a[i]; return m; };

  const dMin = arrMin(delta);
  const dMax = arrMax(delta);
  const dPeak = Math.max(Math.abs(dMin), Math.abs(dMax));
  let dPeakIdx = 0;
  for (let i = 0; i <= N; i++) if (Math.abs(delta[i]) === dPeak) { dPeakIdx = i; break; }

  // Extract RA/RB/MA/MB for UI compatibility
  const vertReactions = reactions.filter(r => !r.isMoment);
  const momentReactions = reactions.filter(r => r.isMoment);
  const RA = vertReactions.find(r => Math.abs(r.pos) < 1e-6)?.value || 0;
  const RB = vertReactions.find(r => Math.abs(r.pos - L) < 1e-6)?.value || 0;
  const MA_fix = momentReactions.find(r => Math.abs(r.pos) < 1e-6)?.value || 0;
  const MB_fix = momentReactions.find(r => Math.abs(r.pos - L) < 1e-6)?.value || 0;

  return {
    xs, V, M, theta, delta,
    RA, RB, MA_fix, MB_fix,
    Vmax: arrAbsMax(V), Mmax: arrAbsMax(M), dMin, dMax, dPeak, dPeakPos: xs[dPeakIdx],
    thetaA: theta[0], thetaB: theta[N],
    thetaMax: arrAbsMax(theta),
    EI,
    reactions: vertReactions.map(r => ({ type: r.type, pos: r.pos, R: r.value })),
    momentReactions: momentReactions.map(r => ({ type: r.type, pos: r.pos, M: r.value })),
    // FEM mesh metadata
    refinedNodes,
    nElems: nNodes - 1,
    nDOF: nDof,
    nFree: freeDof.length,
    constrainedDOFs: Array.from(constrainedDof),
    nodalDisp,
    keyNodes,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AISC 360 STEEL CHECKS
// ═══════════════════════════════════════════════════════════════════════════════
function steelChecks(section, results, Fy=50, unitSys="imperial") {
  if(!section) return null;
  const { Zx, d, tw, bf, tf } = section;
  const Es=29000;
  const Mmax_kft = unitSys==="metric" ? results.Mmax / 1.35582 : results.Mmax;
  const Vmax_kip = unitSys==="metric" ? results.Vmax / 4.44822 : results.Vmax;
  const Mp=Fy*Zx; const Mn=Mp; const phi_Mn=0.9*Mn/12;
  const Aw=d*tw; const Vn=0.6*Fy*Aw; const phi_Vn=Vn;
  const MRatio=Mmax_kft/phi_Mn; const VRatio=Vmax_kip/phi_Vn;
  const lambda_f=(bf/2)/tf; const lambda_pf=0.38*Math.sqrt(Es/Fy);
  return { phi_Mn, phi_Vn, MRatio, VRatio, momentPass:MRatio<=1, shearPass:VRatio<=1, isCompact:lambda_f<=lambda_pf, Mp, Aw, lambda_f, lambda_pf };
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERACTIVE DIAGRAM CANVAS
// ═══════════════════════════════════════════════════════════════════════════════
function DiagramCanvas({ data, color, label, unit, reverse=false, labels=[] }) {
  const canvasRef=useRef(null);
  const [tooltip,setTooltip]=useState(null);

  const drawLabels=(ctx,labelList,px,py,color,H,pad,plotW)=>{
    labelList.forEach((lb,idx)=>{
      const tx=px(lb.x), ty=py(lb.v);
      ctx.save();
      ctx.strokeStyle=color+"cc"; ctx.lineWidth=1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(tx,pad.t); ctx.lineTo(tx,H-pad.b); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=color; ctx.beginPath(); ctx.arc(tx,ty,4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#0f1117"; ctx.lineWidth=1.2; ctx.stroke();
      const boxW=110, boxH=30, margin=6;
      const flipLeft = tx + boxW + margin > (pad.l + plotW);
      const bx = flipLeft ? tx - boxW - margin : tx + margin;
      const by = Math.max(pad.t+2, Math.min(ty - boxH/2, H - pad.b - boxH - 2));
      ctx.fillStyle="#0f1117ee";
      ctx.beginPath(); ctx.roundRect?ctx.roundRect(bx,by,boxW,boxH,4):ctx.rect(bx,by,boxW,boxH);
      ctx.fill();
      ctx.strokeStyle=color+"99"; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle=color; ctx.font="bold 9px monospace"; ctx.textAlign="center";
      ctx.fillText(`L${idx+1}`, bx+9, by+boxH/2+4);
      ctx.fillStyle="#9ca3af"; ctx.font="9px monospace"; ctx.textAlign="left";
      ctx.fillText(`x=${lb.x.toFixed(3)}`, bx+18, by+10);
      ctx.fillStyle=color; ctx.font="bold 9px monospace";
      ctx.fillText(`${lb.v.toFixed(4)} ${unit}`, bx+18, by+22);
      ctx.restore();
    });
  };

  useEffect(()=>{
    if(!data||!canvasRef.current) return;
    const canvas=canvasRef.current;
    const container=canvas.parentElement;

    const draw=()=>{
    const ctx=canvas.getContext("2d");
    const dpr=window.devicePixelRatio||2;
    const cssW=container?container.clientWidth||680:680, cssH=Math.max(160,Math.min(200,cssW*0.3));
    canvas.width=cssW*dpr; canvas.height=cssH*dpr;
    canvas.style.width=cssW+"px"; canvas.style.height=cssH+"px";
    ctx.scale(dpr,dpr);
    const W=cssW, H=cssH;
    const pad={t:28,b:38,l:68,r:20};
    ctx.clearRect(0,0,W,H);
    const vals=reverse?data.y.map(v=>-v):data.y;
    const xs=data.x;
    let minV=0,maxV=0; for(let i=0;i<vals.length;i++){if(vals[i]<minV)minV=vals[i];if(vals[i]>maxV)maxV=vals[i];}
    const range=maxV-minV||1;
    const plotW=W-pad.l-pad.r, plotH=H-pad.t-pad.b;
    const px=x=>pad.l+(x/xs[xs.length-1])*plotW;
    const py=v=>pad.t+plotH-((v-minV)/range)*plotH;
    const zero=py(0);
    ctx.fillStyle="#0f1117"; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#111420"; ctx.fillRect(pad.l,pad.t,plotW,plotH);
    ctx.strokeStyle="#1a1e2e"; ctx.lineWidth=0.5;
    for(let i=0;i<=12;i++){const y=pad.t+(i/12)*plotH;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();}
    for(let i=0;i<=20;i++){const x=pad.l+(i/20)*plotW;ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,H-pad.b);ctx.stroke();}
    ctx.strokeStyle="#232740"; ctx.lineWidth=1;
    for(let i=0;i<=6;i++){const y=pad.t+(i/6)*plotH;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(W-pad.r,y);ctx.stroke();}
    for(let i=0;i<=10;i++){const x=pad.l+(i/10)*plotW;ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,H-pad.b);ctx.stroke();}
    ctx.strokeStyle="#3a3f5c"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(pad.l,zero); ctx.lineTo(W-pad.r,zero); ctx.stroke();
    const grad=ctx.createLinearGradient(0,pad.t,0,H-pad.b);
    grad.addColorStop(0,color+"60"); grad.addColorStop(0.5,color+"28"); grad.addColorStop(1,color+"05");
    ctx.beginPath(); ctx.moveTo(px(xs[0]),zero);
    for(let i=0;i<xs.length;i++) ctx.lineTo(px(xs[i]),py(vals[i]));
    ctx.lineTo(px(xs[xs.length-1]),zero); ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
    ctx.beginPath();
    for(let i=0;i<xs.length;i++) i===0?ctx.moveTo(px(xs[i]),py(vals[i])):ctx.lineTo(px(xs[i]),py(vals[i]));
    ctx.strokeStyle=color; ctx.lineWidth=2; ctx.lineJoin="round"; ctx.stroke();
    ctx.beginPath();
    for(let i=0;i<xs.length;i++) i===0?ctx.moveTo(px(xs[i]),py(vals[i])):ctx.lineTo(px(xs[i]),py(vals[i]));
    ctx.strokeStyle=color+"90"; ctx.lineWidth=4; ctx.filter="blur(2px)"; ctx.stroke(); ctx.filter="none";
    ctx.strokeStyle="#2d3250"; ctx.lineWidth=1; ctx.strokeRect(pad.l,pad.t,plotW,plotH);
    ctx.fillStyle="#8892a4"; ctx.font="10px 'Segoe UI',monospace"; ctx.textAlign="right";
    const step=range/4;
    for(let i=0;i<=4;i++){const v=minV+i*step;ctx.fillText(v.toFixed(2),pad.l-6,py(v)+3.5);}
    ctx.textAlign="center";
    for(let i=0;i<=5;i++){const x=i*xs[xs.length-1]/5;ctx.fillText(x.toFixed(1),px(x),H-8);}
    ctx.fillStyle=color; ctx.font="bold 11px 'Segoe UI',sans-serif"; ctx.textAlign="left";
    ctx.fillText(`${label} (${unit})`,pad.l+4,18);
    ctx.strokeStyle="#3a3f5c"; ctx.lineWidth=1;
    for(let i=0;i<=5;i++){const x=i*xs[xs.length-1]/5;ctx.beginPath();ctx.moveTo(px(x),H-pad.b);ctx.lineTo(px(x),H-pad.b+4);ctx.stroke();}
    drawLabels(ctx,labels,px,py,color,H,pad,plotW);
    if(tooltip){
      const tx=px(tooltip.x),ty=py(tooltip.v);
      ctx.strokeStyle=color+"55"; ctx.lineWidth=1; ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(tx,pad.t);ctx.lineTo(tx,H-pad.b);ctx.stroke();
      ctx.beginPath();ctx.moveTo(pad.l,ty);ctx.lineTo(W-pad.r,ty);ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=color; ctx.beginPath(); ctx.arc(tx,ty,5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#0f1117"; ctx.lineWidth=1.5; ctx.stroke();
    }
    };
    draw();
    const ro=new ResizeObserver(draw);
    if(container) ro.observe(container);
    return()=>ro.disconnect();
  },[data,color,label,unit,reverse,tooltip,labels]);

  const handleMouseMove=useCallback(e=>{
    if(!data||!canvasRef.current) return;
    const canvas=canvasRef.current, rect=canvas.getBoundingClientRect();
    const scaleX=canvas.width/rect.width;
    const mx=(e.clientX-rect.left)*scaleX;
    const pad={l:62,r:18};
    const plotW=canvas.width-pad.l-pad.r;
    const xFrac=Math.max(0,Math.min(1,(mx-pad.l)/plotW));
    const idx=Math.round(xFrac*(data.x.length-1));
    const vVal=reverse?-data.y[idx]:data.y[idx];
    setTooltip({x:data.x[idx],v:vVal});
  },[data,reverse]);

  return (
    <div style={{position:"relative"}}>
      <canvas ref={canvasRef} style={{width:"100%",borderRadius:8,cursor:"crosshair",display:"block"}}
        onMouseMove={handleMouseMove} onMouseLeave={()=>setTooltip(null)}/>
      {tooltip&&(
        <div style={{position:"absolute",top:6,right:10,background:"#0f1117cc",border:`1px solid ${color}`,borderRadius:6,padding:"4px 10px",fontSize:11,color:"#e8eaf0",pointerEvents:"none"}}>
          x = {tooltip.x.toFixed(3)} &nbsp;|&nbsp; <span style={{color}}>{tooltip.v.toFixed(4)}</span> {unit}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BEAM SKETCH
// ═══════════════════════════════════════════════════════════════════════════════
function BeamSketch({ beamType, L, loads, uu, customSupports=[] }) {
  const ref=useRef(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const ctx=cv.getContext("2d"), W=cv.width, H=cv.height;
    ctx.clearRect(0,0,W,H); ctx.fillStyle="#1a1d27"; ctx.fillRect(0,0,W,H);
    const ml=80,mr=80,beamY=H/2+10,bL=ml,bR=W-mr,bLen=bR-bL;
    ctx.strokeStyle="#4f8ef7"; ctx.lineWidth=8; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(bL,beamY); ctx.lineTo(bR,beamY); ctx.stroke();
    const drawPin=(x,y,col="#3dd68c")=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-12,y+20);ctx.lineTo(x+12,y+20);ctx.closePath();ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-15,y+22);ctx.lineTo(x+15,y+22);ctx.stroke();ctx.fillStyle="#1a1d27";ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();};
    const drawRoller=(x,y,col="#f7a24f")=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-10,y+16);ctx.lineTo(x+10,y+16);ctx.closePath();ctx.fill();ctx.beginPath();ctx.arc(x-7,y+20,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+7,y+20,4,0,Math.PI*2);ctx.fill();};
    const drawFixed=(x,y,dir)=>{ctx.strokeStyle="#f75f5f";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-28);ctx.lineTo(x,y+28);ctx.stroke();for(let i=-22;i<=22;i+=9){ctx.beginPath();ctx.moveTo(x,y+i);ctx.lineTo(x+dir*14,y+i+7);ctx.stroke();}};
    if(beamType==="SS"){drawPin(bL,beamY);drawRoller(bR,beamY);}
    else if(beamType==="CANT"){drawFixed(bL,beamY,-1);}
    else if(beamType==="FIXED"){drawFixed(bL,beamY,-1);drawFixed(bR,beamY,1);}
    else if(beamType==="PROPPED"){drawFixed(bL,beamY,-1);drawRoller(bR,beamY);}
    else if(beamType==="CUSTOM"){
      customSupports.forEach(s=>{
        const x=bL+(s.pos/L)*bLen;
        if(s.type==="pin") drawPin(x,beamY);
        else if(s.type==="roller") drawRoller(x,beamY);
        else if(s.type==="fixed") drawFixed(x,beamY,s.pos<L/2?-1:1);
        ctx.fillStyle="#9ca3af";ctx.font="9px sans-serif";ctx.textAlign="center";
        ctx.fillText(s.type[0].toUpperCase()+s.type.slice(1), x, beamY+38);
        ctx.fillText(`${s.pos}${uu.len}`, x, beamY+48);
      });
    }
    const toX=x=>bL+(x/L)*bLen;
    loads.forEach(ld=>{
      if(ld.type==="point"){
        const x=toX(ld.a),dir=ld.P<0?-1:1;
        ctx.strokeStyle="#a78bfa";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,beamY+dir*45);ctx.lineTo(x,beamY+dir*8);ctx.stroke();
        ctx.fillStyle="#a78bfa";ctx.beginPath();ctx.moveTo(x,beamY);ctx.lineTo(x-6,beamY+dir*12);ctx.lineTo(x+6,beamY+dir*12);ctx.closePath();ctx.fill();
        ctx.fillStyle="#e8eaf0";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText(`${Math.abs(ld.P).toFixed(2)}`,x,beamY+dir*58);
      }
      if(ld.type==="udl"){
        const x1=toX(ld.a),x2=toX(ld.b),dir=ld.w1<0?-1:1;
        ctx.strokeStyle="#a78bfa";ctx.lineWidth=1.5;
        ctx.beginPath();ctx.moveTo(x1,beamY+dir*38);ctx.lineTo(x2,beamY+dir*38);ctx.stroke();
        const step=Math.max((x2-x1)/8,12);
        for(let x=x1;x<=x2+1;x+=step){const cx=Math.min(x,x2);ctx.beginPath();ctx.moveTo(cx,beamY+dir*38);ctx.lineTo(cx,beamY+dir*8);ctx.stroke();ctx.fillStyle="#a78bfa";ctx.beginPath();ctx.moveTo(cx,beamY);ctx.lineTo(cx-4,beamY+dir*10);ctx.lineTo(cx+4,beamY+dir*10);ctx.closePath();ctx.fill();}
        ctx.fillStyle="#e8eaf0";ctx.font="10px sans-serif";ctx.textAlign="center";ctx.fillText(`${Math.abs(ld.w1).toFixed(2)} ${uu.force}/${uu.len}`,(x1+x2)/2,beamY+dir*52);
      }
      if(ld.type==="tri"){
        const x1=toX(ld.a),x2=toX(ld.b),dir=ld.w1<0||ld.w2<0?-1:1;
        const h1=Math.abs(ld.w1),h2=Math.abs(ld.w2),wMax=Math.max(h1,h2)||1;
        const steps=8,stepPx=(x2-x1)/steps;
        ctx.strokeStyle="#f7a24f";ctx.lineWidth=1.5;
        for(let k=0;k<=steps;k++){
          const cx=x1+k*stepPx;
          const frac=k/steps;
          const hk=((h1+(h2-h1)*frac)/wMax)*30+8;
          ctx.beginPath();ctx.moveTo(cx,beamY+dir*hk);ctx.lineTo(cx,beamY+dir*8);ctx.stroke();
          ctx.fillStyle="#f7a24f";ctx.beginPath();ctx.moveTo(cx,beamY);ctx.lineTo(cx-4,beamY+dir*10);ctx.lineTo(cx+4,beamY+dir*10);ctx.closePath();ctx.fill();
        }
        ctx.strokeStyle="#f7a24f";ctx.lineWidth=1.5;ctx.beginPath();
        ctx.moveTo(x1,beamY+dir*(((h1/wMax)*30+8)));ctx.lineTo(x2,beamY+dir*(((h2/wMax)*30+8)));ctx.stroke();
        ctx.fillStyle="#e8eaf0";ctx.font="10px sans-serif";ctx.textAlign="center";
        ctx.fillText(`${Math.abs(ld.w1).toFixed(2)}→${Math.abs(ld.w2).toFixed(2)} ${uu.force}/${uu.len}`,(x1+x2)/2,beamY+dir*52);
      }
      if(ld.type==="moment"){
        const x=toX(ld.a),dir=ld.P<0?-1:1;
        const r=22;
        ctx.strokeStyle="#38bdf8";ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(x,beamY,r,dir>0?0.3:Math.PI+0.3,dir>0?Math.PI-0.3:2*Math.PI-0.3,dir<0);ctx.stroke();
        const aEnd=dir>0?Math.PI-0.3:2*Math.PI-0.3;
        const ax=x+r*Math.cos(aEnd),ay=beamY+r*Math.sin(aEnd);
        const tang=dir>0?aEnd+Math.PI/2:aEnd-Math.PI/2;
        ctx.fillStyle="#38bdf8";ctx.beginPath();
        ctx.moveTo(ax,ay);ctx.lineTo(ax+8*Math.cos(tang-0.4),ay+8*Math.sin(tang-0.4));
        ctx.lineTo(ax+8*Math.cos(tang+0.4),ay+8*Math.sin(tang+0.4));ctx.closePath();ctx.fill();
        ctx.fillStyle="#e8eaf0";ctx.font="10px sans-serif";ctx.textAlign="center";
        ctx.fillText(`${Math.abs(ld.P).toFixed(2)} ${uu.mom}`,x,beamY-(r+12)*dir);
      }
    });
    ctx.fillStyle="#9ca3af";ctx.font="11px sans-serif";ctx.textAlign="center";
    ctx.fillText("A",bL,beamY+48);ctx.fillText("B",bR,beamY+48);
    ctx.fillText(`L = ${L} ${uu.len}`,W/2,H-4);
  },[beamType,L,loads,uu,customSupports]);
  return <canvas ref={ref} width={680} height={160} style={{width:"100%",borderRadius:6,background:"#1a1d27"}}/>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function BeamCalculator() {
  const [tab,setTab]=useState("setup");
  const [beamType,setBeamType]=useState("SS");
  const [unitSys,setUnitSys]=useState("imperial");
  const [L,setL]=useState(20);
  const [I,setI]=useState(500);
  const [E,setE]=useState(29000);
  const [Fy,setFy]=useState(50);
  const [engName,setEngName]=useState("Structural Engineer");
  const [projName,setProjName]=useState("Beam Analysis");
  const [loads,setLoads]=useState([]);
  const [loadType,setLoadType]=useState("point");
  const [loadMag,setLoadMag]=useState(10);
  const [loadMag2,setLoadMag2]=useState(0);
  const [loadPos,setLoadPos]=useState(0);
  const [loadPos2,setLoadPos2]=useState(20);
  const [loadDir,setLoadDir]=useState(-1);
  const [results,setResults]=useState(null);
  const [bmdReversed,setBmdReversed]=useState(false);
  const [diagLabels,setDiagLabels]=useState({sfd:[],bmd:[],defl:[],slope:[]});
  const [labelInputs,setLabelInputs]=useState({sfd:"",bmd:"",defl:"",slope:""});
  const [error,setError]=useState("");
  const [deflLimit,setDeflLimit]=useState("L/250");
  const [selectedSection,setSelectedSection]=useState(null);
  const [sectionFilter,setSectionFilter]=useState("");
  const [useAISC,setUseAISC]=useState(false);
  const [useCustomSection,setUseCustomSection]=useState(false);
  const [sectionType,setSectionType]=useState("rect");
  const [sectionDims,setSectionDims]=useState({b:6,h:12,r:6,t:0.5,ro:6,ri:5,bf:6,tf:0.5,tw:0.3,hw:10});
  const [computedSection,setComputedSection]=useState(null);
  const [reportLoading,setReportLoading]=useState(false);
  const [savedProjects,setSavedProjects]=useState(()=>{try{return JSON.parse(localStorage.getItem("probeam_v3")||"[]");}catch{return [];}});
  const [showSaveModal,setShowSaveModal]=useState(false);
  const [customSupports,setCustomSupports]=useState([{type:"pin",pos:0},{type:"roller",pos:20}]);
  const [newSupType,setNewSupType]=useState("pin");
  const [newSupPos,setNewSupPos]=useState(5);
  const [femMeshDensity,setFemMeshDensity]=useState(20);
  const [showAllFEMNodes,setShowAllFEMNodes]=useState(false);
  const [isMobile,setIsMobile]=useState(()=>window.innerWidth<640);
  useEffect(()=>{
    const handler=()=>setIsMobile(window.innerWidth<640);
    window.addEventListener("resize",handler);
    return()=>window.removeEventListener("resize",handler);
  },[]);

  const uu=unitSys==="imperial"
    ?{len:"ft",force:"kip",stress:"ksi",def:"in",mom:"kip*ft",wt:"kip/ft"}
    :{len:"m",force:"kN",stress:"GPa",def:"mm",mom:"kN*m",wt:"kN/m"};

  const deflDenom=parseInt(deflLimit.replace("L/",""));
  const defLimit=unitSys==="imperial"?(L*12/deflDenom):(L*1000/deflDenom);
  const deflPasses=results?Math.abs(results.dPeak)<=defLimit:true;
  const diagramData=results?{sfd:{x:results.xs,y:results.V},bmd:{x:results.xs,y:results.M},defl:{x:results.xs,y:results.delta},slope:{x:results.xs,y:results.theta}}:null;
  const checks=results&&useAISC&&selectedSection?steelChecks(selectedSection,results,Fy,unitSys):null;

  useEffect(()=>{ setLoadPos2(prev=>Math.min(prev, L)); },[L]);
  useEffect(()=>{ if(selectedSection&&useAISC){setI(selectedSection.Ix);setE(29000);} },[selectedSection,useAISC]);
  useEffect(()=>{
    if(!useCustomSection) return;
    const result = calcIx(sectionType, sectionDims);
    setComputedSection(result);
    if(result) setI(+result.Ix.toFixed(4));
  },[useCustomSection, sectionType, sectionDims]);

  // Convert standard beam types to support arrays for unified DSM solving
  function beamTypeToSupports(type, span) {
    if (type === "SS") return [{type:"pin",pos:0},{type:"roller",pos:span}];
    if (type === "CANT") return [{type:"fixed",pos:0}];
    if (type === "FIXED") return [{type:"fixed",pos:0},{type:"fixed",pos:span}];
    if (type === "PROPPED") return [{type:"fixed",pos:0},{type:"roller",pos:span}];
    return [];
  }

  const addLoad=()=>{
    setError("");
    if(loadType==="point"||loadType==="moment"){
      if(loadPos<0||loadPos>L){setError(`Position must be 0 – ${L} ${uu.len}`);return;}
      setLoads([...loads,{type:loadType,P:loadMag*loadDir,a:loadPos}]);
    } else {
      if(loadPos<0||loadPos>L){setError(`Start position must be 0 – ${L} ${uu.len}`);return;}
      if(loadPos2<0||loadPos2>L){setError(`End position must be 0 – ${L} ${uu.len}`);return;}
      if(loadPos2<=loadPos){setError("End position must be greater than start.");return;}
      const w1 = loadMag * loadDir;
      const w2 = loadType === "udl" ? w1 : loadMag2 * loadDir;
      setLoads([...loads,{type:loadType,w1,w2,a:loadPos,b:loadPos2}]);
    }
  };

  const solve=()=>{
    setError("");
    if(loads.length===0){setError("Add at least one load first.");return;}
    if(L<=0||I<=0||E<=0){setError("Span, I, and E must be positive.");return;}

    try{
      let supports;
      if(beamType==="CUSTOM"){
        if(customSupports.length<2){setError("Add at least 2 supports for custom beam.");return;}
        const hasStableSupport = customSupports.some(s => s.type === "pin" || s.type === "fixed");
        if(!hasStableSupport){setError("Custom beam needs at least one pin or fixed support.");return;}
        supports = customSupports;
      } else {
        supports = beamTypeToSupports(beamType, L);
      }

      const r = solveBeamStiffness(L, E, I, supports, loads, unitSys, femMeshDensity);

      if(!isFinite(r.Vmax)||!isFinite(r.Mmax)||!isFinite(r.dPeak)){
        setError("Solver produced invalid results. Check inputs and supports.");
        return;
      }
      setResults(r);setDiagLabels({sfd:[],bmd:[],defl:[],slope:[]});setLabelInputs({sfd:"",bmd:"",defl:"",slope:""});setTab("results");
    }catch(e){setError("Solver error: "+(e.message||String(e)));}
  };

  const saveProject=()=>{
    const p={name:projName,date:new Date().toISOString(),beamType,unitSys,L,I,E,Fy,engName,projName,loads,deflLimit,useAISC,selectedSection,useCustomSection,sectionType,sectionDims,customSupports};
    const updated=[...savedProjects.filter(x=>x.name!==projName),p];
    setSavedProjects(updated);
    try{localStorage.setItem("probeam_v3",JSON.stringify(updated));}
    catch(e){setError("Save failed: storage unavailable.");setShowSaveModal(false);return;}
    setShowSaveModal(false);
  };

  const loadProject=p=>{
    setBeamType(p.beamType);setUnitSys(p.unitSys);setL(p.L);setI(p.I);setE(p.E);setFy(p.Fy||50);
    setEngName(p.engName);setProjName(p.projName);setLoads(p.loads);
    setDeflLimit(p.deflLimit||"L/250");setUseAISC(p.useAISC||false);
    setSelectedSection(p.selectedSection||null);setUseCustomSection(p.useCustomSection||false);
    if(p.sectionType)setSectionType(p.sectionType);
    if(p.sectionDims)setSectionDims(p.sectionDims);
    if(p.customSupports)setCustomSupports(p.customSupports);
    setResults(null);setTab("setup");
  };

  // Report generation functions
  const renderB64=(data,color,label,unit,reverse=false,labels=[])=>{
    const scale=2;
    const cssW=900,cssH=260;
    const W=cssW*scale,H=cssH*scale,canvas=document.createElement("canvas");
    canvas.width=W;canvas.height=H;
    const ctx=canvas.getContext("2d");
    ctx.scale(scale,scale);
    const pad={t:42,b:48,l:80,r:24};
    const vals=reverse?data.y.map(v=>-v):data.y,xs=data.x;
    let minV=0,maxV=0; for(let i=0;i<vals.length;i++){if(vals[i]<minV)minV=vals[i];if(vals[i]>maxV)maxV=vals[i];}
    const range=maxV-minV||1;
    const plotW=cssW-pad.l-pad.r,plotH=cssH-pad.t-pad.b;
    const px=x=>pad.l+(x/xs[xs.length-1])*plotW;
    const py=v=>pad.t+plotH-((v-minV)/range)*plotH;
    const zero=py(0);
    ctx.fillStyle="#ffffff";ctx.fillRect(0,0,cssW,cssH);
    ctx.strokeStyle="#333333";ctx.lineWidth=1.5;ctx.strokeRect(1,1,cssW-2,cssH-2);
    ctx.fillStyle="#fafafa";ctx.fillRect(pad.l,pad.t,plotW,plotH);
    ctx.strokeStyle="#555555";ctx.lineWidth=1.2;ctx.strokeRect(pad.l,pad.t,plotW,plotH);
    ctx.strokeStyle="#ececec";ctx.lineWidth=0.5;
    for(let i=0;i<=12;i++){const y=pad.t+(i/12)*plotH;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(cssW-pad.r,y);ctx.stroke();}
    for(let i=0;i<=20;i++){const x=pad.l+(i/20)*plotW;ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,cssH-pad.b);ctx.stroke();}
    ctx.strokeStyle="#d8d8d8";ctx.lineWidth=0.8;
    for(let i=0;i<=6;i++){const y=pad.t+(i/6)*plotH;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(cssW-pad.r,y);ctx.stroke();}
    for(let i=0;i<=10;i++){const x=pad.l+(i/10)*plotW;ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,cssH-pad.b);ctx.stroke();}
    ctx.strokeStyle="#777777";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pad.l,zero);ctx.lineTo(cssW-pad.r,zero);ctx.stroke();
    const grad=ctx.createLinearGradient(0,pad.t,0,cssH-pad.b);
    grad.addColorStop(0,color+"40");grad.addColorStop(1,color+"08");
    ctx.beginPath();ctx.moveTo(px(xs[0]),zero);
    for(let i=0;i<xs.length;i++)ctx.lineTo(px(xs[i]),py(vals[i]));
    ctx.lineTo(px(xs[xs.length-1]),zero);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
    ctx.beginPath();for(let i=0;i<xs.length;i++)i===0?ctx.moveTo(px(xs[i]),py(vals[i])):ctx.lineTo(px(xs[i]),py(vals[i]));
    ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.lineJoin="round";ctx.stroke();
    ctx.fillStyle="#1f2937";ctx.font="bold 13px Arial";ctx.textAlign="right";
    const step=range/4;for(let i=0;i<=4;i++){const v=minV+i*step;ctx.fillText(v.toFixed(3),pad.l-10,py(v)+4.5);}
    ctx.font="13px Arial";ctx.fillStyle="#1f2937";ctx.textAlign="center";
    for(let i=0;i<=5;i++){const x=i*xs[xs.length-1]/5;ctx.fillText(x.toFixed(2),px(x),cssH-8);}
    ctx.strokeStyle="#555555";ctx.lineWidth=1.2;
    for(let i=0;i<=5;i++){const x=i*xs[xs.length-1]/5;ctx.beginPath();ctx.moveTo(px(x),cssH-pad.b);ctx.lineTo(px(x),cssH-pad.b+6);ctx.stroke();}
    for(let i=0;i<=4;i++){const v=minV+i*step;ctx.beginPath();ctx.moveTo(pad.l,py(v));ctx.lineTo(pad.l-6,py(v));ctx.stroke();}
    ctx.fillStyle=color;ctx.font="bold 16px Arial";ctx.textAlign="left";ctx.fillText(`${label} (${unit})`,pad.l+4,26);
    (labels||[]).forEach((lb,idx)=>{
      const tx=px(lb.x), ty=py(lb.v);
      ctx.save();
      ctx.strokeStyle=color+"bb"; ctx.lineWidth=1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(tx,pad.t); ctx.lineTo(tx,cssH-pad.b); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=color; ctx.beginPath(); ctx.arc(tx,ty,4,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#fff"; ctx.lineWidth=1.2; ctx.stroke();
      const boxW=130, boxH=36, margin=6;
      const flipLeft = tx+boxW+margin > (pad.l+plotW);
      const bx = flipLeft ? tx-boxW-margin : tx+margin;
      const by = Math.max(pad.t+2, Math.min(ty-boxH/2, cssH-pad.b-boxH-2));
      ctx.fillStyle="#ffffffee";
      ctx.beginPath(); ctx.rect(bx,by,boxW,boxH); ctx.fill();
      ctx.strokeStyle=color+"99"; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle=color; ctx.font="bold 11px Arial"; ctx.textAlign="center";
      ctx.fillText(`L${idx+1}`, bx+9, by+boxH/2+3);
      ctx.fillStyle="#374151"; ctx.font="11px Arial"; ctx.textAlign="left";
      ctx.fillText(`x=${lb.x.toFixed(3)}`, bx+18, by+13);
      ctx.fillStyle=color; ctx.font="bold 11px Arial";
      ctx.fillText(`${lb.v.toFixed(4)} ${unit}`, bx+18, by+26);
      ctx.restore();
    });
    return canvas.toDataURL("image/png").split(",")[1];
  };

  const renderBeamSketchB64 = () => {
    const scale=2;
    const cssW=900, cssH=180;
    const cv = document.createElement("canvas");
    cv.width=cssW*scale; cv.height=cssH*scale;
    const ctx = cv.getContext("2d");
    ctx.scale(scale,scale);
    ctx.fillStyle="#ffffff"; ctx.fillRect(0,0,cssW,cssH);
    ctx.strokeStyle="#f3f4f6"; ctx.lineWidth=0.5;
    for(let i=0;i<=20;i++){const x=i*(cssW/20);ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,cssH);ctx.stroke();}
    for(let i=0;i<=8;i++){const y=i*(cssH/8);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(cssW,y);ctx.stroke();}
    const ml=90,mr=90,beamY=cssH/2+4,bL=ml,bR=cssW-mr,bLen=bR-bL;
    ctx.strokeStyle="#1e3a6e"; ctx.lineWidth=8; ctx.lineCap="round";
    ctx.beginPath(); ctx.moveTo(bL,beamY); ctx.lineTo(bR,beamY); ctx.stroke();
    ctx.strokeStyle="#2563eb"; ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(bL,beamY); ctx.lineTo(bR,beamY); ctx.stroke();
    const drawPin=(x,y)=>{
      ctx.fillStyle="#15803d"; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-14,y+22); ctx.lineTo(x+14,y+22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle="#166534"; ctx.lineWidth=1.5; ctx.stroke();
      ctx.strokeStyle="#15803d"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(x-18,y+24); ctx.lineTo(x+18,y+24); ctx.stroke();
      ctx.fillStyle="#e5f3ec"; ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#15803d"; ctx.lineWidth=1.5; ctx.stroke();
    };
    const drawRoller=(x,y)=>{
      ctx.fillStyle="#b45309"; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-12,y+18); ctx.lineTo(x+12,y+18); ctx.closePath(); ctx.fill();
      ctx.strokeStyle="#92400e"; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle="#b45309"; ctx.beginPath(); ctx.arc(x-7,y+23,5,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(x+7,y+23,5,0,Math.PI*2); ctx.fill(); ctx.stroke();
    };
    const drawFixed=(x,y,dir)=>{
      ctx.strokeStyle="#dc2626"; ctx.lineWidth=4;
      ctx.beginPath(); ctx.moveTo(x,y-32); ctx.lineTo(x,y+32); ctx.stroke();
      ctx.lineWidth=2;
      for(let i=-26;i<=26;i+=11){ ctx.strokeStyle="#f87171"; ctx.beginPath(); ctx.moveTo(x,y+i); ctx.lineTo(x+dir*16,y+i+8); ctx.stroke(); }
    };

    const activeSupports = beamType === "CUSTOM" ? customSupports : beamTypeToSupports(beamType, L);
    activeSupports.forEach(s=>{
      const x=bL+(s.pos/L)*bLen;
      if(s.type==="pin") drawPin(x,beamY);
      else if(s.type==="roller") drawRoller(x,beamY);
      else if(s.type==="fixed") drawFixed(x,beamY,s.pos<L/2?-1:1);
      if(beamType==="CUSTOM"){
        ctx.fillStyle="#374151"; ctx.font="9px Arial"; ctx.textAlign="center";
        ctx.fillText(s.type[0].toUpperCase()+s.type.slice(1), x, beamY+40);
        ctx.fillText(`${s.pos}${uu.len}`, x, beamY+51);
      }
    });

    const toX=x=>bL+(x/L)*bLen;
    loads.forEach(ld=>{
      if(ld.type==="point"){
        const x=toX(ld.a), dir=ld.P<0?-1:1;
        ctx.strokeStyle="#6d28d9"; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(x,beamY+dir*48); ctx.lineTo(x,beamY+dir*9); ctx.stroke();
        ctx.fillStyle="#6d28d9"; ctx.beginPath(); ctx.moveTo(x,beamY); ctx.lineTo(x-7,beamY+dir*14); ctx.lineTo(x+7,beamY+dir*14); ctx.closePath(); ctx.fill();
        ctx.fillStyle="#1f2937"; ctx.font="bold 10px Arial"; ctx.textAlign="center";
        ctx.fillText(`${Math.abs(ld.P).toFixed(2)} ${uu.force}`,x,beamY+dir*62);
      }
      if(ld.type==="udl"){
        const x1=toX(ld.a),x2=toX(ld.b),dir=ld.w1<0?-1:1;
        ctx.strokeStyle="#6d28d9"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(x1,beamY+dir*40); ctx.lineTo(x2,beamY+dir*40); ctx.stroke();
        const step=Math.max((x2-x1)/8,12);
        for(let xx=x1;xx<=x2+1;xx+=step){
          const cx=Math.min(xx,x2);
          ctx.beginPath(); ctx.moveTo(cx,beamY+dir*40); ctx.lineTo(cx,beamY+dir*9); ctx.stroke();
          ctx.fillStyle="#6d28d9"; ctx.beginPath(); ctx.moveTo(cx,beamY); ctx.lineTo(cx-5,beamY+dir*12); ctx.lineTo(cx+5,beamY+dir*12); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle="#1f2937"; ctx.font="bold 10px Arial"; ctx.textAlign="center";
        ctx.fillText(`${Math.abs(ld.w1).toFixed(2)} ${uu.force}/${uu.len}`,(x1+x2)/2,beamY+dir*54);
      }
      if(ld.type==="tri"){
        const x1=toX(ld.a),x2=toX(ld.b),dir=ld.w1<0||ld.w2<0?-1:1;
        const h1=Math.abs(ld.w1),h2=Math.abs(ld.w2),wMax=Math.max(h1,h2)||1;
        const steps=8,stepPx=(x2-x1)/steps;
        ctx.strokeStyle="#b45309"; ctx.lineWidth=1.5;
        for(let k=0;k<=steps;k++){
          const cx=x1+k*stepPx, frac=k/steps;
          const hk=((h1+(h2-h1)*frac)/wMax)*30+10;
          ctx.beginPath(); ctx.moveTo(cx,beamY+dir*hk); ctx.lineTo(cx,beamY+dir*9); ctx.stroke();
          ctx.fillStyle="#b45309"; ctx.beginPath(); ctx.moveTo(cx,beamY); ctx.lineTo(cx-5,beamY+dir*12); ctx.lineTo(cx+5,beamY+dir*12); ctx.closePath(); ctx.fill();
        }
        ctx.strokeStyle="#b45309"; ctx.lineWidth=1.5; ctx.beginPath();
        ctx.moveTo(x1,beamY+dir*(((h1/wMax)*30+10))); ctx.lineTo(x2,beamY+dir*(((h2/wMax)*30+10))); ctx.stroke();
        ctx.fillStyle="#1f2937"; ctx.font="bold 10px Arial"; ctx.textAlign="center";
        ctx.fillText(`${Math.abs(ld.w1).toFixed(2)}→${Math.abs(ld.w2).toFixed(2)}`,(x1+x2)/2,beamY+dir*56);
      }
      if(ld.type==="moment"){
        const x=toX(ld.a), dir=ld.P<0?-1:1, r=24;
        ctx.strokeStyle="#0369a1"; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.arc(x,beamY,r,dir>0?0.3:Math.PI+0.3,dir>0?Math.PI-0.3:2*Math.PI-0.3,dir<0); ctx.stroke();
        const aEnd=dir>0?Math.PI-0.3:2*Math.PI-0.3;
        const ax=x+r*Math.cos(aEnd), ay=beamY+r*Math.sin(aEnd);
        const tang=dir>0?aEnd+Math.PI/2:aEnd-Math.PI/2;
        ctx.fillStyle="#0369a1"; ctx.beginPath();
        ctx.moveTo(ax,ay); ctx.lineTo(ax+9*Math.cos(tang-0.4),ay+9*Math.sin(tang-0.4));
        ctx.lineTo(ax+9*Math.cos(tang+0.4),ay+9*Math.sin(tang+0.4)); ctx.closePath(); ctx.fill();
        ctx.fillStyle="#1f2937"; ctx.font="bold 10px Arial"; ctx.textAlign="center";
        ctx.fillText(`${Math.abs(ld.P).toFixed(2)} ${uu.mom}`,x,beamY-(r+14)*dir);
      }
    });
    ctx.fillStyle="#374151"; ctx.font="bold 12px Arial"; ctx.textAlign="center";
    ctx.fillText("A",bL,beamY+60); ctx.fillText("B",bR,beamY+60);
    ctx.fillStyle="#6b7280"; ctx.font="11px Arial";
    ctx.fillText(`L = ${L} ${uu.len}`,cssW/2,cssH-5);
    ctx.strokeStyle="#e5e7eb"; ctx.lineWidth=1; ctx.strokeRect(1,1,cssW-2,cssH-2);
    return cv.toDataURL("image/png").split(",")[1];
  };

  const generateReport=async()=>{
    if(!results){setError("Solve first.");return;}
    setError("");setReportLoading(true);
    try{
      const deflPasses_=Math.abs(results.dPeak)<=defLimit;
      const beamB64  = renderBeamSketchB64();
      const sfdB64   = renderB64(diagramData.sfd,"#F7A24F","Shear Force",uu.force,false,diagLabels.sfd);
      const bmdB64   = renderB64(diagramData.bmd,"#A78BFA","Bending Moment",uu.mom,bmdReversed,diagLabels.bmd);
      const deflB64  = renderB64(diagramData.defl,"#38BDF8","Deflection",uu.def,false,diagLabels.defl);
      const sloB64   = renderB64(diagramData.slope,"#3DD68C","Slope","rad",false,diagLabels.slope);

      if(!window.JSZip){
        await new Promise((res,rej)=>{
          const sc=document.createElement("script");
          sc.src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
          sc.onload=res; sc.onerror=()=>rej(new Error("Failed to load JSZip"));
          document.head.appendChild(sc);
        });
      }
      const JSZip=window.JSZip;

      const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
      const b64ToBytes=b64=>{const bin=atob(b64); const bytes=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i); return bytes;};

      const imgPara=(rId,cx,cy)=>`<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="80" w:after="80"/></w:pPr><w:r><w:rPr/><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="1" name="Image"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="1" name="Image"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;

      const cellW4=(w,txt,bold=false,bg="FFFFFF",color="000000")=>`<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/><w:shading w:val="clear" w:color="auto" w:fill="${bg}"/><w:tcMar><w:top w:w="60" w:type="dxa"/><w:bottom w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar></w:tcPr><w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:rPr>${bold?"<w:b/>":""}<w:color w:val="${color}"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t xml:space="preserve">${esc(txt)}</w:t></w:r></w:p></w:tc>`;
      const tblRow=(cells,altBg=false)=>`<w:tr><w:trPr><w:trHeight w:val="280"/>${altBg?'<w:shading w:val="clear" w:fill="F5F5F5"/>':""}</w:trPr>${cells}</w:tr>`;
      const hdrRow=(cols,widths)=>`<w:tr><w:trPr><w:trHeight w:val="320"/></w:trPr>${cols.map((c,i)=>cellW4(widths[i],c,true,"1C1C1C","FFFFFF")).join("")}</w:tr>`;
      const h1=(txt)=>`<w:p><w:pPr><w:pStyle w:val="Heading1"/><w:spacing w:before="200" w:after="100"/></w:pPr><w:r><w:t>${esc(txt)}</w:t></w:r></w:p>`;
      const h2=(txt)=>`<w:p><w:pPr><w:spacing w:before="180" w:after="60"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="1C1C1C"/><w:sz w:val="22"/></w:rPr><w:t>${esc(txt)}</w:t></w:r></w:p>`;
      const para=(txt,center=false,size=20,bold=false,color="222222")=>`<w:p><w:pPr><w:spacing w:before="40" w:after="40"/>${center?'<w:jc w:val="center"/>':""}</w:pPr><w:r><w:rPr>${bold?"<w:b/>":""}<w:color w:val="${color}"/><w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr><w:t xml:space="preserve">${esc(txt)}</w:t></w:r></w:p>`;
      const captionPara=(txt)=>`<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="40" w:after="140"/></w:pPr><w:r><w:rPr><w:i/><w:color w:val="777777"/><w:sz w:val="17"/></w:rPr><w:t>${esc(txt)}</w:t></w:r></w:p>`;
      const rule=()=>`<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="AAAAAA"/></w:pBdr><w:spacing w:before="40" w:after="40"/></w:pPr></w:p>`;

      const allLbls=[
        {title:"Shear Force",unit:uu.force,items:diagLabels.sfd},
        {title:"Bending Moment",unit:uu.mom,items:diagLabels.bmd},
        {title:"Deflection",unit:uu.def,items:diagLabels.defl},
        {title:"Slope",unit:"rad",items:diagLabels.slope},
      ].filter(g=>g.items.length>0);

      const TW=8640;
      const fyDisplay = `${Fy} ksi`;

      const coverXml=`${para("STRUCTURAL BEAM ANALYSIS REPORT",true,30,true,"111111")}${para("ProBeam Pro  ·  Engineering Analysis Suite",true,18,false,"555555")}${rule()}${para(`Project: ${projName}   |   Engineer: ${engName}   |   Date: ${new Date().toLocaleDateString()}   |   Units: ${unitSys==="imperial"?"Imperial":"Metric"}`,true,17,false,"333333")}${rule()}`;

      const sketchXml=`${h2("1. Beam Configuration")}${imgPara("rId10",5486400,Math.round(5486400*180/900))}${captionPara("Fig 0 — Beam configuration, supports and applied loads")}`;

      const inputData=[
        ["Beam Type", beamType==="CUSTOM"?`Custom (${customSupports.length} supports)`:BEAM_TYPES[beamType]],
        ["Span (L)", `${L} ${uu.len}`],
        ["Modulus E", `${E} ${uu.stress}`],
        ["Moment of Inertia I", `${I} ${unitSys==="imperial"?"in⁴":"mm⁴"}`],
        ["Yield Strength Fy", fyDisplay],
        ["Deflection Limit", deflLimit],
        ...(selectedSection?[["AISC Section",selectedSection.name],[`Ix`,`${selectedSection.Ix} in⁴`]]:useCustomSection?[["Section Type",sectionType],["Computed Ix",computedSection?`${computedSection.Ix.toFixed(2)} ${unitSys==="imperial"?"in⁴":"mm⁴"}`:"N/A"]]:[]),
      ];
      const inputTableXml=`${h2("2. Input Summary")}<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="CCCCCC"/><w:left w:val="single" w:sz="4" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="4" w:color="CCCCCC"/><w:right w:val="single" w:sz="4" w:color="CCCCCC"/><w:insideH w:val="single" w:sz="4" w:color="CCCCCC"/><w:insideV w:val="single" w:sz="4" w:color="CCCCCC"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="${TW/2}"/><w:gridCol w:w="${TW/2}"/></w:tblGrid>${hdrRow(["Parameter","Value"],[TW/2,TW/2])}${inputData.map(([k,v],i)=>tblRow(cellW4(TW/2,k,false,i%2===0?"FFFFFF":"F5F5F5")+cellW4(TW/2,v,true,i%2===0?"FFFFFF":"F5F5F5"),false)).join("")}</w:tbl>`;

      const loadRowsXml=loads.map((ld,i)=>{
        let mag;
        if(ld.type==="point"||ld.type==="moment"){
          mag = `${Math.abs(ld.P||0).toFixed(3)} ${ld.type==="moment"?uu.mom:uu.force} ${ld.P<0?"↓":"↑"}`;
        } else if(ld.type==="udl"){
          mag = `${Math.abs(ld.w1||0).toFixed(3)} ${uu.wt} ${ld.w1<0?"↓":"↑"}`;
        } else {
          mag = `${Math.abs(ld.w1||0).toFixed(3)}→${Math.abs(ld.w2||0).toFixed(3)} ${uu.wt}`;
        }
        const pos=ld.type==="point"||ld.type==="moment"?`x=${ld.a} ${uu.len}`:`${ld.a}–${ld.b} ${uu.len}`;
        const bg=i%2===0?"FFFFFF":"F5F5F5";
        const w3=TW/3|0;
        return tblRow(cellW4(w3,`${i+1}. ${LOAD_TYPES[ld.type]||ld.type}`,false,bg)+cellW4(w3,mag,true,bg)+cellW4(TW-2*w3,pos,false,bg));
      }).join("");
      const loadsTableXml=`${h2(`3. Applied Loads (${loads.length})`)}<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="CCCCCC"/><w:left w:val="single" w:sz="4" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="4" w:color="CCCCCC"/><w:right w:val="single" w:sz="4" w:color="CCCCCC"/><w:insideH w:val="single" w:sz="4" w:color="CCCCCC"/><w:insideV w:val="single" w:sz="4" w:color="CCCCCC"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="${TW/3|0}"/><w:gridCol w:w="${TW/3|0}"/><w:gridCol w:w="${TW-2*(TW/3|0)}"/></w:tblGrid>${hdrRow(["#. Type","Magnitude","Position"],[TW/3|0,TW/3|0,TW-2*(TW/3|0)])}${loadRowsXml||`<w:tr><w:tc><w:tcPr><w:tcW w:w="${TW}" w:type="dxa"/><w:gridSpan w:val="3"/></w:tcPr><w:p><w:r><w:t>No loads applied.</w:t></w:r></w:p></w:tc></w:tr>`}</w:tbl>`;

      const reacRowsXml = results.reactions && results.reactions.length > 0
        ? [
            ...results.reactions.map((r,i)=>{
              const bg=i%2===0?"FFFFFF":"F5F5F5";
              return tblRow(cellW4(TW/2,`${r.type.charAt(0).toUpperCase()+r.type.slice(1)} @ x=${r.pos.toFixed(3)} ${uu.len}`,false,bg)+cellW4(TW/2,`${r.R.toFixed(4)} ${uu.force}`,true,bg));
            }),
            ...(results.momentReactions||[]).map((r,i)=>{
              const bg=(results.reactions.length+i)%2===0?"FFFFFF":"F5F5F5";
              return tblRow(cellW4(TW/2,`Fixed Moment @ x=${r.pos.toFixed(3)} ${uu.len}`,false,bg)+cellW4(TW/2,`${r.M.toFixed(4)} ${uu.mom}`,true,bg));
            }),
          ].join("")
        : [
            tblRow(cellW4(TW/2,`Support A (x=0)`,false,"FFFFFF")+cellW4(TW/2,`${results.RA.toFixed(4)} ${uu.force}  |  M: ${(results.MA_fix||0).toFixed(4)} ${uu.mom}`,true,"FFFFFF")),
            tblRow(cellW4(TW/2,`Support B (x=${L} ${uu.len})`,false,"F5F5F5")+cellW4(TW/2,`${results.RB.toFixed(4)} ${uu.force}  |  M: ${(results.MB_fix||0).toFixed(4)} ${uu.mom}`,true,"F5F5F5")),
          ].join("");
      const reactionsTableXml=`${h2("4. Support Reactions")}<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="CCCCCC"/><w:left w:val="single" w:sz="4" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="4" w:color="CCCCCC"/><w:right w:val="single" w:sz="4" w:color="CCCCCC"/><w:insideH w:val="single" w:sz="4" w:color="CCCCCC"/><w:insideV w:val="single" w:sz="4" w:color="CCCCCC"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="${TW/2}"/><w:gridCol w:w="${TW/2}"/></w:tblGrid>${hdrRow(["Support",`Reaction (${uu.force}) / Moment (${uu.mom})`],[TW/2,TW/2])}${reacRowsXml}</w:tbl>`;

      const arrMax_=a=>{let m=-1/0;for(let i=0;i<a.length;i++)if(a[i]>m)m=a[i];return m;};
      const arrMin_=a=>{let m=1/0; for(let i=0;i<a.length;i++)if(a[i]<m)m=a[i];return m;};
      const extData=[
        ["Shear Force ("+uu.force+")", arrMax_(results.V).toFixed(4), arrMin_(results.V).toFixed(4)],
        ["Bending Moment ("+uu.mom+")", arrMax_(results.M).toFixed(4), arrMin_(results.M).toFixed(4)],
        ["|δ| Deflection ("+uu.def+")", `Downward: ${Math.abs(results.dMin).toFixed(4)}`, `Upward: ${Math.abs(results.dMax).toFixed(4)}`],
        [`Peak |δ| @ x=${results.dPeakPos.toFixed(3)} ${uu.len}`, results.dPeak.toFixed(4)+" "+uu.def, "—"],
        ["θA (rad)", results.thetaA.toFixed(6), ""],
        ["θB (rad)", results.thetaB.toFixed(6), ""],
        ["|θ|max (rad)", results.thetaMax.toFixed(6), ""],
      ];
      const w3e=TW/3|0;
      const extremesTableXml=`${h2("5. Force & Deflection Extremes")}<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="CCCCCC"/><w:left w:val="single" w:sz="4" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="4" w:color="CCCCCC"/><w:right w:val="single" w:sz="4" w:color="CCCCCC"/><w:insideH w:val="single" w:sz="4" w:color="CCCCCC"/><w:insideV w:val="single" w:sz="4" w:color="CCCCCC"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="${w3e}"/><w:gridCol w:w="${w3e}"/><w:gridCol w:w="${TW-2*w3e}"/></w:tblGrid>${hdrRow(["Result","Maximum / Positive","Minimum / Negative"],[w3e,w3e,TW-2*w3e])}${extData.map(([r,a,b],i)=>{const bg=i%2===0?"FFFFFF":"F5F5F5";return tblRow(cellW4(w3e,r,false,bg)+cellW4(w3e,a,true,bg)+cellW4(TW-2*w3e,b||"",false,bg));}).join("")}</w:tbl>`;

      const svcColor_=deflPasses_?"2D6A4F":"7B2D2D";
      const svcBg_=deflPasses_?"EDFAF3":"FDF0F0";
      const svcXml=`${h2("6. Serviceability Check ("+deflLimit+")")}<w:p><w:pPr><w:pBdr><w:left w:val="single" w:sz="10" w:space="4" w:color="${svcColor_}"/></w:pBdr><w:shading w:val="clear" w:fill="${svcBg_}"/><w:spacing w:before="80" w:after="80"/></w:pPr><w:r><w:rPr><w:b/><w:color w:val="${svcColor_}"/><w:sz w:val="22"/></w:rPr><w:t xml:space="preserve">${deflPasses_?"✓ PASS":"✗ FAIL"} — Peak δ: ${results.dPeak.toFixed(4)} ${uu.def}  |  Allowable (${deflLimit}): ${defLimit.toFixed(4)} ${uu.def}  |  Utilization: ${(results.dPeak/defLimit*100).toFixed(1)}%</w:t></w:r></w:p>`;

      let aisc_secNum=7;
      const aisc_xml = checks ? `${h2(`${aisc_secNum++}. AISC 360-16 Steel Checks — ${selectedSection?.name||""}`)}<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="C8C8C8"/><w:left w:val="single" w:sz="4" w:color="C8C8C8"/><w:bottom w:val="single" w:sz="4" w:color="C8C8C8"/><w:right w:val="single" w:sz="4" w:color="C8C8C8"/><w:insideH w:val="single" w:sz="4" w:color="C8C8C8"/><w:insideV w:val="single" w:sz="4" w:color="C8C8C8"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="${TW/3|0}"/><w:gridCol w:w="${TW/3|0}"/><w:gridCol w:w="${TW-2*(TW/3|0)}"/></w:tblGrid>${hdrRow(["Check","Demand","φCapacity / Result"],[TW/3|0,TW/3|0,TW-2*(TW/3|0)])}${tblRow(cellW4(TW/3|0,"Flexure (φMn)",false,"FFFFFF")+cellW4(TW/3|0,`${(unitSys==="metric"?results.Mmax/1.35582:results.Mmax).toFixed(3)} kip*ft`,false,"FFFFFF")+cellW4(TW-2*(TW/3|0),`${checks.phi_Mn.toFixed(3)} kip*ft  |  ${checks.MRatio.toFixed(3)}  ${checks.momentPass?"✓ OK":"✗ FAIL"}`,true,checks.momentPass?"EDFAF3":"FDF0F0",checks.momentPass?"2D6A4F":"7B2D2D"))}${tblRow(cellW4(TW/3|0,"Shear (φVn)",false,"F5F5F5")+cellW4(TW/3|0,`${(unitSys==="metric"?results.Vmax/4.44822:results.Vmax).toFixed(3)} kip`,false,"F5F5F5")+cellW4(TW-2*(TW/3|0),`${checks.phi_Vn.toFixed(3)} kip  |  ${checks.VRatio.toFixed(3)}  ${checks.shearPass?"✓ OK":"✗ FAIL"}`,true,checks.shearPass?"EDFAF3":"FDF0F0",checks.shearPass?"2D6A4F":"7B2D2D"))}${tblRow(cellW4(TW/3|0,"Compact Section",false,"FFFFFF")+cellW4(TW/3|0,`λf = ${checks.lambda_f.toFixed(2)}`,false,"FFFFFF")+cellW4(TW-2*(TW/3|0),`${checks.isCompact?"✓ Compact":"⚠ Non-compact"}  (λpf = ${checks.lambda_pf.toFixed(2)})`,true,checks.isCompact?"EDFAF3":"FEF9E7"))}</w:tbl>` : "";

      let lbl_secNum = aisc_secNum;
      const lblXml = allLbls.length>0 ? `${h2(`${lbl_secNum++}. Labelled Point Values`)}<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="CCCCCC"/><w:left w:val="single" w:sz="4" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="4" w:color="CCCCCC"/><w:right w:val="single" w:sz="4" w:color="CCCCCC"/><w:insideH w:val="single" w:sz="4" w:color="CCCCCC"/><w:insideV w:val="single" w:sz="4" w:color="CCCCCC"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="${TW/4|0}"/><w:gridCol w:w="${TW/4|0}"/><w:gridCol w:w="${TW/4|0}"/><w:gridCol w:w="${TW-3*(TW/4|0)}"/></w:tblGrid>${hdrRow(["Label","Diagram","Position","Value"],[TW/4|0,TW/4|0,TW/4|0,TW-3*(TW/4|0)])}${allLbls.flatMap(g=>g.items.map((lb,i)=>{const bg=i%2===0?"FFFFFF":"F5F5F5";return tblRow(cellW4(TW/4|0,`L${i+1}`,false,bg)+cellW4(TW/4|0,g.title,false,bg)+cellW4(TW/4|0,`${lb.x.toFixed(4)} ${uu.len}`,false,bg)+cellW4(TW-3*(TW/4|0),`${lb.v.toFixed(4)} ${g.unit}`,true,bg));})).join("")}</w:tbl>` : "";

      const diag_secNum=lbl_secNum;
      const imgW=5486400, imgHdiag=Math.round(imgW*260/900), imgHbeam=Math.round(imgW*180/900);
      const diagsXml=`${h2(`${diag_secNum}. Diagrams`)}${imgPara("rId11",imgW,imgHdiag)}${captionPara("Fig 1 — Shear Force Diagram (SFD)")}${imgPara("rId12",imgW,imgHdiag)}${captionPara("Fig 2 — Bending Moment Diagram (BMD)"+(bmdReversed?" — Reversed":""))}${imgPara("rId13",imgW,imgHdiag)}${captionPara("Fig 3 — Deflection / Elastic Curve")}${imgPara("rId14",imgW,imgHdiag)}${captionPara("Fig 4 — Slope / Rotation Diagram")}`;

      const footerNoteXml=`${rule()}${para(`ProBeam Pro  ·  Generated: ${new Date().toLocaleString()}  ·  Hermitian Cubic FEM (${results?.nElems||"?"} elements, ${results?.refinedNodes?.length||"?"} nodes)  ·  © ProBeam Pro`,true,16,false,"999999")}`;

      const bodyXml=`${coverXml}${sketchXml}${inputTableXml}${loadsTableXml}${reactionsTableXml}${extremesTableXml}${svcXml}${aisc_xml}${lblXml}${diagsXml}${footerNoteXml}`;

      const wmText="ProBeam Pro";
      const headerXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr/><w:pict><v:shape id="wm1" type="#_x0000_t136" style="position:absolute;width:520pt;height:120pt;z-index:-1;rotation:315;mso-position-horizontal:center;mso-position-horizontal-relative:page;mso-position-vertical:center;mso-position-vertical-relative:page" fillcolor="#C8D8F0" stroked="f" opacity="8000"><v:fill on="t" focussize="0,0"/><v:textpath style="font-family:Arial;font-size:64pt;font-weight:normal" string="${wmText}" trim="t"/><w10:wrap xmlns:w10="urn:schemas-microsoft-com:office:word" type="none"/></v:shape></w:pict></w:r></w:p></w:hdr>`;

      const documentXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${bodyXml}<w:sectPr><w:headerReference w:type="default" r:id="rId100"/><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720"/></w:sectPr></w:body></w:document>`;

      const stylesXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="20"/><w:szCs w:val="20"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="80"/></w:pPr><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="20"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="240" w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="888888"/></w:pBdr></w:pPr><w:rPr><w:b/><w:color w:val="1C1C1C"/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr></w:style></w:styles>`;

      const docRelsXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId100" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/><Relationship Id="rId10" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/beam.png"/><Relationship Id="rId11" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/sfd.png"/><Relationship Id="rId12" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/bmd.png"/><Relationship Id="rId13" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/defl.png"/><Relationship Id="rId14" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/slope.png"/></Relationships>`;

      const pkgRelsXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;

      const contentTypesXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/></Types>`;

      const zip=new JSZip();
      zip.file("[Content_Types].xml", contentTypesXml);
      zip.file("_rels/.rels", pkgRelsXml);
      zip.file("word/document.xml", documentXml);
      zip.file("word/styles.xml", stylesXml);
      zip.file("word/header1.xml", headerXml);
      zip.file("word/_rels/document.xml.rels", docRelsXml);
      zip.file("word/media/beam.png",  b64ToBytes(beamB64));
      zip.file("word/media/sfd.png",   b64ToBytes(sfdB64));
      zip.file("word/media/bmd.png",   b64ToBytes(bmdB64));
      zip.file("word/media/defl.png",  b64ToBytes(deflB64));
      zip.file("word/media/slope.png", b64ToBytes(sloB64));

      const docxBlob=await zip.generateAsync({type:"blob",mimeType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
      const url=URL.createObjectURL(docxBlob);
      const a=document.createElement("a");
      a.href=url; a.download=`BeamReport_${projName.replace(/\s+/g,"_")}.docx`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(()=>URL.revokeObjectURL(url),15000);
      setReportLoading(false);
    }catch(e){setError("Report generation failed: "+e.message);setReportLoading(false);}
  };

  // Styles
  const s={
    wrap:{fontFamily:"Segoe UI,sans-serif",background:"#0b0d14",color:"#e8eaf0",minHeight:"100vh",padding:isMobile?"8px 8px":"12px 14px"},
    title:{fontSize:isMobile?17:22,fontWeight:800,color:"#4f8ef7",marginBottom:2},
    sub:{fontSize:11,color:"#6b7280",marginBottom:10},
    tabBar:{display:"flex",gap:2,borderBottom:"1px solid #1e2130",marginBottom:12,overflowX:"auto",flexWrap:"nowrap",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"},
    tab:a=>({padding:isMobile?"6px 8px":"7px 12px",border:"none",background:"none",color:a?"#4f8ef7":"#6b7280",cursor:"pointer",fontSize:isMobile?10:12,fontWeight:700,borderBottom:a?"2px solid #4f8ef7":"2px solid transparent",whiteSpace:"nowrap",flexShrink:0}),
    card:{background:"#13161f",border:"1px solid #1e2130",borderRadius:10,padding:isMobile?10:14,marginBottom:10},
    h3:{fontSize:10,fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8},
    lbl:{display:"block",fontSize:12,color:"#9ca3af",marginBottom:4,marginTop:8},
    inp:{width:"100%",background:"#1a1d27",border:"1px solid #2a2d3a",color:"#e8eaf0",borderRadius:6,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box"},
    sel:{width:"100%",background:"#1a1d27",border:"1px solid #2a2d3a",color:"#e8eaf0",borderRadius:6,padding:"7px 10px",fontSize:13,outline:"none",boxSizing:"border-box"},
    g2:{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:8},
    g3:{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr",gap:8},
    g4:{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr 1fr 1fr",gap:8},
    btn:c=>({padding:"9px 14px",border:"none",borderRadius:7,fontSize:isMobile?12:13,fontWeight:700,cursor:"pointer",background:c==="blue"?"#4f8ef7":c==="green"?"#3dd68c":c==="red"?"#ef4444":c==="orange"?"#f7a24f":"#252836",color:c==="green"?"#000":"#fff"}),
    rBox:{background:"#1a1d27",border:"1px solid #1e2130",borderRadius:8,padding:isMobile?"10px 6px":"12px 10px",textAlign:"center"},
    rVal:c=>({fontSize:isMobile?14:19,fontWeight:800,color:c||"#4f8ef7",fontFamily:"monospace",wordBreak:"break-all"}),
    rLbl:{fontSize:isMobile?9:11,color:"#6b7280",marginTop:3},
    tbl:{width:"100%",borderCollapse:"collapse",fontSize:isMobile?11:12},
    th:{textAlign:"left",padding:isMobile?"5px 6px":"7px 10px",background:"#1a1d27",color:"#9ca3af",fontWeight:700,borderBottom:"1px solid #2a2d3a"},
    td:{padding:isMobile?"5px 6px":"7px 10px",borderBottom:"1px solid #13161f",color:"#e8eaf0"},
    warn:{color:"#f75f5f",fontSize:12,padding:"10px 12px",background:"#2a0a0a",borderRadius:6,borderLeft:"3px solid #f75f5f",marginBottom:8},
    ok:{color:"#3dd68c",fontSize:12,padding:"10px 12px",background:"#0a2a0a",borderRadius:6,borderLeft:"3px solid #3dd68c",marginBottom:8},
    info:{color:"#38bdf8",fontSize:12,padding:"10px 12px",background:"#0a1a2a",borderRadius:6,borderLeft:"3px solid #38bdf8",marginBottom:8},
  };

  return (
    <div style={s.wrap}>
      {/* TOOLBAR */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:11,color:"#4b5563",fontFamily:"monospace"}}>
          {loads.length} load{loads.length!==1?"s":""} · {beamType==="CUSTOM"?`Custom (${customSupports.length} supports)`:BEAM_TYPES[beamType]} · {L} {uu.len} span
        </div>
        <div style={{display:"flex",gap:6}}>
          <button style={{...s.btn("blue"),fontSize:11,padding:"6px 12px"}} onClick={()=>setShowSaveModal(true)}>💾 Save</button>
          <select style={{...s.sel,width:"auto",fontSize:11,padding:"6px 10px"}} onChange={e=>{if(e.target.value){const p=savedProjects.find(x=>x.name===e.target.value);if(p)loadProject(p);e.target.value="";}}} defaultValue="">
            <option value="">📂 Load Project</option>
            {savedProjects.map(p=><option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {showSaveModal&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#000a",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{background:"#13161f",border:"1px solid #2a2d3a",borderRadius:12,padding:24,width:isMobile?"90vw":"300px",maxWidth:340,boxSizing:"border-box"}}>
            <div style={{fontWeight:700,marginBottom:12,fontSize:15}}>💾 Save Project</div>
            <label style={s.lbl}>Project Name</label>
            <input style={s.inp} value={projName} onChange={e=>setProjName(e.target.value)}/>
            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button style={{...s.btn("blue"),flex:1}} onClick={saveProject}>Save</button>
              <button style={{...s.btn(""),flex:1}} onClick={()=>setShowSaveModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={s.tabBar}>
        {[["setup","⚙ Setup"],["loads","📦 Loads"],["results","📊 Results"],["diagrams","📈 Diagrams"],["fem","🔲 FEM Mesh"],["checks","✅ Checks"],["report","📄 Report"]].map(([t,label])=>(
          <button key={t} style={s.tab(tab===t)} onClick={()=>setTab(t)}>{label}{t==="fem"&&results?<span style={{marginLeft:4,fontSize:9,background:"#1e3a5f",color:"#4f8ef7",borderRadius:10,padding:"1px 5px"}}>{results.nElems}e</span>:null}</button>
        ))}
      </div>
      {error&&<div style={s.warn}>{error}</div>}

      {/* ══ SETUP ══ */}
      {tab==="setup"&&(
        <>
          <div style={s.g2}>
            <div style={s.card}>
              <div style={s.h3}>Beam Configuration</div>
              <label style={s.lbl}>Beam Type</label>
              <select style={s.sel} value={beamType} onChange={e=>{setBeamType(e.target.value);setResults(null);}}>
                {Object.entries(BEAM_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>

              {beamType==="CUSTOM"&&(
                <div style={{marginTop:10,padding:12,background:"#0f1117",borderRadius:8,border:"1px solid #2a2d3a"}}>
                  <div style={s.h3}>Custom Support Configuration</div>
                  <div style={{fontSize:11,color:"#6b7280",marginBottom:8}}>
                    Add supports anywhere along the beam. Need ≥2 supports for stability.
                    <br/>🟢 Pin · 🟠 Roller · 🔴 Fixed
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"1fr 1fr auto",gap:6,alignItems:"end",marginBottom:8}}>
                    <div>
                      <label style={s.lbl}>Support Type</label>
                      <select style={s.sel} value={newSupType} onChange={e=>setNewSupType(e.target.value)}>
                        <option value="pin">🟢 Pin</option>
                        <option value="roller">🟠 Roller</option>
                        <option value="fixed">🔴 Fixed</option>
                      </select>
                    </div>
                    <div>
                      <label style={s.lbl}>Position ({uu.len})</label>
                      <input style={s.inp} type="number" value={newSupPos}
                        onChange={e=>setNewSupPos(+e.target.value)}
                        min={0} max={L} step={0.5}/>
                    </div>
                    <button style={{...s.btn("blue"),padding:"9px 14px",whiteSpace:"nowrap",gridColumn:isMobile?"1 / -1":"auto"}}
                      onClick={()=>{
                        if(newSupPos<0||newSupPos>L){setError(`Support position must be 0–${L} ${uu.len}`);return;}
                        setCustomSupports(prev=>[...prev,{type:newSupType,pos:+newSupPos}].sort((a,b)=>a.pos-b.pos));
                        setResults(null);
                      }}>+ Add</button>
                  </div>
                  {customSupports.length===0
                    ?<div style={{color:"#6b7280",fontSize:12}}>No supports added yet.</div>
                    :<table style={{...s.tbl,fontSize:11}}><thead><tr>
                        <th style={s.th}>#</th><th style={s.th}>Type</th><th style={s.th}>Position ({uu.len})</th><th style={s.th}></th>
                      </tr></thead><tbody>
                      {customSupports.map((sp,i)=>(
                        <tr key={i}>
                          <td style={s.td}>{i+1}</td>
                          <td style={s.td}>
                            <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:sp.type==="pin"?"#0a2a0a":sp.type==="roller"?"#2a1a0a":"#2a0a0a",color:sp.type==="pin"?"#3dd68c":sp.type==="roller"?"#f7a24f":"#f75f5f"}}>
                              {sp.type==="pin"?"🟢 Pin":sp.type==="roller"?"🟠 Roller":"🔴 Fixed"}
                            </span>
                          </td>
                          <td style={s.td}>{sp.pos} {uu.len}</td>
                          <td style={s.td}>
                            <button style={{...s.btn("red"),padding:"2px 8px",fontSize:10}}
                              onClick={()=>{setCustomSupports(customSupports.filter((_,j)=>j!==i));setResults(null);}}>✕</button>
                          </td>
                        </tr>
                      ))}
                    </tbody></table>
                  }
                  {customSupports.length>0&&(()=>{
                    const nFixed=customSupports.filter(s=>s.type==="fixed").length;
                    const nPin=customSupports.filter(s=>s.type==="pin").length;
                    const nRoller=customSupports.filter(s=>s.type==="roller").length;
                    const totalReactions=nFixed*3+nPin*2+nRoller*1;
                    const stability=totalReactions>=2?"✓ Statically supported":"⚠ May be unstable — add more vertical supports";
                    return <div style={{marginTop:6,fontSize:10,color:totalReactions>=2?"#3dd68c":"#f7a24f"}}>{stability} &nbsp;({nPin} pin, {nRoller} roller, {nFixed} fixed)</div>;
                  })()}
                  {/* FEM Mesh Density Control */}
                  <div style={{marginTop:12,borderTop:"1px solid #1e2130",paddingTop:10}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                      <div style={{...s.h3,margin:0}}>🔲 FEM Mesh Density</div>
                      <span style={{fontSize:11,fontWeight:700,color:"#4f8ef7",fontFamily:"monospace"}}>{femMeshDensity} elem/span</span>
                    </div>
                    <input type="range" min={4} max={60} step={2} value={femMeshDensity}
                      onChange={e=>{setFemMeshDensity(+e.target.value);setResults(null);}}
                      style={{width:"100%",accentColor:"#4f8ef7",cursor:"pointer"}}/>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#4b5563",marginTop:2}}>
                      <span>4 (coarse)</span>
                      <span style={{color:"#6b7280"}}>~{femMeshDensity} elements across beam · {femMeshDensity+1} nodes · {(femMeshDensity+1)*2} DOFs</span>
                      <span>60 (fine)</span>
                    </div>
                    <div style={{fontSize:10,color:"#4b5563",marginTop:4,lineHeight:1.5}}>
                      Hermitian cubic elements — higher density → more accurate SFD/BMD/deflection.
                    </div>
                  </div>
                </div>
              )}
              <label style={s.lbl}>Unit System</label>
              <select style={s.sel} value={unitSys} onChange={e=>{
                setUnitSys(e.target.value);
                if(e.target.value==="metric"){setL(6);setI(200000000);setE(200);}
                else{setL(20);setI(500);setE(29000);}
                setResults(null);
                setError("Unit system changed. Please re-solve the beam.");
              }}>
                <option value="imperial">Imperial (ft, kip, ksi, in)</option>
                <option value="metric">Metric (m, kN, GPa, mm)</option>
              </select>
              <label style={s.lbl}>Deflection Serviceability Limit</label>
              <select style={s.sel} value={deflLimit} onChange={e=>setDeflLimit(e.target.value)}>
                {Object.entries(DEFL_LIMITS).map(([k,v])=><option key={k} value={k}>{k} — {v}</option>)}
              </select>
              <label style={s.lbl}>Engineer Name</label>
              <input style={s.inp} value={engName} onChange={e=>setEngName(e.target.value)}/>
              <label style={s.lbl}>Project Name</label>
              <input style={s.inp} value={projName} onChange={e=>setProjName(e.target.value)}/>
            </div>
            <div style={s.card}>
              <div style={s.h3}>Geometry & Material</div>
              <label style={s.lbl}>Span Length ({uu.len})</label>
              <input style={s.inp} type="number" value={L} onChange={e=>setL(+e.target.value)} min="0.1" step="0.5"/>

              <label style={s.lbl}>Section Input Mode</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                {[["manual","✏️ Manual I"],["custom","📐 Custom Section"],["aisc","📚 AISC Library"]].map(([mode,label])=>(
                  <button key={mode} onClick={()=>{
                    setUseAISC(mode==="aisc");
                    setUseCustomSection(mode==="custom");
                    if(mode==="manual"){setUseAISC(false);setUseCustomSection(false);}
                  }} style={{
                    padding:"8px 4px",borderRadius:7,cursor:"pointer",fontSize:11,fontWeight:700,
                    background:((mode==="aisc"&&useAISC)||(mode==="custom"&&useCustomSection)||(mode==="manual"&&!useAISC&&!useCustomSection))?"#4f8ef7":"#1a1d27",
                    color:((mode==="aisc"&&useAISC)||(mode==="custom"&&useCustomSection)||(mode==="manual"&&!useAISC&&!useCustomSection))?"#fff":"#9ca3af",
                    border:"1px solid #2a2d3a",
                  }}>{label}</button>
                ))}
              </div>

              {!useAISC && !useCustomSection && (
                <>
                  <label style={s.lbl}>Moment of Inertia Iz ({unitSys==="imperial"?"in⁴":"mm⁴"})</label>
                  <input style={s.inp} type="number" value={I} onChange={e=>setI(+e.target.value)} min="0.01"/>
                  <label style={s.lbl}>Young's Modulus E ({uu.stress})</label>
                  <input style={s.inp} type="number" value={E} onChange={e=>setE(+e.target.value)} min="1"/>
                </>
              )}

              {useCustomSection && (
                <>
                  <label style={s.lbl}>Young's Modulus E ({uu.stress})</label>
                  <input style={s.inp} type="number" value={E} onChange={e=>setE(+e.target.value)} min="1"/>
                  <label style={s.lbl}>Section Shape</label>
                  <select style={s.sel} value={sectionType} onChange={e=>setSectionType(e.target.value)}>
                    {Object.entries(SECTION_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
                    {sectionType==="rect"&&<>
                      <div><label style={s.lbl}>Width b ({unitSys==="imperial"?"in":"mm"})</label><input style={s.inp} type="number" value={sectionDims.b} onChange={e=>setSectionDims(p=>({...p,b:+e.target.value}))} min="0.01"/></div>
                      <div><label style={s.lbl}>Height h</label><input style={s.inp} type="number" value={sectionDims.h} onChange={e=>setSectionDims(p=>({...p,h:+e.target.value}))} min="0.01"/></div>
                    </>}
                    {sectionType==="circle"&&<>
                      <div><label style={s.lbl}>Radius r ({unitSys==="imperial"?"in":"mm"})</label><input style={s.inp} type="number" value={sectionDims.r} onChange={e=>setSectionDims(p=>({...p,r:+e.target.value}))} min="0.01"/></div>
                    </>}
                    {sectionType==="hollow_rect"&&<>
                      <div><label style={s.lbl}>Width b</label><input style={s.inp} type="number" value={sectionDims.b} onChange={e=>setSectionDims(p=>({...p,b:+e.target.value}))} min="0.01"/></div>
                      <div><label style={s.lbl}>Height h</label><input style={s.inp} type="number" value={sectionDims.h} onChange={e=>setSectionDims(p=>({...p,h:+e.target.value}))} min="0.01"/></div>
                      <div style={{gridColumn:"1/-1"}}><label style={s.lbl}>Wall thickness t</label><input style={s.inp} type="number" value={sectionDims.t} onChange={e=>setSectionDims(p=>({...p,t:+e.target.value}))} min="0.01"/></div>
                    </>}
                    {sectionType==="hollow_circle"&&<>
                      <div><label style={s.lbl}>Outer radius ro</label><input style={s.inp} type="number" value={sectionDims.ro} onChange={e=>setSectionDims(p=>({...p,ro:+e.target.value}))} min="0.01"/></div>
                      <div><label style={s.lbl}>Inner radius ri</label><input style={s.inp} type="number" value={sectionDims.ri} onChange={e=>setSectionDims(p=>({...p,ri:+e.target.value}))} min="0.01"/></div>
                    </>}
                    {(sectionType==="I_section"||sectionType==="T_section")&&<>
                      <div><label style={s.lbl}>Flange width bf</label><input style={s.inp} type="number" value={sectionDims.bf} onChange={e=>setSectionDims(p=>({...p,bf:+e.target.value}))} min="0.01"/></div>
                      <div><label style={s.lbl}>Flange thickness tf</label><input style={s.inp} type="number" value={sectionDims.tf} onChange={e=>setSectionDims(p=>({...p,tf:+e.target.value}))} min="0.01"/></div>
                      <div><label style={s.lbl}>Web thickness tw</label><input style={s.inp} type="number" value={sectionDims.tw} onChange={e=>setSectionDims(p=>({...p,tw:+e.target.value}))} min="0.01"/></div>
                      <div><label style={s.lbl}>Web height hw</label><input style={s.inp} type="number" value={sectionDims.hw} onChange={e=>setSectionDims(p=>({...p,hw:+e.target.value}))} min="0.01"/></div>
                    </>}
                    {sectionType==="L_section"&&<>
                      <div><label style={s.lbl}>Horiz. leg b</label><input style={s.inp} type="number" value={sectionDims.b} onChange={e=>setSectionDims(p=>({...p,b:+e.target.value}))} min="0.01"/></div>
                      <div><label style={s.lbl}>Vert. leg h</label><input style={s.inp} type="number" value={sectionDims.h} onChange={e=>setSectionDims(p=>({...p,h:+e.target.value}))} min="0.01"/></div>
                      <div style={{gridColumn:"1/-1"}}><label style={s.lbl}>Thickness t</label><input style={s.inp} type="number" value={sectionDims.t} onChange={e=>setSectionDims(p=>({...p,t:+e.target.value}))} min="0.01"/></div>
                    </>}
                  </div>

                  {computedSection ? (
                    <div style={{...s.ok,marginTop:10,fontSize:11}}>
                      <strong>Computed:</strong> Iz = <strong>{computedSection.Ix.toFixed(4)}</strong> {unitSys==="imperial"?"in⁴":"mm⁴"}
                      &nbsp;|&nbsp; Sz = {computedSection.Sx.toFixed(4)} &nbsp;|&nbsp; A = {computedSection.A.toFixed(4)} &nbsp;|&nbsp; ȳ = {computedSection.yc.toFixed(4)}
                      <div style={{marginTop:4,color:"#9ca3af"}}>✓ Iz auto-populated for solver</div>
                    </div>
                  ) : (
                    <div style={{...s.warn,marginTop:10,fontSize:11}}>Enter valid dimensions — check that inner dimensions don't exceed outer.</div>
                  )}

                  <div style={{marginTop:10}}>
                    <div style={{fontSize:10,color:"#6b7280",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Section Preview</div>
                    <SectionCanvas type={sectionType} dims={sectionDims} computed={computedSection}/>
                  </div>
                </>
              )}

              {useAISC && (
                <>
                  <label style={s.lbl}>Filter</label>
                  <input style={s.inp} placeholder="W12, W14x30…" value={sectionFilter} onChange={e=>setSectionFilter(e.target.value)}/>
                  <label style={s.lbl}>Select Section</label>
                  <select style={{...s.sel,height:110}} size={5} value={selectedSection?.name||""} onChange={e=>setSelectedSection(AISC_W_SECTIONS.find(x=>x.name===e.target.value)||null)}>
                    {AISC_W_SECTIONS.filter(x=>x.name.toLowerCase().includes(sectionFilter.toLowerCase())).map(x=>(
                      <option key={x.name} value={x.name}>{x.name} — Ix={x.Ix} in⁴</option>
                    ))}
                  </select>
                  {selectedSection&&<div style={{...s.info,marginTop:8,fontSize:11}}><strong>{selectedSection.name}</strong> d={selectedSection.d}" bf={selectedSection.bf}" Ix={selectedSection.Ix} in⁴ Sx={selectedSection.Sx} in³ Zx={selectedSection.Zx} in³ W={selectedSection.weight} lb/ft</div>}
                  <label style={s.lbl}>Fy (ksi)</label>
                  <input style={s.inp} type="number" value={Fy} onChange={e=>setFy(+e.target.value)} min="1"/>
                </>
              )}
            </div>
          </div>
          <div style={s.card}>
            <div style={s.h3}>Beam & Load Preview</div>
            <BeamSketch beamType={beamType} L={L} loads={loads} uu={uu} customSupports={customSupports}/>
          </div>
        </>
      )}

      {/* ══ LOADS ══ */}
      {tab==="loads"&&(
        <>
          <div style={s.card}>
            <div style={s.h3}>Add Load</div>
            <div style={s.g2}>
              <div>
                <label style={s.lbl}>Load Type</label>
                <select style={s.sel} value={loadType} onChange={e=>setLoadType(e.target.value)}>
                  {Object.entries(LOAD_TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={s.lbl}>Direction</label>
                <select style={s.sel} value={loadDir} onChange={e=>setLoadDir(+e.target.value)}>
                  <option value={-1}>↓ Downward / Clockwise</option>
                  <option value={1}>↑ Upward / Counter-CW</option>
                </select>
              </div>
            </div>
            <div style={s.g3}>
              <div>
                <label style={s.lbl}>{loadType==="moment"?`Moment (${uu.mom})`:loadType==="udl"?`Intensity (${uu.wt})`:`Magnitude (${uu.force})`}</label>
                <input style={s.inp} type="number" value={loadMag} onChange={e=>setLoadMag(+e.target.value)} step="0.5"/>
              </div>
              {loadType==="tri"&&<div><label style={s.lbl}>End Intensity ({uu.wt})</label><input style={s.inp} type="number" value={loadMag2} onChange={e=>setLoadMag2(+e.target.value)} step="0.5"/></div>}
              <div>
                <label style={s.lbl}>{(loadType==="udl"||loadType==="tri")?`Start (${uu.len})`:`Position (${uu.len})`}</label>
                <input style={s.inp} type="number" value={loadPos} onChange={e=>setLoadPos(+e.target.value)} step="0.5" min="0" max={L}/>
              </div>
              {(loadType==="udl"||loadType==="tri")&&<div><label style={s.lbl}>End Position ({uu.len})</label><input style={s.inp} type="number" value={loadPos2} onChange={e=>setLoadPos2(+e.target.value)} step="0.5" min="0" max={L}/></div>}
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
              <button style={s.btn("blue")} onClick={addLoad}>+ Add Load</button>
            </div>
          </div>
          <div style={s.card}>
            <div style={s.h3}>Applied Loads ({loads.length})</div>
            {loads.length===0?<div style={{color:"#6b7280",fontSize:13}}>No loads added yet.</div>:(
              <table style={s.tbl}><thead><tr><th style={s.th}>#</th><th style={s.th}>Type</th><th style={s.th}>Magnitude</th><th style={s.th}>Position</th><th style={s.th}></th></tr></thead>
              <tbody>{loads.map((ld,i)=>(
                <tr key={i}>
                  <td style={s.td}>{i+1}</td>
                  <td style={s.td}><span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,background:"#1a2a4a",color:"#4f8ef7"}}>{LOAD_TYPES[ld.type]}</span></td>
                  <td style={s.td}>{ld.type==="point"||ld.type==="moment"?`${ld.P?.toFixed(3)} ${ld.type==="moment"?uu.mom:uu.force}`:ld.type==="udl"?`${ld.w1?.toFixed(3)} ${uu.wt}`:`${ld.w1?.toFixed(3)}→${ld.w2?.toFixed(3)} ${uu.wt}`}</td>
                  <td style={s.td}>{ld.type==="point"||ld.type==="moment"?`x=${ld.a} ${uu.len}`:`${ld.a}–${ld.b} ${uu.len}`}</td>
                  <td style={s.td}><button style={{...s.btn("red"),padding:"3px 10px",fontSize:11}} onClick={()=>setLoads(loads.filter((_,j)=>j!==i))}>✕</button></td>
                </tr>
              ))}</tbody></table>
            )}
          </div>
        </>
      )}

      {/* ══ RESULTS ══ */}
      {tab==="results"&&(results?(
        <>
          <div style={{...s.card,borderColor:"#4f8ef733"}}>
            <div style={s.h3}>Support Reactions</div>
            {results.reactions && results.reactions.length > 0 ? (
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
                  {results.reactions.map((r,i)=>(
                    <div key={i} style={s.rBox}>
                      <div style={s.rVal(r.R>=0?"#3dd68c":"#ef4444")}>{r.R>=0?"":"↓ "}{Math.abs(r.R).toFixed(4)}</div>
                      <div style={s.rLbl}>{r.type[0].toUpperCase()+r.type.slice(1)} @ x={r.pos.toFixed(3)} {uu.len}<br/>({uu.force})</div>
                    </div>
                  ))}
                </div>
                {results.momentReactions && results.momentReactions.length > 0 && (
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8,marginTop:8}}>
                    {results.momentReactions.map((r,i)=>(
                      <div key={i} style={s.rBox}>
                        <div style={s.rVal("#a78bfa")}>{r.M.toFixed(4)}</div>
                        <div style={s.rLbl}>Fixed Moment @ x={r.pos.toFixed(3)} {uu.len}<br/>({uu.mom})</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={s.g3}>
                  <div style={s.rBox}><div style={s.rVal(results.RA>=0?"#3dd68c":"#ef4444")}>{results.RA.toFixed(4)}</div><div style={s.rLbl}>R<sub>A</sub> ({uu.force})</div></div>
                  <div style={s.rBox}><div style={s.rVal(results.RB>=0?"#3dd68c":"#ef4444")}>{results.RB.toFixed(4)}</div><div style={s.rLbl}>R<sub>B</sub> ({uu.force})</div></div>
                  <div style={s.rBox}><div style={s.rVal("#a78bfa")}>{results.MA_fix?(results.MA_fix).toFixed(4):"—"}</div><div style={s.rLbl}>Fixed M<sub>A</sub> ({uu.mom})</div></div>
                </div>
                {results.MB_fix!==undefined&&results.MB_fix!==0&&(
                  <div style={{...s.rBox,marginTop:8}}>
                    <div style={s.rVal("#a78bfa")}>{(results.MB_fix).toFixed(4)}</div>
                    <div style={s.rLbl}>Fixed M<sub>B</sub> ({uu.mom})</div>
                  </div>
                )}
              </>
            )}
          </div>
          <div style={{...s.card,borderColor:"#f7a24f33"}}>
            <div style={s.h3}>Force Extremes</div>
            <div style={s.g4}>
              <div style={s.rBox}><div style={s.rVal("#f7a24f")}>{results.Vmax.toFixed(4)}</div><div style={s.rLbl}>|V|max ({uu.force})</div></div>
              <div style={s.rBox}><div style={s.rVal("#a78bfa")}>{results.Mmax.toFixed(4)}</div><div style={s.rLbl}>|M|max ({uu.mom})</div></div>
              <div style={s.rBox}><div style={s.rVal("#38bdf8")}>{Math.abs(results.dMin).toFixed(4)}</div><div style={s.rLbl}>|δ| downward ({uu.def})</div></div>
              <div style={s.rBox}><div style={s.rVal("#38bdf8")}>{Math.abs(results.dMax).toFixed(4)}</div><div style={s.rLbl}>|δ| upward ({uu.def})</div></div>
            </div>
          </div>
          <div style={{...s.card,borderColor:"#38bdf833"}}>
            <div style={s.h3}>Peak Deflection & Serviceability</div>
            <div style={s.g3}>
              <div style={s.rBox}><div style={s.rVal("#38bdf8")}>{results.dPeak.toFixed(4)}</div><div style={s.rLbl}>Peak |δ| ({uu.def})</div></div>
              <div style={s.rBox}><div style={s.rVal("#38bdf8")}>{results.dPeakPos.toFixed(3)}</div><div style={s.rLbl}>Location ({uu.len})</div></div>
              <div style={s.rBox}><div style={s.rVal(deflPasses?"#3dd68c":"#ef4444")}>{deflPasses?"PASS":"FAIL"}</div><div style={s.rLbl}>{deflLimit} | limit {defLimit.toFixed(3)} {uu.def}</div></div>
            </div>
            {results&&<div style={{fontSize:11,color:"#6b7280",marginTop:8,textAlign:"center"}}>Deflection utilization: <strong style={{color:deflPasses?"#3dd68c":"#ef4444"}}>{(results.dPeak/defLimit*100).toFixed(1)}%</strong></div>}
          </div>
          <div style={{...s.card,borderColor:"#3dd68c33"}}>
            <div style={s.h3}>Slope / Rotation</div>
            <div style={s.g3}>
              <div style={s.rBox}><div style={s.rVal("#3dd68c")}>{results.thetaA.toFixed(6)}</div><div style={s.rLbl}>θ<sub>A</sub> (rad)</div></div>
              <div style={s.rBox}><div style={s.rVal("#3dd68c")}>{results.thetaB.toFixed(6)}</div><div style={s.rLbl}>θ<sub>B</sub> (rad)</div></div>
              <div style={s.rBox}><div style={s.rVal("#3dd68c")}>{results.thetaMax.toFixed(6)}</div><div style={s.rLbl}>|θ|max (rad)</div></div>
            </div>
          </div>
          <div style={s.g2}>
            <div style={s.card}><div style={s.h3}>Analysis Summary</div>
              <table style={s.tbl}><tbody>
                <tr><td style={{...s.td,color:"#9ca3af"}}>Beam Type</td><td style={s.td}>{beamType==="CUSTOM"?`Custom (${customSupports.length} supports)`:BEAM_TYPES[beamType]}</td></tr>
                <tr><td style={{...s.td,color:"#9ca3af"}}>Span</td><td style={s.td}>{L} {uu.len}</td></tr>
                <tr><td style={{...s.td,color:"#9ca3af"}}>EI</td><td style={s.td}>{results.EI.toFixed(2)} {uu.force}·{uu.len}²</td></tr>
                <tr><td style={{...s.td,color:"#9ca3af"}}>Method</td><td style={s.td}>Hermitian Cubic FEM ({results.nElems} elements)</td></tr>
                {selectedSection&&<tr><td style={{...s.td,color:"#9ca3af"}}>Section</td><td style={s.td}>{selectedSection.name}</td></tr>}
              </tbody></table>
            </div>
            <div style={s.card}><div style={s.h3}>{deflLimit} Check</div>
              <div style={deflPasses?s.ok:s.warn}>{deflPasses?"✓ PASS":"⚠ FAIL"} — {results.dPeak.toFixed(4)} {uu.def} vs {defLimit.toFixed(4)} {uu.def}</div>
              {checks&&(<>
                <div style={{...s.h3,marginTop:10}}>Quick Steel Check</div>
                <div style={checks.momentPass?s.ok:s.warn}>{checks.momentPass?"✓":"✗"} Flexure: {(checks.MRatio*100).toFixed(1)}% utilized</div>
                <div style={checks.shearPass?s.ok:s.warn}>{checks.shearPass?"✓":"✗"} Shear: {(checks.VRatio*100).toFixed(1)}% utilized</div>
              </>)}
            </div>
          </div>
        </>
      ):<div style={{color:"#6b7280",padding:20,textAlign:"center"}}>Click <strong style={{color:"#4f8ef7"}}>▶ Solve Beam</strong> below.</div>)}

      {/* ══ DIAGRAMS ══ */}
      {tab==="diagrams"&&(results?(
        <>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:"#9ca3af"}}>BMD:</span>
            <select style={{...s.sel,width:"auto"}} value={bmdReversed?"rev":"std"} onChange={e=>setBmdReversed(e.target.value==="rev")}>
              <option value="std">Standard (sagging +ve)</option>
              <option value="rev">Reversed (hogging +ve)</option>
            </select>
            <span style={{fontSize:11,color:"#6b7280"}}>💡 Hover for exact values · Labels appear in report</span>
          </div>
          {[
            {d:diagramData.sfd,c:"#f7a24f",l:"Shear Force",u:uu.force,r:false,k:"sfd"},
            {d:diagramData.bmd,c:"#a78bfa",l:"Bending Moment",u:uu.mom,r:bmdReversed,k:"bmd"},
            {d:diagramData.defl,c:"#38bdf8",l:"Deflection",u:uu.def,r:false,k:"defl"},
            {d:diagramData.slope,c:"#3dd68c",l:"Slope",u:"rad",r:false,k:"slope"}
          ].map(({d,c,l,u,r,k})=>{
            const addLabel=()=>{
              const xVal=parseFloat(labelInputs[k]);
              if(isNaN(xVal)||xVal<0||xVal>L){return;}
              const idx=Math.max(0,Math.min(d.x.length-1,Math.round((xVal/L)*(d.x.length-1))));
              const vVal=r?-d.y[idx]:d.y[idx];
              const snappedX=d.x[idx];
              if(diagLabels[k].some(lb=>Math.abs(lb.x-snappedX)<0.001)) return;
              setDiagLabels(prev=>({...prev,[k]:[...prev[k],{x:snappedX,v:vVal}].sort((a,b)=>a.x-b.x)}));
              setLabelInputs(prev=>({...prev,[k]:""}));
            };
            return (
              <div key={l} style={s.card}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6,flexWrap:"wrap",gap:6}}>
                  <div style={{fontSize:13,fontWeight:700,color:c}}>{l} Diagram</div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:11,color:"#6b7280"}}>Label at x =</span>
                    <input type="number" min={0} max={L} step={L/100}
                      value={labelInputs[k]}
                      onChange={e=>setLabelInputs(prev=>({...prev,[k]:e.target.value}))}
                      onKeyDown={e=>e.key==="Enter"&&addLabel()}
                      placeholder={`0–${L}`}
                      style={{...s.inp,width:72,padding:"3px 6px",fontSize:11}}/>
                    <span style={{fontSize:11,color:"#6b7280"}}>{uu.len}</span>
                    <button onClick={addLabel} style={{...s.btn(c),padding:"3px 10px",fontSize:11}}>＋ Add</button>
                  </div>
                </div>
                <DiagramCanvas data={d} color={c} label={l} unit={u} reverse={r} labels={diagLabels[k]}/>
                {diagLabels[k].length>0&&(
                  <div style={{marginTop:8,display:"flex",flexWrap:"wrap",gap:6}}>
                    {diagLabels[k].map((lb,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:5,background:"#1a2a4a",border:`1px solid ${c}44`,borderRadius:20,padding:"3px 10px",fontSize:11}}>
                        <span style={{color:c,fontWeight:700}}>L{i+1}</span>
                        <span style={{color:"#9ca3af"}}>x={lb.x.toFixed(3)} {uu.len}</span>
                        <span style={{color:c}}>{lb.v.toFixed(4)} {u}</span>
                        <button onClick={()=>setDiagLabels(prev=>({...prev,[k]:prev[k].filter((_,j)=>j!==i)}))}
                          style={{background:"none",border:"none",color:"#6b7280",cursor:"pointer",padding:"0 2px",fontSize:12,lineHeight:1}}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      ):<div style={{color:"#6b7280",padding:20,textAlign:"center"}}>Solve the beam first.</div>)}

      {/* ══ FEM MESH ══ */}
      {tab==="fem"&&(
        <>
          {/* Method Header */}
          <div style={{...s.card,borderColor:"#4f8ef733",background:"linear-gradient(135deg,#0f1620,#13161f)"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:"#4f8ef7",marginBottom:4}}>
                  🔲 Hermitian Cubic Finite Element Method
                </div>
                <div style={{fontSize:11,color:"#6b7280",lineHeight:1.7}}>
                  Euler-Bernoulli beam theory · Cubic Hermite shape functions (C¹ continuity) · 2 DOFs/node (v, θ)
                  <br/>Global <span style={{color:"#4f8ef7",fontFamily:"monospace"}}>K</span> assembled by direct stiffness · BCs applied by DOF elimination · Gauss elimination solver
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                {results&&<div style={{fontSize:11,color:"#9ca3af",fontFamily:"monospace",lineHeight:1.8}}>
                  <div><span style={{color:"#f7a24f"}}>{results.nElems}</span> elements</div>
                  <div><span style={{color:"#4f8ef7"}}>{results.refinedNodes.length}</span> nodes</div>
                  <div><span style={{color:"#a78bfa"}}>{results.nDOF}</span> DOFs</div>
                </div>}
              </div>
            </div>
          </div>

          {!results ? (
            <div style={{color:"#6b7280",padding:24,textAlign:"center",fontSize:13}}>
              Click <strong style={{color:"#4f8ef7"}}>▶ Solve Beam</strong> below to run the FEM analysis and view mesh details.
            </div>
          ) : (
            <>
              {/* Mesh Stats */}
              <div style={{...s.card,borderColor:"#f7a24f22"}}>
                <div style={s.h3}>FEM Mesh Statistics</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
                  <div style={s.rBox}>
                    <div style={s.rVal("#f7a24f")}>{results.nElems}</div>
                    <div style={s.rLbl}>Elements</div>
                  </div>
                  <div style={s.rBox}>
                    <div style={s.rVal("#4f8ef7")}>{results.refinedNodes.length}</div>
                    <div style={s.rLbl}>Nodes</div>
                  </div>
                  <div style={s.rBox}>
                    <div style={s.rVal("#a78bfa")}>{results.nDOF}</div>
                    <div style={s.rLbl}>Total DOFs</div>
                  </div>
                  <div style={s.rBox}>
                    <div style={s.rVal("#3dd68c")}>{results.nFree}</div>
                    <div style={s.rLbl}>Free DOFs</div>
                  </div>
                  <div style={s.rBox}>
                    <div style={s.rVal("#f97316")}>{results.constrainedDOFs.length}</div>
                    <div style={s.rLbl}>Constrained</div>
                  </div>
                </div>
                <div style={{marginTop:8,fontSize:10,color:"#4b5563",lineHeight:1.7}}>
                  System size: <span style={{color:"#a78bfa",fontFamily:"monospace"}}>{results.nFree}×{results.nFree}</span> free stiffness matrix
                  &nbsp;·&nbsp; Indeterminacy: <span style={{color:"#38bdf8",fontFamily:"monospace"}}>{results.constrainedDOFs.length - 3 >= 0 ? results.constrainedDOFs.length - 3 : 0}</span> redundant constraints
                  &nbsp;·&nbsp; EI = <span style={{color:"#4f8ef7",fontFamily:"monospace"}}>{results.EI.toFixed(2)} {uu.force}·{uu.len}²</span>
                </div>
              </div>

              {/* Mesh Visualization Canvas */}
              <div style={s.card}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={s.h3}>FEM Mesh Visualization</div>
                  <div style={{fontSize:10,color:"#4b5563"}}>Nodes colored by DOF constraint status</div>
                </div>
                <FEMMeshCanvas
                  refinedNodes={results.refinedNodes}
                  supports={beamType==="CUSTOM"?customSupports:beamTypeToSupports(beamType,L)}
                  L={L}
                  constrainedDOFs={results.constrainedDOFs}
                  nFree={results.nFree}
                  uu={uu}
                />
                <div style={{marginTop:8,fontSize:10,color:"#4b5563",textAlign:"center"}}>
                  Element length: <span style={{color:"#f7a24f",fontFamily:"monospace"}}>~{(L/results.nElems).toFixed(3)} {uu.len}</span>
                  &nbsp;·&nbsp; Node spacing similar · Structural nodes (supports, loads) always included
                </div>
              </div>

              {/* Nodal Displacements Table */}
              <div style={s.card}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8}}>
                  <div style={s.h3}>Nodal Displacements (DOF Solution Vector)</div>
                  <label style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#9ca3af",cursor:"pointer",userSelect:"none"}}>
                    <input type="checkbox" checked={showAllFEMNodes} onChange={e=>setShowAllFEMNodes(e.target.checked)}
                      style={{accentColor:"#4f8ef7",width:13,height:13}}/>
                    Show all {results.refinedNodes.length} nodes
                  </label>
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{...s.tbl,fontSize:11,minWidth:520}}>
                    <thead>
                      <tr>
                        <th style={{...s.th,width:50}}>Node</th>
                        <th style={s.th}>Position ({uu.len})</th>
                        <th style={s.th}>δ ({uu.def})</th>
                        <th style={s.th}>θ (rad)</th>
                        <th style={s.th}>Boundary Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showAllFEMNodes ? results.nodalDisp : results.keyNodes).map((nd,i)=>{
                        const isConstr = nd.vConstr || nd.mConstr;
                        return (
                          <tr key={i} style={{background:isConstr?"#1a0e0a":"transparent"}}>
                            <td style={{...s.td,fontFamily:"monospace",textAlign:"center"}}>
                              <span style={{
                                display:"inline-block",width:22,height:22,lineHeight:"22px",borderRadius:"50%",
                                background:nd.vConstr&&nd.mConstr?"#f9731622":nd.vConstr?"#fbbf2422":"#1a2a4a",
                                color:nd.vConstr&&nd.mConstr?"#f97316":nd.vConstr?"#fbbf24":"#6b7280",
                                fontSize:9,fontWeight:700,textAlign:"center"
                              }}>{nd.node}</span>
                            </td>
                            <td style={{...s.td,fontFamily:"monospace",color:"#9ca3af"}}>{nd.x.toFixed(4)}</td>
                            <td style={{...s.td,fontFamily:"monospace",color:Math.abs(nd.delta)>1e-6?"#38bdf8":"#374151"}}>
                              {nd.delta.toFixed(6)}
                            </td>
                            <td style={{...s.td,fontFamily:"monospace",color:Math.abs(nd.theta)>1e-8?"#3dd68c":"#374151"}}>
                              {nd.theta.toFixed(8)}
                            </td>
                            <td style={s.td}>
                              {nd.vConstr && nd.mConstr
                                ? <span style={{fontSize:10,color:"#f97316",fontWeight:700}}>● Fixed (v = θ = 0)</span>
                                : nd.vConstr
                                ? <span style={{fontSize:10,color:"#fbbf24",fontWeight:700}}>◐ Pin/Roller (v = 0)</span>
                                : nd.mConstr
                                ? <span style={{fontSize:10,color:"#a78bfa",fontWeight:700}}>◑ Moment release (θ = 0)</span>
                                : <span style={{fontSize:10,color:"#4b5563"}}>○ Free</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {!showAllFEMNodes && results.nodalDisp.length > results.keyNodes.length && (
                  <div style={{fontSize:10,color:"#4b5563",marginTop:6,textAlign:"center"}}>
                    Showing {results.keyNodes.length} structural key nodes of {results.nodalDisp.length} total. Enable toggle to see all.
                  </div>
                )}
              </div>

              {/* Shape Functions Reference */}
              <div style={{...s.card,borderColor:"#3dd68c22"}}>
                <div style={s.h3}>Hermitian Shape Functions (per element)</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    ["N₁(ξ)","1 − 3ξ² + 2ξ³","Transverse, node i","#4f8ef7"],
                    ["N₂(ξ)","Lₑ(ξ − 2ξ² + ξ³)","Rotational, node i","#3dd68c"],
                    ["N₃(ξ)","3ξ² − 2ξ³","Transverse, node j","#f7a24f"],
                    ["N₄(ξ)","Lₑ(−ξ² + ξ³)","Rotational, node j","#a78bfa"],
                  ].map(([fn,expr,desc,col])=>(
                    <div key={fn} style={{background:"#0f1117",borderRadius:8,padding:"10px 14px",border:`1px solid ${col}22`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:3}}>
                        <span style={{fontFamily:"monospace",fontWeight:700,color:col,fontSize:13}}>{fn}</span>
                        <span style={{fontSize:9,color:"#4b5563"}}>{desc}</span>
                      </div>
                      <div style={{fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>{expr}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:10,fontFamily:"monospace",fontSize:10,color:"#4b5563",lineHeight:1.8}}>
                  ξ = x / Lₑ ∈ [0, 1]  ·  Lₑ = element length  ·  C¹ continuity enforced at all nodes
                  <br/>Element stiffness:  k = EI/Lₑ³ · [12, 6Lₑ, −12, 6Lₑ; 6Lₑ, 4Lₑ², −6Lₑ, 2Lₑ²; −12, −6Lₑ, 12, −6Lₑ; 6Lₑ, 2Lₑ², −6Lₑ, 4Lₑ²]
                </div>
              </div>

              {/* Mesh Density Control (visible for all modes in FEM tab) */}
              <div style={s.card}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={s.h3}>Mesh Density Control</div>
                  <span style={{fontSize:12,fontWeight:700,color:"#4f8ef7",fontFamily:"monospace"}}>{femMeshDensity} elements/span</span>
                </div>
                <input type="range" min={4} max={60} step={2} value={femMeshDensity}
                  onChange={e=>{setFemMeshDensity(+e.target.value);setResults(null);}}
                  style={{width:"100%",accentColor:"#4f8ef7",cursor:"pointer"}}/>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#4b5563",marginTop:4}}>
                  <span>4 (coarse)</span>
                  <span>← adjust and re-solve to refine</span>
                  <span>60 (fine)</span>
                </div>
                <div style={{marginTop:6,fontSize:10,color:"#4b5563",lineHeight:1.6}}>
                  Current mesh: <span style={{color:"#f7a24f"}}>{results.nElems} elements</span> · {results.refinedNodes.length} nodes · {results.nDOF} DOFs
                  · System Kff size: <span style={{color:"#a78bfa"}}>{results.nFree}×{results.nFree}</span>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ══ CHECKS ══ */}
      {tab==="checks"&&(
        <>
          {!results&&<div style={s.info}>Solve the beam first to run checks.</div>}
          {results&&!useAISC&&<div style={s.info}>Enable <strong>AISC W-Section Library</strong> in Setup tab to run code checks.</div>}
          {results&&useAISC&&!selectedSection&&<div style={s.warn}>Select a W-section in Setup tab.</div>}
          {results&&useAISC&&selectedSection&&checks&&(
            <>
              <div style={{...s.card,borderColor:"#4f8ef733"}}>
                <div style={s.h3}>Section — {selectedSection.name}</div>
                <div style={s.g4}>
                  {[["d",selectedSection.d+'"'],["bf",selectedSection.bf+'"'],["tf",selectedSection.tf+'"'],["tw",selectedSection.tw+'"'],["Ix",selectedSection.Ix+" in⁴"],["Sx",selectedSection.Sx+" in³"],["Zx",selectedSection.Zx+" in³"],["W",selectedSection.weight+" lb/ft"]].map(([k,v])=>(
                    <div key={k} style={s.rBox}><div style={s.rVal("#9ca3af")}>{v}</div><div style={s.rLbl}>{k}</div></div>
                  ))}
                </div>
              </div>
              <div style={{...s.card,borderColor:checks.momentPass?"#3dd68c33":"#ef444433"}}>
                <div style={s.h3}>Flexural Check — AISC 360-16 §F2 (φ = 0.90)</div>
                {unitSys==="metric"&&<div style={{...s.info,fontSize:11,marginBottom:8}}>ℹ Demand converted from kN·m to kip·ft for AISC check.</div>}
                <div style={s.g3}>
                  <div style={s.rBox}><div style={s.rVal("#a78bfa")}>{(unitSys==="metric"?results.Mmax/1.35582:results.Mmax).toFixed(3)}</div><div style={s.rLbl}>Mu (kip·ft)</div></div>
                  <div style={s.rBox}><div style={s.rVal("#3dd68c")}>{checks.phi_Mn.toFixed(3)}</div><div style={s.rLbl}>φMn (kip·ft)</div></div>
                  <div style={s.rBox}><div style={s.rVal(checks.momentPass?"#3dd68c":"#ef4444")}>{checks.MRatio.toFixed(4)}</div><div style={s.rLbl}>Mu/φMn {checks.momentPass?"✓ OK":"✗ FAIL"}</div></div>
                </div>
                <div style={{marginTop:8,fontSize:11,color:"#6b7280"}}>Mp = Fy·Zx = {Fy}×{selectedSection.Zx} = {checks.Mp.toFixed(0)} kip·in = {(checks.Mp/12).toFixed(2)} kip·ft &nbsp;|&nbsp; {checks.isCompact?"✓ Compact section":"⚠ Non-compact — LTB check may govern"}</div>
              </div>
              <div style={{...s.card,borderColor:checks.shearPass?"#3dd68c33":"#ef444433"}}>
                <div style={s.h3}>Shear Check — AISC 360-16 §G2 (φ = 1.00)</div>
                {unitSys==="metric"&&<div style={{...s.info,fontSize:11,marginBottom:8}}>ℹ Demand converted from kN to kip for AISC check.</div>}
                <div style={s.g3}>
                  <div style={s.rBox}><div style={s.rVal("#f7a24f")}>{(unitSys==="metric"?results.Vmax/4.44822:results.Vmax).toFixed(3)}</div><div style={s.rLbl}>Vu (kip)</div></div>
                  <div style={s.rBox}><div style={s.rVal("#3dd68c")}>{checks.phi_Vn.toFixed(3)}</div><div style={s.rLbl}>φVn (kip)</div></div>
                  <div style={s.rBox}><div style={s.rVal(checks.shearPass?"#3dd68c":"#ef4444")}>{checks.VRatio.toFixed(4)}</div><div style={s.rLbl}>Vu/φVn {checks.shearPass?"✓ OK":"✗ FAIL"}</div></div>
                </div>
                <div style={{marginTop:8,fontSize:11,color:"#6b7280"}}>Aw = d·tw = {selectedSection.d}×{selectedSection.tw} = {checks.Aw.toFixed(3)} in² &nbsp;|&nbsp; Vn = 0.6·Fy·Aw = {checks.phi_Vn.toFixed(2)} kip</div>
              </div>
              <div style={s.card}>
                <div style={s.h3}>Compact Section Check (flange)</div>
                <div style={checks.isCompact?s.ok:s.info}>{checks.isCompact?"✓ Compact flange":"⚠ Non-compact flange"} — λf = {checks.lambda_f.toFixed(2)} | λpf = {checks.lambda_pf.toFixed(2)}</div>
              </div>
              {beamType==="SS"&&(()=>{
                const EI_kipin2=29000*selectedSection.Ix;
                const wt=selectedSection.weight/12000;
                const Lin=L*12;
                const fn_approx=(Math.PI/(2*Lin*Lin))*Math.sqrt(EI_kipin2*386.4/wt);
                return(
                  <div style={s.card}>
                    <div style={s.h3}>Vibration — Natural Frequency (SS approx.)</div>
                    <div style={isNaN(fn_approx)?s.info:(fn_approx>4?s.ok:s.info)}>
                      f<sub>n</sub> ≈ {isNaN(fn_approx)?"N/A":fn_approx.toFixed(2)} Hz &nbsp;|&nbsp; {fn_approx>4?"✓ Above 4 Hz walking threshold":"⚠ Below 4 Hz — check floor vibration (AISC DG11)"}
                    </div>
                  </div>
                );
              })()}
            </>
          )}
        </>
      )}

      {/* ══ REPORT PREVIEW ══ */}
      {tab==="report"&&(results?(
        <div style={{...s.card,border:"2px solid #4f8ef7"}}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:isMobile?13:18,fontWeight:800,color:"#4f8ef7"}}>STRUCTURAL BEAM ANALYSIS REPORT</div>
            <div style={{fontSize:11,color:"#6b7280"}}>ProBeam Pro — Hermitian Cubic FEM</div>
          </div>
          <div style={s.g2}>
            <div><span style={{color:"#9ca3af"}}>Project: </span>{projName}</div>
            <div><span style={{color:"#9ca3af"}}>Engineer: </span>{engName}</div>
            <div><span style={{color:"#9ca3af"}}>Date: </span>{new Date().toLocaleString()}</div>
            <div><span style={{color:"#9ca3af"}}>Units: </span>{unitSys==="imperial"?"Imperial":"Metric"}</div>
          </div>
          <hr style={{borderColor:"#2a2d3a",margin:"12px 0"}}/>
          {isMobile?(
            <table style={{...s.tbl,fontSize:11}}><tbody>
              {[["RA",`${Math.abs(results.RA).toFixed(4)} ${uu.force}`],["RB",`${Math.abs(results.RB).toFixed(4)} ${uu.force}`],["|V|max",`${results.Vmax.toFixed(4)} ${uu.force}`],["|M|max",`${results.Mmax.toFixed(4)} ${uu.mom}`],["Peak |δ|",`${results.dPeak.toFixed(4)} ${uu.def}`],["@ x",`${results.dPeakPos.toFixed(3)} ${uu.len}`],["Util.",`${(results.dPeak/defLimit*100).toFixed(1)}%`]].map(([k,v])=>(
                <tr key={k}><td style={{...s.td,color:"#9ca3af",whiteSpace:"nowrap"}}>{k}</td><td style={s.td}>{v}</td></tr>
              ))}
            </tbody></table>
          ):(
          <table style={s.tbl}><tbody>
            <tr><td style={{...s.td,color:"#9ca3af"}}>RA</td><td style={s.td}>{Math.abs(results.RA).toFixed(4)} {uu.force}</td><td style={{...s.td,color:"#9ca3af"}}>RB</td><td style={s.td}>{Math.abs(results.RB).toFixed(4)} {uu.force}</td></tr>
            <tr><td style={{...s.td,color:"#9ca3af"}}>|V|max</td><td style={s.td}>{results.Vmax.toFixed(4)} {uu.force}</td><td style={{...s.td,color:"#9ca3af"}}>|M|max</td><td style={s.td}>{results.Mmax.toFixed(4)} {uu.mom}</td></tr>
            <tr><td style={{...s.td,color:"#9ca3af"}}>|δ| downward</td><td style={s.td}>{Math.abs(results.dMin).toFixed(4)} {uu.def}</td><td style={{...s.td,color:"#9ca3af"}}>|δ| upward</td><td style={s.td}>{Math.abs(results.dMax).toFixed(4)} {uu.def}</td></tr>
            <tr><td style={{...s.td,color:"#9ca3af"}}>Peak |δ|</td><td style={s.td}>{results.dPeak.toFixed(4)} {uu.def} @ x={results.dPeakPos.toFixed(3)} {uu.len}</td><td style={{...s.td,color:"#9ca3af"}}>Utilization</td><td style={s.td}>{(results.dPeak/defLimit*100).toFixed(1)}%</td></tr>
          </tbody></table>
          )}
          <div style={{marginTop:10}}><div style={deflPasses?s.ok:s.warn}>{deflPasses?"✓ PASS":"⚠ FAIL"} — {deflLimit} check: {results.dPeak.toFixed(4)} vs {defLimit.toFixed(4)} {uu.def}</div></div>
          {checks&&<><div style={checks.momentPass?s.ok:s.warn}>{checks.momentPass?"✓":"✗"} Flexure Mu/φMn = {checks.MRatio.toFixed(4)}</div><div style={checks.shearPass?s.ok:s.warn}>{checks.shearPass?"✓":"✗"} Shear Vu/φVn = {checks.VRatio.toFixed(4)}</div></>}
          <div style={{marginTop:10,color:"#6b7280",fontSize:11,textAlign:"center"}}>ProBeam Pro · {new Date().toLocaleString()}</div>
        </div>
      ):<div style={{color:"#6b7280",padding:20,textAlign:"center"}}>Solve the beam first.</div>)}

      {/* BOTTOM BUTTONS */}
      <div style={{display:"flex",gap:8,marginTop:12,flexWrap:isMobile?"wrap":"nowrap"}}>
        <button style={{...s.btn("blue"),flex:isMobile?"1 1 100%":2,padding:13,fontSize:14}} onClick={solve}>▶ Solve Beam</button>
        <button style={{...s.btn("green"),flex:isMobile?"1 1 100%":2,padding:13,fontSize:14,opacity:reportLoading?0.6:1}} onClick={generateReport} disabled={reportLoading}>
          {reportLoading?"⏳ Building .docx...":"⬇ Word Report (.docx)"}
        </button>
        {loads.length>0&&<button style={{...s.btn("red"),flex:isMobile?"1 1 auto":1,padding:13,fontSize:12}} onClick={()=>{setLoads([]);setResults(null);}}>🗑 Clear</button>}
      </div>
    </div>
  );
}

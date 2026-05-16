// Gaussian elimination solver
function gaussSolve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) maxRow = k;
    [M[i], M[maxRow]] = [M[maxRow], M[i]];
    if (Math.abs(M[i][i]) < 1e-15) continue;
    for (let k = i + 1; k < n; k++) {
      const c = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) M[k][j] -= c * M[i][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(M[i][i]) < 1e-15) { x[i] = 0; continue; }
    x[i] = M[i][n];
    for (let j = i + 1; j < n; j++) x[i] -= M[i][j] * x[j];
    x[i] /= M[i][i];
  }
  return x;
}

function solveBeam(L, E, I, beamType, loads, unitSys, supports) {
  const EI = unitSys === "imperial" ? (E * I) / 144 : (E * 1e6 * I * 1e-12);
  const N = 1000; const dx = L / N;
  const xs = Array.from({ length: N + 1 }, (_, i) => i * dx);

  let supList;
  if (supports && supports.length >= 2) {
    supList = [...supports];
  } else {
    supList = [];
    if (beamType === "SS") supList = [{type:"pin",x:0},{type:"roller",x:L}];
    else if (beamType === "CANT") supList = [{type:"fixed",x:0}]; // ONLY one support
    else if (beamType === "FIXED") supList = [{type:"fixed",x:0},{type:"fixed",x:L}];
    else if (beamType === "PROPPED") supList = [{type:"fixed",x:0},{type:"roller",x:L}];
    else supList = [{type:"pin",x:0},{type:"roller",x:L}];
  }

  if (beamType === "CANT" && supList.length === 0) supList = [{type:"fixed",x:0}];
  if (beamType === "CANT") supList = [{type:"fixed",x:0}]; // Always only one support

  supList = supList.filter(s => s.x >= 0 && s.x <= L).sort((a,b) => a.x - b.x);
  supList = supList.filter((s,i,arr) => i===0 || Math.abs(s.x-arr[i-1].x) > 0.001);
  if (beamType !== "CANT" && supList.length < 2) supList = [{type:"pin",x:0},{type:"roller",x:L}];

  const breaks = new Set([0, L]);
  supList.forEach(s => breaks.add(s.x));
  loads.forEach(ld => {
    if (ld.type === "point" || ld.type === "moment") breaks.add(ld.a);
    if (ld.type === "udl" || ld.type === "tri") { breaks.add(ld.a); breaks.add(ld.b); }
  });
  const breakList = Array.from(breaks).sort((a,b) => a - b).filter(x => x >= 0 && x <= L);

  const nodes = breakList.map(x => {
    const sup = supList.find(s => Math.abs(s.x - x) < 1e-6);
    return { x, isSupport: !!sup, type: sup ? sup.type : "internal", hasM: sup ? sup.type === "fixed" : false };
  });
  nodes.forEach((n, i) => { n.dof_y = i * 2; n.dof_th = i * 2 + 1; });
  const nDof = nodes.length * 2;
  const K_full = Array.from({length: nDof}, () => new Array(nDof).fill(0));
  const F_full = new Array(nDof).fill(0);

  const spans = [];
  for (let i = 0; i < breakList.length - 1; i++) {
    const xA = breakList[i], xB = breakList[i+1];
    if (xB - xA < 1e-6) continue;
    const nA = nodes.find(n => Math.abs(n.x - xA) < 1e-6);
    const nB = nodes.find(n => Math.abs(n.x - xB) < 1e-6);
    spans.push({ xA, xB, nA, nB, len: xB - xA });
  }

  spans.forEach(span => {
    const Le = span.len;
    const kLocal = [
      [  12*EI/(Le**3),   6*EI/(Le**2), -12*EI/(Le**3),  6*EI/(Le**2)],
      [   6*EI/(Le**2),   4*EI/Le,      -6*EI/(Le**2),  2*EI/Le    ],
      [ -12*EI/(Le**3),  -6*EI/(Le**2),  12*EI/(Le**3), -6*EI/(Le**2)],
      [   6*EI/(Le**2),   2*EI/Le,      -6*EI/(Le**2),  4*EI/Le    ],
    ];
    const dofMap = [span.nA.dof_y, span.nA.dof_th, span.nB.dof_y, span.nB.dof_th];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const gi = dofMap[r], gj = dofMap[c];
      if (gi >= 0 && gj >= 0) K_full[gi][gj] += kLocal[r][c];
    }
  });

  // Loads: positive P = downward (positive = pushes beam down)
  loads.forEach(ld => {
    if (ld.type === "point") {
      const P = ld.P * Math.sin(((ld.angle !== undefined) ? ld.angle : 90) * Math.PI / 180);
      const node = nodes.find(n => Math.abs(n.x - ld.a) < 1e-6);
      if (node) F_full[node.dof_y] -= P; // downward = subtract from F
    }
    if (ld.type === "moment") {
      const node = nodes.find(n => Math.abs(n.x - ld.a) < 1e-6);
      if (node) F_full[node.dof_th] += ld.P;
    }
    if (ld.type === "udl" || ld.type === "tri") {
      spans.forEach(span => {
        if (ld.a < span.xB && ld.b > span.xA) {
          const a = Math.max(0, ld.a - span.xA);
          const b = Math.min(span.len, ld.b - span.xA);
          if (b > a) {
            const Le = span.len, w = ld.w1;
            // FEF for partial UDL: M_i = w/6 * [2(b³-a³)/L - 3(b²-a²) + 6L(b-a)]
            // V_i = -w*(b²-a²)/(2L)
            const V_i = -w * (b**2 - a**2) / (2*Le);
            const M_i = w/6 * (2*(b**3-a**3)/Le - 3*(b**2-a**2) + 6*Le*(b-a));
            const V_j = -w*(b-a) - V_i;
            const M_j = M_i + V_i*Le - w*(b-a)*(Le - (a+b)/2);
            const dofMap = [span.nA.dof_y, span.nA.dof_th, span.nB.dof_y, span.nB.dof_th];
            F_full[dofMap[0]] += V_i; F_full[dofMap[1]] += M_i;
            F_full[dofMap[2]] += V_j; F_full[dofMap[3]] += M_j;
          }
        }
      });
    }
  });

  const PEN = 1e15;
  const K = K_full.map(row => [...row]);
  const F = [...F_full];
  nodes.forEach(n => {
    if (n.isSupport) {
      if (n.dof_y >= 0) K[n.dof_y][n.dof_y] += PEN;
      if (n.type === "fixed" && n.dof_th >= 0) K[n.dof_th][n.dof_th] += PEN;
    }
  });

  const disp = gaussSolve(K, F);

  // Reactions: R = F - K*u (positive = upward)
  const reactions = {};
  nodes.forEach(n => {
    let ry = 0, rm = 0;
    if (n.isSupport && n.dof_y >= 0) {
      ry = F_full[n.dof_y] - K_full[n.dof_y].reduce((s, v, j) => s + v * disp[j], 0);
    }
    if (n.type === "fixed" && n.dof_th >= 0) {
      rm = F_full[n.dof_th] - K_full[n.dof_th].reduce((s, v, j) => s + v * disp[j], 0);
    }
    reactions[n.x] = { V: ry, M: n.hasM ? rm : 0 };
  });

  // V, M from equilibrium using reactions + loads
  const V = new Array(N + 1).fill(0);
  const M = new Array(N + 1).fill(0);

  for (let i = 0; i <= N; i++) {
    const x = xs[i];
    let Vi = 0, Mi = 0;
    nodes.forEach(n => {
      if (n.x < x - 1e-8) {
        Vi += reactions[n.x]?.V || 0;
        Mi += (reactions[n.x]?.V || 0) * (x - n.x) + (reactions[n.x]?.M || 0);
      }
    });
    loads.forEach(ld => {
      if (ld.type === "point") {
        const P = ld.P * Math.sin(((ld.angle !== undefined) ? ld.angle : 90) * Math.PI / 180);
        if (ld.a < x - 1e-8) { Vi -= P; Mi -= P * (x - ld.a); }
      }
      if (ld.type === "moment") {
        if (ld.a < x - 1e-8) Mi -= ld.P;
      }
      if (ld.type === "udl") {
        const a = ld.a, b = ld.b, w = ld.w1;
        if (a < x && b > 0) {
          const start = Math.max(a, 0), end = Math.min(b, x);
          if (end > start) { Vi -= w * (end - start); Mi -= w * (end - start) * (x - (start + end) / 2); }
        }
      }
    });
    V[i] = Vi; M[i] = Mi;
  }

  // Integrate theta and delta
  const theta = new Array(N + 1).fill(0);
  const delta = new Array(N + 1).fill(0);
  for (let i = 1; i <= N; i++) {
    theta[i] = theta[i-1] + (M[i-1] + M[i]) / 2 * dx / EI;
    delta[i] = delta[i-1] + (theta[i-1] + theta[i]) / 2 * dx;
  }

  nodes.forEach(n => {
    const idx = Math.round(n.x / dx);
    if (idx >= 0 && idx <= N) {
      if (n.dof_y >= 0) delta[idx] = disp[n.dof_y];
      if (n.dof_th >= 0) theta[idx] = disp[n.dof_th];
    }
  });

  let lastAnchor = null, lastAnchorIdx = -1;
  for (let i = 0; i <= N; i++) {
    const isAnchor = nodes.some(n => Math.abs(n.x - xs[i]) < dx);
    if (isAnchor) {
      const n2 = nodes.find(n3 => Math.abs(n3.x - xs[i]) < dx);
      if (n2 && n2.dof_y >= 0) {
        if (lastAnchor !== null) {
          const slope = (disp[n2.dof_y] - lastAnchor) / (xs[i] - xs[lastAnchorIdx]);
          for (let j = lastAnchorIdx + 1; j <= i; j++) delta[j] = lastAnchor + slope * (xs[j] - xs[lastAnchorIdx]);
        }
        lastAnchor = disp[n2.dof_y];
        lastAnchorIdx = i;
      }
    }
  }

  const scale = unitSys === "imperial" ? 12 : 1000;
  for (let i = 0; i <= N; i++) delta[i] *= scale;

  const Vmax = Math.max(...V.map(Math.abs));
  const Mmax = Math.max(...M.map(Math.abs));
  const dMin = Math.min(...delta);
  const dMax = Math.max(...delta);
  const dPeak = Math.max(Math.abs(dMin), Math.abs(dMax));
  const dPeakIdx = delta.map(Math.abs).indexOf(dPeak);
  const thetaMax = Math.max(...theta.map(Math.abs));
  const RA = reactions[0]?.V || 0;
  const RB = reactions[L]?.V || 0;
  const MA_fix = reactions[0]?.M || 0;
  const MB_fix = reactions[L]?.M || 0;

  return { xs, V, M, theta, delta, RA, RB, MA_fix, MB_fix, Vmax, Mmax, dMin, dMax, dPeak, dPeakPos: xs[dPeakIdx], thetaA: theta[0], thetaB: theta[N], thetaMax, EI, reactions };
}

console.log("=== Test 1: SS, P=10kip at midspan ===");
const r1 = solveBeam(20, 29000, 500, 'SS', [{type:'point',P:10,a:10,angle:90}], 'imperial', null);
console.log('  RA:', r1.RA.toFixed(4), 'kip  (expected: 5)');
console.log('  RB:', r1.RB.toFixed(4), 'kip  (expected: 5)');
console.log('  Mmax:', r1.Mmax.toFixed(4), 'kip-ft  (expected: 50)');
console.log('  delta at midspan:', r1.delta[500].toFixed(4), 'in  (expected: ~2.86)');

console.log("\n=== Test 2: Cantilever, P=10kip at tip ===");
const r2 = solveBeam(20, 29000, 500, 'CANT', [{type:'point',P:10,a:20,angle:90}], 'imperial', null);
console.log('  RA:', r2.RA.toFixed(4), 'kip  (expected: 10)');
console.log('  MA:', r2.MA_fix.toFixed(4), 'kip-ft  (expected: 200)');
console.log('  delta at tip:', r2.delta[1000].toFixed(4), 'in  (expected: ~45.7)');

console.log("\n=== Test 3: Fixed-Fixed, P=10kip at midspan ===");
const r3 = solveBeam(20, 29000, 500, 'FIXED', [{type:'point',P:10,a:10,angle:90}], 'imperial', null);
console.log('  RA:', r3.RA.toFixed(4), 'kip  (expected: 5)');
console.log('  RB:', r3.RB.toFixed(4), 'kip  (expected: 5)');
console.log('  MA_fix:', r3.MA_fix.toFixed(4), 'kip-ft  (expected: -16.67)');

console.log("\n=== Test 4: SS, UDL w=1kip/ft ===");
const r4 = solveBeam(20, 29000, 500, 'SS', [{type:'udl',w1:1,a:0,b:20}], 'imperial', null);
console.log('  RA:', r4.RA.toFixed(4), 'kip  (expected: 10)');
console.log('  RB:', r4.RB.toFixed(4), 'kip  (expected: 10)');
console.log('  Mmax:', r4.Mmax.toFixed(4), 'kip-ft  (expected: 50)');
console.log('  dPeak:', r4.dPeak.toFixed(4), 'in  (expected: ~3.57)');

console.log("\n=== Test 5: Propped, P=10kip at midspan ===");
const r5 = solveBeam(20, 29000, 500, 'PROPPED', [{type:'point',P:10,a:10,angle:90}], 'imperial', null);
console.log('  RA:', r5.RA.toFixed(4), 'kip  (expected: 3.33)');
console.log('  RB:', r5.RB.toFixed(4), 'kip  (expected: 6.67)');
console.log('  MA_fix:', r5.MA_fix.toFixed(4), 'kip-ft  (expected: -33.33)');
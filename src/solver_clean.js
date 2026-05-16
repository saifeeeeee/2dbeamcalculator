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

// Fixed-end forces for beam element [0, L] (left-fixed convention)
function fixedEndForces(load, L, EI) {
  const f = [0, 0, 0, 0];
  if (load.type === "point") {
    const P = load.P, a = load.a;
    f[2] += -P * a * a * (3 - a / L) / (L * L);
    f[3] += -P * a * a * a / (L * L);
    f[1] += -P * a * (6 * L * L - 8 * L * a + 3 * a * a) / (12 * L * L);
    f[0] += -P - f[1];
  }
  if (load.type === "moment") {
    const M0 = load.P, a = load.a;
    f[1] += M0 * (1 - 4 * a / L + 3 * a * a / (L * L));
    f[3] += M0 * (2 * a / L - 3 * a * a / (L * L));
    f[0] += -6 * M0 * a / (L * L * L) * (L - a);
    f[2] += 6 * M0 * a / (L * L * L) * (L - a);
  }
  if (load.type === "udl") {
    const w = load.w1, s = load.a, e = Math.min(load.b, L);
    const ls = Math.max(0, s), le = Math.min(e, L);
    if (le <= ls) return f;
    const wFull = w * (le - ls);
    const a = ls, b = le;
    const MA = wFull * (2 * L * L * (b * b - a * a) - L * (b * b * b - a * a * a) * 2 + (b * b * b * b - a * a * a * a)) / (12 * L * L);
    f[1] += -MA;
    f[3] += w * ((b * b * b - a * a * a) / 3 - L * (b * b - a * a) + L * L * (b - a)) / L;
    f[0] += -(f[1] + f[2] + f[3]);
  }
  if (load.type === "tri") {
    const w1 = load.w1, w2 = load.w2, a = load.a, b = Math.min(load.b, L);
    const la = Math.max(0, a), lb = Math.min(b, L);
    if (lb <= la) return f;
    const len = lb - la;
    const wBar = (w1 + w2) / 2 * len;
    const cg = la + len * (2 * w1 + w2) / (3 * (w1 + w2) || 1);
    const MA = wBar * (cg * cg) * (3 * L - 2 * cg) / (6 * L * L);
    const MB = wBar * (L - cg) * (L - cg) * (3 * L - 2 * (L - cg)) / (6 * L * L);
    f[1] += -MA;
    f[3] += MB;
    f[0] += -wBar + MA / L;
    f[2] += -MB / L;
  }
  return f;
}

function solveBeam(L, E, I, beamType, loads, unitSys, supports) {
  const EI_val = unitSys === "imperial" ? (E * I) / 144 : (E * 1e6 * I * 1e-12);
  const N = 1000; const dx = L / N;
  const xs = Array.from({ length: N+1 }, (_,i) => i*dx);

  // ── Step 1: Determine beam structure from supports ──
  let supportList = supports && supports.length >= 2 ? [...supports] : null;
  if (!supportList) {
    const autoSupports = [];
    if (beamType === "SS")     { autoSupports.push({type:"pin",x:0},{type:"roller",x:L}); }
    else if (beamType === "CANT") { autoSupports.push({type:"fixed",x:0},{type:"roller",x:L}); }
    else if (beamType === "FIXED") { autoSupports.push({type:"fixed",x:0},{type:"fixed",x:L}); }
    else if (beamType === "PROPPED") { autoSupports.push({type:"fixed",x:0},{type:"roller",x:L}); }
    supportList = autoSupports;
  }
  if (supportList.length === 1) supportList.push({type:"roller", x:L});
  supportList.sort((a,b)=>a.x-b.x);
  supportList = supportList.filter(s=>s.x>=0&&s.x<=L);
  if (supportList.length < 2) supportList = [{type:"pin",x:0},{type:"roller",x:L}];

  // ── Step 2: Classify nodes & build segments ──
  const nodes = supportList.map(s => ({
    x: s.x, type: s.type,
    hasY: s.type !== "hinge",
    hasM: s.type === "fixed"
  }));
  const allBreakpoints = [0, L];
  supportList.forEach(s => { if (!allBreakpoints.includes(s.x)) allBreakpoints.push(s.x); });
  allBreakpoints.sort((a,b)=>a-b);
  const spans = [];
  for (let i = 0; i < allBreakpoints.length - 1; i++) {
    const xA = allBreakpoints[i], xB = allBreakpoints[i+1];
    if (xB - xA < 1e-6) continue;
    spans.push({ xA, xB, len: xB - xA });
  }

  // ── Step 3: Assign global DOFs ──
  nodes.forEach((node, ni) => { node.dof_y = -1; node.dof_theta = -1; });
  let freeDOFs = [];
  nodes.forEach((node, ni) => {
    if (node.hasY) node.dof_y = freeDOFs.length++;
    if (node.hasM) node.dof_theta = freeDOFs.length++;
  });
  const nDOF = freeDOFs.length;

  // ── Step 4: Assemble global stiffness matrix K and force vector F ──
  const K = Array.from({length: nDOF}, () => new Array(nDOF).fill(0));
  const F = new Array(nDOF).fill(0);

  spans.forEach(span => {
    const Le = span.len;
    const Ke_local = [
      [  12*EI_val/(Le**3),   6*EI_val/(Le**2), -12*EI_val/(Le**3),  6*EI_val/(Le**2)],
      [   6*EI_val/(Le**2),   4*EI_val/Le,      -6*EI_val/(Le**2),  2*EI_val/Le    ],
      [ -12*EI_val/(Le**3),  -6*EI_val/(Le**2),  12*EI_val/(Le**3), -6*EI_val/(Le**2)],
      [   6*EI_val/(Le**2),   2*EI_val/Le,      -6*EI_val/(Le**2),  4*EI_val/Le    ],
    ];
    const nodeA = nodes.find(n=>Math.abs(n.x-span.xA)<1e-6);
    const nodeB = nodes.find(n=>Math.abs(n.x-span.xB)<1e-6);
    if (!nodeA || !nodeB) return;
    const dofMap = [nodeA.dof_y, nodeA.dof_theta, nodeB.dof_y, nodeB.dof_theta];
    for (let r=0;r<4;r++) for(let c=0;c<4;c++) {
      const gi=dofMap[r], gj=dofMap[c];
      if(gi>=0&&gj>=0){K[gi][gj]+=Ke_local[r][c];}
    }
    const loadsOnSpan = loads.filter(ld=>{
      if(ld.type==="point") return ld.a>=span.xA&&ld.a<=span.xB;
      if(ld.type==="moment") return ld.a>=span.xA&&ld.a<=span.xB;
      if(ld.type==="udl"||ld.type==="tri") return ld.a<span.xB&&ld.b>span.xA;
      return false;
    }).map(ld=>{
      if(ld.type==="point") return {...ld, a: ld.a - span.xA};
      if(ld.type==="moment") return {...ld, a: ld.a - span.xA};
      return {...ld, a: ld.a - span.xA, b: ld.b - span.xA};
    });
    const fe = loadsOnSpan.reduce((acc,ld)=>{
      const f = fixedEndForces(ld, Le, EI_val);
      return acc.map((v,i)=>v+f[i]);
    },[0,0,0,0]);
    for(let r=0;r<4;r++){
      const gi=dofMap[r];
      if(gi>=0) F[gi]+=fe[r];
    }
  });

  // ── Step 5: Apply boundary conditions via penalty ──
  const penalty = 1e30;
  nodes.forEach(node => {
    if (node.dof_y >= 0) { K[node.dof_y][node.dof_y] += penalty; F[node.dof_y] += 0; }
    if (node.dof_theta >= 0) { K[node.dof_theta][node.dof_theta] += penalty; F[node.dof_theta] += 0; }
  });

  // ── Step 6: Solve for nodal displacements ──
  const disp = gaussSolve(K, F);

  // ── Step 7: Extract support reactions ──
  const reactions = {};
  nodes.forEach(node => {
    const Vy = node.dof_y >= 0 ? disp[node.dof_y] * penalty : 0;
    const M_theta = node.dof_theta >= 0 ? disp[node.dof_theta] * penalty : 0;
    reactions[node.x] = { V: Vy, M: node.hasM ? M_theta : 0 };
  });

  // ── Step 8: Build V, M, delta, theta ──
  const V = new Array(N+1).fill(0);
  const M = new Array(N+1).fill(0);
  const theta = new Array(N+1).fill(0);
  const delta = new Array(N+1).fill(0);

  spans.forEach(span => {
    const Le = span.len;
    const nodeA = nodes.find(n=>Math.abs(n.x-span.xA)<1e-6);
    const nodeB = nodes.find(n=>Math.abs(n.x-span.xB)<1e-6);
    if (!nodeA || !nodeB) return;
    const dyA = nodeA.dof_y >= 0 ? disp[nodeA.dof_y] : 0;
    const dthA = nodeA.dof_theta >= 0 ? disp[nodeA.dof_theta] : 0;
    const dyB = nodeB.dof_y >= 0 ? disp[nodeB.dof_y] : 0;
    const dthB = nodeB.dof_theta >= 0 ? disp[nodeB.dof_theta] : 0;
    const u_local = [dyA, dthA, dyB, dthB];
    const Ke = [
      [  12*EI_val/(Le**3),   6*EI_val/(Le**2), -12*EI_val/(Le**3),  6*EI_val/(Le**2)],
      [   6*EI_val/(Le**2),   4*EI_val/Le,      -6*EI_val/(Le**2),  2*EI_val/Le    ],
      [ -12*EI_val/(Le**3),  -6*EI_val/(Le**2),  12*EI_val/(Le**3), -6*EI_val/(Le**2)],
      [   6*EI_val/(Le**2),   2*EI_val/Le,      -6*EI_val/(Le**2),  4*EI_val/Le    ],
    ];
    const loadsOnSpan = loads.filter(ld=>{
      if(ld.type==="point") return ld.a>=span.xA&&ld.a<=span.xB;
      if(ld.type==="moment") return ld.a>=span.xA&&ld.a<=span.xB;
      if(ld.type==="udl"||ld.type==="tri") return ld.a<span.xB&&ld.b>span.xA;
      return false;
    }).map(ld=>{
      if(ld.type==="point") {
        const angle = (ld.angle !== undefined) ? ld.angle : 90;
        const P_adj = ld.P * Math.cos(angle * Math.PI / 180);
        return { ...ld, P: P_adj, a: ld.a - span.xA };
      }
      if(ld.type==="moment") return { ...ld, a: ld.a - span.xA };
      return { ...ld, a: ld.a - span.xA, b: ld.b - span.xA };
    });
    const fe = loadsOnSpan.reduce((acc,ld)=>{
      const f = fixedEndForces(ld, Le, EI_val);
      return acc.map((v,i)=>v+f[i]);
    },[0,0,0,0]);
    const f_int = Ke.map((row, i) => row.reduce((s, v, j) => s + v * u_local[j], 0) - fe[i]);
    const Mi = f_int[1], Mj = f_int[3], Vi = -f_int[0], Vj = -f_int[2];

    for (let i = 0; i <= N; i++) {
      const x = xs[i];
      if (x < span.xA - 1e-8 || x > span.xB + 1e-8) continue;
      const xi = (x - span.xA) / Le;
      const M_at_x = Mi + (Mj - Mi) * xi;
      const V_at_x = Vi + (Vj - Vi) * xi;
      let loadM = 0, loadV = 0;
      loadsOnSpan.forEach(ld => {
        if (ld.type==="point" && x > ld.a) {
          loadV += -ld.P;
          loadM += -ld.P * (x - span.xA - ld.a);
        }
        if (ld.type==="udl" && x >= ld.a && x <= ld.b) {
          const w_x = ld.w1;
          loadV += -w_x * (x - span.xA - ld.a);
          loadM += -w_x * (x - span.xA - ld.a) * (x - span.xA - ld.a) / 2;
        }
      });
      V[i] += V_at_x + loadV;
      M[i] += M_at_x + loadM;
    }
  });

  // Integrate theta and delta
  for (let i = 1; i <= N; i++) {
    const M_mid = (M[i-1] + M[i]) / 2;
    theta[i] = theta[i-1] + M_mid * dx / EI_val;
    delta[i] = delta[i-1] + (theta[i-1] + theta[i]) / 2 * dx;
  }

  // Enforce boundary displacements from stiffness solution
  nodes.forEach(n => {
    const idx = Math.round(n.x / dx);
    if (idx >= 0 && idx <= N) {
      if (n.dof_y >= 0) delta[idx] = disp[n.dof_y];
      if (n.dof_theta >= 0) theta[idx] = disp[n.dof_theta];
    }
  });

  // Scale to correct units
  const scale = unitSys==="imperial"?12:1000;
  for (let i = 0; i <= N; i++) delta[i] *= scale;

  // Superposition for deflection (cantilever method)
  const deltaCant = new Array(N+1).fill(0);
  const thetaCant = new Array(N+1).fill(0);
  const loadsPerp = loads.map(ld => {
    if (ld.type === "point") {
      const angle = (ld.angle !== undefined) ? ld.angle : 90;
      return {...ld, P: ld.P * Math.cos(angle * Math.PI / 180)};
    }
    return ld;
  });

  loadsPerp.forEach(ld => {
    if (ld.type==="point") {
      const P=ld.P, a=ld.a;
      for (let i=0;i<=N;i++) {
        const x=xs[i];
        if (x<=a) {
          const dx0=a-x;
          deltaCant[i]+=P*dx0*dx0*(3*a-x)/(6*EI_val);
          thetaCant[i]+=P*dx0*dx0/(2*EI_val);
        } else {
          const dx0=x-a;
          deltaCant[i]+=P*a*a*a/(3*EI_val)-P*a*a*dx0/EI_val+P*dx0*dx0*dx0/(6*EI_val);
          thetaCant[i]+=-P*a*a/(2*EI_val)+P*dx0*dx0/(2*EI_val);
        }
      }
    }
    if (ld.type==="moment") {
      const M0=ld.P, a=ld.a;
      for (let i=0;i<=N;i++) {
        const x=xs[i];
        if (x<=a) { deltaCant[i]+=M0*(a-x)*(a-x)/(2*EI_val); thetaCant[i]+=-M0*(a-x)/EI_val; }
        else { deltaCant[i]+=-M0*(x-a)*(x-a)/(2*EI_val); thetaCant[i]+=M0*(x-a)/EI_val; }
      }
    }
    if (ld.type==="udl") {
      const w=ld.w1, s=Math.max(0,ld.a), e=Math.min(L,ld.b);
      for (let i=0;i<=N;i++) {
        const x=xs[i];
        if (x<=s) { deltaCant[i]+=w*(s-x)**4/(8*EI_val); thetaCant[i]+=-w*(s-x)**3/(6*EI_val); }
        else if (x<=e) {
          const dx0=x-s;
          deltaCant[i]+=w*dx0*dx0*(6*s*s-4*s*dx0+dx0*dx0)/(24*EI_val);
          thetaCant[i]+=w*dx0*(2*s+dx0)/(6*EI_val);
        } else {
          const dx0=e-s;
          deltaCant[i]+=w*dx0*dx0*(6*s*s-4*s*dx0+dx0*dx0)/(24*EI_val)-w*dx0*dx0*dx0*(x-e)/(6*EI_val);
          thetaCant[i]+=w*dx0*(2*s+dx0)/(6*EI_val)-w*dx0*dx0*(x-e)/(4*EI_val);
        }
      }
    }
    if (ld.type==="tri") {
      const w1=ld.w1,w2=ld.w2,a=ld.a,b=Math.min(ld.b,L),la=Math.max(0,a),lb=Math.min(b,L);
      if(lb<=la) return;
      const len=lb-la;
      for (let i=0;i<=N;i++) {
        const x=xs[i];
        if (x<=la) {
          thetaCant[i]+=-(w1-w2)/(6*EI_val*len)*(x-la)**3+(w1)/(2*EI_val)*(x-la)**2;
          deltaCant[i]+=(w1-w2)/(24*EI_val*len)*(x-la)**4-(w1)/(6*EI_val)*(x-la)**3;
        } else if (x<=lb) {
          const dx0=x-la;
          thetaCant[i]+=-(w2-w2)/(6*EI_val*len)*(x-la)**3+(w1)/(2*EI_val)*(x-la)**2;
          deltaCant[i]+=w1*dx0**4/(24*EI_val*len)*(12-8*dx0/len+dx0**2/len**2);
        }
      }
    }
  });

  // Solve for integration constants
  const cA = [], cB = [];
  nodes.forEach(node => {
    const idx = Math.round(node.x / dx);
    if (idx >= 0 && idx <= N) {
      if (node.hasY) cA.push({i:idx, val:0});
      if (node.hasM) cB.push({i:idx, val:0});
    }
  });
  const eqA = [0,0,0], eqB=[0,0];
  cA.forEach(c=>{ eqA[0]+=xs[c.i]*xs[c.i]; eqA[1]+=xs[c.i]; eqA[2]+=-deltaCant[c.i]*xs[c.i]; });
  cB.forEach(c=>{ eqB[0]+=xs[c.i]; eqB[1]+=-thetaCant[c.i]; });
  if (eqA[1]*eqA[1]-eqA[0]*(cA.length+1)>1e-10) {
    const det = eqA[0]*(cB.length+1)-eqA[1]*eqA[1];
    if(Math.abs(det)>1e-10) {
      const C2=-(eqB[1]*eqA[0]-eqA[2]*(cB.length+1))/det;
      const C1=(eqA[0]*eqB[1]-eqA[1]*eqA[2])/det;
      for(let i=0;i<=N;i++){
        delta[i]=(deltaCant[i]+C1+C2*xs[i])*scale;
        theta[i]=thetaCant[i]+C1;
      }
    }
  } else {
    const C1=-thetaCant[Math.round(N/2)];
    for(let i=0;i<=N;i++) delta[i]=(deltaCant[i]+C1)*scale;
  }

  // ── Step 10: Compute final results ──
  const Vmax=Math.max(...V.map(Math.abs));
  const Mmax=Math.max(...M.map(Math.abs));
  const dMin=Math.min(...delta);
  const dMax=Math.max(...delta);
  const dPeak=Math.max(Math.abs(dMin),Math.abs(dMax));
  const dPeakIdx=delta.map(Math.abs).indexOf(dPeak);
  const thetaMax=Math.max(...theta.map(Math.abs));
  const thetaA=theta[0], thetaB=theta[N];
  const RA=reactions[0]?.V||0;
  const RB=reactions[L]?.V||0;
  const MA_fix=reactions[0]?.M||0;
  const MB_fix=reactions[L]?.M||0;
  return { xs, V, M, theta, delta, RA, RB, MA_fix, MB_fix, Vmax, Mmax, dMin, dMax, dPeak, dPeakPos:xs[dPeakIdx], thetaA, thetaB, thetaMax, EI:EI_val, reactions };
}
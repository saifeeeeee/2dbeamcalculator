import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Colours ──────────────────────────────────────────────────────────────── */
const C = {
  bg:"#07080f", card:"#0d1020", border:"#1a1e30",
  blue:"#4f8ef7", green:"#3dd68c", amber:"#f7a24f",
  purple:"#a78bfa", red:"#f75f5f",
  text:"#e8eaf0", muted:"#6b7280", dim:"#3a3e52",
};

/* ─── SVG Primitives ────────────────────────────────────────────────────────── */
const Pin = ({cx,cy,s=13})=>(
  <g>
    <polygon points={`${cx},${cy} ${cx-s},${cy+s*1.4} ${cx+s},${cy+s*1.4}`}
      fill="none" stroke={C.text} strokeWidth="1.5"/>
    <line x1={cx-s-5} y1={cy+s*1.4+6} x2={cx+s+5} y2={cy+s*1.4+6} stroke={C.text} strokeWidth="1.5"/>
    {[-8,0,8].map(d=><line key={d} x1={cx-s-5+d*1.1} y1={cy+s*1.4+11} x2={cx-s-5+d*1.1+6} y2={cy+s*1.4+6} stroke={C.muted} strokeWidth="1"/>)}
  </g>
);
const Roller = ({cx,cy,s=13})=>(
  <g>
    <polygon points={`${cx},${cy} ${cx-s},${cy+s*1.4} ${cx+s},${cy+s*1.4}`}
      fill="none" stroke={C.text} strokeWidth="1.5"/>
    <circle cx={cx} cy={cy+s*1.4+5} r={4} fill="none" stroke={C.text} strokeWidth="1.5"/>
    <line x1={cx-s-5} y1={cy+s*1.4+13} x2={cx+s+5} y2={cy+s*1.4+13} stroke={C.text} strokeWidth="1.5"/>
  </g>
);
const Fixed = ({x,y,h=56,right=false})=>{
  const d=right?1:-1;
  return(<g>
    <rect x={x+(right?0:-12)} y={y-h/2} width={12} height={h} fill={C.dim}/>
    <line x1={x} y1={y-h/2} x2={x} y2={y+h/2} stroke={C.text} strokeWidth="2"/>
    {[-20,-10,0,10,20].filter(v=>v+30<=h).map(v=>(
      <line key={v} x1={x} y1={y-h/2+v+20} x2={x-d*10} y2={y-h/2+v+10} stroke={C.muted} strokeWidth="1"/>
    ))}
  </g>);
};
const Beam = ({x1,x2,y,h=9,col=C.blue})=>(
  <rect x={x1} y={y-h/2} width={x2-x1} height={h} rx={2} fill={col} opacity={0.9}/>
);
const Arrow = ({x,top,bot,col=C.red,lbl=""})=>(
  <g>
    <defs><marker id={`a${x|0}`} markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill={col}/></marker></defs>
    <line x1={x} y1={top} x2={x} y2={bot-2} stroke={col} strokeWidth="2" markerEnd={`url(#a${x|0})`}/>
    {lbl&&<text x={x} y={top-6} fill={col} fontSize="10" textAnchor="middle" fontFamily="monospace">{lbl}</text>}
  </g>
);
const UDLArrows = ({x1,x2,y,count=7,col=C.amber,len=28})=>{
  const pts=Array.from({length:count},(_,i)=>x1+(x2-x1)*(i/(count-1)));
  return(<g>
    <line x1={x1} y1={y-len} x2={x2} y2={y-len} stroke={col} strokeWidth="1.5"/>
    {pts.map(x=><Arrow key={x} x={x} top={y-len+4} bot={y} col={col}/>)}
  </g>);
};
const SFD = ({x0,w,y0,h,vals,col=C.green})=>{
  const px=v=>x0+(v/vals.length)*w;
  const py=v=>y0-v*h;
  const pts=vals.map((v,i)=>`${px(i)},${py(v)}`).join(" ");
  return(<polyline points={pts} fill="none" stroke={col} strokeWidth="2.5"/>);
};
const Curve = ({x0,w,y0,h,fn,col=C.purple,n=80})=>{
  const pts=Array.from({length:n+1},(_,i)=>{
    const t=i/n;
    return `${x0+t*w},${y0-fn(t)*h}`;
  }).join(" ");
  return(<polyline points={pts} fill="none" stroke={col} strokeWidth="2.5"/>);
};

/* ─── Animated Beam Scenes ──────────────────────────────────────────────────── */
function WelcomeScene(){
  return(
    <svg viewBox="0 0 560 240" style={{width:"100%"}}>
      <text x="280" y="52" textAnchor="middle" fill={C.blue} fontSize="22" fontWeight="800" fontFamily="'Syne',sans-serif" letterSpacing="-0.5">ProBeam Pro</text>
      <text x="280" y="74" textAnchor="middle" fill={C.muted} fontSize="12" fontFamily="monospace" letterSpacing="3">STRUCTURAL BEAM ANALYSIS SUITE</text>
      <Beam x1={60} x2={500} y={130} h={10} col={C.blue}/>
      <Pin cx={100} cy={130} s={14}/>
      <Roller cx={460} cy={130} s={14}/>
      <Arrow x={200} top={75} bot={124} col={C.red} lbl="P"/>
      <UDLArrows x1={260} x2={420} y={125} col={C.amber}/>
      {/* dimension line */}
      <line x1={60} y1={200} x2={500} y2={200} stroke={C.dim} strokeWidth="1" strokeDasharray="4 4"/>
      <line x1={60} y1={196} x2={60} y2={204} stroke={C.dim} strokeWidth="1"/>
      <line x1={500} y1={196} x2={500} y2={204} stroke={C.dim} strokeWidth="1"/>
      <text x="280" y="215" textAnchor="middle" fill={C.muted} fontSize="11" fontFamily="monospace">L = 8.0 m</text>
      {/* badges */}
      {[["FEM Solver",60,38],["|∞| Reports",200,38],["AISC 360-16",340,38],["Free",470,38]].map(([t,x,y])=>(
        <g key={t}>
          <rect x={x-34} y={y-14} width={t.length*6.5+12} height={20} rx={5} fill={C.card} stroke={C.border}/>
          <text x={x+t.length*3.2} y={y} textAnchor="middle" fill={C.green} fontSize="10" fontFamily="monospace">{t}</text>
        </g>
      ))}
    </svg>
  );
}

function InterfaceScene(){
  const tabs=["⚙️ Config","📦 Loads","📐 Section","⚒️ AISC","📈 Diagrams","🔲 Mesh","🔢 FEM","📄 Report"];
  return(
    <svg viewBox="0 0 560 240" style={{width:"100%"}}>
      <rect x={10} y={10} width={540} height={220} rx={10} fill={C.card} stroke={C.border}/>
      {/* tab bar */}
      {tabs.map((t,i)=>(
        <g key={i}>
          <rect x={14+i*68} y={14} width={64} height={26} rx={6} fill={i===0?C.blue+"33":C.dim+"22"} stroke={i===0?C.blue:"none"}/>
          <text x={14+i*68+32} y={31} textAnchor="middle" fill={i===0?C.blue:C.muted} fontSize="9" fontFamily="sans-serif">{t}</text>
        </g>
      ))}
      {/* content area mockup */}
      <rect x={14} y={46} width={340} height={178} rx={6} fill="#0a0c18" stroke={C.border}/>
      <rect x={364} y={46} width={182} height={178} rx={6} fill="#0a0c18" stroke={C.border}/>
      {/* left panel — input fields */}
      <text x={28} y={65} fill={C.muted} fontSize="9" fontFamily="monospace">BEAM CONFIGURATION</text>
      {[["Beam Length","8.0"],["Elastic Modulus","200"],["Beam Type","Simply Supported"]].map(([lbl,val],i)=>(
        <g key={lbl}>
          <text x={28} y={85+i*36} fill={C.muted} fontSize="9">{lbl}</text>
          <rect x={28} y={90+i*36} width={200} height={22} rx={4} fill={C.dim+"44"} stroke={C.border}/>
          <text x={38} y={105+i*36} fill={C.text} fontSize="10" fontFamily="monospace">{val}</text>
        </g>
      ))}
      {/* right panel — beam sketch */}
      <text x={374} y={65} fill={C.muted} fontSize="9" fontFamily="monospace">BEAM SKETCH</text>
      <Beam x1={374} x2={536} y={130} h={7} col={C.blue}/>
      <Pin cx={374} cy={130} s={10}/>
      <Roller cx={536} cy={130} s={10}/>
      <Arrow x={455} top={97} bot={124} col={C.red}/>
      {/* solve button */}
      <rect x={28} y={200} width={320} height={20} rx={5} fill={C.blue}/>
      <text x={188} y={214} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">▶  Solve Beam</text>
    </svg>
  );
}

function UnitsScene(){
  const rows=[["Length","m","ft"],["Force","kN","kip"],["Moment","kN·m","kip·ft"],["Stress","GPa","ksi"],["Deflection","mm","in"]];
  return(
    <svg viewBox="0 0 560 220" style={{width:"100%"}}>
      <text x="280" y="28" textAnchor="middle" fill={C.text} fontSize="14" fontWeight="700" fontFamily="'Syne',sans-serif">Dual Unit System</text>
      {/* metric */}
      <rect x={40} y={40} width={210} height={170} rx={10} fill={C.card} stroke={C.green}/>
      <rect x={40} y={40} width={210} height={30} rx={10} fill={C.green+"33"}/>
      <text x={145} y={61} textAnchor="middle" fill={C.green} fontSize="13" fontWeight="700" fontFamily="monospace">METRIC</text>
      {rows.map(([q,m],i)=>(
        <g key={q}>
          <text x={60} y={100+i*24} fill={C.muted} fontSize="11">{q}</text>
          <text x={215} y={100+i*24} textAnchor="end" fill={C.green} fontSize="11" fontFamily="monospace">{m}</text>
        </g>
      ))}
      {/* divider */}
      <text x="280" y="135" textAnchor="middle" fill={C.muted} fontSize="11" fontFamily="monospace">switch</text>
      <line x1="257" y1="128" x2="268" y2="128" stroke={C.muted} strokeWidth="1"/>
      <line x1="292" y1="128" x2="303" y2="128" stroke={C.muted} strokeWidth="1"/>
      {/* imperial */}
      <rect x={310} y={40} width={210} height={170} rx={10} fill={C.card} stroke={C.amber}/>
      <rect x={310} y={40} width={210} height={30} rx={10} fill={C.amber+"33"}/>
      <text x={415} y={61} textAnchor="middle" fill={C.amber} fontSize="13" fontWeight="700" fontFamily="monospace">IMPERIAL</text>
      {rows.map(([q,,imp],i)=>(
        <g key={q}>
          <text x={330} y={100+i*24} fill={C.muted} fontSize="11">{q}</text>
          <text x={485} y={100+i*24} textAnchor="end" fill={C.amber} fontSize="11" fontFamily="monospace">{imp}</text>
        </g>
      ))}
    </svg>
  );
}

function BeamTypesScene(){
  const types=[
    {name:"Simply Supported",x1:30,x2:160,y:48,pin:30,roller:160},
    {name:"Cantilever",x1:200,x2:330,y:48,fixed:200},
    {name:"Fixed–Fixed",x1:370,x2:500,y:48,fixedL:370,fixedR:500},
    {name:"Propped Cantilever",x1:30,x2:160,y:148,fixed:30,roller:160},
    {name:"Custom (FEM)",x1:200,x2:500,y:148,pin:200,custom:true},
  ];
  return(
    <svg viewBox="0 0 540 230" style={{width:"100%"}}>
      {types.map((t,i)=>(
        <g key={i}>
          <Beam x1={t.x1} x2={t.x2} y={t.y} h={7} col={i===4?C.green:C.blue}/>
          {t.pin!==undefined && <Pin cx={t.pin} cy={t.y} s={9}/>}
          {t.roller!==undefined && <Roller cx={t.roller} cy={t.y} s={9}/>}
          {t.fixed!==undefined && <Fixed x={t.fixed} y={t.y} h={40}/>}
          {t.fixedL!==undefined && <Fixed x={t.fixedL} y={t.y} h={40}/>}
          {t.fixedR!==undefined && <Fixed x={t.fixedR} y={t.y} h={40} right/>}
          {t.custom && [260,330,400].map(cx=><g key={cx}><Pin cx={cx} cy={t.y} s={9}/></g>)}
          <text x={(t.x1+t.x2)/2} y={t.y+(i<3?-16:-16)} textAnchor="middle" fill={i===4?C.green:C.muted} fontSize="10" fontFamily="sans-serif">{t.name}</text>
          {i===4&&<text x={(t.x1+t.x2)/2} y={t.y+30} textAnchor="middle" fill={C.green} fontSize="9" fontFamily="monospace">← FEM solver</text>}
        </g>
      ))}
      <text x="270" y="220" textAnchor="middle" fill={C.muted} fontSize="10" fontFamily="sans-serif">5 beam configurations — all solved with Hermitian cubic FEM</text>
    </svg>
  );
}

function CustomSupportsScene(){
  const nodes=[30,110,200,300,400,480,520];
  const supports=[{cx:30,type:"pin"},{cx:200,type:"pin"},{cx:400,type:"roller"},{cx:520,type:"pin"}];
  return(
    <svg viewBox="0 0 560 260" style={{width:"100%"}}>
      <text x="280" y="22" textAnchor="middle" fill={C.green} fontSize="13" fontWeight="800" fontFamily="'Syne',sans-serif" letterSpacing="-0.3">⭐ FEM Solver — Custom Supports</text>
      {/* Beam */}
      <Beam x1={30} x2={520} y={80} h={9} col={C.blue}/>
      {supports.map(({cx,type},i)=>type==="pin"?<Pin key={i} cx={cx} cy={80} s={12}/>:<Roller key={i} cx={cx} cy={80} s={12}/>)}
      {/* Loads */}
      <Arrow x={130} top={42} bot={74} col={C.red} lbl="25kN"/>
      <UDLArrows x1={250} x2={370} y={75} count={5} col={C.amber} len={22}/>
      {/* Mesh nodes */}
      <text x="280" y="148" textAnchor="middle" fill={C.muted} fontSize="10" fontFamily="monospace">FEM MESH — 20 elements · 21 nodes · 42 DOFs · 34 free</text>
      <line x1={30} y1={162} x2={520} y2={162} stroke={C.dim} strokeWidth="1"/>
      {nodes.map((x,i)=>(
        <g key={i}>
          <circle cx={x} cy={162} r={4} fill={[0,2,4,6].includes(i)?C.green:C.blue} opacity={0.9}/>
          <text x={x} y={178} textAnchor="middle" fill={C.muted} fontSize="8" fontFamily="monospace">{i*3}</text>
        </g>
      ))}
      {/* Constrained DOF labels */}
      {[{cx:30,dof:"u=θ=0"},{cx:200,dof:"u=0"},{cx:400,dof:"u=0"},{cx:520,dof:"u=θ=0"}].map(({cx,dof},i)=>(
        <g key={i}>
          <rect x={cx-20} y={188} width={42} height={15} rx={3} fill={C.green+"22"} stroke={C.green+"55"}/>
          <text x={cx+1} y={199} textAnchor="middle" fill={C.green} fontSize="8" fontFamily="monospace">{dof}</text>
        </g>
      ))}
      {/* Stiffness matrix hint */}
      <text x="280" y="235" textAnchor="middle" fill={C.dim} fontSize="10" fontFamily="monospace">K·u = f   →  Hermitian cubic element stiffness matrix</text>
    </svg>
  );
}

function LoadsScene(){
  return(
    <svg viewBox="0 0 560 230" style={{width:"100%"}}>
      {/* Point load */}
      <text x="80" y="20" textAnchor="middle" fill={C.text} fontSize="11" fontWeight="700">Point Load</text>
      <Beam x1={20} x2={140} y={80} h={7} col={C.blue}/>
      <Pin cx={20} cy={80} s={9}/><Roller cx={140} cy={80} s={9}/>
      <Arrow x={80} top={44} bot={74} col={C.red} lbl="P"/>
      {/* UDL */}
      <text x="230" y="20" textAnchor="middle" fill={C.text} fontSize="11" fontWeight="700">Uniform (UDL)</text>
      <Beam x1={170} x2={290} y={80} h={7} col={C.blue}/>
      <Pin cx={170} cy={80} s={9}/><Roller cx={290} cy={80} s={9}/>
      <UDLArrows x1={170} x2={290} y={75} count={6} col={C.amber} len={22}/>
      {/* Triangular */}
      <text x="380" y="20" textAnchor="middle" fill={C.text} fontSize="11" fontWeight="700">Triangular</text>
      <Beam x1={320} x2={440} y={80} h={7} col={C.blue}/>
      <Pin cx={320} cy={80} s={9}/><Roller cx={440} cy={80} s={9}/>
      {Array.from({length:6},(_,i)=>{
        const x=320+i*24; const len=i*7+2;
        return <Arrow key={i} x={x} top={75-len} bot={74} col={C.green}/>;
      })}
      <line x1={320} y1={73} x2={440} y2={44} stroke={C.green} strokeWidth="1.5" strokeDasharray="3 3"/>
      {/* Moment */}
      <text x="500" y="20" textAnchor="middle" fill={C.text} fontSize="11" fontWeight="700">Moment</text>
      <Beam x1={470} x2={540} y={80} h={7} col={C.blue}/>
      <Fixed x={470} y={80} h={36}/>
      <text x="510" y="70" textAnchor="middle" fill={C.purple} fontSize="20">↻</text>
      <text x="510" y="56" textAnchor="middle" fill={C.purple} fontSize="9" fontFamily="monospace">M</text>
      {/* Table */}
      {[["Type","Position","Magnitude","Direction"],["Point","3.0 m","25 kN","↓"],["UDL","0–6 m","10 kN/m","↓"],["Triangular","2–5 m","0→15 kN/m","↓"],["Moment","1.5 m","40 kN·m","↻"]].map((row,i)=>(
        <g key={i}>
          <rect x={10} y={140+i*17} width={540} height={17} rx={2} fill={i===0?C.dim+"66":"none"}/>
          {row.map((cell,j)=>(
            <text key={j} x={16+j*135} y={153+i*17} fill={i===0?C.text:C.muted} fontSize="10" fontFamily={i===0?"sans-serif":"monospace"}>{cell}</text>
          ))}
        </g>
      ))}
    </svg>
  );
}

function SectionScene(){
  const shapes=[
    {name:"Rect",path:"M-18,-14 h36 v28 h-36z"},
    {name:"Circle",r:15},
    {name:"Hollow Box",outer:"M-18,-14 h36 v28 h-36z",inner:"M-10,-8 h20 v16 h-20z"},
    {name:"Pipe",ro:14,ri:9},
    {name:"I-Sect",path:"M-16,-14 h32 v5 h-11 v18 h11 v5 h-32 v-5 h11 v-18 h-11z"},
    {name:"T-Sect",path:"M-16,-12 h32 v5 h-8 v18 h-16 v-18 h-8z"},
    {name:"Angle",path:"M-12,-14 h5 v24 h16 v5 h-21z"},
  ];
  return(
    <svg viewBox="0 0 560 230" style={{width:"100%"}}>
      <text x="280" y="22" textAnchor="middle" fill={C.text} fontSize="13" fontWeight="700" fontFamily="'Syne',sans-serif">7 Cross-Section Shapes</text>
      {shapes.map(({name,path,r,outer,inner,ro,ri},i)=>{
        const cx=50+i*74, cy=100;
        return(
          <g key={name}>
            <rect x={cx-33} y={cy-38} width={66} height={76} rx={6} fill={C.card} stroke={C.border}/>
            <g transform={`translate(${cx},${cy-4})`}>
              {r&&<circle r={r} fill={C.blue+"44"} stroke={C.blue} strokeWidth="1.5"/>}
              {ro&&<><circle r={ro} fill={C.blue+"44"} stroke={C.blue} strokeWidth="1.5"/><circle r={ri} fill={C.card} stroke={C.blue} strokeWidth="1"/></>}
              {path&&<path d={path} fill={C.blue+"44"} stroke={C.blue} strokeWidth="1.5"/>}
              {outer&&inner&&<><path d={outer} fill={C.blue+"44"} stroke={C.blue} strokeWidth="1.5"/><path d={inner} fill={C.card}/><path d={inner} fill="none" stroke={C.blue} strokeWidth="1"/></>}
            </g>
            <text x={cx} y={cy+45} textAnchor="middle" fill={C.muted} fontSize="9" fontFamily="sans-serif">{name}</text>
          </g>
        );
      })}
      {/* Ix formula */}
      <rect x={60} y={175} width={440} height={45} rx={8} fill={C.card} stroke={C.border}/>
      <text x="280" y="194" textAnchor="middle" fill={C.muted} fontSize="10">Auto-calculated moment of inertia (Iₓ)</text>
      <text x="280" y="212" textAnchor="middle" fill={C.blue} fontSize="11" fontFamily="monospace">Rectangle: Iₓ = b·h³/12    Circle: Iₓ = π·d⁴/64    I-Section: Iₓ = Iₓflange + Iₓweb</text>
    </svg>
  );
}

function AISCScene(){
  const sections=[["W18×35","17.7","6.0","431"],["W16×40","16.0","7.0","518"],["W14×48","13.8","8.0","485"],["W12×35","12.5","6.6","285"]];
  return(
    <svg viewBox="0 0 560 240" style={{width:"100%"}}>
      <text x="280" y="22" textAnchor="middle" fill={C.text} fontSize="13" fontWeight="700" fontFamily="'Syne',sans-serif">37 Standard AISC W-Sections</text>
      {/* dropdown mockup */}
      <rect x={30} y={38} width={240} height={30} rx={6} fill={C.card} stroke={C.border}/>
      <text x={46} y={57} fill={C.text} fontSize="12" fontFamily="monospace">W18×35</text>
      <text x={256} y={57} textAnchor="end" fill={C.muted} fontSize="12">▾</text>
      {/* table header */}
      {["Section","d (in)","bf (in)","Iₓ (in⁴)"].map((h,i)=>(
        <g key={h}>
          <rect x={30+i*125} y={88} width={125} height={22} rx={0} fill={C.dim}/>
          <text x={38+i*125} y={103} fill={C.text} fontSize="10" fontWeight="700" fontFamily="sans-serif">{h}</text>
        </g>
      ))}
      {sections.map(([sec,d,bf,ix],i)=>(
        <g key={sec}>
          <rect x={30} y={110+i*24} width={500} height={24} rx={0} fill={i%2===0?"#0d111a":"#0a0e16"}/>
          {[sec,d,bf,ix].map((v,j)=>(
            <text key={j} x={38+j*125} y={126+i*24} fill={i===0?C.blue:C.muted} fontSize="11" fontFamily="monospace">{v}</text>
          ))}
        </g>
      ))}
      <rect x={30} y={206} width={500} height={24} rx={0} fill={C.dim+"44"}/>
      <text x={38} y={222} fill={C.muted} fontSize="10" fontFamily="monospace">… 33 more sections (W4×13 → W36×135)</text>
      {/* properties auto-fill hint */}
      <rect x={290} y={38} width={240} height={44} rx={6} fill={C.green+"11"} stroke={C.green+"44"}/>
      <text x={306} y={56} fill={C.green} fontSize="10" fontFamily="monospace">✓ d, bf, tf, tw, Ix, Sx, Zx</text>
      <text x={306} y={72} fill={C.green} fontSize="10" fontFamily="monospace">  auto-filled on selection</text>
    </svg>
  );
}

function DiagramScene({type}){
  const config={
    sfd:{title:"Shear Force Diagram (SFD)",col:C.green,fn:t=>t<0.5?0.4:-0.5,ylab:"V (kN)"},
    bmd:{title:"Bending Moment Diagram (BMD)",col:C.purple,fn:t=>Math.sin(Math.PI*t)*0.9,ylab:"M (kN·m)"},
    def:{title:"Deflection Curve (δ)",col:C.blue,fn:t=>Math.sin(Math.PI*t)*0.85,ylab:"δ (mm)"},
    slope:{title:"Slope Diagram (θ)",col:C.amber,fn:t=>(Math.cos(Math.PI*t))*0.7,ylab:"θ (rad)"},
  }[type];
  const x0=60,w=440,y0=130,h=80;
  return(
    <svg viewBox="0 0 560 230" style={{width:"100%"}}>
      <text x="280" y="22" textAnchor="middle" fill={config.col} fontSize="13" fontWeight="700" fontFamily="'Syne',sans-serif">{config.title}</text>
      <rect x={50} y={35} width={460} height={170} rx={8} fill={C.card} stroke={C.border}/>
      {/* axes */}
      <line x1={x0} y1={50} x2={x0} y2={195} stroke={C.dim} strokeWidth="1"/>
      <line x1={x0} y1={y0} x2={x0+w} y2={y0} stroke={C.dim} strokeWidth="1"/>
      <text x={x0-8} y={y0} fill={C.muted} fontSize="9" textAnchor="end" dominantBaseline="middle">0</text>
      <text x={x0-8} y={y0-h} fill={C.muted} fontSize="9" textAnchor="end" dominantBaseline="middle">+</text>
      <text x={x0-8} y={y0+h} fill={C.muted} fontSize="9" textAnchor="end" dominantBaseline="middle">–</text>
      {/* grid */}
      {[0.25,0.5,0.75].map(t=>(
        <line key={t} x1={x0+t*w} y1={50} x2={x0+t*w} y2={195} stroke={C.dim} strokeWidth="0.5" strokeDasharray="3 4"/>
      ))}
      {/* curve/diagram */}
      {type==="sfd"?(
        <>
          <line x1={x0} y1={y0-h*0.4} x2={x0+w*0.5} y2={y0-h*0.4} stroke={config.col} strokeWidth="2.5"/>
          <line x1={x0+w*0.5} y1={y0+h*0.5} x2={x0+w} y2={y0+h*0.5} stroke={config.col} strokeWidth="2.5"/>
          <line x1={x0+w*0.5} y1={y0-h*0.4} x2={x0+w*0.5} y2={y0+h*0.5} stroke={config.col} strokeWidth="2.5" strokeDasharray="4 3"/>
        </>
      ):<Curve x0={x0} w={w} y0={y0} h={h} fn={config.fn} col={config.col}/>}
      {/* hover tooltip mockup */}
      <circle cx={x0+w*0.38} cy={y0-config.fn(0.38)*h} r={5} fill={config.col}/>
      <rect x={x0+w*0.38-28} y={y0-config.fn(0.38)*h-40} width={90} height={30} rx={5} fill={C.card} stroke={config.col}/>
      <text x={x0+w*0.38+17} y={y0-config.fn(0.38)*h-28} textAnchor="middle" fill={C.muted} fontSize="9" fontFamily="monospace">x = 3.04 m</text>
      <text x={x0+w*0.38+17} y={y0-config.fn(0.38)*h-15} textAnchor="middle" fill={config.col} fontSize="10" fontFamily="monospace" fontWeight="700">max: 18.6</text>
      {/* x labels */}
      {[0,0.5,1].map(t=>(
        <text key={t} x={x0+t*w} y={207} textAnchor="middle" fill={C.muted} fontSize="9" fontFamily="monospace">{(t*8).toFixed(1)} m</text>
      ))}
      <text x={x0-12} y={y0} textAnchor="end" fill={config.col} fontSize="9" fontFamily="monospace">{config.ylab}</text>
    </svg>
  );
}

function FEMMeshScene(){
  const nodes=Array.from({length:21},(_,i)=>30+i*24);
  const supports=[0,5,12,20];
  const loads=[4,10];
  return(
    <svg viewBox="0 0 560 230" style={{width:"100%"}}>
      <text x="280" y="22" textAnchor="middle" fill={C.text} fontSize="13" fontWeight="700" fontFamily="'Syne',sans-serif">FEM Mesh Visualiser</text>
      <rect x={15} y={32} width={530} height={190} rx={10} fill={C.card} stroke={C.border}/>
      <text x="280" y="52" textAnchor="middle" fill={C.muted} fontSize="9" fontFamily="monospace">20 elements  ·  21 nodes  ·  42 DOFs  ·  34 free</text>
      <line x1={30} y1={90} x2={528} y2={90} stroke={C.blue} strokeWidth="3" opacity={0.5}/>
      {nodes.map((x,i)=>{
        const isSup=supports.includes(i);
        const isLoad=loads.includes(i);
        return(
          <g key={i}>
            {isSup&&<Pin cx={x} cy={90} s={9}/>}
            <circle cx={x} cy={90} r={isSup?5:3} fill={isSup?C.green:isLoad?C.red:C.blue} opacity={0.9}/>
            {i%4===0&&<text x={x} y={108} textAnchor="middle" fill={C.muted} fontSize="8" fontFamily="monospace">{i}</text>}
            {isLoad&&<Arrow x={x} top={64} bot={83} col={C.red}/>}
          </g>
        );
      })}
      {/* Legend */}
      {[[C.green,"Support node"],[C.red,"Load node"],[C.blue,"Free node"]].map(([col,lbl],i)=>(
        <g key={lbl}>
          <circle cx={30+i*160} cy={145} r={5} fill={col}/>
          <text x={42+i*160} y={149} fill={C.muted} fontSize="10">{lbl}</text>
        </g>
      ))}
      {/* DOF table */}
      <rect x={15} y={160} width={530} height={56} rx={6} fill="#0a0c18" stroke={C.border}/>
      {[["Node","x (m)","DOF 1 (u)","DOF 2 (θ)","Constrained?"],["0","0.000","–","–","Pin: u=θ=0"],["5","1.200","free","free","—"],["12","2.880","–","free","Roller: u=0"]].map((row,i)=>(
        <g key={i}>
          {row.map((cell,j)=>(
            <text key={j} x={22+j*110} y={176+i*14} fill={i===0?C.text:j===4&&row[4]!=="—"?C.green:C.muted} fontSize="9" fontFamily={i===0?"sans-serif":"monospace"}>{cell}</text>
          ))}
        </g>
      ))}
    </svg>
  );
}

function AISCChecksScene(){
  const checks=[
    {label:"Flexure check (φMn ≥ Mu)",req:"Mn = Zx × Fy = 3.14 kip·ft",dem:"Mu = 1.89 kip·ft",ratio:"0.60",pass:true},
    {label:"Shear check (φVn ≥ Vu)",req:"Vn = 0.6 × Fy × Aw = 8.2 kip",dem:"Vu = 3.1 kip",ratio:"0.38",pass:true},
    {label:"Compact section (λ ≤ λp)",req:"λpf = 10.8",dem:"λf = 7.2",ratio:"0.67",pass:true},
    {label:"Natural frequency",req:"f₁ = π²/L² × √(EIₓ/ρA)",dem:"3.4 Hz",ratio:"—",pass:true},
  ];
  return(
    <svg viewBox="0 0 560 240" style={{width:"100%"}}>
      <text x="280" y="22" textAnchor="middle" fill={C.text} fontSize="13" fontWeight="700" fontFamily="'Syne',sans-serif">AISC 360-16 Code Checks</text>
      {checks.map(({label,req,dem,ratio,pass},i)=>(
        <g key={i}>
          <rect x={15} y={36+i*50} width={530} height={44} rx={8} fill={pass?"#0a1a0a":"#1a0a0a"} stroke={pass?C.green+"44":C.red+"44"}/>
          <text x={26} y={53+i*50} fill={C.text} fontSize="11" fontWeight="700">{label}</text>
          <text x={26} y={68+i*50} fill={C.muted} fontSize="10" fontFamily="monospace">{req}  |  Demand: {dem}  |  D/C: {ratio}</text>
          <text x={524} y={56+i*50} textAnchor="end" fill={pass?C.green:C.red} fontSize="14">{pass?"✓":"✗"}</text>
          <rect x={480} y={41+i*50} width={60} height={18} rx={4} fill={pass?C.green+"22":C.red+"22"} stroke={pass?C.green+"66":C.red+"66"}/>
          <text x={510} y={53+i*50} textAnchor="middle" fill={pass?C.green:C.red} fontSize="10" fontFamily="monospace" fontWeight="700">{pass?"PASS":"FAIL"}</text>
        </g>
      ))}
      <rect x={15} y={238} width={530} height={0} rx={8}/>
    </svg>
  );
}

function ReportScene(){
  return(
    <svg viewBox="0 0 560 240" style={{width:"100%"}}>
      <text x="280" y="22" textAnchor="middle" fill={C.text} fontSize="13" fontWeight="700" fontFamily="'Syne',sans-serif">∞ Word Report Generation — Free</text>
      {/* document mockup */}
      <rect x={100} y={34} width={360} height={190} rx={8} fill="#fff" stroke={C.border}/>
      <rect x={100} y={34} width={360} height={24} rx={8} fill={C.blue}/>
      <text x="280" y="51" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700" fontFamily="sans-serif">STRUCTURAL BEAM ANALYSIS REPORT</text>
      {/* report sections */}
      <rect x={114} y={64} width={120} height={6} rx={2} fill="#e5e7eb"/>
      <rect x={114} y={76} width={90} height={5} rx={2} fill="#f3f4f6"/>
      <rect x={114} y={87} width={100} height={5} rx={2} fill="#f3f4f6"/>
      <rect x={114} y={100} width={80} height={5} rx={2} fill="#f3f4f6"/>
      {/* diagram placeholders */}
      <rect x={114} y={115} width={155} height={50} rx={3} fill="#e8f0fe"/>
      <text x="191" y="144" textAnchor="middle" fill={C.blue} fontSize="10" fontFamily="monospace">SFD diagram</text>
      <rect x={278} y={115} width={170} height={50} rx={3} fill="#e8f0fe"/>
      <text x="363" y="144" textAnchor="middle" fill={C.blue} fontSize="10" fontFamily="monospace">BMD diagram</text>
      {/* more sections */}
      <rect x={114} y={172} width={120} height={6} rx={2} fill="#e5e7eb"/>
      <rect x={114} y={184} width={90} height={5} rx={2} fill="#f3f4f6"/>
      <rect x={114} y={196} width={100} height={5} rx={2} fill="#f3f4f6"/>
      <rect x={114} y={208} width={60} height={5} rx={2} fill="#f3f4f6"/>
      {/* download badge */}
      <rect x={355} y={180} width={100} height={40} rx={8} fill={C.green} opacity={0.15} stroke={C.green+"66"}/>
      <text x="405" y="198" textAnchor="middle" fill={C.green} fontSize="11" fontWeight="700" fontFamily="sans-serif">⬇ .docx</text>
      <text x="405" y="213" textAnchor="middle" fill={C.green} fontSize="9" fontFamily="monospace">Unlimited · Free</text>
    </svg>
  );
}

function SaveLoadScene(){
  const projects=[["Warehouse Frame","5.0 m · UDL + Point","2 mins ago"],["Bridge Girder","12.0 m · Multi-span","Yesterday"],["Cantilever Check","3.5 m · Fixed","2 days ago"]];
  return(
    <svg viewBox="0 0 560 230" style={{width:"100%"}}>
      <text x="280" y="22" textAnchor="middle" fill={C.text} fontSize="13" fontWeight="700" fontFamily="'Syne',sans-serif">Project Save & Load</text>
      {/* save input */}
      <rect x={30} y={36} width={340} height={30} rx={6} fill={C.card} stroke={C.border}/>
      <text x={44} y={56} fill={C.text} fontSize="12" fontFamily="monospace">My Beam Project</text>
      <rect x={380} y={36} width={150} height={30} rx={6} fill={C.blue}/>
      <text x="455" y="56" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">💾 Save</text>
      {/* project list */}
      <text x={30} y={90} fill={C.muted} fontSize="10" fontFamily="monospace">SAVED PROJECTS</text>
      {projects.map(([name,desc,time],i)=>(
        <g key={i}>
          <rect x={30} y={100+i*40} width={500} height={34} rx={6} fill={C.card} stroke={C.border}/>
          <text x={46} y={115+i*40} fill={C.text} fontSize="12" fontWeight="700">{name}</text>
          <text x={46} y={128+i*40} fill={C.muted} fontSize="10" fontFamily="monospace">{desc}</text>
          <text x={510} y={121+i*40} textAnchor="end" fill={C.dim} fontSize="9">{time}</text>
          <rect x={470} y={104+i*40} width={56} height={22} rx={4} fill={C.blue+"22"} stroke={C.blue+"55"}/>
          <text x="498" y="119" textAnchor="middle" fill={C.blue} fontSize="10" dominantBaseline="central">▶ Load</text>
          <text x="498" y={119+i*40} textAnchor="middle" fill={C.blue} fontSize="10">▶ Load</text>
        </g>
      ))}
      <text x="280" y="218" textAnchor="middle" fill={C.muted} fontSize="10" fontFamily="sans-serif">No account needed · Stored in browser localStorage</text>
    </svg>
  );
}

/* ─── Slides Data ────────────────────────────────────────────────────────────── */
const SLIDES = [
  {title:"Welcome to ProBeam Pro",sub:"Professional Beam Analysis — Completely Free",dur:12,
    narration:"Welcome to ProBeam Pro — a professional-grade structural beam analysis tool built for civil and structural engineers. In this tutorial you'll learn every feature, from setting up your first beam to generating a full Word report. Everything you see here is completely free.",
    Visual:WelcomeScene,chapter:"Introduction"},
  {title:"The Calculator Interface",sub:"8 functional tabs, each covering a key analysis step",dur:11,
    narration:"When you open the calculator, you'll see eight tabs across the top: Config, Loads, Section, AISC, Diagrams, Mesh, FEM Results, and Report. You'll work through them roughly left to right. The Beam Sketch panel on the right updates live as you make changes.",
    Visual:InterfaceScene,chapter:"Getting Started"},
  {title:"Choose Your Unit System",sub:"Switch between Metric and Imperial at any time",dur:10,
    narration:"At the top of the Config tab, choose between Metric — kilonewtons, metres, gigapascals — or Imperial — kips, feet, and ksi. You can switch at any point and all values convert automatically. AISC code checks always run in Imperial regardless of your preference.",
    Visual:UnitsScene,chapter:"Getting Started"},
  {title:"5 Beam Types",sub:"Pre-configured supports or fully custom placement",dur:12,
    narration:"ProBeam Pro supports five beam configurations. Simply Supported, Cantilever, Fixed-Fixed, and Propped Cantilever all set their boundary conditions automatically. The fifth type — Custom — is the most powerful, letting you place supports anywhere using the FEM solver.",
    Visual:BeamTypesScene,chapter:"Beam Configuration"},
  {title:"⭐ FEM Solver: Custom Supports",sub:"Place pin, roller, or fixed supports at any position",dur:15,
    narration:"This is the main feature of ProBeam Pro. In Custom mode, the Hermitian cubic finite element solver takes over. You can place pin, roller, or fixed supports at any position along the beam — two supports, three, four, anywhere. The solver assembles the full global stiffness matrix, applies boundary conditions, and computes exact displacements and reactions. No other free tool does this.",
    Visual:CustomSupportsScene,chapter:"FEM Solver"},
  {title:"Adding Loads",sub:"Point loads, UDL, triangular, and applied moments",dur:12,
    narration:"In the Loads tab, add as many loads as you need. Point loads are vertical forces at a single position. Uniform distributed loads — UDLs — apply a constant force per unit length over a range. Triangular loads ramp from zero to a peak. Applied moments add rotational loading at any point. Combine all types on the same beam.",
    Visual:LoadsScene,chapter:"Loads"},
  {title:"Cross-Section Library",sub:"7 shapes with automatic moment of inertia calculation",dur:11,
    narration:"In the Section tab, choose from seven built-in cross-section shapes: Rectangle, Circle, Hollow Box, Pipe, I-Section, T-Section, and Angle. Enter your dimensions and the moment of inertia Ix, section modulus Sx, and centroid are all computed automatically. A live preview updates as you type.",
    Visual:SectionScene,chapter:"Cross-Sections"},
  {title:"AISC W-Section Library",sub:"37 standard sections from W4×13 to W36×135",dur:10,
    narration:"If you're working with standard steel sections, use the AISC library in the Section tab. Thirty-seven W-sections are built in. Select any section from the dropdown and all properties — depth, flange width, thickness, Ix, Sx, Zx — auto-fill instantly. You can then run AISC 360-16 code checks directly.",
    Visual:AISCScene,chapter:"Cross-Sections"},
  {title:"Shear Force Diagram",sub:"Interactive SFD with hover tooltips",dur:12,
    narration:"After clicking Solve, go to the Diagrams tab. The Shear Force Diagram shows the internal shear at every point along the beam. Hover anywhere on the curve to read the exact shear value and position. You can also pin labels at specific points for your report. The diagram is rendered on a high-DPI canvas and scales perfectly on any screen.",
    Visual:()=><DiagramScene type="sfd"/>,chapter:"Results"},
  {title:"Bending Moment Diagram",sub:"Peak moment with hover tooltips",dur:11,
    narration:"The Bending Moment Diagram shows the internal bending moment — often the most critical result for design. The peak value is automatically identified. Hover to read values at any position. For simply supported beams under UDL, the parabolic curve should reach its maximum at midspan — ProBeam Pro confirms this numerically.",
    Visual:()=><DiagramScene type="bmd"/>,chapter:"Results"},
  {title:"Deflection & Slope Diagrams",sub:"Critical for serviceability checks",dur:12,
    narration:"Deflection is crucial for serviceability — how much does the beam actually move? ProBeam Pro plots the full deflection curve from the FEM solution and identifies the peak deflection at its exact position. The slope diagram shows the angle of rotation at every section — useful for connection design and checking rotational compatibility.",
    Visual:()=><DiagramScene type="def"/>,chapter:"Results"},
  {title:"FEM Mesh Visualiser",sub:"Inspect nodes, elements, and constrained DOFs",dur:11,
    narration:"The FEM Mesh tab lets you look inside the solver. You'll see every node, element boundary, support symbol, and degree-of-freedom constraint. Green nodes are support nodes with constrained DOFs. Red nodes carry applied loads. You can adjust the mesh density from 4 to 60 elements — higher density gives smoother diagrams and more accurate peak values.",
    Visual:FEMMeshScene,chapter:"FEM Solver"},
  {title:"AISC 360-16 Code Checks",sub:"Flexure, shear, compact section, natural frequency",dur:12,
    narration:"The AISC tab runs four code checks against AISC 360-16. The flexure check compares the demand moment to phi-Mn — the factored plastic moment capacity. The shear check compares the demand shear to phi-Vn. A compact section check verifies the flange slenderness ratio. Finally, the natural frequency is estimated for simply supported beams. Each check shows demand, capacity, and a PASS or FAIL badge.",
    Visual:AISCChecksScene,chapter:"Code Checks"},
  {title:"Deflection Limit Check",sub:"L/360, L/300, L/250, L/240, L/180",dur:9,
    narration:"Back in the Config tab, choose a deflection limit from five standard ratios — L over 360 for floors, L over 180 for roof members. The Results card shows your peak deflection, the limit, and a utilisation percentage. Green means you're within limit; red means the beam deflects too much and you need a stiffer section or shorter span.",
    Visual:()=>(
      <svg viewBox="0 0 560 220" style={{width:"100%"}}>
        <text x="280" y="22" textAnchor="middle" fill={C.text} fontSize="13" fontWeight="700" fontFamily="'Syne',sans-serif">Deflection Limit Check</text>
        {[["L/360","8.0 m / 360 = 22.2 mm","18.4 mm","82.9%",true],["L/300","8.0 m / 300 = 26.7 mm","18.4 mm","68.9%",true],["L/250","8.0 m / 250 = 32.0 mm","18.4 mm","57.5%",true],["L/240","8.0 m / 240 = 33.3 mm","18.4 mm","55.3%",true],["L/180","8.0 m / 180 = 44.4 mm","18.4 mm","41.4%",true]].map(([lim,calc,peak,util,pass],i)=>(
          <g key={i}>
            <rect x={15} y={36+i*35} width={530} height={28} rx={6} fill={pass?"#0a1a0a":"#1a0a0a"} stroke={pass?C.green+"33":C.red+"33"}/>
            <text x={28} y={53+i*35} fill={C.text} fontSize="12" fontWeight="700" fontFamily="monospace">{lim}</text>
            <text x={100} y={53+i*35} fill={C.muted} fontSize="10" fontFamily="monospace">{calc}</text>
            <text x={310} y={53+i*35} fill={C.muted} fontSize="10" fontFamily="monospace">δ = {peak}</text>
            <text x={420} y={53+i*35} fill={pass?C.green:C.red} fontSize="11" fontFamily="monospace" fontWeight="700">{util} {pass?"✓":"✗"}</text>
          </g>
        ))}
      </svg>
    ),chapter:"Code Checks"},
  {title:"Generate Word Report",sub:"Unlimited .docx export — free for a limited time",dur:13,
    narration:"When you're ready, click the Word Report button. ProBeam Pro generates a complete professional .docx file containing your project details, beam configuration, load table, all four diagrams as embedded PNG images, reaction forces, AISC check results, and the deflection limit summary. Generation takes just a few seconds. Downloads are unlimited — completely free during the current period.",
    Visual:ReportScene,chapter:"Reports"},
  {title:"Save & Load Projects",sub:"Store multiple beams in browser memory — no account needed",dur:11,
    narration:"Finally, you can save any beam configuration with a name using the Save button at the bottom. Your project is stored in your browser's local storage — no server, no account, no data shared. Load any saved project with one click to continue where you left off. Perfect for comparing different sections or span lengths on the same beam.",
    Visual:SaveLoadScene,chapter:"Projects"},
];

const CHAPTERS=[...new Set(SLIDES.map(s=>s.chapter))];

/* ─── Player Controls ────────────────────────────────────────────────────────── */
function ProgressBar({elapsed,total,accent}){
  return(
    <div style={{width:"100%",height:3,background:"#1a1e30",borderRadius:2,cursor:"pointer"}}>
      <div style={{height:"100%",width:`${Math.min(100,elapsed/total*100)}%`,background:accent,borderRadius:2,transition:"width .4s linear"}}/>
    </div>
  );
}

/* ─── Main Tutorial Component ────────────────────────────────────────────────── */
export default function Tutorial({setPage}){
  const [cur,setCur]=useState(0);
  const [playing,setPlaying]=useState(true);
  const [elapsed,setElapsed]=useState(0);
  const timerRef=useRef(null);

  const slide=SLIDES[cur];
  const dur=slide.dur*1000;

  const next=useCallback(()=>{
    if(cur<SLIDES.length-1){setCur(c=>c+1);setElapsed(0);}
    else {setPlaying(false);}
  },[cur]);
  const prev=()=>{setCur(c=>Math.max(0,c-1));setElapsed(0);};
  const goTo=i=>{setCur(i);setElapsed(0);setPlaying(true);};

  useEffect(()=>{
    clearInterval(timerRef.current);
    if(playing){
      timerRef.current=setInterval(()=>{
        setElapsed(e=>{if(e+120>=dur){next();return 0;}return e+120;});
      },120);
    }
    return()=>clearInterval(timerRef.current);
  },[playing,cur,dur,next]);

  const accent=C.blue;

  return(
    <div style={{background:C.bg,minHeight:"100vh",paddingTop:62,fontFamily:"'Inter',sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
        .tut-chap:hover{background:#1a1e30!important;color:#e8eaf0!important;}
        .tut-nav:hover{background:#1e2236!important;}
        @keyframes fadein{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
        .slide-anim{animation:fadein .45s ease both;}
      `}</style>

      <div style={{maxWidth:1060,margin:"0 auto",padding:"32px 16px 60px",display:"flex",gap:20,flexWrap:"wrap"}}>
        {/* Chapter sidebar */}
        <div style={{width:180,flexShrink:0}}>
          <div style={{fontSize:10,color:C.muted,letterSpacing:".1em",textTransform:"uppercase",marginBottom:10,fontFamily:"'JetBrains Mono',monospace"}}>Chapters</div>
          {CHAPTERS.map(ch=>{
            const first=SLIDES.findIndex(s=>s.chapter===ch);
            const active=SLIDES[cur].chapter===ch;
            return(
              <button key={ch} className="tut-chap" onClick={()=>goTo(first)}
                style={{display:"block",width:"100%",textAlign:"left",padding:"9px 12px",background:active?accent+"22":"none",color:active?accent:C.muted,border:"none",borderRadius:6,fontSize:12,fontWeight:active?600:400,cursor:"pointer",marginBottom:3,borderLeft:active?`2px solid ${accent}`:"2px solid transparent",fontFamily:"'Inter',sans-serif",transition:"all .18s"}}>
                {ch}
              </button>
            );
          })}
          <div style={{marginTop:16,borderTop:`1px solid ${C.border}`,paddingTop:14}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:8}}>Slides</div>
            {SLIDES.map((_,i)=>(
              <button key={i} onClick={()=>goTo(i)}
                style={{display:"inline-block",width:18,height:18,margin:"2px",border:"none",borderRadius:3,background:i===cur?accent:C.border,cursor:"pointer",transition:"background .18s"}}/>
            ))}
          </div>
        </div>

        {/* Player */}
        <div style={{flex:1,minWidth:0}}>
          {/* Screen */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden",marginBottom:14}}>
            {/* Visual area */}
            <div className="slide-anim" key={cur} style={{background:"#0a0c18",minHeight:280,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px 16px"}}>
              <slide.Visual/>
            </div>
            {/* Progress */}
            <div style={{padding:"0 16px"}}>
              <ProgressBar elapsed={elapsed} total={dur} accent={accent}/>
            </div>
            {/* Controls */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px"}}>
              <button className="tut-nav" onClick={prev} disabled={cur===0}
                style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"7px 12px",fontSize:13,cursor:cur===0?"not-allowed":"pointer",opacity:cur===0?.4:1,fontFamily:"'Inter',sans-serif"}}>
                ← Prev
              </button>
              <button onClick={()=>setPlaying(p=>!p)}
                style={{background:accent,border:"none",color:"#fff",borderRadius:6,padding:"7px 18px",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"'Inter',sans-serif"}}>
                {playing?"⏸ Pause":"▶ Play"}
              </button>
              <button className="tut-nav" onClick={next} disabled={cur===SLIDES.length-1}
                style={{background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:6,padding:"7px 12px",fontSize:13,cursor:cur===SLIDES.length-1?"not-allowed":"pointer",opacity:cur===SLIDES.length-1?.4:1,fontFamily:"'Inter',sans-serif"}}>
                Next →
              </button>
              <div style={{marginLeft:"auto",fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:C.muted}}>
                {cur+1} / {SLIDES.length}
              </div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:C.dim}}>
                {Math.ceil((dur-elapsed)/1000)}s
              </div>
            </div>
          </div>

          {/* Narration card */}
          <div className="slide-anim" key={"n"+cur} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 24px"}}>
            <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
              <div style={{background:accent+"22",border:`1px solid ${accent}44`,borderRadius:8,padding:"6px 12px",flexShrink:0}}>
                <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:accent,letterSpacing:".1em",textTransform:"uppercase"}}>{slide.chapter}</div>
              </div>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:C.text,marginBottom:4,letterSpacing:"-0.3px"}}>{slide.title}</div>
                <div style={{fontSize:12,color:C.muted,marginBottom:10,fontStyle:"italic"}}>{slide.sub}</div>
                <div style={{fontSize:14,color:"#b8bdd0",lineHeight:1.75}}>{slide.narration}</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          {cur===SLIDES.length-1&&(
            <div style={{marginTop:16,textAlign:"center",padding:"24px",background:C.card,border:`1px solid ${accent}44`,borderRadius:12}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:C.text,marginBottom:8}}>Ready to try it yourself?</div>
              <div style={{color:C.muted,fontSize:14,marginBottom:16}}>Everything shown in this tutorial is available right now — completely free.</div>
              <button onClick={()=>setPage&&setPage("calculator")}
                style={{background:`linear-gradient(135deg,${accent},#3b6fd4)`,color:"#fff",border:"none",padding:"13px 36px",borderRadius:9,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",letterSpacing:".01em"}}>
                ▶ Open the Calculator
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

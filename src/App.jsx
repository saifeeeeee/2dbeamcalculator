import { useState, useEffect, useRef } from "react";
import BeamCalculator from "./BeamCalculator";
import Tutorial from "./Tutorial";

// ─── Global Styles ────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #07080f; color: #e8eaf0; font-family: 'Inter', sans-serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0b0d14; }
  ::-webkit-scrollbar-thumb { background: #2a2d3a; border-radius: 3px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes glow { 0%,100%{opacity:.6;} 50%{opacity:1;} }
  @keyframes float { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-7px);} }
  @keyframes pulse-dot { 0%,100%{transform:scale(1);opacity:1;} 50%{transform:scale(1.4);opacity:.7;} }
  @keyframes cookieSlide { from{transform:translateY(100%);opacity:0;} to{transform:translateY(0);opacity:1;} }
  .fade-up  { animation: fadeUp .55s ease both; }
  .fade-up-d1{ animation: fadeUp .55s .1s ease both; }
  .fade-up-d2{ animation: fadeUp .55s .2s ease both; }
  .fade-up-d3{ animation: fadeUp .55s .35s ease both; }
  .fade-up-d4{ animation: fadeUp .55s .5s ease both; }
  .fade-up-d5{ animation: fadeUp .55s .65s ease both; }
  .nav-link { background:none; border:none; font-family:'Inter',sans-serif; font-size:13px; font-weight:500; cursor:pointer; padding:6px 14px; border-radius:6px; transition:background .18s,color .18s; letter-spacing:.01em; }
  .card-hover { transition: transform .2s, box-shadow .2s, border-color .2s; }
  .card-hover:hover { transform:translateY(-3px); box-shadow:0 8px 32px #0007; border-color:#2e3347 !important; }
  .btn-primary { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#4f8ef7,#3b6fd4); color:#fff; border:none; padding:13px 28px; border-radius:9px; font-family:'Inter',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:opacity .18s,transform .15s,box-shadow .18s; letter-spacing:.01em; }
  .btn-primary:hover { opacity:.9; transform:translateY(-1px); box-shadow:0 6px 24px #4f8ef740; }
  .btn-secondary { display:inline-flex; align-items:center; gap:8px; background:none; color:#9ca3af; border:1px solid #2a2d3a; padding:12px 26px; border-radius:9px; font-family:'Inter',sans-serif; font-size:14px; font-weight:500; cursor:pointer; transition:border-color .18s,color .18s,background .18s; }
  .btn-secondary:hover { border-color:#4f8ef7; color:#fff; background:#4f8ef710; }
  .tag { display:inline-block; font-family:'JetBrains Mono',monospace; font-size:10px; color:#4f8ef7; letter-spacing:.15em; text-transform:uppercase; margin-bottom:12px; }
  .section-title { font-family:'Syne',sans-serif; font-weight:800; font-size:clamp(26px,4vw,44px); color:#fff; letter-spacing:-1.2px; line-height:1.1; }
  .grid-auto { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px; }
  /* Mobile hamburger */
  .ham-bar { width:22px; height:2px; background:#9ca3af; border-radius:2px; transition:all .25s; display:block; }
  @media(max-width:768px) {
    .nav-desktop { display:none !important; }
    .nav-mobile-toggle { display:flex !important; }
  }
  @media(min-width:769px) {
    .nav-desktop { display:flex !important; }
    .nav-mobile-toggle { display:none !important; }
    .mobile-menu { display:none !important; }
  }
  @media(max-width:640px) {
    .hero-btns { flex-direction:column !important; align-items:stretch !important; }
    .hero-btns .btn-primary, .hero-btns .btn-secondary { justify-content:center; }
    .stats-row { flex-wrap:wrap !important; }
    .stats-row > div { flex: 1 1 40% !important; }
  }
`;

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <rect width="34" height="34" rx="8" fill="#1a2240"/>
        <rect x="5" y="15" width="24" height="4" rx="2" fill="#4f8ef7"/>
        <path d="M5 19 L5 25" stroke="#3dd68c" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M29 19 L29 25" stroke="#f7a24f" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="5" cy="19" r="2.5" fill="#3dd68c"/>
        <circle cx="29" cy="19" r="2.5" fill="#f7a24f"/>
        <path d="M10 15 L10 10 M17 15 L17 8 M24 15 L24 10" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="17" cy="8" r="2" fill="#a78bfa"/>
      </svg>
      <div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#fff",letterSpacing:"-0.3px",lineHeight:1}}>ProBeam</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#4f8ef7",letterSpacing:"0.15em",textTransform:"uppercase",lineHeight:1,marginTop:2}}>Pro</div>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
const NAV_LINKS = ["Calculator","Tutorial","Features","About","Contact"];
function Navbar({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:"#07080fdd",backdropFilter:"blur(16px)",borderBottom:"1px solid #1a1d2a"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px",height:62,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div onClick={()=>{setPage("home");setMenuOpen(false);}}><Logo/></div>
          {/* Desktop nav */}
          <div className="nav-desktop" style={{display:"flex",gap:4,alignItems:"center"}}>
            {NAV_LINKS.map(n=>(
              <button key={n} className="nav-link"
                onClick={()=>setPage(n.toLowerCase())}
                style={{color:page===n.toLowerCase()?"#4f8ef7":"#9ca3af"}}>
                {n}
              </button>
            ))}
            <button className="btn-primary" style={{padding:"8px 18px",fontSize:13,marginLeft:8}}
              onClick={()=>setPage("calculator")}>
              ▶ Open Calculator
            </button>
          </div>
          {/* Mobile toggle */}
          <button className="nav-mobile-toggle" style={{display:"none",flexDirection:"column",gap:5,background:"none",border:"none",cursor:"pointer",padding:6}}
            onClick={()=>setMenuOpen(o=>!o)}>
            <span className="ham-bar" style={{transform:menuOpen?"rotate(45deg) translateY(7px)":"none"}}/>
            <span className="ham-bar" style={{opacity:menuOpen?0:1}}/>
            <span className="ham-bar" style={{transform:menuOpen?"rotate(-45deg) translateY(-7px)":"none"}}/>
          </button>
        </div>
      </nav>
      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu" style={{position:"fixed",top:62,left:0,right:0,zIndex:199,background:"#07080fff",borderBottom:"1px solid #1a1d2a",padding:"12px 20px 20px"}}>
          {NAV_LINKS.map(n=>(
            <button key={n} className="nav-link"
              onClick={()=>{setPage(n.toLowerCase());setMenuOpen(false);}}
              style={{color:page===n.toLowerCase()?"#4f8ef7":"#9ca3af",display:"block",width:"100%",textAlign:"left",padding:"12px 10px",fontSize:15}}>
              {n}
            </button>
          ))}
          <button className="btn-primary" style={{width:"100%",justifyContent:"center",marginTop:8}}
            onClick={()=>{setPage("calculator");setMenuOpen(false);}}>
            ▶ Open Calculator
          </button>
        </div>
      )}
    </>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{borderTop:"1px solid #1a1d2a",padding:"32px 24px",background:"#07080f"}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:16}}>
        <div style={{fontSize:12,color:"#4b5563"}}>Built with ❤️ for structural engineers · {new Date().getFullYear()}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:16}}>
          {["Calculator","Features","About","Contact","Privacy"].map(t=>(
            <button key={t} onClick={()=>setPage(t.toLowerCase())}
              style={{background:"none",border:"none",color:"#4b5563",fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"color .15s"}}
              onMouseEnter={e=>e.currentTarget.style.color="#9ca3af"}
              onMouseLeave={e=>e.currentTarget.style.color="#4b5563"}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Stat Box ─────────────────────────────────────────────────────────────────
function StatBox({ value, label }) {
  return (
    <div style={{padding:"24px 20px",textAlign:"center",borderRight:"1px solid #1a1d2a",flex:"1 1 140px"}}>
      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:28,color:"#4f8ef7",lineHeight:1}}>{value}</div>
      <div style={{fontFamily:"'Inter',sans-serif",fontSize:11,color:"#6b7280",marginTop:5,textTransform:"uppercase",letterSpacing:".07em"}}>{label}</div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, badge, color="#4f8ef7" }) {
  return (
    <div className="card-hover" style={{background:"#0e1020",border:"1px solid #1a1d2a",borderRadius:12,padding:"22px 20px",display:"flex",flexDirection:"column",gap:10,position:"relative"}}>
      {badge && <div style={{position:"absolute",top:12,right:12,background:color+"22",color:color,fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:".1em",padding:"3px 8px",borderRadius:4,fontWeight:700}}>{badge}</div>}
      <div style={{fontSize:24}}>{icon}</div>
      <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#e8eaf0"}}>{title}</div>
      <div style={{fontFamily:"'Inter',sans-serif",fontSize:13,color:"#6b7280",lineHeight:1.65}}>{desc}</div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  return (
    <div style={{minHeight:"100vh",background:"#07080f",paddingTop:62}}>
      {/* Hero */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"80px 24px 60px",textAlign:"center"}}>
        {/* Live badge */}
        <div className="fade-up" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#3dd68c18",border:"1px solid #3dd68c30",borderRadius:20,padding:"5px 14px",marginBottom:24}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:"#3dd68c",display:"inline-block",animation:"pulse-dot 1.8s ease infinite"}}/>
          <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#3dd68c",letterSpacing:".1em"}}>FREE · ALL FEATURES UNLOCKED</span>
        </div>

        <h1 className="fade-up-d1 section-title" style={{fontSize:"clamp(32px,6vw,62px)",marginBottom:18,lineHeight:1.05}}>
          Professional Beam Analysis<br/>
          <span style={{color:"#4f8ef7"}}>Powered by FEM</span>
        </h1>
        <p className="fade-up-d2" style={{color:"#9ca3af",fontSize:"clamp(14px,2vw,17px)",maxWidth:580,margin:"0 auto 16px",lineHeight:1.7}}>
          SFD · BMD · Deflection · Slope · AISC 360-16 checks · Word reports — completely free, no signup, no limits.
        </p>
        <div className="fade-up-d2" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#f7a24f18",border:"1px solid #f7a24f40",borderRadius:8,padding:"8px 16px",marginBottom:32}}>
          <span style={{fontSize:14}}>🎁</span>
          <span style={{fontFamily:"'Inter',sans-serif",fontSize:12,color:"#f7a24f",fontWeight:600}}>Limited-time: Unlimited Word reports, deflection, slope diagrams — 100% free</span>
        </div>

        <div className="hero-btns fade-up-d3" style={{display:"flex",justifyContent:"center",gap:12,marginBottom:56}}>
          <button className="btn-primary" style={{fontSize:15,padding:"14px 32px"}} onClick={()=>setPage("calculator")}>
            ▶ Launch Calculator
          </button>
          <button className="btn-secondary" style={{fontSize:14,padding:"13px 26px"}} onClick={()=>setPage("tutorial")}>
            📺 Watch Tutorial →
          </button>
          <button className="btn-secondary" style={{fontSize:14,padding:"13px 26px"}} onClick={()=>setPage("features")}>
            See all features →
          </button>
        </div>

        {/* Stats */}
        <div className="fade-up-d4 stats-row" style={{display:"flex",borderTop:"1px solid #1a1d2a",borderLeft:"1px solid #1a1d2a",borderRadius:12,overflow:"hidden",border:"1px solid #1a1d2a",maxWidth:760,margin:"0 auto"}}>
          {[["5+","Beam Types"],["7","Section Shapes"],["37","AISC Sections"],["∞","Free Reports"],["FEM","Solver"]].map(([v,l])=>(
            <StatBox key={l} value={v} label={l}/>
          ))}
        </div>
      </section>

      {/* Mini feature preview */}
      <section style={{maxWidth:1100,margin:"0 auto",padding:"60px 24px 80px"}}>
        <div style={{textAlign:"center",marginBottom:44}}>
          <div className="tag">What It Does</div>
          <h2 className="section-title">Everything a Structural Engineer Needs</h2>
        </div>
        <div className="grid-auto">
          {[
            {icon:"🔲",title:"FEM Solver — Custom Supports",desc:"Place pin, roller, or fixed supports anywhere along the beam. The Hermitian cubic finite element solver handles any configuration automatically.",badge:"New Feature",color:"#3dd68c"},
            {icon:"⚙️",title:"5 Beam Types",desc:"Simply Supported, Cantilever, Fixed-Fixed, Propped Cantilever, and fully Custom multi-support beams. Each solved with exact FEM formulation.",badge:null},
            {icon:"📦",title:"All Load Types",desc:"Point loads, UDL, triangular distributed loads, and applied moments — mix any combination on the same beam."},
            {icon:"📈",title:"4 Interactive Diagrams",desc:"Shear Force (SFD), Bending Moment (BMD), Deflection, and Slope — all rendered on high-DPI canvas with hover tooltips."},
            {icon:"📐",title:"Custom Cross-Sections",desc:"7 built-in shapes with automatic Ix calculation: Rectangle, Circle, Hollow Box, Pipe, I-Section, T-Section, and Angle."},
            {icon:"✅",title:"AISC 360-16 Checks",desc:"Full flexure (φMn), shear (φVn), compact section, and natural frequency checks. 37 standard W-sections built in."},
            {icon:"📄",title:"∞ Word Reports",desc:"Professional .docx reports with diagrams, tables, AISC checks — unlimited generation, completely free.",badge:"Free ∞",color:"#f7a24f"},
            {icon:"🔧",title:"FEM Mesh Viewer",desc:"Visualize the finite element mesh, node numbering, constrained DOFs, and support symbols in a dedicated tab."},
          ].map((f,i)=>(
            <FeatureCard key={i} {...f}/>
          ))}
        </div>

        <div style={{textAlign:"center",marginTop:48}}>
          <button className="btn-primary" style={{fontSize:15,padding:"14px 36px"}} onClick={()=>setPage("calculator")}>
            Start Calculating — Free
          </button>
        </div>
      </section>

      <Footer setPage={setPage}/>
    </div>
  );
}

// ─── FEATURES PAGE ────────────────────────────────────────────────────────────
function FeaturesPage({ setPage }) {
  const allFeatures = [
    {
      icon:"🔲", title:"FEM Solver with Custom Supports", badge:"⭐ Main Feature", color:"#3dd68c",
      desc:"The core of ProBeam Pro — a Hermitian cubic finite element solver. Place pin, roller, or fixed supports at any position along the beam. The solver assembles the full global stiffness matrix, applies boundary conditions, and solves the system of equations for exact displacements and reactions.",
      detail:"Supports N-element mesh with automatic refinement at load and support positions. Handles over-constrained and multi-span beams. Visualise the mesh with node numbers, element boundaries, and constrained DOFs in the FEM Mesh tab."
    },
    {
      icon:"⚙️", title:"5 Beam Configuration Types", badge:null,
      desc:"Simply Supported, Cantilever, Fixed-Fixed, Propped Cantilever — all pre-configured. Plus fully Custom mode where you place supports anywhere.",
      detail:"Boundary conditions enforced analytically for preset types. Custom mode uses the FEM solver for any support arrangement."
    },
    {
      icon:"📦", title:"All Load Types", badge:null,
      desc:"Point loads, Uniform Distributed Loads (UDL), triangular distributed loads, and applied moments. Mix and match any combination on the same beam.",
      detail:"Load superposition handled automatically. Negative values for downward loads follow standard structural engineering sign convention."
    },
    {
      icon:"📈", title:"Interactive Diagrams", badge:null,
      desc:"Shear Force Diagram (SFD), Bending Moment Diagram (BMD), Deflection Curve, and Slope Diagram — rendered on high-DPI Canvas with hover tooltips.",
      detail:"Hover anywhere on the diagram to read exact values. Pin custom labels at specific positions for your reports."
    },
    {
      icon:"📐", title:"Custom Cross-Sections", badge:null,
      desc:"7 built-in section shapes with automatic moment of inertia (Ix) calculation: Rectangle, Circle, Hollow Box, Pipe, I-Section, T-Section, and Angle.",
      detail:"Visual preview renders in real-time as you type dimensions. Centroid and section modulus (Sx) calculated automatically."
    },
    {
      icon:"📚", title:"AISC W-Section Library", badge:null,
      desc:"37 standard AISC W-sections from W4x13 to W36x135. Select any section and properties auto-fill instantly.",
      detail:"Includes d, bf, tf, tw, Ix, Sx, Zx, and weight per foot. Filter by name to find sections quickly."
    },
    {
      icon:"✅", title:"AISC 360-16 Code Checks", badge:null,
      desc:"Full flexure check (φMn), shear check (φVn), compact section verification, and natural frequency estimation for simply supported beams.",
      detail:"Demand/capacity ratios shown with pass/fail indicators. Converts metric demands to imperial for AISC checks automatically."
    },
    {
      icon:"📄", title:"Word Report Generation", badge:"∞ Free", color:"#f7a24f",
      desc:"Export a complete professional .docx report: beam sketch, input summary, reactions, SFD/BMD/deflection/slope diagrams, AISC check results.",
      detail:"Unlimited report generation — completely free, for a limited time. Diagrams embedded as high-resolution PNG images."
    },
    {
      icon:"🔲", title:"FEM Mesh Visualiser", badge:null,
      desc:"Dedicated tab to visualise the finite element mesh used to solve the beam. See node numbering, element boundaries, and constrained DOFs.",
      detail:"Adjust mesh density (4–60 elements) and re-solve to refine accuracy. Higher mesh density = more precise diagrams."
    },
    {
      icon:"💾", title:"Project Save & Load", badge:null,
      desc:"Save your beam configuration, loads, and section to browser local storage. Load any previous project with one click.",
      detail:"Projects saved by name. Load multiple beams across sessions — no account needed."
    },
    {
      icon:"🌍", title:"Dual Unit System", badge:null,
      desc:"Switch between Imperial (kip, ft, in, ksi) and Metric (kN, m, mm, GPa) at any time. All values convert automatically.",
      detail:"AISC checks always run in Imperial; metric demands are converted automatically with unit labels clearly shown."
    },
    {
      icon:"🎯", title:"Deflection Limit Checks", badge:null,
      desc:"5 built-in deflection limits: L/360, L/300, L/250, L/240, L/180. Pass/fail shown against the peak deflection.",
      detail:"Utilisation percentage shown. Limit check applied to the FEM-calculated peak deflection at any position along the beam."
    },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#07080f",paddingTop:62}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"60px 24px 80px"}}>
        <div className="fade-up" style={{textAlign:"center",marginBottom:52}}>
          <div className="tag">Features</div>
          <h1 className="section-title">Everything ProBeam Pro Can Do</h1>
          <p style={{color:"#9ca3af",fontSize:16,maxWidth:600,margin:"16px auto 0",lineHeight:1.7}}>
            A complete structural beam analysis toolkit — from quick checks to professional FEM-powered reports.
          </p>
          {/* Free banner */}
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginTop:24,background:"#4f8ef710",border:"1px solid #4f8ef740",borderRadius:10,padding:"12px 20px"}}>
            <span style={{fontSize:20}}>🎁</span>
            <div style={{textAlign:"left"}}>
              <div style={{color:"#4f8ef7",fontWeight:700,fontSize:14}}>All features unlocked — free for a limited time</div>
              <div style={{color:"#6b7280",fontSize:12}}>Unlimited Word reports · Deflection & Slope diagrams · AISC checks · FEM Solver</div>
            </div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:18}}>
          {allFeatures.map((f,i)=>(
            <div key={i} className="card-hover" style={{background:"#0e1020",border:`1px solid ${f.badge && f.color ? f.color+"33" : "#1a1d2a"}`,borderRadius:12,padding:"22px 20px",position:"relative"}}>
              {f.badge && (
                <div style={{position:"absolute",top:12,right:12,background:(f.color||"#4f8ef7")+"22",color:f.color||"#4f8ef7",fontFamily:"'JetBrains Mono',monospace",fontSize:9,letterSpacing:".08em",padding:"3px 9px",borderRadius:4,fontWeight:700}}>
                  {f.badge}
                </div>
              )}
              <div style={{fontSize:26,marginBottom:10}}>{f.icon}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#e8eaf0",marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:13,color:"#6b7280",lineHeight:1.65,marginBottom:10}}>{f.desc}</div>
              <div style={{fontSize:11,color:"#4b5563",lineHeight:1.6,borderTop:"1px solid #1a1d2a",paddingTop:10}}>{f.detail}</div>
            </div>
          ))}
        </div>

        <div style={{textAlign:"center",marginTop:52}}>
          <button className="btn-primary" style={{fontSize:15,padding:"14px 36px"}} onClick={()=>setPage("calculator")}>
            ▶ Open the Calculator
          </button>
        </div>
      </div>
      <Footer setPage={setPage}/>
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function AboutPage({ setPage }) {
  const sections = [
    {
      title:"What is ProBeam Pro?",
      body:"ProBeam Pro is a free, browser-based structural beam analysis tool built for civil and structural engineers, students, and researchers. It requires no installation, no signup, and no payment — just open the calculator and start analysing."
    },
    {
      title:"The FEM Engine",
      body:"Unlike traditional closed-form beam calculators, ProBeam Pro uses a Hermitian cubic finite element method (FEM) to solve beams with any support configuration. The solver assembles a full global stiffness matrix, handles pin, roller, and fixed supports at any position, and computes exact nodal displacements, rotations, shear forces, bending moments, and reactions."
    },
    {
      title:"Accuracy & Mesh Density",
      body:"Results are computed on a refined finite element mesh with automatic node insertion at support and load positions. You can control mesh density from 4 to 60 elements. Higher densities give smoother diagram curves and more accurate peak values. The FEM Mesh tab lets you inspect the mesh, node numbering, and constrained degrees of freedom."
    },
    {
      title:"Why is it free?",
      body:"ProBeam Pro is free because great engineering tools should be accessible to everyone, especially students and engineers in developing countries. All features — including Word report generation, AISC code checks, custom cross-sections, and FEM solving — are currently unlocked at no cost."
    },
    {
      title:"Accuracy Disclaimer",
      body:"ProBeam Pro is designed for educational and preliminary design purposes. Always verify critical structural calculations with a licensed professional engineer and apply appropriate design codes for your jurisdiction."
    },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#07080f",paddingTop:62}}>
      <div style={{maxWidth:800,margin:"0 auto",padding:"60px 24px 80px"}}>
        <div className="fade-up" style={{marginBottom:44}}>
          <div className="tag">About</div>
          <h1 className="section-title">ProBeam Pro</h1>
          <p style={{color:"#9ca3af",fontSize:15,marginTop:12,lineHeight:1.7}}>A professional-grade structural beam analysis tool, free for everyone.</p>
        </div>
        {sections.map((s,i)=>(
          <div key={i} className="fade-up" style={{marginBottom:28,background:"#0e1020",border:"1px solid #1a1d2a",borderRadius:12,padding:"24px 22px"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:16,color:"#e8eaf0",marginBottom:10}}>{s.title}</div>
            <div style={{fontSize:14,color:"#9ca3af",lineHeight:1.75}}>{s.body}</div>
          </div>
        ))}
        <div style={{textAlign:"center",marginTop:36}}>
          <button className="btn-secondary" onClick={()=>setPage("home")}>← Back to Home</button>
        </div>
      </div>
      <Footer setPage={setPage}/>
    </div>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
function ContactPage({ setPage }) {
  const [form, setForm] = useState({name:"",email:"",subject:"",message:""});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    if(!form.name||!form.email||!form.message){setErr("Please fill in your name, email, and message.");return;}
    if(!form.email.includes("@")){setErr("Please enter a valid email address.");return;}
    setSending(true);
    try {
      const res = await fetch("https://formspree.io/f/mrejnebp",{
        method:"POST",
        headers:{"Content-Type":"application/json",Accept:"application/json"},
        body:JSON.stringify({name:form.name,email:form.email,subject:form.subject||"ProBeam Pro Contact",message:form.message,_gotcha:""}),
      });
      if(res.ok){setSent(true);setForm({name:"",email:"",subject:"",message:""});}
      else setErr("Something went wrong. Please email us directly.");
    } catch { setErr("Network error. Please email us directly at probeampro@gmail.com"); }
    finally { setSending(false); }
  };

  const inp = {width:"100%",background:"#0e1020",border:"1px solid #1e2130",color:"#e8eaf0",borderRadius:8,padding:"11px 14px",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"'Inter',sans-serif",transition:"border-color .18s"};

  return (
    <div style={{minHeight:"100vh",background:"#07080f",paddingTop:62}}>
      <div style={{maxWidth:640,margin:"0 auto",padding:"60px 24px 80px"}}>
        <div className="fade-up" style={{marginBottom:40}}>
          <div className="tag">Contact</div>
          <h1 className="section-title">Get in Touch</h1>
          <p style={{color:"#9ca3af",fontSize:15,marginTop:10,lineHeight:1.7}}>Questions, bug reports, or feature requests — we'd love to hear from you.</p>
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:16,background:"#1a1d2a40",border:"1px solid #1e2130",borderRadius:8,padding:"12px 16px"}}>
            <span style={{fontSize:16}}>📧</span>
            <a href="mailto:probeampro@gmail.com" style={{color:"#4f8ef7",fontFamily:"'JetBrains Mono',monospace",fontSize:13}}>probeampro@gmail.com</a>
          </div>
        </div>

        {sent ? (
          <div style={{background:"#0a2a0a",border:"1px solid #3dd68c40",borderRadius:12,padding:"28px 24px",textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:12}}>✅</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:18,color:"#3dd68c",marginBottom:8}}>Message Sent!</div>
            <div style={{color:"#9ca3af",fontSize:14}}>Thank you for reaching out. We'll get back to you soon.</div>
            <button className="btn-secondary" style={{marginTop:20}} onClick={()=>setSent(false)}>Send Another</button>
          </div>
        ) : (
          <div className="fade-up-d1" style={{background:"#0e1020",border:"1px solid #1e2130",borderRadius:12,padding:"28px 24px",display:"flex",flexDirection:"column",gap:14}}>
            {[["Name","name","text"],["Email","email","email"],["Subject (optional)","subject","text"]].map(([lbl,key,type])=>(
              <div key={key}>
                <label style={{display:"block",fontSize:12,color:"#9ca3af",marginBottom:6}}>{lbl}</label>
                <input style={inp} type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                  onFocus={e=>e.target.style.borderColor="#4f8ef7"} onBlur={e=>e.target.style.borderColor="#1e2130"}/>
              </div>
            ))}
            <div>
              <label style={{display:"block",fontSize:12,color:"#9ca3af",marginBottom:6}}>Message</label>
              <textarea style={{...inp,minHeight:130,resize:"vertical"}} value={form.message}
                onChange={e=>setForm(f=>({...f,message:e.target.value}))}
                onFocus={e=>e.target.style.borderColor="#4f8ef7"} onBlur={e=>e.target.style.borderColor="#1e2130"}/>
            </div>
            {err&&<div style={{color:"#f75f5f",fontSize:13,padding:"8px 12px",background:"#2a0a0a",borderRadius:6,borderLeft:"3px solid #f75f5f"}}>{err}</div>}
            <button className="btn-primary" style={{justifyContent:"center",opacity:sending?.6:1}} onClick={submit} disabled={sending}>
              {sending?"Sending…":"Send Message"}
            </button>
          </div>
        )}
        <div style={{textAlign:"center",marginTop:28}}>
          <button className="btn-secondary" onClick={()=>setPage("home")}>← Back to Home</button>
        </div>
      </div>
      <Footer setPage={setPage}/>
    </div>
  );
}

// ─── PRIVACY PAGE ─────────────────────────────────────────────────────────────
function PrivacySection({ title, content }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{background:"#0e1020",border:"1px solid #1e2130",borderRadius:10,marginBottom:8,overflow:"hidden"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:"none",border:"none",color:"#e8eaf0",padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:14,fontWeight:600,textAlign:"left"}}>
        {title}
        <span style={{color:"#4f8ef7",fontSize:18,lineHeight:1,transform:open?"rotate(45deg)":"none",transition:"transform .2s"}}>+</span>
      </button>
      {open&&<div style={{padding:"0 18px 16px",color:"#6b7280",fontSize:13,lineHeight:1.75,whiteSpace:"pre-line"}}>{content}</div>}
    </div>
  );
}

function PrivacyPage({ setPage }) {
  const sections = [
    {title:"1. Introduction",content:"ProBeam Pro (\"we,\" \"our,\" or \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.\n\nEmail: probeampro@gmail.com\nWebsite: https://2dbeamcalculator.netlify.app"},
    {title:"2. Information We Collect",content:"We collect minimal information. No account registration is required. If you use the contact form, we collect your name and email to respond to you. Your beam calculation data is stored locally in your browser (localStorage) and never sent to our servers."},
    {title:"3. Analytics",content:"We use Google Analytics to understand aggregate usage patterns (page views, session duration). No personally identifiable calculation data is shared. You can opt out via your browser's Do-Not-Track settings."},
    {title:"4. Cookies",content:"We use essential cookies for site functionality and analytics cookies (Google Analytics). You can decline non-essential cookies via the cookie banner shown on your first visit. Declining analytics cookies will not affect calculator functionality."},
    {title:"5. Data Retention",content:"Contact form submissions are retained for up to 90 days for correspondence purposes, then deleted. We do not store your beam calculations on any server."},
    {title:"6. Your Rights",content:"You may request deletion of any contact form data by emailing probeampro@gmail.com. You may opt out of analytics at any time via browser settings or the cookie banner."},
    {title:"7. Contact Us",content:"ProBeam Pro\nEmail: probeampro@gmail.com\nWebsite: https://2dbeamcalculator.netlify.app\n\nThis Privacy Policy was created for ProBeam Pro — a free structural beam calculator built for civil engineering students and professionals worldwide."},
  ];
  return (
    <div style={{minHeight:"100vh",background:"#07080f",paddingTop:62}}>
      <div style={{maxWidth:800,margin:"0 auto",padding:"60px 24px 80px"}}>
        <div className="fade-up" style={{marginBottom:36}}>
          <div className="tag">Legal</div>
          <h1 className="section-title">Privacy Policy</h1>
          <p style={{color:"#9ca3af",fontSize:14,marginTop:10}}>Last updated: {new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</p>
        </div>
        {sections.map((s,i)=><PrivacySection key={i} {...s}/>)}
        <div style={{textAlign:"center",marginTop:32}}>
          <button className="btn-secondary" onClick={()=>setPage("home")}>← Back to Home</button>
        </div>
      </div>
      <Footer setPage={setPage}/>
    </div>
  );
}

// ─── COOKIE CONSENT ───────────────────────────────────────────────────────────
function CookieConsent({ onAccept, onDecline }) {
  const [visible, setVisible] = useState(false);
  useEffect(()=>{
    const pref = localStorage.getItem("probeam_cookies");
    if(!pref) setTimeout(()=>setVisible(true), 1200);
  },[]);

  const handle = (accepted) => {
    localStorage.setItem("probeam_cookies", accepted?"accepted":"declined");
    setVisible(false);
    if(accepted && onAccept) onAccept();
    if(!accepted && onDecline) onDecline();
  };

  if(!visible) return null;
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:9999,animation:"cookieSlide .4s ease both"}}>
      <div style={{background:"#0d0f1a",borderTop:"1px solid #1e2130",padding:"16px 20px",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:14,maxWidth:"100%"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12,flex:"1 1 300px"}}>
          <span style={{fontSize:22,flexShrink:0}}>🍪</span>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:"#e8eaf0",marginBottom:4}}>We use cookies</div>
            <div style={{fontSize:12,color:"#6b7280",lineHeight:1.6}}>
              We use essential cookies for site functionality and optional analytics cookies (Google Analytics) to understand how the calculator is used. No calculation data is ever collected.{" "}
              <button onClick={()=>{}} style={{background:"none",border:"none",color:"#4f8ef7",fontSize:12,cursor:"pointer",textDecoration:"underline",padding:0,fontFamily:"'Inter',sans-serif"}}>
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,flexShrink:0,flexWrap:"wrap"}}>
          <button onClick={()=>handle(false)}
            style={{background:"none",border:"1px solid #2a2d3a",color:"#9ca3af",padding:"9px 18px",borderRadius:7,fontSize:13,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:500,transition:"border-color .18s,color .18s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#4b5563";e.currentTarget.style.color="#e8eaf0";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#2a2d3a";e.currentTarget.style.color="#9ca3af";}}>
            Decline
          </button>
          <button onClick={()=>handle(true)}
            style={{background:"linear-gradient(135deg,#4f8ef7,#3b6fd4)",color:"#fff",border:"none",padding:"9px 22px",borderRadius:7,fontSize:13,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:600}}>
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch(page) {
      case "tutorial":    return <Tutorial setPage={setPage}/>;
      case "home":       return <HomePage setPage={setPage}/>;
      case "features":   return <FeaturesPage setPage={setPage}/>;
      case "about":      return <AboutPage setPage={setPage}/>;
      case "contact":    return <ContactPage setPage={setPage}/>;
      case "privacy":    return <PrivacyPage setPage={setPage}/>;
      case "calculator": return (
        <div style={{paddingTop:62,minHeight:"100vh",background:"#0b0d14"}}>
          <BeamCalculator/>
        </div>
      );
      default: return <HomePage setPage={setPage}/>;
    }
  };

  return (
    <>
      <Navbar page={page} setPage={setPage}/>
      {renderPage()}
      <CookieConsent/>
    </>
  );
}

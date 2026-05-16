// Manual verification of beam solver
// Test Case 1: Simply Supported beam, point load at midspan
// L=20ft, P=10kip at x=10ft
// Expected: RA=5kip, RB=5kip, Mmax=50kip-ft at midspan
// Deflection at midspan: delta = PL³/(48EI) = 10*20³/(48*15000) in inches
// EI in kip-ft²: 29000*500/144 = 100694 kip-ft²
// Wait, EI = E*I/144 = 29000*500/144 = 100694 kip-in²...
// EI in kip-ft² = EI_kip_in / 144 = 100694/144 = 699 kip-ft²
// delta = PL³/(48EI) = 10*20³/(48*699) = 8000/33552 = 0.238 ft = 2.86 in
console.log("=== TEST CASE 1: SS beam, P=10kip at midspan, L=20ft ===");
const EI = (29000 * 500) / 144; // kip-in²
const EI_ft2 = EI / 144; // kip-ft²
const L = 20;
const P = 10;
const a = 10;
const RA = P * (L - a) / L; // = 5 kip
const RB = P * a / L; // = 5 kip
const Mmax = RA * a; // = 50 kip-ft
const delta_mid = P * L * L * L / (48 * EI_ft2 * 12 * 12); // in inches
// = 10 * 8000 / (48 * 699 * 144) = 80000 / 4826112 = 0.01658... ft?
// Let me redo: delta (ft) = PL³/(48EI) where EI is in kip-ft²
// delta (ft) = 10 * 20³ / (48 * 699) = 8000 / 33552 = 0.238 ft = 2.86 in
console.log("RA =", RA, "kip");
console.log("RB =", RB, "kip");
console.log("Mmax =", Mmax, "kip-ft");
console.log("delta (ft) =", P * L**3 / (48 * EI_ft2));
console.log("delta (in) =", (P * L**3 / (48 * EI_ft2)) * 12);

// Test Case 2: Cantilever, P=10kip at free end x=20ft
// RA = 10kip, MA = 10*20 = 200kip-ft
// delta at tip = PL³/(3EI) = 10*20³/(3*699) = 8000/2097 = 3.81 ft = 45.8 in
console.log("\n=== TEST CASE 2: Cantilever, P=10kip at x=20ft, L=20ft ===");
const RA2 = P;
const MA2 = P * L;
const delta2 = P * L**3 / (3 * EI_ft2);
console.log("RA =", RA2, "kip");
console.log("MA =", MA2, "kip-ft (fixed end)");
console.log("delta (ft) =", delta2);
console.log("delta (in) =", delta2 * 12);

// Test Case 3: Fixed-Fixed, point load at midspan
// RA = RB = P/2 = 5kip
// Mmax at load = P*L/8 = 25kip-ft (moment at midspan under load)
// Actually for fixed-fixed, M at midspan under load = PL/8 = 25
// But the fixed end moments are -PL/12 = -16.67 each
// M at load point = +PL/8 = +25
console.log("\n=== TEST CASE 3: Fixed-Fixed, P=10kip at midspan, L=20ft ===");
const RA3 = P/2;
const RB3 = P/2;
const M_fixed = -P * L / 12; // -16.67 kip-ft
const M_load = P * L / 8; // +25 kip-ft
console.log("RA = RB =", RA3, "kip");
console.log("Fixed end moments =", M_fixed.toFixed(2), "kip-ft");
console.log("Max positive moment (at load) =", M_load, "kip-ft");

// Test Case 4: SS with UDL w=1kip/ft, L=20ft
// RA = RB = wL/2 = 10kip
// Mmax = wL²/8 = 50kip-ft
// delta_max = 5wL⁴/(384EI) = 5*1*20⁴/(384*699) = 80000/268416 = 0.298 ft = 3.57 in
console.log("\n=== TEST CASE 4: SS beam, UDL w=1kip/ft, L=20ft ===");
const w = 1;
const RA4 = w * L / 2;
const RB4 = w * L / 2;
const Mmax4 = w * L * L / 8;
const delta4 = 5 * w * L**4 / (384 * EI_ft2);
console.log("RA = RB =", RA4, "kip");
console.log("Mmax =", Mmax4, "kip-ft");
console.log("delta (ft) =", delta4.toFixed(4));
console.log("delta (in) =", (delta4 * 12).toFixed(2));

// Test Case 5: Propped cantilever, P=10kip at midspan
// For propped: R1 = P*(3L²-4a²)/(6L²) at fixed, R2 = P - R1 at roller
// at midspan a=L/2: R1 = 10*(3*400-4*100)/(6*400) = (1200-400)/2400 = 0.333... no
// Actually: For propped cantilever with point load at distance a from fixed end:
// R1 = P*(3L² - 4a²) / (6L²) when measured from fixed end
// R2 = P - R1
// MA = -P*a*(3L² - 4a²) / (6L²)
console.log("\n=== TEST CASE 5: Propped, P=10kip at midspan, L=20ft ===");
const a5 = 10;
const R1 = P * (3*L*L - 4*a5*a5) / (6*L*L);
const R2 = P - R1;
const MA5 = -P * a5 * (3*L*L - 4*a5*a5) / (6*L*L);
const Mmax5 = R1 * a5 + MA5; // should be at load point
console.log("R1 (fixed) =", R1.toFixed(4), "kip");
console.log("R2 (roller) =", R2.toFixed(4), "kip");
console.log("MA (fixed moment) =", MA5.toFixed(4), "kip-ft");
console.log("Check: R1 + R2 =", (R1+R2).toFixed(4), "should be", P);

// Test Case 6: Custom support - pin at 0, roller at 15, fixed at 20
console.log("\n=== TEST CASE 6: Custom supports pin@0, roller@15, fixed@20 ===");
console.log("L=20ft, P=10kip at x=10ft");
console.log("3 supports: pin at 0 (vy, no moment), roller at 15 (vy, no moment), fixed at 20 (vy, moment)");
console.log("DOFs: y0, th_0(hinge? no - pin has no theta), y_roller, th_fixed at 20");
console.log("Actually: pin=2DOF(y), roller=1DOF(y), fixed=2DOF(y,th) = 5 free DOFs");
console.log("Spans: [0-15] and [15-20]");

// Verify angular load - 10kip at 30 degrees from vertical
// P_perp = P * cos(30) = 10 * 0.866 = 8.66kip (perpendicular to beam)
// P_ax = P * sin(30) = 5kip (axial, causes additional compression/tension)
// For SFD/BMD, only perpendicular component matters
console.log("\n=== TEST CASE 7: Angular point load at 30° ===");
const P_angle = 10;
const angle = 30; // degrees from vertical
const P_perp = P_angle * Math.cos(angle * Math.PI / 180);
const P_ax = P_angle * Math.sin(angle * Math.PI / 180);
console.log("P =", P_angle, "kip at", angle, "deg from vertical");
console.log("Perpendicular component =", P_perp.toFixed(3), "kip");
console.log("Axial component =", P_ax.toFixed(3), "kip");
console.log("90 deg = perpendicular, 0 deg = horizontal");
# ✅ LEARN MODE – FINAL TECHNICAL SPECIFICATION

---

## 1. UI Architecture: Two Distinct Screens

### Screen A: Input/Validation Phase
| Element | Specification |
|---------|--------------|
| **Layout** | Full grid + Full-screen 3D cube in background + sidebar color palette |
| **Guided Sequence** | Green → Red → Blue → Orange → White → Yellow (auto-rotate or highlight target face) |
| **Interaction** | **Click** = Paint face • **Drag** = Orbit camera • **Scroll** = Zoom |
| **Validation** | "Validate & Start" button triggers Kociemba check |
| **Color Limit** | Each color disabled after 8 user inputs (9 total with center) |
| **Error Handling** | Invalid state → warning modal, stay on Screen A |

### Screen B: Tutorial Phase
| Element | Specification |
|---------|--------------|
| **Layout** | Reference image layout: central cube, right instruction panel, left "Next Step" preview |
| **Top Display** | `STEP 04 / 12` or `PHASE: F2L (3/6)` (reuses timer component styling) |
| **Controls** | Next / Previous / Auto-Play / Animate buttons |
| **Cube Interaction** | Slice rotation enabled for practice; camera orbit still available |
| **Algorithm Display** | Notation box (e.g., `R U R' U'`) + plain-English explanation |

### Transition Flow
```
[Hero Menu] 
     ↓ (click "LEARN" button)
[Screen A: Input] 
     ↓ (Validate & Start → Kociemba pass)
[Screen B: Tutorial]
     ↺ (Restart/Back button returns to Screen A)
```

---

## 2. Solver Strategy: Hybrid Beginner CFOP

### Approach
```
Cross + F2L → Use npm package (rubiks-cube-solver, partitioned output)
OLL + PLL   → Custom 4LLL logic (2-Look OLL + 2-Look PLL)
```

### Algorithm Database (Beginner-Friendly)
| Phase | Method | Algorithm Count | Source |
|-------|--------|----------------|--------|
| **OLL** | 2-Look (Edge orient → Corner orient) | 10 | J Perm, CubeSkills |
| **PLL** | 2-Look (Corner perm → Edge perm) | 6 | J Perm, SpeedCubeDB |
| **Total** | **4LLL** | **~16** | vs 78 for full CFOP |

### Implementation Pseudo-Code
```typescript
function getBeginnerCFOPSolution(cubeState: CubeState): BeginnerSolution {
  // Step 1: Get partitioned solution from npm package
  const advanced = rubiksCubeSolver.solve(cubeState, { 
    method: 'CFOP', 
    partition: true 
  });
  
  // Step 2: Use package output for Cross & F2L
  const cross = advanced.cross;
  const f2l = advanced.f2l;
  
  // Step 3: Detect last-layer case & apply 4LLL lookup
  const llState = detectLastLayerState(cubeState);
  const oll = lookup2LookOLL(llState); // 10-algo database
  const pll = lookup2LookPLL(llState); // 6-algo database
  
  return { cross, f2l, oll, pll, isBeginner: true };
}
```

### Development Estimate
- Cross/F2L integration: **1-2 days**
- 4LLL state detection + lookup tables: **1-2 weeks**
- Testing & UX polish: **3-5 days**

---

## 3. 3D Input Controls (Screen A)

### Interaction Model: Click = Paint, Drag = Orbit
| Action | Behavior |
|--------|----------|
| **Left Click on Face** | Apply selected palette color to that sticker |
| **Mouse Drag (anywhere)** | Orbit camera around cube (no slice rotation) |
| **Scroll Wheel** | Zoom in/out |
| **Right Click (optional)** | Alternative orbit control |

### Implementation Snippet
```typescript
// Disable slice rotation during Input Phase
cubeControls.enableSliceRotation = false;

onMouseDown(event) {
  if (event.target.isCubeFace && !isDragging) {
    paintSticker(event.target.faceIndex, selectedColor);
  }
}

onMouseMove(event) {
  if (mouseIsDown) {
    orbitCamera(event.deltaX, event.deltaY);
  }
}

// Palette logic: disable color after 8 user placements
if (colorUsage[selectedColor] >= 8) {
  paletteButton.disabled = true;
  paletteButton.classList.add('greyed-out');
}
```

### UX Enhancements
- Hover highlight on target face
- Auto-rotate toggle for hands-free viewing
- Face-navigation arrows (optional, follows guided sequence)

---

## 4. Top Display: Progress Tracker (Not Timer)

### Rationale
- Learning mode prioritizes comprehension over speed
- Stopwatch creates anxiety; step counter creates motivation
- Visual consistency with Game mode preserved

### Implementation
```tsx
<TopDisplay 
  className="neon-orange glow" 
  aria-label={currentMode === 'GAME' ? 'Timer' : 'Progress'}
>
  {currentMode === 'GAME' 
    ? formatTime(elapsedTime) 
    : `STEP ${currentStep} / ${totalSteps}`}
</TopDisplay>
```

### Optional Enhancement
Add a small `⏱️` toggle in the bottom-right panel that, when activated, switches the top display to a stopwatch *only for users who want to practice speed*.

---

## 5. Navigation Entry Point (Hero Menu)

```tsx
// Add below "INITIALIZE" button, 10px gap
<Button 
  variant="primary" 
  onClick={() => setGlobalMode('LEARN')}
  style={{ marginTop: '10px' }}
>
  LEARN
</Button>
```
- Identical typography, color, border-radius, and hover effects as "INITIALIZE"
- Sets global `mode: 'LEARN'` → mounts `LearnOverlay.tsx`

---

## 6. Validation Logic Summary

### Client-Side Checks (Screen A)
1. **Color Count**: Each color ≤ 9 stickers (1 center + 8 user inputs)
2. **Center Fixed**: Centers are pre-filled and non-editable
3. **Palette Disable**: Grey out colors that have reached limit

### Server-Side/Internal Check
```typescript
async function validateCubeState(cube: CubeState): Promise<ValidationResult> {
  // Run Kociemba algorithm internally
  const result = await kociemba.solve(cube);
  
  if (result.error || !result.solution) {
    return { 
      valid: false, 
      message: "Invalid configuration. Check for twisted corners or swapped edges." 
    };
  }
  return { valid: true };
}
```

---

## 7. Resource Links (Verified)

### 4LLL / Beginner Algorithms
- CubeSkills 4LLL PDF: https://www.cubeskills.com/uploads/pdf/tutorials/4-look-last-layer.pdf
- J Perm 2-Look OLL: https://jperm.net/algs/2lookoll
- J Perm 2-Look PLL: https://jperm.net/algs/2lookpll
- Cubing Cheat Sheet 4LLL: https://cubingcheatsheet.com/algs3x_4lll.html

### NPM Package
- rubiks-cube-solver: https://www.jsdelivr.com/package/npm/rubiks-cube-solver
- GitHub CFOP Solver: https://github.com/Fahad-Habib/Rubiks-Cube-Solver

### Method Reference
- Wikipedia CFOP: https://en.wikipedia.org/wiki/CFOP_method
- J Perm CFOP Guide: https://jperm.net/3x3/cfop

---

## ✅ Final Approval Checklist

- [ ] "LEARN" button added to Hero menu (10px gap, matching style)
- [ ] Global state extended with `mode: 'LEARN'`
- [ ] Screen A: 3D painting UI with guided sequence + palette limits
- [ ] Screen B: Tutorial layout per reference image + step counter
- [ ] Hybrid solver: npm package for Cross/F2L + custom 4LLL for OLL/PLL
- [ ] Kociemba validation gate between Screen A → B
- [ ] Interaction model: Click=Paint, Drag=Orbit (Input Phase)
- [ ] Slice rotation enabled only in Tutorial/Practice phases
- [ ] Top display repurposed as step tracker (visual parity preserved)

---

> **This specification delivers a beginner-friendly, visually consistent, and technically robust learning module—without over-engineering the solver or compromising UX clarity.**


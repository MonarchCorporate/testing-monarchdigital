/**
 * Art-direction config.
 * Every number that shapes the look or the choreography lives here.
 * Units: 1 unit = half a keycap width (the source keycap is 2.0 × 1.19 × 2.0).
 */

export const config = {
  /* ------------------------------------------------------------------ */
  sphere: {
    /** Horizontal rings including the two single-key poles (odd number keeps an equator ring). */
    rings: 9,
    /** Radius of the sphere at the keycap base plane (sphere-local units). */
    radius: 13.2,
    /** Keycap size in sphere-local units (model is 2.0 wide → 2× = 4.0 wide). */
    keyScale: 2,
    /** Arc distance between key centres along a ring, measured at the key's inner (pole-side) edge. */
    pitch: 4.64,
    /** Whole sphere system (keys, choreography, phrase) is rendered at this world scale. */
    worldScale: 2.3,
    /** World position of the sphere centre in the hero. */
    center: [0, 0, 0] as [number, number, number],
    /** Idle rotation around the vertical axis, rad/s. */
    idleRotationSpeed: 0.045,
    /** Vertical bob amplitude (units) and frequency (Hz-ish). */
    bobAmplitude: 0.45,
    bobSpeed: 0.32,
    /** Per-key micro breathing along the normal. */
    microAmplitude: 0.07,
    /** Glyph seed for the random legends on non-phrase keys. */
    seed: 7,
  },

  /* ------------------------------------------------------------------ */
  mouse: {
    /** Max outward push of the key under the cursor (sphere-local units). */
    strength: 3.5,
    /** Angular radius of influence on the sphere (radians, gaussian sigma). */
    radius: 0.62,
    /** Spring stiffness / damping for the nearest key (soft, slightly underdamped = gentle settle). */
    stiffness: 26,
    damping: 6.4,
    /** How much softer the outermost affected keys are (0..1). */
    neighbourSoftness: 0.55,
    /** Response delay (s): keys under the cursor follow after `responseDelay`, the farthest affected
     *  ones after `responseDelay + neighbourDelay` — the push travels across the surface like a wave. */
    responseDelay: 0.06,
    neighbourDelay: 0.34,
    /** Returning to rest is this much slower than reacting. */
    releaseSlowdown: 2.2,
    /** Tilt away from the hit point (radians at full push). 0 = keys only slide outwards. */
    tilt: 0,
    /** Smoothing of the cursor's hit point on the sphere (s) — small hand jitter never reaches the keys. */
    hitSmoothing: 0.22,
    /** Progress at which mouse interaction has fully faded out. */
    fadeOut: [0.015, 0.12] as [number, number],
  },

  /* ------------------------------------------------------------------ */
  /** Scroll phase boundaries (normalised scroll progress). */
  phases: {
    activation: [0.0, 0.2] as [number, number],
    decoding: [0.2, 0.45] as [number, number],
    disassembly: [0.45, 0.7] as [number, number],
    reconstruction: [0.7, 0.9] as [number, number],
    final: [0.9, 1.0] as [number, number],
    /** The sphere story above runs over the first `storyEnd` of the scroll (its phases are relative to it);
     *  the rest belongs to the third section — the MAKE IT REAL → MATERIAL anagram (absolute scroll). */
    storyEnd: 0.64,
    material: [0.8, 0.95] as [number, number],
  },

  choreography: {
    /** Ring spin (rad/s) added on top of idle at full activation / full decoding. */
    activationSpin: 0.35,
    decodingSpin: 1.15,
    disassemblySpin: 0.6,
    /** Extra vertical spacing added between neighbouring rings at full decoding. */
    ringSpread: 2.5,
    /** Max off-axis drift and tilt of rings during decoding (kept below the added ring spacing). */
    ringDrift: 1.2,
    ringTilt: 0.05,
    /** Share of keys that start to detach during decoding and how far they go. */
    detachShare: 0.16,
    detachDistance: 4.2,
    /** Disassembly: every ring keeps its circle and grows by this much radius while it leaves,
     *  climbing (rings above the camera) or sinking (below) along a cone — rings never cross. */
    exitGrowth: 320,
    /** Cone slope = base + gain·|sin(lat)| (monotonic with height → ring order is preserved). */
    exitSlopeBase: 0.42,
    exitSlopeGain: 0.55,
    /** Outer rings leave first; each step towards the equator waits this much progress. */
    exitStagger: 0.02,
    /** Duration of each ring's exit inside the disassembly phase (fraction of total progress). */
    exitDuration: 0.2,
    /** Gentle per-key tumble while leaving (radians). */
    exitTumble: 0.9,
    /** Phrase keys sink from their rings into the hollow centre in this window and hover there. */
    holdWindow: [0.33, 0.6] as [number, number],
    /** Phrase reconstruction: base start, per-key stagger spread and duration. */
    reconstructStart: 0.665,
    reconstructStagger: 0.07,
    reconstructDuration: 0.16,
    /** Float in the final state. */
    floatAmplitude: 0.26,
    floatDepth: 0.7,
    /** Each phrase key wobbles on all three axes with its own amplitude in this range (degrees). */
    floatRotationDeg: [3, 5] as [number, number],
  },

  /* ------------------------------------------------------------------ */
  phrase: {
    text: 'MAKE IT REAL',
    /** Centre of the final phrase (sphere-local; ×worldScale in the world). */
    center: [0, 0, 4] as [number, number, number],
    /** Key-to-key pitch inside a word and the extra space between words (sphere-local). */
    pitch: 4.88,
    wordGap: 3.1,
    /** Third section: the same keys re-spell this word (letters must be a subset of `text`). */
    anagram: 'MATERIAL',
    /** Static depth variation of each key in the final composition. */
    depthJitter: 1.0,
    /** The final camera distance adapts to the viewport so one keycap is this share of its width. */
    keyScreenWidth: 0.0713,
  },

  /* ------------------------------------------------------------------ */
  /** H1 animation — Text Motion Studio export "focus-reveal.json" (font/size/leading come from the layout). */
  titles: {
    focusReveal: {
      duration: 2.2,
      delay: 0.1,
      ease: 'sine',
      easeType: 'inOut',
      direction: 'right' as 'left' | 'right',
      scale: 1.1,
      opacity: 0,
      blur: 0.25, // em
      intensity: 0.7, // depth of field = 0.12 + 0.5 × intensity (share of the line width)
    },
    /** Second part of a two-part title starts this much later (s). */
    secondLineDelay: 0.35,
    /** Body copy ("H2") — Text Motion Studio export "h2_fade-up-prompt.md", line by line. */
    fadeUp: {
      duration: 0.8,
      delay: 0.1,
      stagger: 0.12,
      ease: 'power3.out',
      distance: 0.6, // em
      opacity: 0,
      blur: 0.1, // em
    },
    /** Body copy starts after its section's H1 has begun focusing (s). */
    bodyDelay: 0.45,
  },

  /* ------------------------------------------------------------------ */
  /** MAKE IT REAL → MATERIAL: how the rebuild trails the scroll (Scene.tsx followMaterial). */
  anagramMotion: {
    /** Critically damped follow time (s): larger = more inertia, softer start and landing. */
    smoothTime: 0.55,
    /** Upper bound of the rebuild speed (anagram progress per second): 0.4 → never faster than 2.5 s. */
    maxSpeed: 0.4,
  },
  /** Third section: keys under the cursor turn to dark glass and show their blue wireframe. */
  wireframe: {
    /** Anagram progress from which the effect is allowed (it never shows during the rebuild). */
    from: 0.9,
    /** Influence radius around the cursor, sphere-local units (a key pitch is ~4.9). */
    radius: 4.2,
    /** Inner share of the radius at full strength. */
    core: 0.45,
    /** Response times (s): quick to appear, slow and smooth to fade back. */
    inTime: 0.12,
    outTime: 0.9,
    color: '#3d7bff',
    /** Emissive strength of the lines (bloom picks up values above ~1). */
    intensity: 0.85,
    /** Lattice cells per model unit (a keycap is ~1.8 units wide). */
    density: 5,
  },
  /** Northern lights over sections 2–3 (Sky.tsx). */
  aurora: {
    /** Animation speed multiplier (1.2 = 20 % faster than the first version). */
    speed: 1.2,
    /** Lowers the curtains by this many screen pixels (at any viewport size). */
    offsetPx: 150,
    /** Top darkening: begins at this fraction of the frame height (0 bottom → 1 top)… */
    shadeFrom: 0.78,
    /** …and reaches this strength at the top edge. */
    shadeStrength: 0.85,
  },
  preloader: {
    /** Canvas size (px); keep in sync with --preloader-sphere in tokens.css. */
    sphereSize: 50,
    /** Dot lattice: latitude bands × dots on the equator (≈110 dots, half the mockup's density). */
    latBands: 9,
    lonCount: 16,
    rotationSpeed: 0.55, // rad/s
    sphereOutDuration: 0.45,
    revealDuration: 1.5,
    revealEase: 'power3.inOut',
    /** Preloader background — also the colour WebGL paints outside the reveal circle. Keep in sync with CSS. */
    color: '#050a22',
    /** Consecutive smooth frames (< 34 ms) required before the exit starts, so the reveal never hitches. */
    stableFrames: 24,
    /** …but never wait longer than this many seconds of rendering for it. */
    stableTimeout: 4,
  },

  /* ------------------------------------------------------------------ */
  /** Sections 2–3: the cursor as a small sphere of light with a smoky trail. */
  cursorLight: {
    color: '#9cc9ff',
    /** Point light (candela) and its range (sphere-local × worldScale). */
    intensity: 600,
    distance: 70,
    /** How far in front of the phrase plane the light floats (sphere-local). */
    depthOffset: 6,
    /** Visual orb size (sphere-local) and how quickly it follows the cursor (1/s). */
    orbSize: 7,
    follow: 7,
    /** Trail: splat radius (screen height units) and strength; smoke colours (dense → thin). */
    trailRadius: 0.044,
    trailStrength: 0.085,
    trailColor: '#4f7fe0',
    trailCore: '#d4e5ff',
    trailIntensity: 1.25,
    /** Phrase keys turn towards the light (max degrees), lift towards it (local units) within this radius (local). */
    keyTiltDeg: 7,
    keyLift: 0.9,
    keyRadius: 12,
  },

  /* ------------------------------------------------------------------ */
  camera: {
    fov: 32,
    near: 0.5,
    far: 5000,
    hero: { position: [0, -9, 168] as [number, number, number], target: [0, -5, 0] as [number, number, number] },
    decode: { position: [1.5, -7, 150] as [number, number, number], target: [0, -3.5, 0] as [number, number, number] },
    disassembly: { position: [-6, -1, 138] as [number, number, number], target: [0, 2, 12] as [number, number, number], fov: 34.5 },
    /** Final framing is computed from the viewport (see choreography/framing.ts); only the FOV is set here. */
    final: { fov: 31 },
    /** Cursor parallax (units) and its smoothing. */
    parallax: [3.2, 1.8] as [number, number],
    parallaxDamping: 2.2,
    /** Idle drift amplitude. */
    idle: 0.6,
  },

  /* ------------------------------------------------------------------ */
  lighting: {
    exposure: 1.0,
    hemisphere: { sky: '#7f9be6', ground: '#060a18', intensity: 0.6 },
    key: { color: '#d6e4ff', intensity: 2.6, position: [-38, 90, -30] as [number, number, number] },
    fill: { color: '#6d8ee0', intensity: 0.38, position: [60, 10, 120] as [number, number, number] },
    /** Final state: soft directional light from upper-left front. */
    finalKey: { color: '#eef3ff', intensity: 2.2, position: [-60, 90, 260] as [number, number, number] },
    /** Inner core light (candela, physically-based; distance is sphere-local × worldScale). */
    core: { color: '#8ec5ff', intensity: 15000, distance: 70, decay: 2 },
    environmentIntensity: 0.6,
    shadowMapSize: 2048,
  },

  /* ------------------------------------------------------------------ */
  /** Palette & air — cold ultramarine night, luminous breach in the centre. */
  atmosphere: {
    fogColor: '#3a57a6',
    fogDensity: 0.0019,
    /** Final void color (near black with a cold blue cast). */
    voidColor: '#03050c',
    skyZenith: '#0a1230',
    skyGlow: '#c4dcff',
    /** Height fog: density, falloff and base height (baked into the shared fog chunk). */
    heightFog: { density: 0.012, falloff: 0.045, base: -62 },
    /** Far haze: distant ranges melt into the atmosphere (view-distance band, world units). */
    farFog: { start: 260, end: 1150, max: 0.93 },
    shaftColor: '#b7d0ff',
    shaftIntensity: 0.07,
    dustColor: '#6f8fd8',
    dustCount: 1400,
    rock: { dark: '#0b1128', light: '#22325f', snow: '#9cb6f0' },
  },

  /* ------------------------------------------------------------------ */
  terrain: {
    seed: 11,
    segmentsX: 440,
    segmentsZ: 340,
    width: 1700,
    zNear: 210,
    zFar: -1500,
    floor: -78,
    /** Foreground massifs built from the supplied mountain asset (two differently placed copies). */
    foreground: [
      { position: [-160, -112, 70], rotationY: 0.6, scale: [0.62, 0.72, 0.62] },
      { position: [215, -115, 70], rotationY: 2.0, scale: [-0.58, 0.66, 0.58] }, // mirrored
    ] as { position: [number, number, number]; rotationY: number; scale: [number, number, number] }[],
  },

  /* ------------------------------------------------------------------ */
  post: {
    bloomIntensity: 1.0,
    bloomThreshold: 0.85,
    bloomSmoothing: 0.25,
    godRays: true,
    grain: 0.05,
    vignette: 0.55,
  },

  /* ------------------------------------------------------------------ */
  scroll: {
    /** Length of the pinned scroll in viewport heights. */
    lengthScreens: 11,
    /** Soft snap: releasing the scroll inside a zone glides to its resting point (s = seconds). */
    magnetDuration: [0.45, 1.1] as [number, number],
    /** GSAP scrub smoothing in seconds. */
    scrub: 1.4,
    restartDuration: 3.6,
  },

  /** `?demo=1` take (scroll/demo.ts): [τ seconds after the hero titles start, scroll progress] stops;
   *  equal progress = a hold, otherwise an eased move. Sphere → break-up → MAKE IT REAL → MATERIAL.
   *  The stops at 0.45 (the hero titles leave) and 0.79 (the second section's leave) give each outgoing
   *  title time to reverse before the next one focuses in at the same place. */
  demo: {
    keys: [
      [0, 0],
      [2.6, 0],
      [6.0, 0.45],
      [9.4, 0.676],
      [10.8, 0.676],
      [12.0, 0.79],
      [13.0, 0.79],
      [14.0, 1],
    ] as [number, number][],
  },

  performance: {
    dpr: [1, 1.5] as [number, number],
    lowDpr: 1,
    /** Drawing-buffer budget in device pixels: the pixel ratio is lowered (once, at start) so large or
     *  high-density screens never shade more than this. 1440 × 900 → ≈1.3, 1920 × 1080 → ≈1.07. */
    pixelBudget: 2_200_000,
  },
} as const

export type Config = typeof config

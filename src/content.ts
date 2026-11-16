/** Every line of interface copy. The keycap phrase and anagram live in config.phrase. */
export const content = {
  brand: 'NOVERBA',
  label: 'AN EXPERIMENT IN LANGUAGE — 001',
  phases: [
    ['01', '— Activation'],
    ['02', '— Decoding'],
    ['03', '— Disassembly'],
    ['04', '— Reconstruction'],
    ['05', '— Make it real'],
    ['06', '— Material'],
  ] as [string, string][],
  hero: {
    title: 'Everything begins\nwith a word.',
    text: 'A sphere of unspoken keys, suspended in cold silence, waiting for the first letter to be pressed.',
    hint: 'Scroll to decode ↓',
  },
  final: {
    text: 'Each key returns to its place. What was never said assembles itself into something you can hold.',
    line1: 'Thoughts become words.',
    line2: 'Words become reality.',
  },
  material: {
    text: 'The same keys, rearranged. What we leave unsaid is made of the very same matter as what we say.',
    title: 'Words are material.',
    restart: 'Restart experience ↗',
  },
  loading: 'Loading',

  /** The case study below the experience: a reference page for the concept. */
  caseStudy: {
    eyebrow: 'Case study — 001',
    title: 'An experiment\nin language.',
    intro:
      'NOVERBA is a concept study about the moment before speaking. A sphere of keycaps holds every word that has not been said yet — scrolling decodes it, breaks it apart and rebuilds it into language.',
    meta: [
      ['Type', 'Concept study'],
      ['Format', 'Interactive WebGL experience'],
      ['Disciplines', 'Creative development, real-time 3D, motion'],
      ['Platforms', 'Desktop and mobile browsers'],
      ['Year', '2026'],
    ] as [string, string][],
    idea: {
      label: 'The idea',
      title: 'Words begin as material.',
      paragraphs: [
        'Every key on the sphere carries its own legend. At rest it is a closed, quiet object floating over a cold valley — a keyboard nobody has touched yet. The cursor is the first hand on it: the keys under it give way in a soft wave.',
        'Scrolling turns the object into a story. A core of light ignites inside, the rings spin up and leave one by one, and ten keys stay behind to spell a sentence. Further down, the same keys rearrange themselves into a single word: what we say and what we leave unsaid are made of the same matter.',
      ],
    },
    phases: {
      label: 'The sequence',
      title: 'Six phases, one scroll.',
      items: [
        ['01', 'Activation', 'The sphere wakes up. Rings begin to turn, and the keys under the cursor answer in a soft, travelling wave.'],
        ['02', 'Decoding', 'The rings spin up and spread apart while a cold core of light ignites inside the hollow sphere.'],
        ['03', 'Disassembly', 'Outer rings first, the sphere breaks up ring by ring along cones — no ring ever passes through another.'],
        ['04', 'Reconstruction', 'Ten keys sink into the hollow centre and open out into a phrase, lit from the upper left.'],
        ['05', 'Make it real', 'The cursor becomes a small sphere of light with a smoky trail that lights and tilts the keys.'],
        ['06', 'Material', 'The same keys re-spell themselves. Under the cursor they turn to dark glass and reveal their wireframe.'],
      ] as [string, string, string][],
    },
    system: {
      label: 'Design system',
      title: 'Swiss interface, cold light.',
      text: 'A minimal grid anchored to the window edges keeps the interface quiet, so the object carries the page. One extended display face, one text face, one palette shared by the interface and the 3D scene.',
      typeDisplay: ['Archivo', 'Extended 125 % · display, titles, counter'],
      typeText: ['Inter', 'Variable · labels, body copy, micro type'],
      keys: 'NOVERBA',
      palette: [
        ['Night', '#050A22'],
        ['Fog', '#3A57A6'],
        ['Breach', '#C4DCFF'],
        ['Core', '#8EC5FF'],
        ['Wire', '#3D7BFF'],
        ['Snow', '#9CB6F0'],
        ['Ink', '#E8EEF0'],
      ] as [string, string][],
    },
    tech: {
      label: 'Under the hood',
      title: 'Built for the browser.',
      text: 'No video, no pre-rendered frames. Every key’s pose is a pure function of the scroll position, so scrolling back always rebuilds the perfect sphere — and the whole scene is generated on the device.',
      stats: [
        ['77', 'keycaps, drawn in two instanced calls'],
        ['11', 'screens of scroll on one pinned timeline'],
        ['0', 'downloaded textures — valley, mountains, sky and legends are generated in code'],
        ['6', 'phases, fully reversible in both directions'],
      ] as [string, string][],
      stack: [
        ['Rendering', 'three.js · React Three Fiber'],
        ['Post', 'God rays · bloom · ACES filmic · grade · SMAA'],
        ['Motion', 'GSAP ScrollTrigger · custom springs'],
        ['Shaders', 'Terrain · sky · aurora · height fog · smoke trail'],
        ['Build', 'React 19 · TypeScript · Vite'],
      ] as [string, string][],
    },
    closing: {
      title: 'Words become reality.',
      text: 'This page is a live reference for scroll-driven, real-time 3D storytelling — an idea told with an object instead of a slideshow.',
      cta: 'Start a project ↗',
      ctaHref: 'https://monarchdigital.xyz',
      replay: 'Replay experience ↑',
    },
    footer: {
      credit: 'A concept study by Monarch Digital',
      year: '© 2026',
    },
  },
}

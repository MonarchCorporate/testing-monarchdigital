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
}

export const icon = (name: string, size = 18) => {
  const paths: Record<string,string> = {
    orbit:'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="10" ry="5" transform="rotate(-35 12 12)"/>',
    reset:'<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>',
    grid:'<path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    sliders:'<path d="M5 3v8m0 4v6M12 3v3m0 4v11M19 3v11m0 4v3"/><path d="M2 11h6v4H2zM9 6h6v4H9zM16 14h6v4h-6z"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 7v.1"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
    play:'<path d="m8 4 12 8-12 8z"/>',
    pause:'<path d="M8 4v16M16 4v16"/>',
    arrow:'<path d="m9 5 7 7-7 7"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    minus:'<path d="M5 12h14"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.info}</svg>`;
};
export function garmentIcon(id: string) {
  const paths: Record<string,string> = {
    'fitted-tee':'M25 14 13 20 5 34 17 41 23 32 23 65 57 65 57 32 63 41 75 34 67 20 55 14Q40 24 25 14Z',
    'oversized-tee':'M24 13 11 18 3 39 20 45 23 36 20 67 60 67 57 36 60 45 77 39 69 18 56 13Q40 24 24 13Z',
    hoodie:'M28 17Q27 2 40 3Q53 2 52 17L65 23 75 63 63 67 55 40 57 69 23 69 25 40 17 67 5 63 15 23Z M28 17Q40 29 52 17 M29 51 25 61H55L51 51Z',
    trousers:'M22 10H58L61 69H44L40 31 36 69H19Z M22 16H58 M40 16V29',
    skirt:'M28 13H52L69 67Q40 74 11 67Z M27 20H53 M31 28 25 63 M49 28 55 63',
    jacket:'M28 13 14 20 3 63 16 67 25 37 22 67 37 69 40 28 43 69 58 67 55 37 64 67 77 63 66 20 52 13 40 20Z M28 13 33 30 40 20 47 30 52 13',
  };
  return `<svg viewBox="0 0 80 80" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true"><path d="${paths[id]}"/></svg>`;
}

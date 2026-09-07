/** The only source of visual values used by the navigator UI. */
export const Palette = {
  ink: '#07182f', inkSoft: '#0b2343', surface: '#102c50', surfaceRaised: '#183a65',
  surfaceMuted: '#214875', border: '#49729b', text: '#f7fbff', textMuted: '#b4c8dc',
  blue: '#4b8cff', blueBright: '#5ca7ff', violet: '#7b5cff', aqua: '#43d5d0',
  aquaSoft: '#185c73', success: '#58e0bf', warning: '#ffc85a', danger: '#f65d82',
  overlay: 'rgba(3, 17, 36, 0.73)', transparent: 'transparent', white: '#ffffff',
} as const;
export const Space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40 } as const;
export const Radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;

import { defineConfig, presetAttributify, presetWind4 } from 'unocss'

export default defineConfig({
  // ...UnoCSS options
  presets: [
    presetAttributify({
      /* preset options */
    }),
    presetWind4(),
    // ...custom presets
  ],
})

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const contracts = {
  map: `<!--
THESIS: Need Momentum turns physical presence and digital demand into one connected growth map.
OWN-WORLD: Orbital cartography, a black cosmic stage, one luminous Earth, cobalt routes, signal yellow decisions, exact brand assets.
STORY: Arrive at the map; connect the growth system; enter the service atlas; see real-world proof; meet the founders; request the audit.
FIRST VIEWPORT: A cinematic Earth limb and glass navigation globe dominate. Headline: Put Your Business on the Map. One yellow audit action.
FORM: Experiential editorial homepage. seed-key: need-momentum-map-atlas-20260803
FINISH: This must feel authored, not assembled. If it could ship unchanged for another agency, it is not finished.
-->`,
  signal: `<!--
THESIS: Need Momentum makes the signal around a business impossible to ignore.
OWN-WORLD: A kinetic field of cobalt and yellow particles, liquid lenses, swipe rails, dissolving real photography, sharp editorial type.
STORY: Feel the signal; swipe through one connected system; watch work materialize; enter Momentum 360; meet Mac and Sean; request the audit.
FIRST VIEWPORT: A giant responsive particle mark pushes through glass while the promise stays still and readable. One yellow audit action.
FORM: Experiential editorial homepage. seed-key: need-momentum-signal-field-20260803
FINISH: This must feel authored, not assembled. If it could ship unchanged for another agency, it is not finished.
-->`
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const concept = env.VITE_CONCEPT === 'map' ? 'map' : 'signal';
  return {
    plugins: [
      react(),
      {
        name: 'direction-contract',
        transformIndexHtml(html) {
          return html.replace('<!-- DIRECTION_CONTRACT -->', contracts[concept]);
        }
      }
    ],
    build: { sourcemap: true, chunkSizeWarningLimit: 1100 }
  };
});

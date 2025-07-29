import { definePlugin } from 'sanity';

import { lottieType } from './lottieType';

/**
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LottiePreviewConfig {
  // Future configuration options can be added here
}

/**
 * Usage in `sanity.config.ts` (or .js)
 *
 * ```ts
 * import {defineConfig} from 'sanity'
 * import {lottiePreview} from 'sanity-plugin-lottie-preview'
 *
 * export default defineConfig({
 *   // ...
 *   plugins: [lottiePreview()],
 * })
 * ```
 */
/**
 * @public
 */
export const lottiePreview = definePlugin<LottiePreviewConfig | void>(() => {
  return {
    name: 'sanity-plugin-lottie',
    schema: {
      types: [lottieType],
    },
  };
});

export { LottieInput } from './LottieInput';

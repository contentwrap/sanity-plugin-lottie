import { definePlugin } from 'sanity';

import { lottieType } from './lottieType';

/**
 * @public
 */
export interface LottiePreviewConfig {}

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
export const lottiePreview = definePlugin<LottiePreviewConfig | void>(
  (config = {}) => {
    return {
      name: 'sanity-plugin-lottie-preview',
      schema: {
        types: [lottieType],
      },
    };
  },
);

export { LottieInput } from './LottieInput';

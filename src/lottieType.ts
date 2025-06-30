import { defineType } from 'sanity';

import { LottieInput } from './LottieInput';

export const lottieType = defineType({
  name: 'lottie',
  title: 'Lottie',
  type: 'file',
  components: {
    input: LottieInput,
  },
  options: {
    accept: '.json',
  },
});

import { type JSX } from 'react';
import { FileInput, FileValue, ObjectInputProps } from 'sanity';

import { LottiePreview } from './LottiePreview';

interface LottieInputProps extends ObjectInputProps<FileValue> {
  assetSources?: any[];
  setSelectedAssetSource?: (assetSource: any) => void;
}

/**
 * @public
 */
export const LottieInput = (props: LottieInputProps): JSX.Element => {
  const value = props.value;

  return (
    <div>
      <FileInput {...props} />
      {value?.asset && <LottiePreview value={value} />}
    </div>
  );
};

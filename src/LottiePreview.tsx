import { Player } from '@lottiefiles/react-lottie-player';
import { SpinnerIcon, WarningOutlineIcon } from '@sanity/icons';
import { Box, Card, Flex, Stack, Text, useTheme } from '@sanity/ui';
import React, { useEffect, useState, useRef } from 'react';
import { useClient } from 'sanity';
import styled from 'styled-components';

const PlayerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 220px;
  box-sizing: border-box;
  overflow: hidden;

  display: flex;
  justify-content: center;
  align-items: center;

  border: 1px solid var(--card-border-color);
  border-top: none;

  background-image:
    linear-gradient(45deg, var(--svg-bg-color) 25%, transparent 25%),
    linear-gradient(-45deg, var(--svg-bg-color) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--svg-bg-color) 75%),
    linear-gradient(-45deg, transparent 75%, var(--svg-bg-color) 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0;

  &:focus-within {
    border-color: var(--card-focus-ring-color);
  }

  --svg-bg-color: rgba(23, 23, 23, 0.05);
  &.dark {
    --svg-bg-color: rgb(255, 255, 255, 0.1);
  }

  // Ensure any SVG/canvas inside the Lottie Player scales to fit
  & > div,
  svg,
  canvas {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain !important;
    display: block;
  }
`;

const SpinningIcon = styled.span`
  display: inline-block;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export function LottiePreview({
  value,
  onError,
}: {
  value: any;
  onError?: (err: string) => void;
}) {
  const client = useClient({ apiVersion: '2023-01-01' });
  const theme = useTheme();
  const scheme = theme?.sanity?.color?.dark ? 'dark' : 'light';

  const [lottieData, setLottieData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [totalFrames, setTotalFrames] = useState<number>(0);
  const [frameRate, setFrameRate] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assetReady, setAssetReady] = useState(false);
  const errorRef = useRef<string | null>(null);

  useEffect(() => {
    async function fetchAssetAndLottie() {
      setLottieData(null);
      setError(null);
      setDuration(null);
      setTotalFrames(0);
      setFrameRate(null);

      let asset = value?.asset;
      if (!asset) return;
      // Fetch asset metadata if needed
      if (
        asset._ref &&
        (!asset.url || !asset.originalFilename || !asset.size)
      ) {
        const assetDoc = await client.fetch(
          `*[_type == "sanity.fileAsset" && _id == $id][0]{url,originalFilename,size}`,
          { id: asset._ref },
        );
        if (!assetDoc) {
          setIsProcessing(true);
          return;
        }
        asset = { ...asset, ...assetDoc };
      }

      if (!asset.url) {
        setError('No file URL');
        return;
      }
      try {
        const res = await fetch(asset.url);
        if (!res.ok) throw new Error('Failed to fetch Lottie file');
        const json = await res.json();
        setLottieData(json);

        // Extract metadata
        const fr = json.fr || 30;
        const inPoint = json.ip || 0;
        const outPoint = json.op || 0;
        const totalFrameCount = outPoint - inPoint;
        const animDuration = totalFrameCount / fr;

        setFrameRate(fr);
        setTotalFrames(totalFrameCount);
        setDuration(animDuration);
      } catch (e) {
        if (asset?.size === 0) {
          setError('File is empty. Please upload a valid .json Lottie file.');
        } else {
          setError('Not a valid Lottie file');
        }
      }
    }
    fetchAssetAndLottie();
  }, [value, client, assetReady]);

  useEffect(() => {
    let isMounted = true;
    let pollTimeout: NodeJS.Timeout | null = null;

    async function pollForAsset() {
      setIsProcessing(true);
      let attempts = 0;
      while (attempts < 10 && isMounted) {
        // Try to fetch asset metadata
        const assetDoc = await client.fetch(
          `*[_type == "sanity.fileAsset" && _id == $id][0]{url,originalFilename,size}`,
          { id: value?.asset?._ref },
        );
        if (assetDoc) {
          setIsProcessing(false);
          setError(null);
          setAssetReady((r) => !r); // Toggle to trigger fetch
          return;
        }
        // Wait 500ms before next attempt
        await new Promise((res) => (pollTimeout = setTimeout(res, 200)));
        attempts++;
      }
      if (isMounted) {
        setIsProcessing(false);
        setError('Asset not found');
      }
    }

    if (value?.asset?._ref && !value?.asset?.url) {
      setError(null); // Clear error while polling
      pollForAsset();
    }

    return () => {
      isMounted = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [value?.asset?._ref]);

  // Notify parent of error
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  if (error) {
    return (
      <Card tone="critical" padding={4} border radius={0}>
        <Flex gap={3} align="center">
          <Box>
            <Text size={1}>
              <WarningOutlineIcon />
            </Text>
          </Box>
          <Text size={1} weight="medium">
            {error}
          </Text>
        </Flex>
      </Card>
    );
  }

  if (isProcessing) {
    return (
      <Card tone="default" padding={4} border radius={0}>
        <Flex gap={3} align="center">
          <Box>
            <Text size={1}>
              <SpinningIcon>
                <SpinnerIcon />
              </SpinningIcon>
            </Text>
          </Box>
          <Text size={1}>Processing upload...</Text>
        </Flex>
      </Card>
    );
  }

  return (
    <div>
      <PlayerContainer className={scheme}>
        <Player
          src={lottieData}
          autoplay
          loop
          onEvent={(event) => {
            if (event === 'error') {
              setError(
                'Not a valid Lottie file. Please upload a .json Lottie file.',
              );
            } else if (errorRef.current !== null) {
              setError(null);
            }
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </PlayerContainer>
      <Flex gap={4} justify="center" wrap="wrap" style={{ marginTop: 16 }}>
        {duration !== null && (
          <Stack space={2} style={{ textAlign: 'center', minWidth: '60px' }}>
            <Text size={1} muted>
              Duration
            </Text>
            <Text size={1} weight="semibold">
              {duration.toFixed(2)}s
            </Text>
          </Stack>
        )}
        {totalFrames > 0 && (
          <Stack space={2} style={{ textAlign: 'center', minWidth: '80px' }}>
            <Text size={1} muted>
              Frames
            </Text>
            <Text size={1} weight="semibold">
              {totalFrames.toFixed(2)}
            </Text>
          </Stack>
        )}
        {frameRate && (
          <Stack space={2} style={{ textAlign: 'center', minWidth: '80px' }}>
            <Text size={1} muted>
              Frame Rate
            </Text>
            <Text size={1} weight="semibold">
              {frameRate.toFixed(2)} fps
            </Text>
          </Stack>
        )}
      </Flex>
    </div>
  );
}

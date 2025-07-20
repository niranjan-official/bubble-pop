import { useEffect, useRef, useState } from 'react';
import { loadFistModel, preprocessLandmarks } from '../utils/modelUtils';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@tensorflow/tfjs-backend-webgl';

const SMOOTHING_HISTORY = 10;
const FIST_THRESHOLD = 0.7;

export function useFistDetection(videoRef: React.RefObject<HTMLVideoElement>) {
  const [status, setStatus] = useState<{ detected: boolean; confidence: number }>({ detected: false, confidence: 0 });
  const modelRef = useRef<any>(null);
  const detectorRef = useRef<any>(null);
  const detectionHistory = useRef<number[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    let isMounted = true;
    async function setup() {
      try {
        modelRef.current = await loadFistModel();
      } catch (e) {
        console.error('[FistDetection] Error loading model:', e);
      }
      try {
        detectorRef.current = await handPoseDetection.createDetector(
          handPoseDetection.SupportedModels.MediaPipeHands,
          {
            runtime: 'tfjs',
            modelType: 'lite',
            maxHands: 1,
          }
        );
      } catch (e) {
        console.error('[FistDetection] Error loading MediaPipe Hands:', e);
      }
    }
    setup();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let stopped = false;
    async function detect() {
      if (!videoRef.current || !modelRef.current || !detectorRef.current) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }
      const video = videoRef.current;
      if (video.readyState < 2) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }
      const hands = await detectorRef.current.estimateHands(video, { flipHorizontal: true });
      if (hands.length > 0 && hands[0].keypoints) {
      }
      let detected = false;
      let confidence = 0;
      if (hands.length > 0 && hands[0].keypoints) {
        const landmarks = hands[0].keypoints.slice(0, 21).map(({ x, y }: any) => ({ x, y }));
        const input = preprocessLandmarks(landmarks);
        const prediction = await modelRef.current.predict(input).data();
        const fistProb = prediction[1];
        detectionHistory.current.push(fistProb);
        if (detectionHistory.current.length > SMOOTHING_HISTORY) {
          detectionHistory.current.shift();
        }
        const smoothed = detectionHistory.current.reduce((a, b) => a + b, 0) / detectionHistory.current.length;
        confidence = smoothed;
        detected = smoothed > FIST_THRESHOLD;
      } else {
        detectionHistory.current = [];
      }
      setStatus({ detected, confidence });
      if (!stopped) animationRef.current = requestAnimationFrame(detect);
    }
    animationRef.current = requestAnimationFrame(detect);
    return () => {
      stopped = true;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [videoRef]);

  return status;
}

import React, { useRef } from 'react';
import CameraFeed from './CameraFeed';
import DetectionStatus from './DetectionStatus';
import { useFistDetection } from '../../hooks/useFistDetection'; 

const FistDetector = () => {
  const videoRef = useRef(null);
  const { detected, confidence } = useFistDetection(videoRef);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}>
      <CameraFeed ref={videoRef} width={400} height={300} />
      <DetectionStatus detected={detected} confidence={confidence} />
    </div>
  );
};

export default FistDetector;

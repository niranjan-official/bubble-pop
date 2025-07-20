import React, { useEffect, useState } from 'react';

interface CameraFeedProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const CameraFeed = React.forwardRef<HTMLVideoElement, CameraFeedProps>((props, ref) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      if (ref && 'current' in ref && ref.current) {
        try {
          const constraints = {
            video: {
              facingMode: 'user',
              width: { ideal: Math.max(props.width || 320, 320) },
              height: { ideal: Math.max(props.height || 240, 240) },
            }
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          ref.current.srcObject = stream;
          setError(null);
        } catch (err: any) {
          console.error('Error accessing webcam:', err);
          setError('Unable to access camera. Please check browser permissions and HTTPS.');
        }
      }
    }
    setupCamera();
    return () => {
      if (ref && 'current' in ref && ref.current && ref.current.srcObject) {
        (ref.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [ref, props.width, props.height]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        width={props.width || 400}
        height={props.height || 300}
        style={{ borderRadius: 8, background: '#222', ...(props.style || {}) }}
      />
      {error && (
        <div style={{ color: '#f87171', fontSize: 13, marginTop: 6, textAlign: 'center', maxWidth: 220 }}>
          {error}
        </div>
      )}
    </div>
  );
});

export default CameraFeed; 
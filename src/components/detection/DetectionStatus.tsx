import React from 'react';

interface DetectionStatusProps {
  detected: boolean;
  confidence: number;
}

const DetectionStatus: React.FC<DetectionStatusProps> = ({ detected, confidence }) => {
  let color = '#888';
  let status = 'No Hand';
  if (confidence > 0) {
    if (detected) {
      color = '#22c55e'; // green-500
      status = 'Fist Detected';
    } else {
      color = '#ef4444'; // red-500
      status = 'No Fist';
    }
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(20,20,20,0.85)',
        borderRadius: 8,
        padding: '6px 12px',
        marginTop: 8,
        minWidth: 0,
        fontSize: 14,
        fontWeight: 500,
        color: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
      }}
    >
      <span style={{
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: color,
        marginRight: 8,
        border: '1.5px solid #fff',
      }} />
      <span>{status}</span>
      {confidence > 0 && (
        <span style={{ color: '#aaa', fontSize: 12, marginLeft: 8 }}>
          {(confidence * 100).toFixed(0)}%
        </span>
      )}
    </div>
  );
};

export default DetectionStatus;

import * as tf from '@tensorflow/tfjs';

// Load the TensorFlow.js model from public/models/model.json
export async function loadFistModel(): Promise<tf.LayersModel> {
  const model = await tf.loadLayersModel('/models/model.json');
  return model;
}

// Preprocess landmarks: flatten, pad/truncate to 21 points, shape [1, 42, 1]
export function preprocessLandmarks(
  landmarks: { x: number; y: number }[],
  maxLandmarks = 21
): tf.Tensor {
  // landmarks: array of {x, y}
  let landmarkList: [number, number][] = landmarks.map(lm => [lm.x, lm.y]);

  if (landmarkList.length > maxLandmarks) {
    landmarkList = landmarkList.slice(0, maxLandmarks);
  } else if (landmarkList.length < maxLandmarks) {
    const pad: [number, number][] = Array(maxLandmarks - landmarkList.length).fill([0, 0]);
    landmarkList = landmarkList.concat(pad);
  }

  // Flatten
  const flat = landmarkList.flat();
  // Convert to tensor and reshape to [1, 42, 1]
  return tf.tensor(flat, [1, maxLandmarks * 2, 1]);
}

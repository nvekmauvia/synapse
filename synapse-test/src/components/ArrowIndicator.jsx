import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const ArrowIndicator = () => {
  const arrowRef = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (!arrowRef.current) return;

    // Get the camera's forward direction
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    // Calculate offset from the camera in the direction it's facing
    // Adjust these values to position the arrow relative to the camera's viewport
    const distance = 5; // Distance in front of the camera
    const leftOffset = -1.8; // Offset to the left of the camera's direction
    const downOffset = -0.8; // Offset below the camera's direction

    // Calculate left vector (perpendicular to the up vector and direction)
    const left = new THREE.Vector3().crossVectors(camera.up, direction).normalize().multiplyScalar(leftOffset);
    
    // Calculate up vector (no need for recalculation, just use camera's up vector)
    const up = new THREE.Vector3().copy(camera.up).multiplyScalar(downOffset);
    
    // Combine direction, left, and up offsets
    const offset = new THREE.Vector3().addVectors(left, up).add(direction.multiplyScalar(distance));

    // Apply the calculated position to the arrow mesh (relative to the camera's position)
    arrowRef.current.position.copy(camera.position).add(offset);
    arrowRef.current.rotation.z = -Math.PI / 2;

  });

  return (
    <mesh ref={arrowRef}>
      <coneGeometry args={[0.05, 0.3, 10]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
};

export default ArrowIndicator;

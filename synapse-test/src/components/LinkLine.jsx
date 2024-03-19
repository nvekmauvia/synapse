import React, { useMemo, useState, useRef } from 'react';
import { Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useNotes } from '../context/NotesContext';

export const LinkLine = ({ start, end, linkId }) => {
  const meshRef = useRef();
  const [isHovered, setIsHovered] = useState(false); // State to track hover

  const {
    setSelectedLink,
    selectedLink,
    setClickedNote
  } = useNotes()

  const orientation = useMemo(() => {
    // Vector pointing from start to end
    const direction = new THREE.Vector3().subVectors(end, start);
    // Midpoint for the cylinder's position
    const midPoint = new THREE.Vector3().addVectors(start, direction.multiplyScalar(0.5));
    // Length of the cylinder
    const length = start.distanceTo(end);
    // Quaternion for the cylinder's rotation
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );

    return { midPoint, length, quaternion };
  }, [start, end]);

  const onClick = (event) => {
    event.stopPropagation();
    setSelectedLink(linkId)
    setClickedNote(true)
    console.log(linkId)
  };

  useFrame(() => {
    if (meshRef.current) {
      const materialColor = meshRef.current.material.color; // Directly reference the material's color
      const startColor = new THREE.Color("#555");
      const endColor = new THREE.Color("#ffa500");
      const selectedColor = new THREE.Color("red");

      const isSelected = selectedLink === linkId

      if (isHovered) {
        materialColor.lerp(endColor, 0.8); // Interpolate towards endColor when hovered
      } else {
        materialColor.lerp(startColor, 0.1); // Interpolate towards startColor when not hovered
      }
      if (isSelected) {
        materialColor.lerp(selectedColor, 0.8); // Interpolate towards endColor when hovered
      }
    }
  });

  return (
    <Cylinder
      ref={meshRef}
      args={[0.02, 0.02, orientation.length, 8]} // Adjust the radius and segment count as needed
      position={orientation.midPoint}
      quaternion={orientation.quaternion}
      onPointerEnter={(e) => setIsHovered(true)}
      onPointerLeave={(e) => setIsHovered(false)}
      onClick={onClick}
    >
      <meshStandardMaterial attach="material" color="white" transparent="false" />
    </Cylinder>
  );
};

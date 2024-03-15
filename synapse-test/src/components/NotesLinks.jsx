import React, { useMemo, useState, useRef } from 'react';
import { Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import { useNotes } from '../context/NotesContext'; // Adjust import path as needed
import { useFrame } from '@react-three/fiber';

const LinkLine = ({ start, end }) => {
  const meshRef = useRef();
  const [isHovered, setIsHovered] = useState(false); // State to track hover

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

  useFrame(() => {
    if (meshRef.current) {
      const materialColor = meshRef.current.material.color; // Directly reference the material's color
      const startColor = new THREE.Color("#555");
      const endColor = new THREE.Color("#ffa500");

      if (isHovered) {
        materialColor.lerp(endColor, 0.8); // Interpolate towards endColor when hovered
      } else {
        materialColor.lerp(startColor, 0.1); // Interpolate towards startColor when not hovered
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
    >
      <meshStandardMaterial attach="material" color="white" transparent="false" />
    </Cylinder>
  );
};

const NotesLinks = () => {
  const { notes } = useNotes();

  // Assuming each note has a `position` object and optionally `downstream` array
  return (
    <>
      {notes.map(note => (
        note.downstream.map(downstreamId => {
          const downstreamNote = notes.find(n => n.id === downstreamId);
          if (!downstreamNote) return null; // In case the downstream note isn't found

          const startPosition = new THREE.Vector3().copy(note.position);
          const endPosition = new THREE.Vector3().copy(downstreamNote.position);

          // Adjust start and end positions to account for connections starting and ending at the edges of the notes
          startPosition.x += 0.5; // Assuming the note's width is 1 unit
          endPosition.x -= 0.5;

          return <LinkLine key={`${note.id}-${downstreamId}`} start={startPosition} end={endPosition} />;
        })
      ))}
    </>
  );
};


export default NotesLinks
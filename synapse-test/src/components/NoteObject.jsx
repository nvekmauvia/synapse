import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Plane, Html } from '@react-three/drei';
import { DoubleSide } from 'three';
import { useNotes } from '../context/NotesContext';

const NoteObject = ({ position, noteReference }) => {
  const meshRef = useRef();
  const { camera } = useThree(); // Access the Three.js camera from the react-three-fiber context
  const [isHovered, setIsHovered] = useState(false); // State to track hover
  const [isInputHovered, setInputHovered] = useState(false); // State to track hover
  const [inputScale, setInputScale] = useState(1);
  const { notes, setNotes } = useNotes()

  useFrame(({ camera }) => {
    meshRef.current.rotation.copy(camera.rotation);

    const distance = meshRef.current.position.distanceTo(camera.position);

    // Adjust scale based on distance (you might need to tweak the formula to fit your needs)
    const scaleAdjustment = Math.min(Math.max(10 / distance, 0.5), 20); // Example adjustment, tweak as needed
    setInputScale(scaleAdjustment);
  });

  const onChangeText = (e) => {
    //setText(e.target.value)

    noteReference.initialText = e.target.value
    setNotes(notes.map(note => note.id === noteReference.id ? { ...note, initialText: noteReference.initialText } : note));
  }

  return (
    <mesh
      position={position}
      ref={meshRef}
      onPointerOver={(e) => setIsHovered(true)}
      onPointerOut={(e) => {
        if (!isInputHovered) {
          setIsHovered(false)
        }
      }
      }
    >
      <Plane args={[1, 1]}>
        <meshBasicMaterial color="#fff" side={DoubleSide} transparent={true} opacity={0.8} />
      </Plane>
      {isHovered ?
        (<Html scaleFactor={10}>
          <textarea
            style={{
              width: '100px',
              height: '50px',
              transformOrigin: 'right top',
              resize: 'none',
            }}
            type="text"
            value={noteReference.initialText}
            onChange={onChangeText}
            onMouseEnter={() => {
              setInputHovered(true)
            }
            }
            onMouseLeave={() => {
              setInputHovered(false)
            }}
            autoFocus
          />
        </Html>
        ) : (
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.1}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {noteReference.initialText}
          </Text>
        )}
    </mesh>
  );
}

export default NoteObject
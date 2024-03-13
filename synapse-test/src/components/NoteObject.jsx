import React, { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Plane, Html } from '@react-three/drei';
import * as THREE from 'three';
import { DoubleSide } from 'three';
import { useNotes } from '../context/NotesContext';

const NoteObject = ({ position, noteReference }) => {
  const meshRef = useRef();
  const { camera, gl, pointer } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [meshColor, setMeshColor] = useState(new THREE.Color("#ffa500"));
  const [isHovered, setIsHovered] = useState(false); // State to track hover
  const [isInputHovered, setInputHovered] = useState(false); // State to track hover
  const [inputScale, setInputScale] = useState(1);
  const { notes, setNotes, setDraggingNote, setEditingNote, setMovingTimer } = useNotes()
  const planeRef = useRef(new THREE.Plane());
  const raycaster = new THREE.Raycaster();
  const [offset, setOffset] = useState(new THREE.Vector3());

  const startColor = new THREE.Color("#fff");
  const endColor = new THREE.Color("#ffa500");

  useFrame(({ camera }) => {
    meshRef.current.rotation.copy(camera.rotation);

    const distance = meshRef.current.position.distanceTo(camera.position);

    // Adjust scale based on distance (you might need to tweak the formula to fit your needs)
    const scaleAdjustment = Math.min(Math.max(10 / distance, 0.5), 20); // Example adjustment, tweak as needed
    setInputScale(scaleAdjustment);
  });

  const startDragging = useCallback((event) => {
    setIsDragging(true);
    event.stopPropagation();

    window.addEventListener('mouseup', stopDraggingGlobal, { once: true });

    // Calculate and set the drag plane
    const dragPlaneNormal = camera.getWorldDirection(new THREE.Vector3());
    planeRef.current.setFromNormalAndCoplanarPoint(dragPlaneNormal, meshRef.current.position);

    // Calculate the intersection with the drag plane as the drag start point
    raycaster.setFromCamera(pointer, camera);
    const intersection = raycaster.ray.intersectPlane(planeRef.current, new THREE.Vector3());

    if (intersection) {
      // Calculate the offset from the intersection point to the note's position
      const offset = new THREE.Vector3().subVectors(meshRef.current.position, intersection);
      setOffset(offset); // Store this offset
    }

    setDraggingNote(noteReference);
  }, [camera, pointer, raycaster, noteReference]);

  const stopDraggingGlobal = useCallback(() => {
    stopDragging();
  }, []);

  const stopDragging = useCallback(() => {
    setIsDragging(false);
    setDraggingNote(false);
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteReference.id ? { ...note, position: meshRef.current.position.clone() } : note
      ))
    setOffset(new THREE.Vector3());
  }, []);

  const dragNote = useFrame(() => {
    if (!isDragging || !offset) return;

    raycaster.setFromCamera(pointer, camera); // Use pointer directly from useThree
    const intersection = raycaster.ray.intersectPlane(planeRef.current, new THREE.Vector3());
    if (intersection) {
      intersection.add(offset);
      meshRef.current.position.copy(intersection);
      //console.log(noteReference.position.x)
      setMovingTimer(0)
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === noteReference.id
            ? { ...note, position: intersection, endPosition: intersection }
            : note
        )
      );
    }
  }, [camera, isDragging, pointer, setNotes, noteReference.id, raycaster]);


  const onChangeText = (e) => {
    const updatedValue = e.target.value;
    // Create a new array with updated note without mutating the original noteReference
    setNotes(notes.map(note => note.id === noteReference.id ? { ...note, initialText: updatedValue } : note));
  }

  const onClick = (e) => {
    setEditingNote(noteReference)
  }

  useFrame(() => {
    if (meshRef.current) {
      const materialColor = meshRef.current.children[0].material.color; // Directly reference the material's color
      if (isHovered || isDragging) {
        materialColor.lerp(endColor, 0.8); // Interpolate towards endColor when hovered
      } else {
        materialColor.lerp(startColor, 0.1); // Interpolate towards startColor when not hovered
      }
    }
  });

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
      onDoubleClick={onClick}
      //onClick={onClick}
      onPointerDown={startDragging}
      onPointerUp={stopDragging}
      onPointerMove={dragNote}
    >
      <Plane args={[1, 1]}>
        <meshBasicMaterial color={meshColor} side={DoubleSide} transparent={true} opacity={0.8} />
      </Plane>
      {false ?
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
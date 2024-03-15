import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Plane, Html } from '@react-three/drei';
import * as THREE from 'three';
import { DoubleSide } from 'three';
import { useInput } from '../context/InputContext';
import { useNotes } from '../context/NotesContext';
import { useEditNoteText } from '../utils/hooks';

const NoteObject = ({ position, noteReference }) => {
  const meshRef = useRef();
  const { camera, gl, pointer } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [meshColor, setMeshColor] = useState(new THREE.Color("#ffa500"));
  const [isInputHovered, setInputHovered] = useState(false); // State to track hover
  const {
    setNotes,
    setDraggingNote,
    editingNote,
    setEditingNote,
    setMovingTimer,
    setClickedNote,
  } = useNotes()
  const {
    hoveredNote
  } = useInput()
  const planeRef = useRef(new THREE.Plane());
  const raycaster = new THREE.Raycaster();
  const [offset, setOffset] = useState(new THREE.Vector3());
  const [localText, setLocalText] = useState(noteReference.initialText);
  const textAreaRef = useRef(null);

  // Assign the noteReference to the mesh object for identification in the raycaster
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.children[0].userData.noteReferenceId = noteReference.id;
    }
  }, [noteReference.id]);

  useFrame(({ camera }) => {
    meshRef.current.rotation.copy(camera.rotation);
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
      setOffset(offset);
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

  const editNoteText = useEditNoteText()

  const onChangeText = (e) => {
    setLocalText(e.target.value);
    editNoteText(noteReference.id, textAreaRef.current.value);
  }

  const onTextBlur = () => {
    if (textAreaRef.current) {
      editNoteText(noteReference.id, textAreaRef.current.value);
    }
  };

  const onDoubleClick = (event) => {
    event.stopPropagation();
    setClickedNote(noteReference)
    setEditingNote(noteReference)
  }

  const onClick = (event) => {
    event.stopPropagation();
    if (editingNote && noteReference.id === editingNote.id) {
      setClickedNote(noteReference)
    }
  }

  // Update Frame
  useFrame(() => {
    setClickedNote(null)

    if (meshRef.current) {
      const materialColor = meshRef.current.children[0].material.color; // Directly reference the material's color
      const editingColor = new THREE.Color("#fff")
      const startColor = new THREE.Color("#ccc");
      const endColor = new THREE.Color("#ffa500");

      //const meshScale = meshRef.current.meshScale;
      if (editingNote && noteReference.id === editingNote.id) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1); // Scale up when hovered or dragged
        materialColor.lerp(editingColor, 0.8); // Interpolate towards endColor when hovered
        meshRef.current.children[0].material.opacity = 1
      }
      else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1); // Scale up when hovered or dragged
        if (isDragging || hoveredNote && hoveredNote === noteReference.id) {
          materialColor.lerp(endColor, 0.8); // Interpolate towards endColor when hovered
        } else {
          materialColor.lerp(startColor, 0.1); // Interpolate towards startColor when not hovered
        }
        meshRef.current.children[0].material.opacity = 0.7
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onDoubleClick={onDoubleClick}
      onClick={onClick}
      onPointerDown={startDragging}
      onPointerUp={stopDragging}
      onPointerMove={dragNote}
    >
      <Plane args={[1, 1]}>
        <meshBasicMaterial color={meshColor} side={DoubleSide} transparent={true} opacity={0.8} />
      </Plane>
      {editingNote && noteReference.id === editingNote.id ?
        (<Html scaleFactor={10}>
          <div style={{
            display: 'flex',
            justifyContent: 'center', // Center horizontally
            alignItems: 'center', // Center vertically
            width: '100px', // Match the size of your Plane
            height: '100px', // Match the size of your Plane
            //transform: 'translate(-50%, -50%)', // Center the element
            transformOrigin: 'center center', // Origin from the center
          }}>
            <textarea
              ref={textAreaRef}
              style={{
                width: '100px',
                height: '100px',
                transform: 'translate(-50%, -50%)',
                transformOrigin: 'center center',
                resize: 'none',
                textAlign: 'center',
                color: 'black', // This sets the text color to black
                background: 'none', // This makes the background transparent
                border: 'none', // This removes the border
                outline: 'none' // This removes the outline on focus        
              }}
              type="text"
              value={localText}
              onChange={onChangeText}
              //onBlur={onTextBlur}
              onClick={onClick}
              onMouseEnter={() => {
                setInputHovered(true)
              }
              }
              onMouseLeave={() => {
                setInputHovered(false)
              }}
              autoFocus
            />
          </div>
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
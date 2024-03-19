import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Plane, Html } from '@react-three/drei';
import * as THREE from 'three';
import { DoubleSide } from 'three';
import { useInput } from '../context/InputContext';
import { useNotes } from '../context/NotesContext';
import { useEditNoteText } from '../utils/hooks';
import { BoxGeometry, MeshBasicMaterial, Mesh } from 'three';
import LinkButton from './LinkButton';

const NoteObject = ({ position, noteReference }) => {
  const meshRef = useRef();
  const { camera, gl, pointer } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [wasEditing, setWasEditing] = useState(false);

  const [meshColor, setMeshColor] = useState(new THREE.Color("#ffa500"));
  const {
    setNotes,
    setDraggingNote,
    editingNoteId,
    setEditingNoteId,
    setMovingTimer,
    setClickedNote,
    selectedNoteId,
    setSelectedNoteId,
  } = useNotes()
  const {
    hoveredNote,
    hoveredButton
  } = useInput()
  const planeRef = useRef(new THREE.Plane());
  const raycaster = new THREE.Raycaster();
  const [offset, setOffset] = useState(new THREE.Vector3());
  const [localText, setLocalText] = useState(noteReference.text);
  const textAreaRef = useRef(null);
  const editNoteText = useEditNoteText()

  // Assign the noteReference to the mesh object for identification in the raycaster
  useEffect(() => {
    if (meshRef.current) {
      // Main plane
      meshRef.current.children[0].userData.noteReferenceId = noteReference.id;
      console.log(meshRef)
    }
  }, [noteReference.id]);

  const startDragging = useCallback((event) => {
    if (hoveredButton !== null) {
      return;
    }

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

  const onChange = (event) => {
    setLocalText(event.target.value);
  };

  const onDoubleClick = (event) => {
    event.stopPropagation();
    setClickedNote(noteReference)
    setEditingNoteId(noteReference.id)
    setWasEditing(true)
    setSelectedNoteId(noteReference.id)
  }

  const onClick = (event) => {
    event.stopPropagation();
    setTimeout(() => {
      if (editingNoteId && noteReference.id === editingNoteId) {
        setClickedNote(noteReference)
      }
      setSelectedNoteId(noteReference.id);
    }, 0);
  }

  // Select Textarea after editing starts
  useEffect(() => {
    // Delay focusing to the next frame to ensure it has been rendered
    setTimeout(() => {
      // Check if we're editing this specific note and if the textarea ref is set
      if (editingNoteId && noteReference.id === editingNoteId && textAreaRef.current) {
        const textarea = textAreaRef.current;
        textarea.focus();
        // Set caret position to the end of the text
        const length = textarea.value.length;
        textarea.setSelectionRange(length, length);
      }
    }, 1); // Timeout set to 0 ms delays the execution until after the current frame
  }, [editingNoteId, noteReference.id]);

  // Update Frame
  useFrame(() => {
    // Camera billboarding
    meshRef.current.rotation.copy(camera.rotation);

    setClickedNote(null)

    if (wasEditing && editingNoteId === null) {
      editNoteText(noteReference.id, localText);
      setWasEditing(false)
    }

    if (meshRef.current) {
      const materialColor = meshRef.current.children[0].material.color; // Directly reference the material's color
      const editingColor = new THREE.Color("#fff")
      const startColor = new THREE.Color("#ccc");
      const endColor = new THREE.Color("#ffa500");

      //const meshScale = meshRef.current.meshScale;
      if (editingNoteId && noteReference.id === editingNoteId) {
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
      <LinkButton noteReference={noteReference} />
      <Html scaleFactor={10} center
        style={{
          width: `${100}px`, // Adjust based on the actual size of your Plane
          height: `${100}px`, // Adjust based on the actual size of your Plane
          border: noteReference.id === selectedNoteId ? "2px solid red" : "none", // Conditional border
          boxSizing: "border-box",
          pointerEvents: "none", // Make this div invisible to clicks    
        }}
      >
      </Html>
      {editingNoteId && noteReference.id === editingNoteId ?
        (<Html scaleFactor={10} center>
          <div style={{ padding: 40 }}> {/* Debugging border */}
            <textarea
              ref={textAreaRef} // Attach the ref here
              defaultValue={localText}
              onClick={onClick}
              onChange={onChange}
              style={{
                width: `${100}px`,
                height: `${100}px`,
                resize: "none",
                background: "none",
                border: "none",
                outline: "none",
                overflow: "auto",
              }}
            >
            </textarea>
          </div>
        </Html>
        ) : (
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.1}
            color="black"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.8}
          >
            {noteReference.text}
          </Text>
        )}
    </mesh>
  );
}

export default NoteObject
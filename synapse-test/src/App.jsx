import React, { useEffect, useState, useRef } from 'react';
import NotesManager from "./components/NotesManager"
import NoteObject from "./components/NoteObject"
import OrbitManager from './components/OrbitManager'
import Skybox from './components/Skybox'
import { Selection, useSetupInputManager } from './services/inputManager';
import { Vector3, Vector2, Raycaster } from 'three';

import { SelectionBox } from './components/SelectionBox';
import { SelectionHelper } from './components/SelectionHelper';
import { Canvas, useThree, useFrame } from '@react-three/fiber';

import ArrowIndicator from './components/ArrowIndicator'
import LinkManager from './components/LinkManager'
import { Html } from '@react-three/drei';

const MySelectionComponent = () => {
  const { gl, camera, scene } = useThree();
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectionHelper, setSelectionHelper] = useState(null);

  useEffect(() => {
    // Initialize SelectionBox and SelectionHelper
    const box = new SelectionBox(camera, scene);
    setSelectionBox(box);

    const helper = new SelectionHelper(gl, 'selectionBox');
    setSelectionHelper(helper);

    return () => {
      // Clean up SelectionHelper
      if (helper) helper.dispose();
    };
  }, [gl, camera, scene]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!selectionBox) return;

      const startVector = new Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5
      );
      selectionBox.startPoint.set(startVector.x, startVector.y, startVector.z);

      console.log("start:", startVector);
    };

    const handlePointerUp = (event) => {
      if (!selectionBox) return;

      const endVector = new Vector3(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
        0.5
      );
      selectionBox.endPoint.set(endVector.x, endVector.y, endVector.z);

      console.log("end:", endVector);

      // Use SelectionBox to select note objects
      const selectedObjects = selectionBox.select();
      const filteredObjects = selectedObjects.filter(object => object.userData.noteReferenceId);

      console.log("Selected Objects:", filteredObjects);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      // Clean up event listeners
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [selectionBox]);

  return null;
};

export const App = () => {
  // Input Manager
  useSetupInputManager();
  useEffect(() => {
    const handleRightClick = (event) => {
      event.preventDefault(); // Prevent the context menu from appearing
    };

    window.addEventListener('contextmenu', handleRightClick);

    return () => {
      window.removeEventListener('contextmenu', handleRightClick);
    };
  }, []);

  return (
    <>
      <OrbitManager />
      <Skybox />
      <ambientLight intensity={2} />
      <NotesManager>
        {notes => (
          <>
            {notes.map(note => (
              <NoteObject
                key={note.id}
                position={note.position.toArray()}
                noteReference={note}
              />
            ))}
          </>
        )}
      </NotesManager>
      <MySelectionComponent />
      <LinkManager />
      <ArrowIndicator />
    </>
  )
};

export default App
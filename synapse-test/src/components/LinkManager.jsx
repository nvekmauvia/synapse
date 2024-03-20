import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useNotes } from '../context/NotesContext';
import { useInput } from '../context/InputContext';
import { LinkLine } from './LinkLine';
import { useCreateNoteLink, useCreateNewNote } from '../utils/hooks';

const SetLinks = ({ notes }) => {
  return (
    <>
      {notes.map(note =>
        note.downstream?.map(downstreamId => {
          const downstreamNote = notes.find(n => n.id === downstreamId);
          if (!downstreamNote) return null; // In case the downstream note isn't found

          const startPosition = new THREE.Vector3().copy(note.position);
          const endPosition = new THREE.Vector3().copy(downstreamNote.position);

          // Adjust start and end positions
          startPosition.y -= 0.5; // Assuming the note's width is 1 unit
          endPosition.y += 0.5;

          return <LinkLine key={`${note.id}-${downstreamId}`} start={startPosition} end={endPosition} linkId={`${note.id}>${downstreamId}`} />;
        }) || []
      )}
    </>
  );
};

const LinkManager = () => {
  const { notes } = useNotes();
  const { camera, mouse } = useThree();
  const [mousePosition, setMousePosition] = useState(new THREE.Vector3());
  const {
    linkingNote,
    hoveredNote,
    linkingDown,
    setLinkingNote
  } = useInput()

  const createNote = useCreateNewNote();
  const createNoteLink = useCreateNoteLink();


  // Calculate mouse pos
  useEffect(() => {
    const updateMousePosition = () => {
      if (!linkingNote) return;

      const note = notes.find(n => n.id === linkingNote);
      if (!note) return;

      // Create a plane at the note's position, facing the camera
      const planeNormal = new THREE.Vector3().subVectors(camera.position, note.position).normalize();
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, note.position);
      const planeRaycaster = new THREE.Raycaster();

      // Unproject mouse position into 3D space
      planeRaycaster.setFromCamera(mouse, camera);

      // Find where the ray intersects the plane
      const intersectPoint = new THREE.Vector3();
      planeRaycaster.ray.intersectPlane(plane, intersectPoint);

      setMousePosition(intersectPoint);
    };

    updateMousePosition();
    // Update mouse position on mouse move
    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, [camera, mouse, linkingNote, notes]);

  // Handle mouse release globally
  useEffect(() => {
    const handleMouseRelease = () => {
      if (linkingNote && hoveredNote) {
        if (linkingDown) {
          createNoteLink(linkingNote, hoveredNote);
        }
        else {
          createNoteLink(hoveredNote, linkingNote);
        }
      }
      if (linkingNote && hoveredNote === null) {
        createNote();
      }
      setLinkingNote(null); // Reset the linking note state
    };

    window.addEventListener('mouseup', handleMouseRelease);

    return () => {
      window.removeEventListener('mouseup', handleMouseRelease);
    };
  }, [linkingNote, hoveredNote, createNoteLink]);

  // Generate dynamic link if linkingNote is set
  const dynamicLink = useMemo(() => {
    if (!linkingNote) return null;

    const note = notes.find(n => n.id === linkingNote);
    if (!note) return null;

    const startPosition = new THREE.Vector3().copy(note.position);
    startPosition.y += linkingDown ? -0.5 : 0.5; // Adjust according to note size

    return <LinkLine key="dynamic-link" start={startPosition} end={mousePosition} linkId={null} />;
  }, [linkingNote, mousePosition, notes]);

  // Assuming each note has a `position` object and optionally `downstream` array
  return (
    <>
      <SetLinks notes={notes} />
      {dynamicLink}
    </>
  );
};


export default LinkManager
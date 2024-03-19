import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Plane, Html } from '@react-three/drei';
import * as THREE from 'three';
import { DoubleSide } from 'three';
import { useInput } from '../context/InputContext';
import { useNotes } from '../context/NotesContext';
import { useEditNoteText } from '../utils/hooks';
import { BoxGeometry, MeshBasicMaterial, Mesh } from 'three';

const rightButtonPosition = [0.45, 0, 0.1];

const LinkButton = ({ noteReference }) => {
    const meshRef = useRef();
    const [isHovered, setIsHovered] = useState(false); // Add state to track hover

    const {
        hoveredNote,
        setLinkingNote,
        hoveredButton
    } = useInput()

    const startDragging = useCallback((event) => {
        setLinkingNote(noteReference.id)
        // Add a global mouseup listener when dragging starts
        window.addEventListener('mouseup', stopDraggingGlobal, { once: true });
    }, [noteReference, setLinkingNote]);

    const stopDraggingGlobal = useCallback(() => {
        // This will trigger whenever the mouse is released, regardless of location
        setLinkingNote(null);
    }, [setLinkingNote]);


    useEffect(() => {
        if (meshRef.current) {
            // Main plane
            meshRef.current.children[0].userData.buttonReferenceId = noteReference.id;
            console.log(meshRef)
        }
        // Cleanup global event listener on component unmount
        return () => {
            window.removeEventListener('mouseup', stopDraggingGlobal);
        }
    }, [noteReference.id, stopDraggingGlobal]);

    return (
        <mesh
            ref={meshRef}
            onPointerDown={startDragging}
            onPointerOver={() => setIsHovered(true)} // Set hover state true on mouse over
            onPointerOut={() => setIsHovered(false)} // Set hover state false on mouse out
        >
            <Plane position={rightButtonPosition} args={[0.2, 0.2]}>
                <meshBasicMaterial
                    color={isHovered ? 'blue' : 'red'} // Change color based on hover state
                    side={DoubleSide}
                    transparent={true}
                    opacity={0.8}
                />
            </Plane>
        </mesh>
    )
}

export default LinkButton
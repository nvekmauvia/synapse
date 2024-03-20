import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Plane } from '@react-three/drei';
import { DoubleSide } from 'three';
import { useInput } from '../context/InputContext';

const leftButtonPosition = [0, 0.4, 0];
const rightButtonPosition = [0, -0.4, 0];

const LinkButton = ({ noteReference, isDownLink }) => {
    const meshRef = useRef();
    const [isHovered, setIsHovered] = useState(false); // Add state to track hover
    const {
        setLinkingNote,
        setLinkingDown,
        hoveredNote
    } = useInput()

    const startDragging = useCallback((event) => {
        if (event.button !== 0) return;
        setLinkingNote(noteReference.id)
        setLinkingDown(isDownLink)
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
            <Plane position={isDownLink ? rightButtonPosition : leftButtonPosition} args={[0.2, 0.2]}>
                <meshBasicMaterial
                    color={isHovered ? 'blue' : 'red'} // Change color based on hover state
                    side={DoubleSide}
                    transparent={true}
                    opacity={hoveredNote === noteReference.id ? 0.8 : 0}
                />
            </Plane>
        </mesh>
    )
}

export default LinkButton
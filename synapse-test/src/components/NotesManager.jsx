import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three'
import { useNotes } from '../context/NotesContext';

const calculateMovement = (notes) => {
    const minCalcDistance = 5;

    const repulsionThresholdDistance = 2;
    const repulsionStrength = 0.2;

    const originAttractionStrength = 0.1;

    const linkDesiredDistance = 0.2;
    const linkAttractionCoefficient = 0.2;

    const linkMinDistance = 2;
    const linkRepulsionCoefficient = 2;

    const axisWeights = { x: 1.0, y: 2 , z: 1 }; // Customize these weights as need ed

    for (let i = 0; i < notes.length; i++) {
        // General note flocking
        for (let j = i + 1; j < notes.length; j++) {
            const noteA = notes[i];
            const noteB = notes[j];
            let direction = new THREE.Vector3().subVectors(noteB.position, noteA.endPosition);
            const distance = direction.length();

            // Only calculate if close enough
            if (distance > minCalcDistance) {
                break
            }

            direction.normalize();
            direction = new THREE.Vector3(
                direction.x * axisWeights.x,
                direction.y * axisWeights.y,
                direction.z * axisWeights.z
            ).normalize();

            if (distance < repulsionThresholdDistance) {
                const repulsion = direction.multiplyScalar(repulsionStrength * (repulsionThresholdDistance - distance));
                noteA.endPosition.sub(repulsion);
                noteB.endPosition.add(repulsion);
            }
        }
        
        // Attraction to origin
        let originDirection = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), notes[i].endPosition);
        originDirection.normalize();

        const attraction = originDirection.multiplyScalar(originAttractionStrength);
        notes[i].endPosition.add(attraction);
    }

    // Apply attraction based on upstream-downstream relationships
    notes.forEach(noteUp => {
        noteUp.downstream.forEach(downstreamId => {
            const noteDown = notes.find(note => note.id === downstreamId);

            if (noteDown) {
                const direction = new THREE.Vector3().subVectors(noteDown.endPosition, noteUp.endPosition);
                const distance = direction.length();
                direction.normalize();

                // Links pull notes together
                if (distance > linkDesiredDistance) {
                    const attraction = direction.multiplyScalar(linkAttractionCoefficient * (distance - linkDesiredDistance));
                    noteUp.endPosition.add(attraction);
                    noteDown.endPosition.sub(attraction);
                }

                // Ensure upstream note remains to the negative X-axis side of its downstream note
                if (noteUp.endPosition.x + linkMinDistance > noteDown.endPosition.x) {
                    const adjustX = Math.abs(noteUp.endPosition.x + linkMinDistance - noteDown.endPosition.x) / linkRepulsionCoefficient;
                    noteUp.endPosition.x -= adjustX;
                    noteDown.endPosition.x += adjustX;
                }
            }
        });
    });

    return notes.map(note => {
        return { ...note, endPosition: note.endPosition.clone() };
    })
};

const NotesManager = ({ children }) => {
    const { notes, setNotes, movingTimer, setMovingTimer, moveFactor, setMoveFactor } = useNotes();

    // Function to smoothly update note positions towards their end positions
    const updatePositions = () => {
        setNotes(currentNotes =>
            currentNotes.map(note => {
                if (!note.endPosition) {
                    return note;
                }
                note.position.lerp(note.endPosition, 0.2)
                return { ...note };
            })
        );
    };

    // Update loop
    useFrame((delta) => {
        setMovingTimer(movingTimer + delta)
        if (movingTimer >= 2) {
            setMoveFactor(moveFactor - delta)
            if (moveFactor < 0) {
                setMoveFactor(0)
            }
        }
        else {
            setMoveFactor(1)
        }

        // Calculate movement
        setNotes(() => { return calculateMovement(notes) })

        updatePositions();
    })

    return children(notes);
};

export default NotesManager
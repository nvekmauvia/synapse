import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three'
import { useNotes } from '../context/NotesContext';

const simulateEndState = (notes) => {
    const maxIterations = 1; // Limit the simulation to prevent infinite loops
    const attractionCoefficient = 0.01;
    const repulsionCoefficient = 0.7;
    const desiredDistance = 1;
    const minDistance = 2;
    const linkDesiredDistance = 0.2;
    const linkMinDistance = 3;
    const linkAttractionCoefficient = 0.2;

    const axisWeights = { x: 1.0, y: 5, z: 0.4 }; // Customize these weights as needed

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        let movement = false;

        for (let i = 0; i < notes.length; i++) {
            for (let j = i + 1; j < notes.length; j++) {
                const noteA = notes[i];
                const noteB = notes[j];
                let direction = new THREE.Vector3().subVectors(noteB.endPosition, noteA.endPosition);
                const distance = direction.length();
                direction.normalize();
                direction = new THREE.Vector3(
                    direction.x * axisWeights.x,
                    direction.y * axisWeights.y,
                    direction.z * axisWeights.z
                ).normalize();

                if (distance < minDistance) {
                    const repulsion = direction.multiplyScalar(repulsionCoefficient * (minDistance - distance));
                    noteA.endPosition.sub(repulsion);
                    noteB.endPosition.add(repulsion);
                    movement = true;
                } else if (distance > desiredDistance) {
                    const attraction = direction.multiplyScalar(attractionCoefficient * (distance - desiredDistance));
                    noteA.endPosition.add(attraction);
                    noteB.endPosition.sub(attraction);
                    movement = true;
                }
            }
        }

        // Apply attraction based on upstream-downstream relationships
        notes.forEach(noteA => {
            noteA.downstream.forEach(downstreamId => {
                const noteB = notes.find(note => note.id === downstreamId);
                console.log(noteB)
                if (noteB) {
                    const direction = new THREE.Vector3().subVectors(noteB.endPosition, noteA.endPosition);
                    const distance = direction.length();
                    direction.normalize();

                    if (distance > linkDesiredDistance) {
                        const attraction = direction.multiplyScalar(linkAttractionCoefficient * (distance - linkDesiredDistance));
                        noteA.endPosition.add(attraction);
                        noteB.endPosition.sub(attraction);
                        movement = true;
                    }

                    // Ensure upstream note remains to the negative X-axis side of its downstream note
                    if (distance < linkMinDistance) {
                        const adjustX = Math.abs(noteA.endPosition.x - noteB.endPosition.x) / 2;
                        noteA.endPosition.x -= adjustX;
                        noteB.endPosition.x += adjustX;
                        movement = true;
                    }
                }
            });
        });


        // Break out of the loop if no more movement (system reached equilibrium)
        if (!movement) break;
    }

    return notes.map(note => ({ ...note, endPosition: note.endPosition.clone() }));
};

const NotesManager = ({ children }) => {
    const { notes, setNotes, shouldSetNotesPos, setShouldSetNotesPos } = useNotes();

    if (!shouldSetNotesPos) {
        setNotes(() => {
            return simulateEndState(notes);
        })
        setShouldSetNotesPos(true)
    }

    useEffect(() => {


    }, [shouldSetNotesPos])

    /*
    setNotes(() => {
        return simulateEndState(notes);
    })*/

    // Function to smoothly update note positions towards their end positions
    const updatePositions = () => {
        setNotes(currentNotes =>
            currentNotes.map(note => {
                if (!note.endPosition) {
                    return note; // Skip if no endPosition is defined
                }
                note.position.lerp(note.endPosition, 0.05); // Adjust the lerp factor as needed
                return { ...note };
            })
        );
    };

    // Use `useFrame` to continuously update positions
    useFrame(() => {
        updatePositions();
    });

    return children(notes);
};

export default NotesManager
// NotesContext.js
import React, { createContext, useContext, useState } from 'react';
import { Vector3 } from 'three';
import { v4 as uuidv4 } from 'uuid';

const NotesContext = createContext();

const initialNotes = () => {
    const notes = [];
    for (let i = 0; i < 4; i++) {
        // Randomize positions within a range, e.g., [-5, 5] for each axis
        const position = new Vector3(
            Math.random() * 5 - 2.5, // X axis
            Math.random() * 5 - 2.5, // Y axis
            Math.random() * 5 - 2.5  // Z axis
        );
        notes.push({
            id: uuidv4(),
            position,
            endPosition: new Vector3(position.x, position.y, position.z), // Starting with zero velocity
            initialText: 'New Note Text', // Placeholder text
            upstream: [],
            downstream: [],
        });
    }
    return notes;
};

export const NotesProvider = ({ children }) => {
    const [notes, setNotes] = useState(initialNotes());
    const [editingNote, setEditingNote] = useState(null);
    const [draggingNote, setDraggingNote] = useState(null);
    const [clickedNote, setClickedNote] = useState(false);
    const [movingTimer, setMovingTimer] = useState(0.0);
    const [moveFactor, setMoveFactor] = useState(1);

    const value = {
        notes,
        setNotes,
        editingNote,
        setEditingNote,
        clickedNote,
        setClickedNote,
        draggingNote,
        setDraggingNote,
        movingTimer,
        setMovingTimer,
        moveFactor,
        setMoveFactor
    };

    return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotes = () => useContext(NotesContext);
// NotesContext.js
import React, { createContext, useContext, useState } from 'react';
import { Vector3 } from 'three';

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
            id: i,
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
    const [shouldSetNotesPos, setShouldSetNotesPos] = useState(false);

    const value = { notes, setNotes, editingNote, setEditingNote, shouldSetNotesPos, setShouldSetNotesPos };

    return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
};

export const useNotes = () => useContext(NotesContext);
import { useCallback, useContext } from 'react';
import { Vector3 } from 'three';
import { useNotes } from '../context/NotesContext';
import noteService from '../services/notes';
import { v4 as uuidv4 } from 'uuid';

export const useCreateNewNote = () => {
    const { notes, setNotes } = useNotes();

    const createNewNote = () => {
        console.log('Creating new note...');

        const position = new Vector3(
            Math.random() * 5 - 2.5, // X axis
            Math.random() * 5 - 2.5, // Y axis
            Math.random() * 5 - 2.5 // Z axis
        );

        const newNote = {
            id: uuidv4(),
            position,
            endPosition: new Vector3(position.x, position.y, position.z),
            initialText: 'New Note Text', // Placeholder text
            upstream: [],
            downstream: [],
        };

        // Correctly updates the notes array by appending the new note
        setNotes([...notes, newNote]);
    };

    return createNewNote;
};


export const useSaveAll = () => {
    const { notes } = useNotes()

    const saveNotes = () => {
        noteService.saveAll(notes)
    }

    return saveNotes
}

export const useLoadAll = () => {
    const { setNotes } = useNotes()

    const loadNotes = async () => {
        const loaded = await noteService.getAll()

        const notesWithVectorPositions = loaded.notes.map(note => ({
            ...note,
            position: new Vector3(note.position.x, note.position.y, note.position.z),
            endPosition: new Vector3(note.endPosition.x, note.endPosition.y, note.endPosition.z)
        }))

        setNotes(notesWithVectorPositions)
    }

    return loadNotes
}

export const useEditNoteText = () => {
    const { setNotes } = useNotes();

    // useCallback will return a memoized version of the callback that only changes if one of the dependencies has changed
    const editNoteText = useCallback((noteId, newText) => {
        setNotes(currentNotes =>
            currentNotes.map(note => note.id === noteId ? { ...note, initialText: newText } : note)
        );
    }, [setNotes]); // setNotes is a stable function reference from context and will not change

    return editNoteText;
};

export const useCreateNoteLink = (upstreamId, downstreamId) => {
    const { notes, setNotes } = useNotes();
    // Logic to handle link editing
};

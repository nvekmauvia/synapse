import { Vector3 } from 'three';
import { useNotes } from '../context/NotesContext';
import noteService from '../services/notes';

export const useCreateNewNote = () => {
    const { notes, setNotes, setShouldSetNotesPos } = useNotes();

    const createNewNote = () => {
        console.log('Creating new note...');

        const position = new Vector3(
            Math.random() * 5 - 2.5, // X axis
            Math.random() * 5 - 2.5, // Y axis
            Math.random() * 5 - 2.5 // Z axis
        );

        const newNote = {
            id: notes.length,
            position,
            endPosition: new Vector3(position.x, position.y, position.z),
            initialText: 'New Note Text' // Placeholder text
        };

        // Correctly updates the notes array by appending the new note
        setNotes([...notes, newNote]);
        setShouldSetNotesPos(false);
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
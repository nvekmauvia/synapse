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
            text: 'New Note Text', // Placeholder text
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

    // useCallback will return a memorized version of the callback that only changes if one of the dependencies has changed
    const editNoteText = useCallback((noteId, newText) => {
        setTimeout(() => {
            setNotes(currentNotes =>
                currentNotes.map(note => note.id === noteId ? { ...note, text: newText } : note)
            );
        }, 0);

    }, [setNotes]); // setNotes is a stable function reference from context and will not change

    return editNoteText;
};

export const useCreateNoteLink = () => {
    const { notes, setNotes } = useNotes();

    const createNoteLink = useCallback((upstreamId, downstreamId) => {
        setNotes(currentNotes => {
            // Create a new array to avoid directly mutating the state
            const newNotes = [...currentNotes];

            // Find the index of the upstream and downstream notes
            const upstreamNoteIndex = newNotes.findIndex(note => note.id === upstreamId);
            const downstreamNoteIndex = newNotes.findIndex(note => note.id === downstreamId);

            // Safeguard checks if either note is not found
            if (upstreamNoteIndex === -1 || downstreamNoteIndex === -1) {
                console.error('One or both of the notes were not found.');
                return currentNotes; // Return the original notes if there's an issue
            }

            // Check if the upstream note is already a downstream of the downstream note
            if (currentNotes[downstreamNoteIndex].downstream.includes(upstreamId)) {
                console.error('Operation cancelled: A note cannot be both downstream and upstream of the same note.');
                return currentNotes; // Cancel the operation
            }

            // Proceed with updating the notes since the check passed
            return currentNotes.map(note => {
                if (note.id === upstreamId) {
                    return { ...note, downstream: [...note.downstream, downstreamId] };
                } else if (note.id === downstreamId) {
                    return { ...note, upstream: [...note.upstream, upstreamId] };
                }
                return note;
            });
        });
    }, [setNotes]);

    return createNoteLink;
};

export const useDeleteNote = () => {
    const { notes, setNotes, setSelectedNoteId } = useNotes();

    const deleteNote = useCallback((deleteNoteId) => {
        setNotes(currentNotes => {
            // First, find the note to be deleted
            const noteToDelete = currentNotes.find(note => note.id === deleteNoteId);
            if (!noteToDelete) return currentNotes; // If not found, return the current state

            // Prepare arrays to hold IDs of notes to update
            const idsToUpdate = new Set([...noteToDelete.upstream, ...noteToDelete.downstream]);

            // Filter out the note to be deleted
            const notesWithoutDeleted = currentNotes.filter(note => note.id !== deleteNoteId);

            // Update upstream and downstream links only for related notes
            const updatedNotes = notesWithoutDeleted.map(note => {
                if (idsToUpdate.has(note.id)) {
                    return {
                        ...note,
                        upstream: note.upstream.filter(id => id !== deleteNoteId),
                        downstream: note.downstream.filter(id => id !== deleteNoteId),
                    };
                }
                return note; // Return the note unmodified if it's not related to the deleted one
            });

            return updatedNotes;
        });

        setSelectedNoteId(null)
    }, [setNotes]);

    return deleteNote;
};

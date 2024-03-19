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
            if (upstreamId === downstreamId) {
                console.error('Operation cancelled: A note cannot link to itself.');
                return currentNotes;
            }
            const upstreamNote = currentNotes.find(note => note.id === upstreamId);
            const downstreamNote = currentNotes.find(note => note.id === downstreamId);

            // Safeguard checks if either note is not found
            if (!upstreamNote || !downstreamNote) {
                console.error('One or both of the notes were not found.');
                return currentNotes; // Return the original notes if there's an issue
            }

            // Check if there is already a link in either direction
            const alreadyLinked = upstreamNote.downstream.includes(downstreamId) || downstreamNote.upstream.includes(upstreamId) || downstreamNote.downstream.includes(upstreamId) || upstreamNote.upstream.includes(downstreamId);

            if (alreadyLinked) {
                console.error('Operation cancelled: A link already exists between these notes or a reciprocal link exists.');
                return currentNotes;
            }

            // Proceed with updating the notes since the check passed
            return currentNotes.map(note => {
                if (note.id === upstreamId) {
                    // Ensure downstream array exists before adding to it
                    const updatedDownstream = note.downstream ? [...note.downstream, downstreamId] : [downstreamId];
                    return { ...note, downstream: updatedDownstream };
                } else if (note.id === downstreamId) {
                    // Ensure upstream array exists before adding to it
                    const updatedUpstream = note.upstream ? [...note.upstream, upstreamId] : [upstreamId];
                    return { ...note, upstream: updatedUpstream };
                }
                return note;
            });
        });
    }, [notes, setNotes]); // Note: Removed 'setNotes' dependency if not used elsewhere

    return createNoteLink;
};

export const useDeleteLink = () => {
    const { notes, setNotes, setSelectedLink } = useNotes();

    const deleteLink = useCallback((linkIdentifier) => {
        // Extract the note ID and downstream ID from the link identifier
        const [noteId, downstreamId] = linkIdentifier.split('>');

        setNotes(currentNotes => {
            // Create updates for notes by removing the specified link
            return currentNotes.map(note => {
                if (note.id === noteId) {
                    // Remove downstreamId from this note's downstream array
                    const updatedDownstream = note.downstream.filter(id => id !== downstreamId);
                    return { ...note, downstream: updatedDownstream };
                } else if (note.id === downstreamId) {
                    // Remove noteId from this note's upstream array, if it exists
                    const updatedUpstream = note.upstream ? note.upstream.filter(id => id !== noteId) : [];
                    return { ...note, upstream: updatedUpstream };
                }
                return note; // Return the note unchanged if it's not involved in the link
            });
        });
        setSelectedLink(null)
    }, [setNotes]);

    return deleteLink;
};
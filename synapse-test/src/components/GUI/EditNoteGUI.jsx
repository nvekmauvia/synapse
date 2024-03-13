import React, { useContext, useState, useEffect } from 'react';
import { useNotes } from '../../context/NotesContext'; // Adjust import path as needed

const EditNoteGUI = () => {
    const { notes, setNotes, editingNote, setEditingNote } = useNotes();

    const safeEditingNote = editingNote || { upstream: [], downstream: [] };
    const [selectedUpstream, setSelectedUpstream] = useState(safeEditingNote.upstream || []);
    const [selectedDownstream, setSelectedDownstream] = useState(safeEditingNote.downstream || []);

    const [text, setText] = useState('');

    // Update the text state whenever editingNote changes
    React.useEffect(() => {
        if (editingNote) {
            setText(editingNote.initialText || '');
            setSelectedUpstream(editingNote.upstream);
            setSelectedDownstream(editingNote.downstream);
        }
    }, [editingNote]);

    if (!editingNote) return null; // Don't render if there's no note being edited

    const handleSave = () => {
        const updatedNotes = setNotes(prevNotes =>
            prevNotes.map(note => note.id === editingNote.id ? { ...note, initialText: text } : note)
        );
        setEditingNote(null); // Exit editing mode
    };

    // Updates note relationships upon saving
    const handleSaveLinks = () => onSave(safeEditingNote.id, selectedUpstream, selectedDownstream);

    const onSave = (noteId, selectedUpstream, selectedDownstream) => {

        setNotes(prevNotes => prevNotes.map(note => {
            // Update upstream and downstream for the current note
            if (note.id === noteId) {
                return { ...note, upstream: selectedUpstream, downstream: selectedDownstream };
            }
            // Add this note as downstream to its new upstream notes and remove from old ones
            if (selectedUpstream.includes(note.id)) {
                return { ...note, downstream: [...note.downstream, noteId].filter((value, index, self) => self.indexOf(value) === index) }; // Ensure no duplicates
            } else {
                return { ...note, downstream: note.downstream.filter(id => id !== noteId) };
            }
            // Add this note as upstream to its new downstream notes and remove from old ones (similar logic as above)
            // This part will be similar to the upstream update but applied to downstream relations
        }));
    };

    // Render checkboxes for upstream and downstream selection
    return (
        <div style={{ position: 'fixed', left: '10px', top: '10px', background: 'white', padding: '20px', zIndex: 1000 }}>
            <div>Edit Note</div>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ width: '200px', height: '100px' }}
            />
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setEditingNote(null)}>Cancel</button>
            <h4>Upstream Notes</h4>
            {notes.filter(note => (note.id !== safeEditingNote.id && !safeEditingNote.downstream.includes(note.id))).map(note => (
                <label key={note.id}>
                    <input
                        type="checkbox"
                        checked={selectedUpstream.includes(note.id)}
                        onChange={(e) => {
                            const updated = e.target.checked
                                ? [...selectedUpstream, note.id]
                                : selectedUpstream.filter(id => id !== note.id);
                            setSelectedUpstream(updated);
                        }}
                    />
                    {`${note.initialText}`}
                </label>
            ))}

            <h4>Downstream Notes</h4>
            {notes.filter((note => note.id !== safeEditingNote.id && !safeEditingNote.upstream.includes(note.id))).map(note => (
                <label key={note.id}>
                    <input
                        type="checkbox"
                        checked={selectedDownstream.includes(note.id)}
                        onChange={(e) => {
                            const updated = e.target.checked
                                ? [...selectedDownstream, note.id]
                                : selectedDownstream.filter(id => id !== note.id);
                            setSelectedDownstream(updated);
                        }}
                    />
                    {`${note.initialText}`}
                </label>
            ))}

            <button onClick={handleSaveLinks}>Save Links</button>
        </div>
    );
};

export default EditNoteGUI;
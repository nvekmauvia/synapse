import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { useInput } from '../../context/InputContext';

const DebugGUI = () => {
    const { editingNoteId, selectedNoteId, draggingNoteId, notes, selectedLink } = useNotes();
    const { hoveredNote, hoveredButton, linkingNote } = useInput();

    const editText = notes.find(note => note.id === editingNoteId)?.text;
    const selectText = notes.find(note => note.id === selectedNoteId)?.text;
    const hoveredText = notes.find(note => note.id === hoveredNote)?.text;
    const buttonText = hoveredButton;
    const draggingText = notes.find(note => note.id === draggingNoteId)?.text;
    const linkingText = notes.find(note => note.id === linkingNote)?.text;

    //console.log(linkingText)

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '10px', zIndex: 1000 }}>
            <pre>Editing: {JSON.stringify(editText, null, 2)}</pre>
            <pre>Selected: {JSON.stringify(selectText, null, 2)}</pre>
            <pre>Hovered: {JSON.stringify(hoveredText, null, 2)}</pre>
            <pre>Button: {JSON.stringify(buttonText, null, 2)}</pre>
            <pre>Dragged: {JSON.stringify(draggingText, null, 2)}</pre>
            <pre>Linking: {JSON.stringify(linkingText, null, 2)}</pre>
        </div>
    );
};

export default DebugGUI;
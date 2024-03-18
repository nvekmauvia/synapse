import React from 'react';
import { useCreateNewNote, useLoadAll, useSaveAll } from '../../utils/hooks';
import { Html } from '@react-three/drei';

const OverlayGUI = () => {
    const createNewNote = useCreateNewNote();
    const saveNotes = useSaveAll();
    const loadNotes = useLoadAll();

    return (
            <div className="overlay-gui">
                <button onClick={createNewNote}>New Note</button>
                <button onClick={saveNotes}>Save</button>
                <button onClick={loadNotes}>Load</button>
            </div>
    );
};

export default OverlayGUI;
import React from 'react';
import { useCreateNewNote, useLoadAll, useSaveAll, useRecalculatePositions } from '../../utils/hooks';

const OverlayGUI = () => {
    const createNewNote = useCreateNewNote();
    const saveNotes = useSaveAll();
    const loadNotes = useLoadAll();
    const resetRecalculate = useRecalculatePositions();

    return (
        <div className="overlay-gui">
            <button onClick={createNewNote}>New Note</button>
            <button onClick={resetRecalculate}>Calculate Pos</button>
            <button onClick={saveNotes}>Save</button>
            <button onClick={loadNotes}>Load</button>
        </div>
    );
};

export default OverlayGUI;
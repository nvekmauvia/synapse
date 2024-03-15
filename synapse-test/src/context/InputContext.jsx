import React, { createContext, useContext, useState } from 'react';

const InputContext = createContext();

export const InputProvider = ({ children }) => {
    const [cameraControlsOn, setCameraControlsOn] = useState(false);
    const [hoveredNote, setHoveredNote] = useState(null);

    const value = {
        cameraControlsOn,
        setCameraControlsOn,
        hoveredNote,
        setHoveredNote
    };

    return <InputContext.Provider value={value}>{children}</InputContext.Provider>;
};

export const useInput = () => useContext(InputContext);
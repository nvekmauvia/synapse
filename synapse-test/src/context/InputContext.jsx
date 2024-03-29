import React, { createContext, useContext, useState } from 'react';

const InputContext = createContext();

export const InputProvider = ({ children }) => {
    const [cameraControlsOn, setCameraControlsOn] = useState(false);
    const [hoveredNote, setHoveredNote] = useState(null);
    const [hoveredButton, setHoveredButton] = useState(null);
    const [linkingNote, setLinkingNote] = useState(null);
    const [linkingDown, setLinkingDown] = useState(false);

    const value = {
        cameraControlsOn,
        setCameraControlsOn,
        hoveredNote,
        setHoveredNote,
        hoveredButton,
        setHoveredButton,
        linkingNote,
        setLinkingNote,
        linkingDown,
        setLinkingDown,
    };

    return <InputContext.Provider value={value}>{children}</InputContext.Provider>;
};

export const useInput = () => useContext(InputContext);
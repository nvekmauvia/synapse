import React, { useRef } from 'react';

const NoteTextArea = React.memo(({ text, onChangeText, onBlur, onClick, onMouseEnter, onMouseLeave }) => {
    const textAreaRef = useRef(null);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center', // Center horizontally
            alignItems: 'center', // Center vertically
            width: '100px', // Match the size of your Plane
            height: '100px', // Match the size of your Plane
            transformOrigin: 'center center', // Origin from the center
        }}>
            <textarea
                ref={textAreaRef}
                style={{
                    width: '100px',
                    height: '100px',
                    transform: 'translate(-50%, -50%)',
                    transformOrigin: 'center center',
                    resize: 'none',
                    textAlign: 'center',
                    color: 'black', // This sets the text color to black
                    background: 'none', // This makes the background transparent
                    border: 'none', // This removes the border
                    outline: 'none' // This removes the outline on focus        
                }}
                value={text}
                onChange={onChangeText}
                onBlur={onBlur}
                onClick={onClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                autoFocus
            />
        </div>
    );
});

export default NoteTextArea;

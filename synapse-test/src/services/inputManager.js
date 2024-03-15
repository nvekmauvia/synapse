import { useFrame } from '@react-three/fiber';
import { Vector2, Raycaster } from 'three';
import { useEffect } from 'react';
import { useInput } from '../context/InputContext';
import { useNotes } from '../context/NotesContext';

export const useSetupInputManager = () => {
    const { setCameraControlsOn, setHoveredNote } = useInput();
    const { editingNote, setEditingNote, clickedNote } = useNotes();

    const raycaster = new Raycaster();
    const mousePosition = new Vector2();

    // Mouse Hover
    useFrame(({ camera, scene, mouse }) => {
        // Update mouse position from the 'mouse' provided by useFrame
        mousePosition.x = mouse.x;
        mousePosition.y = mouse.y;

        raycaster.setFromCamera(mousePosition, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        const hoveredNoteObject = intersects.find(intersect => intersect.object.userData.noteReferenceId);

        if (hoveredNoteObject) {
            setHoveredNote(hoveredNoteObject.object.userData.noteReferenceId);
        } else {
            setHoveredNote(null);
        }
    });

    // Deselects editingNote when clicking elsewhere
    useEffect(() => {
        const handleDocumentClick = () => {
            if (!clickedNote) {
                setEditingNote(null);
            }
        };
        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [clickedNote, setEditingNote]);

    // Key inputs
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Camera Controls
            if (event.code === 'Space') {
                if (editingNote === null) {
                    setCameraControlsOn(true);
                }
            }
            // Deselecting editor
            if (event.code === 'Escape') {
                setEditingNote(null)
            }
            if (event.code === 'Enter' && event.ctrlKey) {
                setEditingNote(null);
            }
        };
        const handleKeyUp = (event) => {
            // Camera Controls
            if (event.code === 'Space') {
                setCameraControlsOn(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Cleanup to remove the event listeners when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [setCameraControlsOn, setEditingNote, editingNote]);
};

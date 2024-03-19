import { useFrame } from '@react-three/fiber';
import { Vector2, Raycaster } from 'three';
import { useEffect } from 'react';
import { useInput } from '../context/InputContext';
import { useNotes } from '../context/NotesContext';
import { useDeleteNote, useDeleteLink } from '../utils/hooks';

export const useSetupInputManager = () => {
    const { cameraControlsOn, setCameraControlsOn, setHoveredNote, setHoveredButton } = useInput();
    const { editingNoteId, setEditingNoteId, clickedNote, selectedNoteId, setSelectedNoteId, selectedLink, setSelectedLink } = useNotes();

    const raycaster = new Raycaster();
    const mousePosition = new Vector2();

    const deleteNote = useDeleteNote();
    const deleteLink = useDeleteLink();

    // Mouse Hover
    useFrame(({ camera, scene, mouse }) => {
        // Update mouse position from the 'mouse' provided by useFrame
        mousePosition.x = mouse.x;
        mousePosition.y = mouse.y;

        raycaster.setFromCamera(mousePosition, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        const hoveredNoteObject = intersects.find(intersect => intersect.object.userData.noteReferenceId && !intersect.object.userData.ignoreRaycast);
        const hoveredButtonObject = intersects.find(intersect => intersect.object.userData.buttonReferenceId);

        if (!cameraControlsOn) {
            if (hoveredNoteObject) {
                setHoveredNote(hoveredNoteObject.object.userData.noteReferenceId);
            } else {
                setHoveredNote(null);
            }
            if (hoveredButtonObject) {
                setHoveredButton(hoveredButtonObject.object.userData.buttonReferenceId);
            } else {
                setHoveredButton(null);
            }
        }
        else {
            setHoveredNote(null);
            setHoveredButton(null);
        }
    });

    // Deselects editingNote when clicking elsewhere
    useEffect(() => {
        const handleDocumentClick = () => {
            if (!clickedNote) {
                //console.log(selectedNote)
                setEditingNoteId(null);
                setSelectedNoteId(null)
                //setSelectedLink(null)
            }
        };
        document.addEventListener('click', handleDocumentClick);

        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [clickedNote, setEditingNoteId, setSelectedNoteId, selectedNoteId]);

    // Key inputs
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Camera Controls
            if (event.code === 'Space') {
                if (editingNoteId === null) {
                    setCameraControlsOn(true);
                }
            }
            // Deselecting editor
            if (event.code === 'Escape') {
                setEditingNoteId(null)
                setSelectedNoteId(null)
            }
            if (event.code === 'Enter' && event.ctrlKey) {
                setEditingNoteId(null);
            }
            if (event.code === 'Delete') {
                if (selectedNoteId && editingNoteId === null) {
                    deleteNote(selectedNoteId)
                }
                if (selectedLink !== null) {
                    console.log('!!')
                    deleteLink(selectedLink)
                }
            }
        }

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
    }, [setCameraControlsOn, setEditingNoteId, setSelectedNoteId, editingNoteId, selectedNoteId, deleteNote, deleteLink, selectedLink]);
};

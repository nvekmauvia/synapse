import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector2, Raycaster } from 'three';
import { Box, Html } from '@react-three/drei'; // Example object
import { Vector3, Frustum, Matrix4 } from 'three';

import { useState, useEffect, useRef } from 'react';
import { useInput } from '../context/InputContext';
import { useNotes } from '../context/NotesContext';
import { useDeleteNote, useDeleteLink } from '../utils/hooks';

import { SelectionBox } from '../components/SelectionBox';

import '../index.css'

export const Selection = () => {
    const { gl, scene, camera } = useThree(); // Extract camera here
    const [isSelecting, setIsSelecting] = useState(false);
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
    const [endPoint, setEndPoint] = useState({ x: 0, y: 0 });
    const selectionDivRef = useRef(null); // Reference to the selection div
    const selectedObjects = useRef(null);
    const { hoveredNote } = useInput();

    useEffect(() => {
        const updateVisualSelectionBox = () => {
            if (!isSelecting) {
                if (selectionDivRef.current) {
                    selectionDivRef.current.style.display = 'none';
                }
                return;
            }

            const minX = Math.min(startPoint.x, endPoint.x);
            const maxX = Math.max(startPoint.x, endPoint.x);
            const minY = Math.min(startPoint.y, endPoint.y);
            const maxY = Math.max(startPoint.y, endPoint.y);

            if (selectionDivRef.current) {
                selectionDivRef.current.style.left = `${minX}px`;
                selectionDivRef.current.style.top = `${minY}px`;
                selectionDivRef.current.style.width = `${maxX - minX}px`;
                selectionDivRef.current.style.height = `${maxY - minY}px`;
                selectionDivRef.current.style.display = 'block';
            }
        };

        function onPointerDown(e) {
            if (true) {
                const rect = gl.domElement.getBoundingClientRect();
                const x = e.clientX - rect.width / 2;
                const y = e.clientY - rect.height / 2;
                setIsSelecting(true);
                setStartPoint({ x, y });
                setEndPoint({ x, y });
            }
        }

        function onPointerMove(e) {
            if (isSelecting) {
                const rect = gl.domElement.getBoundingClientRect();
                const x = e.clientX - rect.width / 2;
                const y = e.clientY - rect.height / 2;

                setEndPoint({ x, y });
                updateVisualSelectionBox();
            }
        }

        function onPointerUp(e) {
            setIsSelecting(false);
            checkIntersections();
            updateVisualSelectionBox(); // Hide the selection box
        }

        window.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        return () => {
            window.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [isSelecting, camera, gl, scene, startPoint, endPoint]);

    const checkIntersections = () => {
        // Calculate corners of the selection area in NDC
        const ndcStart = new Vector3(
            (startPoint.x / window.innerWidth) * 2 - 1,
            -(startPoint.y / window.innerHeight) * 2 + 1,
            -1
        );
        const ndcEnd = new Vector3(
            (endPoint.x / window.innerWidth) * 2 - 1,
            -(endPoint.y / window.innerHeight) * 2 + 1,
            1
        );

        // Unproject corners to world space
        const worldStart = ndcStart.unproject(camera);
        const worldEnd = ndcEnd.unproject(camera);

        // Use the camera position and the two unprojected points to define the frustum
        const frustum = new Frustum();
        const projScreenMatrix = new Matrix4();
        projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
        frustum.setFromProjectionMatrix(projScreenMatrix);

        // Now check if objects intersect with the frustum
        selectedObjects.current = [];
        scene.traverse((child) => {
            if (child.isMesh) {
                if (frustum.intersectsObject(child)) {
                    if (child.userData.noteReferenceId) {
                        selectedObjects.current.push(child);
                    }
                }
            }
        });

        console.log(selectedObjects.current);
    };

    return (
        <Html>
            <div ref={selectionDivRef}
                //className="selection-box"
                style={{
                    position: 'absolute',
                    display: 'none',
                    border: '2px dashed #ff0000',
                    pointerEvents: 'none'
                }}>
            </div>
        </Html>
    );
};

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

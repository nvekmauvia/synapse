import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector2, Raycaster } from 'three';
import { Box, Html } from '@react-three/drei'; // Example object
import { Vector3, Frustum, Matrix4 } from 'three';

import { useState, useEffect, useRef } from 'react';
import { useInput } from '../context/InputContext';
import { useNotes } from '../context/NotesContext';
import { useDeleteNote, useDeleteLink } from '../utils/hooks';

import { SelectionBox } from '../components/SelectionBox';
import { SelectionHelper } from '../components/SelectionHelper';

import '../index.css'

export const Selection = () => {
    const { camera, scene, gl: renderer } = useThree();

    const selectionBox = new SelectionBox(camera, scene);
    const helper = new SelectionHelper(renderer, 'selectBox');

    document.addEventListener('pointerdown', function (event) {

        for (const item of selectionBox.collection) {
            //item.material.emissive.set(0x000000);
        }
        selectionBox.startPoint.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            - (event.clientY / window.innerHeight) * 2 + 1,
            0.5);

    });

    document.addEventListener('pointermove', function (event) {
        if (helper.isDown) {

            for (let i = 0; i < selectionBox.collection.length; i++) {
                //console.log(selectionBox.collection[i])
                //selectionBox.collection[i].material.emissive.set(0x000000);
            }

            selectionBox.endPoint.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                - (event.clientY / window.innerHeight) * 2 + 1,
                0.5);

            const allSelected = selectionBox.select();

            for (let i = 0; i < allSelected.length; i++) {
                //console.log(selectionBox.collection[i])
                //allSelected[i].material.emissive.set(0xffffff);
            }
        }
    });

    document.addEventListener('pointerup', function (event) {

        selectionBox.endPoint.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            - (event.clientY / window.innerHeight) * 2 + 1,
            0.5);

        const allSelected = selectionBox.select();

        for (let i = 0; i < allSelected.length; i++) {
            if (selectionBox.collection[i].userData.noteReferenceId) {
                console.log(selectionBox.collection[i])
            }
            //allSelected[i].material.emissive.set(0xffffff);
        }

    });
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

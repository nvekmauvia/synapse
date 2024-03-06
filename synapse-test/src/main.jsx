import { createRoot } from 'react-dom/client'
import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Box, Text, Plane, useTexture } from '@react-three/drei';
import { DoubleSide } from 'three';
import * as THREE from 'three'
import NotesManager from './components/NotesManager'

import './index.css'

function NoteObject({ position, text }) {
  const meshRef = useRef();
  const { camera } = useThree(); // Access the Three.js camera from the react-three-fiber context

  useFrame(({ camera }) => {
    meshRef.current.rotation.copy(camera.rotation)
  })

  return (
    <mesh position={position} ref={meshRef}>
      {/* Plane acting as the billboard background */}
      <Plane args={[1, 1]} /* Plane size, you can adjust this */>
        <meshBasicMaterial color="#fff" side={DoubleSide} transparent={true} opacity={0.8} />
      </Plane>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
    </mesh>
  )
}

const Skybox = () => {
  const size = 50; // Large enough to encompass the scene
  const faces = [
    { color: 'DarkSlateGrey', position: [0, size, 0], rotation: [Math.PI / 2, 0, 0] }, // Top
    { color: 'DarkSlateGrey', position: [0, -size, 0], rotation: [-Math.PI / 2, 0, 0] }, // Bottom
    { color: 'DimGrey', position: [size, 0, 0], rotation: [0, Math.PI / 2, 0] }, // Right
    { color: 'DimGrey', position: [-size, 0, 0], rotation: [0, -Math.PI / 2, 0] }, // Left
    { color: 'SlateGrey', position: [0, 0, size], rotation: [0, Math.PI, 0] }, // Front
    { color: 'SlateGrey', position: [0, 0, -size], rotation: [0, 0, 0] }, // Back
  ];

  return faces.map((face, index) => (
    <mesh key={index} position={face.position} rotation={face.rotation}>
      <planeGeometry args={[size * 2, size * 2]} />
      <meshBasicMaterial color={face.color} side={DoubleSide} />
    </mesh>
  ))
}

createRoot(document.getElementById('root')).render(
  <Canvas
    camera={{
      position: [0, 0, 10],
      fov: 30,
      near: 0.1,
      far: 1000,
    }}
    style={{ background: 'black' }}
  >
    <OrbitControls />
    <Skybox />
    <ambientLight intensity={Math.PI / 2} />
    <NotesManager>
      {notes => (
        <>
          {notes.map(note => (
            <NoteObject key={note.id} position={note.position.toArray()} text="Hello, Miriam!" />
          ))}
        </>
      )}
    </NotesManager>
  </Canvas>
)
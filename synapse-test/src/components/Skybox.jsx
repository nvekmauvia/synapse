import { DoubleSide } from 'three';
import { useNotes } from '../context/NotesContext';

const Skybox = () => {
  const { setEditingNote } = useNotes()
  const size = 500; // Large enough to encompass the scene
  const faces = [
    { color: 'DarkSlateGrey', position: [0, size, 0], rotation: [Math.PI / 2, 0, 0] }, // Top
    { color: 'DarkSlateGrey', position: [0, -size, 0], rotation: [-Math.PI / 2, 0, 0] }, // Bottom
    { color: 'DimGrey', position: [size, 0, 0], rotation: [0, Math.PI / 2, 0] }, // Right
    { color: 'DimGrey', position: [-size, 0, 0], rotation: [0, -Math.PI / 2, 0] }, // Left
    { color: 'SlateGrey', position: [0, 0, size], rotation: [0, Math.PI, 0] }, // Front
    { color: 'SlateGrey', position: [0, 0, -size], rotation: [0, 0, 0] }, // Back
  ];

  const onClick = (e) => {
    //setEditingNote(null)
  }

  return faces.map((face, index) => (
    <mesh key={index} position={face.position} rotation={face.rotation} onClick={onClick}    >
      <planeGeometry args={[size * 2, size * 2]} />
      <meshBasicMaterial color={face.color} side={DoubleSide} />
    </mesh>
  ));
};

export default Skybox
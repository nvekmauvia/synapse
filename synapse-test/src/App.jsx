import { Canvas } from '@react-three/fiber'
import NotesManager from "./components/NotesManager"
import NoteObject from "./components/NoteObject"
import OrbitManager from './components/OrbitManager'
import Skybox from './components/Skybox'

import { NotesProvider } from './context/NotesContext'
import OverlayGUI from './components/GUI/OverlayGUI'
import ArrowIndicator from './components/ArrowIndicator'
import EditNoteGUI from './components/GUI/EditNoteGUI'
import NotesLinks from './components/NotesLinks'

export const App = () => {

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <NotesProvider>
        <Canvas
          camera={{
            position: [0, 0, 10],
            fov: 30,
            near: 0.1,
            far: 1000,
          }}
          style={{ background: 'black' }}
        >
          <OrbitManager />
          <Skybox />
          <NotesManager>
            {notes => (
              <>
                {notes.map(note => (
                  <NoteObject
                    key={note.id}
                    position={note.position.toArray()}
                    noteReference={note}
                  />
                ))}
              </>
            )}
          </NotesManager>
          <NotesLinks />
          <ArrowIndicator />
        </Canvas>
        <OverlayGUI />
        <EditNoteGUI />
      </NotesProvider>
    </div>
  )
};

export default App
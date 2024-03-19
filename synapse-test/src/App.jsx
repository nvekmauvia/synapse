import NotesManager from "./components/NotesManager"
import NoteObject from "./components/NoteObject"
import OrbitManager from './components/OrbitManager'
import Skybox from './components/Skybox'
import { useSetupInputManager } from './services/inputManager';

import ArrowIndicator from './components/ArrowIndicator'
import LinkManager from './components/LinkManager'

export const App = () => {
  // Input Manager
  useSetupInputManager();

  return (
    <>
      <OrbitManager />
      <Skybox />
      <ambientLight intensity={2} />
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
      <LinkManager />
      <ArrowIndicator />
    </>
  )
};

export default App
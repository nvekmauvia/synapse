import React, { useEffect, useRef } from 'react';
import NotesManager from "./components/NotesManager"
import NoteObject from "./components/NoteObject"
import OrbitManager from './components/OrbitManager'
import Skybox from './components/Skybox'
import { useSetupInputManager } from './services/inputManager';

import OverlayGUI from './components/GUI/OverlayGUI'
import ArrowIndicator from './components/ArrowIndicator'
import NotesLinks from './components/NotesLinks'

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
      <NotesLinks />
      <ArrowIndicator />
      <OverlayGUI />
    </>
  )
};

export default App
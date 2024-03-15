import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App';
import { NotesProvider } from './context/NotesContext';
import { InputProvider } from './context/InputContext';
import { Canvas } from '@react-three/fiber'

createRoot(document.getElementById('root')).render(
  < NotesProvider >
    < InputProvider >
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <Canvas
          camera={{
            position: [0, 0, 10],
            fov: 30,
            near: 0.1,
            far: 1000,
          }}
          style={{ background: 'black' }}
        >
          <App />
        </Canvas>
      </div>
    </InputProvider>
  </NotesProvider >
)
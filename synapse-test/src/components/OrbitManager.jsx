import { OrbitControls } from "@react-three/drei"
import { useState, useEffect } from 'react';

const OrbitManager = () => {
    const [orbitEnabled, setOrbitEnabled] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === 'Space') {
                setOrbitEnabled(true);
            }
        };
        const handleKeyUp = (event) => {
            if (event.code === 'Space') {
                setOrbitEnabled(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Cleanup to remove the event listeners when the component unmounts
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);


    return (
        < OrbitControls enabled={orbitEnabled} />
    );
};

export default OrbitManager
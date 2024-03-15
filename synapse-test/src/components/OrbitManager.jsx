import { OrbitControls } from "@react-three/drei"
import { useInput } from "../context/InputContext";

const OrbitManager = () => {
    const { cameraControlsOn } = useInput();

    return (
        < OrbitControls enabled={cameraControlsOn} />
    );
};

export default OrbitManager
import { useEffect, useState } from 'react';

const BrushCursor = ({ size, visible }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const move = (e) => setPosition({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', move);
        return () => window.removeEventListener('mousemove', move);
    }, []);

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 0 5px rgba(0,0,0,0.5)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 9999
        }} />
    );
};

export default BrushCursor;
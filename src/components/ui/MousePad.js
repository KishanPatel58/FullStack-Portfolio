"use client"
import { useState, useEffect } from 'react'
import Cursor from './Cursor';

export default function MousePad() {
    const [clientX, setClientX] = useState(0)
    const [clientY, setClientY] = useState(0)
    useEffect(() => {
        const handleMouseMove = (e) => {
            // Your mouse-move logic here
            setClientX(e.clientX)
            setClientY(e.clientY)
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[3000] pointer-events-none">
            <Cursor clientX={clientX} clientY={clientY} />
        </div>
    );
}

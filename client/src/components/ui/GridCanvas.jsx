import { useEffect, useRef } from "react";

const GridCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        let animationFrameId;
        let offset = 0;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();

        window.addEventListener("resize", resizeCanvas);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const gridSize = 50;
            // rgba(255, 255, 255, 0.12)
            ctx.strokeStyle = "rgba(255, 255, 255, 0.20)";
            ctx.lineWidth = 1;

            // Vertical lines
            for (
                let x = -gridSize + offset;
                x < canvas.width + gridSize;
                x += gridSize
            ) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Horizontal lines
            for (
                let y = -gridSize + offset;
                y < canvas.height + gridSize;
                y += gridSize
            ) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            offset += 0.3;

            if (offset >= gridSize) {
                offset = 0;
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full pointer-events-none"
            />
        </>
    );
};

export default GridCanvas;
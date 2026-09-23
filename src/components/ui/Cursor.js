"use client";

export default function Cursor({
    clientX = 0,
    clientY = 0,
    color = "black",
}) {
    return (
        <div
            className="w-10 h-10 border-3 fixed z-[5000] pointer-events-none rounded-full flex items-center justify-center"
            style={{
                left: `${clientX}px`,
                top: `${clientY}px`,
                borderColor: color,
                transform: "translate(-50%, -50%)",
            }}
        >
            {/* Dot */}
            <span
                className="w-2 h-2 rounded-full transition-all duration-500"
                style={{
                    backgroundColor: color,
                }}
            />
        </div>
    );
}
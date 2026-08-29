import { Grip, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import audioFile from "../../Audio/audio1.mp3";

const Menu = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const PLAY_MUSIC =
        import.meta.env.VITE_PLAY_MUSIC === "true";

    const [play, setPlay] = useState(false);

    const audioRef = useRef(null);

    // Set volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.2;
        }
    }, []);

    // Load saved preference
    useEffect(() => {
        const savedMusic = localStorage.getItem("music");

        if (savedMusic !== null) {
            setPlay(savedMusic === "true");
        } else {
            setPlay(PLAY_MUSIC);
        }
    }, [PLAY_MUSIC]);

    // Try to play music after user interaction
    useEffect(() => {
        if (!play) return;

        const audio = audioRef.current;
        if (!audio) return;

        const startMusic = async () => {
            try {
                await audio.play();

                window.removeEventListener(
                    "click",
                    startMusic
                );

                window.removeEventListener(
                    "keydown",
                    startMusic
                );

                window.removeEventListener(
                    "touchstart",
                    startMusic
                );
            } catch (error) {
                console.log("Waiting for user interaction");
            }
        };

        startMusic();

        window.addEventListener("click", startMusic);
        window.addEventListener("keydown", startMusic);
        window.addEventListener("touchstart", startMusic);

        return () => {
            window.removeEventListener(
                "click",
                startMusic
            );

            window.removeEventListener(
                "keydown",
                startMusic
            );

            window.removeEventListener(
                "touchstart",
                startMusic
            );
        };
    }, [play]);

    // Pause when play becomes false
    useEffect(() => {
        if (!play && audioRef.current) {
            audioRef.current.pause();
        }
    }, [play]);

    const toggleMusic = async () => {
        const audio = audioRef.current;

        if (!audio) return;

        if (audio.paused) {
            try {
                await audio.play();

                setPlay(true);

                localStorage.setItem(
                    "music",
                    "true"
                );
            } catch (error) {
                console.log(
                    "Unable to play music:",
                    error
                );

                setPlay(false);
            }
        } else {
            audio.pause();

            setPlay(false);

            localStorage.setItem(
                "music",
                "false"
            );
        }
    };

    return (
        <div className="fixed bottom-5 right-5 z-50">

            <audio
                ref={audioRef}
                src={audioFile}
                loop
                preload="auto"
            />

            <div className="relative w-[40px]">

                <div
                    className={`
                        absolute
                        bottom-0
                        right-0
                        w-[40px]
                        rounded-full
                        border
                        bg-[#dadada]
                        p-1
                        flex
                        flex-col
                        items-center
                        gap-1
                        overflow-hidden
                        transition-all
                        duration-300
                        ${menuOpen
                            ? "h-[80px]"
                            : "h-[40px]"
                        }
                    `}
                >

                    <button
                        title={play ? "Pause" : "Play"}
                        onClick={toggleMusic}
                        className={`
                            w-[30px]
                            h-[30px]
                            shrink-0
                            rounded-full
                            flex
                            items-center
                            justify-center
                            cursor-pointer
                            bg-black
                            text-white
                            transition-all
                            duration-300
                            ${
                                menuOpen
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-10 pointer-events-none"
                            }
                        `}
                    >
                        {play ? (
                            <Pause size={16} />
                        ) : (
                            <Play size={16} />
                        )}
                    </button>

                </div>

                <button
                    onClick={() =>
                        setMenuOpen(prev => !prev)
                    }
                    className="
                        relative
                        z-20
                        w-[40px]
                        h-[40px]
                        border
                        rounded-full
                        flex
                        items-center
                        justify-center
                        bg-[#dadada]
                        cursor-pointer
                    "
                >
                    <Grip
                        size={22}
                        className={`
                            transition-transform
                            duration-500
                            ${
                                menuOpen
                                    ? "rotate-90"
                                    : "rotate-0"
                            }
                        `}
                    />
                </button>

            </div>
        </div>
    );
};

export default Menu;
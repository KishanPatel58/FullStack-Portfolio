import { CircleArrowRight, XIcon } from "lucide-react";
import { RiGithubLine, RiLinkedinBoxLine } from "@remixicon/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
    const [menuHover, setMenuHover] = useState(false);
    const [hoverLink, setHoverLink] = useState(null);
    const [socialHoverLink, setSocialHoverLink] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = [
        { name: "Home", to: "/" },
        { name: "Login", to: "/login" }
    ];

    const socialLinks = [
        {
            name: "Linkedin",
            to: "#",
            icon: <RiLinkedinBoxLine size={40} color="rgba(255,255,255,1)" />
        },
        {
            name: "Github",
            to: "#",
            icon: <RiGithubLine size={40} strokeWidth="2px" color="rgba(255,255,255,1)" />
        }
    ];

    const badges = [
        "Full Stack Developer",
        "React Developer",
        "MERN Stack",
        "Creative Developer"
    ];

    const carouselBadges = [...badges, ...badges];

    return (
        <>
            {/* ================= NAVBAR ================= */}
            <nav
                className={`
                    flex items-center justify-between
                    p-[9px_7%]
                    sm:p-[9px_15%]
                    lg:p-[9px_18%]
                    xl:p-[9px_20%]
                    fixed top-0 left-0
                    w-full
                    z-[3000]
                    transition-colors
                    duration-300
                    ${menuOpen ? "bg-[#101010]" : "bg-[#dadada]"}
                `}
            >
                <Link
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className={`
                        flex items-center text-2xl cursor-pointer font-semibold
                        transition-colors duration-300
                        ${menuOpen ? "text-white" : "text-black"}
                    `}
                >
                    Kishan
                </Link>

                <div className="flex flex-col w-auto h-7 overflow-hidden">
                    <div
                        className={`
                            transition-all duration-300
                            ${menuOpen ? "-translate-y-6 text-white" : ""}
                        `}
                    >
                        <button
                            type="button"
                            onClick={() => setMenuOpen(true)}
                            onMouseEnter={() => setMenuHover(true)}
                            onMouseLeave={() => setMenuHover(false)}
                            className="flex items-center font-semibold justify-center gap-2 cursor-pointer"
                        >
                            Menu
                            <div className="flex flex-col py-1 justify-center items-center gap-1 overflow-hidden">
                                <span className="h-[2px] w-5 bg-black" />
                                <span
                                    className={`
                                        h-[2px] w-5 bg-black
                                        transition-all duration-300
                                        ${menuHover ? "" : "translate-x-2"}
                                    `}
                                />
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Close
                            <XIcon size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ================= FULL SCREEN MENU (Top → Bottom) ================= */}
            <motion.div
                onClick={() => setMenuOpen(false)}
                initial={false}
                animate={{ y: menuOpen ? "0%" : "-100%" }}
                transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
                className="
                    fixed top-0 left-0 z-[2999]
                    flex flex-col sm:flex-row
                    items-stretch justify-between
                    w-full h-screen
                    bg-[#101010]
                    overflow-hidden
                "
            >
                {/* ================= LEFT SIDE ================= */}
                <div
                    className="
                        relative z-10
                        flex flex-col
                        w-full sm:w-[55%]
                        h-full
                        overflow-y-auto
                        overflow-x-hidden
                    "
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* NAV LINKS */}
                    <ul className="relative flex flex-col gap-3 sm:gap-4 mt-24 px-5 sm:px-10 lg:px-16 flex-shrink-0">
                        {navLinks.map((link, idx) => (
                            <div
                                key={link.name}
                                className="flex items-center justify-start gap-2 w-full"
                            >
                                {/* Number */}
                                <motion.span
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={
                                        menuOpen
                                            ? { opacity: 1, y: 0 }
                                            : { opacity: 0, y: -20 }
                                    }
                                    transition={{
                                        duration: 0.4,
                                        delay: menuOpen ? 0.2 + idx * 0.08 : 0
                                    }}
                                    className="text-white/50 text-sm self-center"
                                >
                                    [0{idx + 1}]
                                </motion.span>

                                {/* Link */}
                                <motion.div
                                    initial={{ opacity: 0, y: -40 }}
                                    animate={
                                        menuOpen
                                            ? { opacity: 1, y: 0 }
                                            : { opacity: 0, y: -40 }
                                    }
                                    transition={{
                                        duration: 0.5,
                                        delay: menuOpen ? 0.25 + idx * 0.1 : 0,
                                        ease: [0.76, 0, 0.24, 1]
                                    }}
                                    onMouseEnter={() => setHoverLink(idx)}
                                    onMouseLeave={() => setHoverLink(null)}
                                    className="relative h-[1.1em] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold leading-none overflow-hidden"
                                >
                                    <div
                                        className={`
                                            flex flex-col
                                            transition-transform duration-300 ease-out
                                            ${hoverLink === idx
                                                ? "-translate-y-[calc(50%+10px)] sm:-translate-y-[calc(50%+15px)]"
                                                : "-translate-y-1 sm:-translate-y-2 md:-translate-y-3"
                                            }
                                        `}
                                        style={{ height: "200%" }}
                                    >
                                        {/* Outline (default) */}
                                        <Link
                                            to={link.to}
                                            onClick={() => setMenuOpen(false)}
                                            className="h-1/2 flex items-center white-stroke text-transparent leading-none"
                                        >
                                            {link.name}
                                        </Link>

                                        {/* Filled (on hover) */}
                                        <Link
                                            to={link.to}
                                            onClick={() => setMenuOpen(false)}
                                            className="h-1/2 flex items-center text-white leading-none"
                                        >
                                            {link.name}
                                        </Link>
                                    </div>
                                </motion.div>

                                {/* Arrow */}
                                <CircleArrowRight
                                    size={32}
                                    className={`
                                        text-white shrink-0 -rotate-[45deg]
                                        transition-all duration-300
                                        ${hoverLink === idx
                                            ? "opacity-100 translate-x-0"
                                            : "opacity-0 -translate-x-3"
                                        }
                                    `}
                                />
                            </div>
                        ))}
                    </ul>

                    {/* ================= SOCIAL LINKS ================= */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={
                            menuOpen
                                ? { opacity: 1, y: 0 }
                                : { opacity: 0, y: 30 }
                        }
                        transition={{
                            duration: 0.5,
                            delay: menuOpen ? 0.7 : 0
                        }}
                        className="
                            mt-auto
                            mb-10 sm:mb-0
                            pt-8 pb-8
                            pl-5 sm:pl-10 lg:pl-16
                            flex flex-col
                            items-start justify-start
                            gap-3
                            flex-shrink-0
                        "
                    >
                        <h1 className="text-white text-base sm:text-lg">
                            Social Links<span className="animate-pulse">_</span>
                        </h1>

                        <div className="flex gap-4">
                            {socialLinks.map((link, idx) => (
                                <Link
                                    to={link.to}
                                    key={link.name}
                                    className="relative flex items-center justify-center"
                                    onMouseEnter={() => setSocialHoverLink(idx)}
                                    onMouseLeave={() => setSocialHoverLink(null)}
                                >
                                    <div className="cursor-pointer transition-transform duration-300 hover:scale-110">
                                        {link.icon}
                                    </div>

                                    <div
                                        className={`
                                            absolute flex items-center justify-center gap-2
                                            left-1/2 -translate-x-1/2 whitespace-nowrap
                                            text-sm font-semibold text-white
                                            bg-[#3a3a3a] px-[10px] py-[8px] rounded-lg
                                            pointer-events-none transition-all duration-300
                                            ${socialHoverLink === idx
                                                ? "-top-12 opacity-100 translate-y-0"
                                                : "-top-8 opacity-0 translate-y-2"
                                            }
                                        `}
                                    >
                                        {link.name}
                                        <CircleArrowRight
                                            color="#ffffff"
                                            size={17}
                                            className="-rotate-[45deg]"
                                        />
                                        <div className="w-0 h-0 absolute left-1/2 -translate-x-1/2 -bottom-2 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[#3a3a3a]" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ================= RIGHT SIDE DESKTOP ================= */}
                <div className="relative hidden lg:flex flex-col justify-center w-[45%] h-full overflow-hidden">
                    <div className="w-full overflow-hidden -rotate-[12deg]">
                        <div className="upper-badge flex w-max animate-carousel">
                            {carouselBadges.map((badge, idx) => (
                                <h1
                                    key={`top-${idx}`}
                                    className={`
                                        shrink-0
                                        text-5xl lg:text-7xl xl:text-8xl
                                        font-semibold leading-none px-4
                                        ${idx % 2 === 0
                                            ? "white-stroke text-transparent"
                                            : "text-white"
                                        }
                                    `}
                                >
                                    {badge}
                                </h1>
                            ))}
                        </div>
                    </div>

                    <div className="absolute w-full overflow-hidden rotate-[12deg]">
                        <div className="lower-badge flex w-max animate-carousel-reverse">
                            {carouselBadges.map((badge, idx) => (
                                <h1
                                    key={`bottom-${idx}`}
                                    className={`
                                        shrink-0
                                        text-5xl lg:text-7xl xl:text-8xl
                                        font-semibold leading-none px-4
                                        ${idx % 2 === 0
                                            ? "text-white"
                                            : "white-stroke text-transparent"
                                        }
                                    `}
                                >
                                    {badge}
                                </h1>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default Navbar;
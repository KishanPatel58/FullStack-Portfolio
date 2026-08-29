import React from "react";
import { motion } from "framer-motion";
import { Home, FolderKanban, ArrowRight, Sparkles, ArrowRightIcon, HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#f4f4f2] text-[#20232a]">

            {/* Background subtle glow */}
            <div className="absolute left-1/2 top-[48%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300/20 blur-[120px]" />

            <div className="absolute left-1/2 top-[48%] h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-300/20 blur-[100px]" />


            {/* Main Content */}
            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-10">

                {/* Small top text */}
                <motion.p
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4 text-sm tracking-wide text-zinc-500"
                >
                    You look a little lost...
                </motion.p>


                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.7,
                        ease: "easeOut",
                    }}
                    className="relative"
                >
                    {/* Left decorative cloud */}
                    <motion.div
                        animate={{
                            y: [0, -6, 0],
                            rotate: [-5, 5, -5],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute -left-8 -top-6"
                    >
                        <div
                            className="h-5 w-10 bg-gradient-to-r from-purple-400 via-pink-300 to-blue-400 blur-[1px] [clip-path:path('M5,20C2,20,0,18,0,15C0,12,2,10,5,10C5,6,8,3,12,3C15,3,18,5,19,8C20,7,22,6,25,6C29,6,32,9,33,12C34,11,36,10,38,10C42,10,45,13,45,16C45,18,43,20,40,20Z')]"
                        />
                    </motion.div>

                    <h1 className="text-center text-4xl font-medium tracking-tight text-zinc-800 sm:text-5xl md:text-6xl">
                        Ooops! Page not found
                    </h1>

                    {/* Right decorative cloud */}
                    <motion.div
                        animate={{
                            y: [0, 7, 0],
                            rotate: [5, -5, 5],
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute -right-7 top-2"
                    >
                        <div className="h-5 w-9 [clip-path:polygon(50%_15%,61%_5%,75%_5%,88%_15%,95%_30%,95%_45%,85%_65%,50%_95%,15%_65%,5%_45%,5%_30%,12%_15%,25%_5%,39%_5%)] bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 blur-[1px]" />
                    </motion.div>
                </motion.div>


                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mt-5 max-w-xl text-center text-sm leading-7 text-zinc-500"
                >
                    Looks like this page took a trip somewhere else.
                    <br />
                    Let's get you back on the right path.
                </motion.p>


                {/* UFO Section */}
                <div className="relative mt-8 flex h-[260px] w-[600px] max-w-full items-center justify-center">

                    {/* Outer orbital circles */}
                    <div className="absolute h-[250px] w-[250px] rounded-full border border-zinc-300/60 sm:h-[360px] sm:w-[360px]" />

                    <div className="absolute h-[200px] w-[200px] rounded-full border border-zinc-300/50 sm:h-[300px] sm:w-[300px]" />

                    <div className="absolute h-[150px] w-[150px] rounded-full border border-zinc-300/40 sm:h-[240px] sm:w-[240px]" />


                    {/* UFO Glow */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute h-44 w-72 rounded-full bg-blue-300/30 blur-[60px]"
                    />


                    {/* UFO IMAGE */}
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 30,
                            scale: 0.8,
                        }}
                        animate={{
                            opacity: 1,
                            y: [0, -12, 0],
                            scale: 1,
                        }}
                        transition={{
                            opacity: {
                                duration: 0.6,
                            },
                            scale: {
                                duration: 0.6,
                            },
                            y: {
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            },
                        }}
                        className="relative z-20"
                    >

                        <img
                            src="/ufo.png"
                            alt="Flying UFO"
                            className="h-auto w-[230px] object-contain drop-shadow-2xl sm:w-[280px]"
                        />


                        {/* LIGHTNING IMAGE */}
                        <motion.img
                            src="/lightning.png"
                            alt=""
                            animate={{
                                opacity: [0.4, 1, 0.4],
                                y: [0, -8, 0],
                                rotate: [-5, 5, -5],
                                scale: [0.9, 1.1, 0.9],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute -right-8 -top-8 h-14 w-14 object-contain sm:h-16 sm:w-16"
                        />

                    </motion.div>


                    {/* Decorative particles */}
                    <motion.div
                        animate={{
                            opacity: [0.2, 1, 0.2],
                            scale: [0.8, 1.2, 0.8],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                        }}
                        className="absolute left-[30%] top-[65%]"
                    >
                        <Sparkles size={14} className="text-blue-400" />
                    </motion.div>


                    <motion.div
                        animate={{
                            opacity: [1, 0.3, 1],
                            scale: [1, 0.7, 1],
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                        }}
                        className="absolute right-[28%] top-[62%]"
                    >
                        <Sparkles size={12} className="text-purple-400" />
                    </motion.div>

                </div>


                {/* Navigation Cards */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 30,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.6,
                        duration: 0.6,
                    }}
                    className="mt-3 flex w-full max-w-sm flex-col gap-3"
                >


                    <Link
                        to="/"
                        className="button-bg w-full max-w-[360px] rounded-[22px] p-0.5 hover:scale-[1.02] transition duration-300 active:scale-[0.99] z-[60]"
                    >
                        <div className="group flex items-center justify-between w-full px-6 py-4 rounded-[20px] bg-white/90 backdrop-blur-md">

                            {/* Left Side */}
                            <div className="flex items-center gap-4">

                                {/* Home Icon */}
                                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gray-100 shadow-sm">
                                    <HomeIcon className="w-5 h-5 text-gray-800" />
                                </div>

                                {/* Text */}
                                <div className="flex flex-col text-left">
                                    <span className="text-[15px] font-semibold text-gray-800">
                                        Home Page
                                    </span>

                                    <span className="mt-0.5 text-xs text-gray-500">
                                        There's no place like home...
                                    </span>
                                </div>

                            </div>

                            {/* Arrow */}
                            <ArrowRightIcon
                                className="w-5 h-5 text-gray-500 transition-transform duration-300 group-hover:translate-x-1"
                            />

                        </div>
                    </Link>

                </motion.div>

            </main>
        </div>
    );
};

export default NotFound;
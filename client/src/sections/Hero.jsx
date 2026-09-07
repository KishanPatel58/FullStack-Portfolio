import { FileCog, SendHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { UseMyContext } from "../context/MyContext";
import Button from "../components/ui/Button";
import { useEffect, useState } from "react";
import api from "../api/axios";

const Hero = () => {
    const [admin, setAdmin] = useState(null)
    const { Profile } = UseMyContext();

    const badges = [
        "Full Stack Developer",
        "React Developer",
        "MERN Stack",
        "Creative Developer"
    ];

    // Duplicate for seamless loop
    const carouselBadges = [...badges, ...badges];


    // Fetch Owner Details.
    const fetchProfileDetails = async () => {
        try {
            const {data} = await api.get("/api/portfolio/profile");
            if(data.success){
                setAdmin(data.admin)
            }
        } catch (error) {
            console.log("Failed to Fetch:", error)
            return;
        }
    }

    useEffect(()=>{
        fetchProfileDetails()
    },[])
    return (
        <section className="relative h-auto flex items-center flex-col gap-4 sm:gap-7 overflow-hidden">
            <div className="flex flex-col justify-center items-center sm:gap-3">
                
                {/* Hi Greeting */}
                <motion.h1
                    className="text-[15vw] mt-20 font-semibold leading-tight sm:text-7xl"
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    Hi!, 👋
                </motion.h1>

                {/* Name */}
                <motion.h1
                    className="text-[9vw] font-semibold sm:text-4xl"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
                >
                    I'm {admin?.name}
                </motion.h1>
            </div>

            {/* Description */}
            <motion.p
                className="px-[10vw] text-[5vw] text-justify sm:text-2xl sm:px-15 sm:w-[90vh] leading-tight"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
            >
                {admin?.about?.shortDescription}
            </motion.p>

            {/* Buttons */}
            <motion.div
                className="w-full flex items-center justify-center gap-2 sm:gap-6 flex-col sm:flex-row mt-3 py-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
            >
                <Button
                    type="fill"
                    link="/projects"
                    text="Projects"
                    icon={<FileCog />}
                    className="w-[35vh]"
                />
                <Button
                    link="/contact"
                    text="Contact"
                    type="border"
                    icon={
                        <SendHorizontal className="text-black group-hover:text-white group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-300 -rotate-40" />
                    }
                />
            </motion.div>

            {/* Horizontal Marquee */}
            <motion.div
                className="w-full overflow-hidden mt-6 mb-4"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.55 }}
            >
                <div className="flex w-max h-auto py-6 animate-carousel">
                    {carouselBadges.map((badge, idx) => (
                        <h1
                            key={`hero-badge-${idx}`}
                            className={`
                                shrink-0
                                text-5xl
                                sm:text-6xl
                                md:text-7xl
                                lg:text-8xl
                                font-semibold
                                leading-none
                                px-4
                                ${idx % 2 === 0
                                    ? "black-stroke text-transparent"
                                    : "text-black"
                                }
                            `}
                        >
                            {badge}
                        </h1>
                    ))}
                </div>
            </motion.div>
        </section>
    )
}

export default Hero;
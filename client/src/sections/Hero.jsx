import { FileCog, SendHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { UseMyContext } from "../context/MyContext";
import Button from "../components/ui/Button";

const Hero = () => {
    const { Profile } = UseMyContext();

    return (
        <section className="relative h-auto flex items-center flex-col gap-4 sm:gap-7">
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
                    I'm {Profile.me.name}
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
                {Profile.me.description}
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
        </section>
    )
}

export default Hero;
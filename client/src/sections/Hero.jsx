import { FileCog, FolderBookmark, SendHorizontal } from "lucide-react";
import { UseMyContext } from "../context/MyContext";
import Button from "../components/ui/Button";

const Hero = () => {
    const { Profile } = UseMyContext();
    return (
        <section className="relative h-auto flex items-center flex-col gap-4 sm:gap-7">
            <div className="flex flex-col justify-center items-center sm:gap-3">
                <h1 className="text-[15vw] mt-20 font-semibold leading-tight sm:text-7xl">Hi!, 👋</h1>
                <h1 className="text-[9vw] font-semibold sm:text-4xl">I'm {Profile.me.name}</h1>
            </div>
            <p className="px-[10vw] text-[5vw] text-justify sm:text-2xl sm:px-15 sm:w-[90vh] leading-tight">{Profile.me.description}</p>
            <div className="w-full flex items-center justify-center gap-2 sm:gap-6 flex-col sm:flex-row mt-3 py-3">
                <Button type="fill" link="/projects" text="Projects" icon={<FileCog />} className="w-[35vh]"/>
                <Button text="Contact" type="border" icon={<SendHorizontal className='text-black group-hover:text-white group-hover:-translate-y-1 group-hover:translate-x-1 transition-all duration-300 -rotate-40' />}/>
            </div>
        </section >
    )
}

export default Hero;
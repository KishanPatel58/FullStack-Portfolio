import { CircleArrowRight, LinkIcon, Mail, MapPinHouse } from 'lucide-react'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { UseMyContext } from '../context/MyContext'
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { RiGithubLine, RiLinkedinBoxLine } from '@remixicon/react';
import GridCanvas from '../components/ui/GridCanvas';

const Contact = () => {
  const { Profile } = UseMyContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialHoverLink, setSocialHoverLink] = useState(null);

  const socialLinks = [
    {
      name: "Linkedin",
      to: "#",
      icon: (
        <RiLinkedinBoxLine size={45} color="#101010" />
      ),
      title: "Linkedin"
    },
    {
      name: "Github",
      to: "#",
      icon: (
        <RiGithubLine size={45} strokeWidth="2px" color="#101010" />
      ),
      title: "Github"
    }
  ];

  const handleContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Your Message Recorded...")
      setLoading(false)
    }, 3000)
  }
  return (
    <>
      <GridCanvas />
      <div className='relative flex justify-center items-center gap-2 w-full min-h-screen mt-9 mx-auto sm:flex-row sm:px-2'>
        <div className='w-full flex flex-col justify-center items-center sm:flex-row sm:w-[90vh]'>
          <div className='w-full flex items-center justify-center flex-col'>
            <h1 className='w-[90%] text-start text-3xl mt-6'>Contact Me<span className='animate-pulse'>_</span></h1>
            {/* Address */}
            {/* Heading */}
            <h1 className='w-[90%] text-start text-xl mt-6 flex items-center justify-start gap-2'><MapPinHouse size={18} color="#000" /> <span className='flex items-center justify-center'>Address <span className='animate-pulse'>_</span></span></h1>
            <p className='w-[90%] text-left'>{Profile.me.address}</p>

            {/* Email */}
            {/* Heading */}
            <h1 className='w-[90%] text-start text-xl mt-6 flex items-center justify-start gap-2'><Mail color="#000" size={18} /> <span className='flex items-center justify-center'>Email <span className='animate-pulse'>_</span></span></h1>
            <p className='w-[90%] text-left'>{Profile.me.email}</p>

            {/* Social Links */}
            {/* Heading */}
            {/* <h1 className='w-[90%] text-start text-xl mt-6 flex items-center justify-start gap-2'><LinkIcon color='#000' size={18} /> <span className='flex items-center justify-center'>Social Links <span className='animate-pulse'>_</span></span></h1>
          <div className='flex items-center justify-start gap-2 w-[90%] mt-2'>
            {
              socialLinks.map((link, idx) => (
                <Link title={link.title} key={idx} to={link.to}>{link.icon}</Link>
              ))
            }
          </div> */}

            <motion.div
              initial={{
                opacity: 0,
                y: 30
              }}
              animate={{
                opacity: 1,
                y: 0
              }

              }
              transition={{
                duration: 0.5,
                delay: 0.5
              }}
              className="
                            mt-4
                            w-[90%]
                            mb-[10%]
                            flex
                            flex-col
                            items-start
                            justify-start
                            gap-2
                            
                        "
            >
              <h1 className="text-black flex items-center gap-2 text-xl "><LinkIcon color='#000' size={18} /> Social Links<span className="animate-pulse">_</span></h1>
              <div className="flex gap-4">
                {socialLinks.map((link, idx) => (
                  <Link
                    to={link.to}
                    key={link.name}
                    className="
                                    relative
                                    flex
                                    items-center
                                    justify-center
                                "
                    onMouseEnter={() =>
                      setSocialHoverLink(idx)
                    }
                    onMouseLeave={() =>
                      setSocialHoverLink(null)
                    }
                  >
                    {/* Icon */}

                    <div
                      className="
                                        cursor-pointer
                                        transition-transform
                                        duration-300
                                        hover:scale-110
                                    "
                    >
                      {link.icon}
                    </div>


                    {/* Tooltip */}

                    <div
                      className={`
                                        absolute

                                        flex
                                        items-center
                                        justify-center
                                        gap-2

                                        left-1/2
                                        -translate-x-1/2

                                        whitespace-nowrap

                                        text-sm
                                        font-semibold
                                        text-white

                                        bg-[#3a3a3a]

                                        px-[10px]
                                        py-[8px]

                                        rounded-lg

                                        pointer-events-none

                                        transition-all
                                        duration-300

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

                      {/* Triangle */}

                      <div
                        className="
                                            w-0
                                            h-0

                                            absolute
                                            left-1/2
                                            -translate-x-1/2
                                            -bottom-2

                                            border-l-[6px]
                                            border-r-[6px]
                                            border-t-[8px]

                                            border-l-transparent
                                            border-r-transparent
                                            border-t-[#3a3a3a]
                                        "
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

          </div>
          {/* Contact Form */}
          <form onSubmit={handleContact} className='w-[90%] relative flex flex-col justify-center items-center mt-9'>
            <h1 className='w-full px-2 text-3xl'>Say Hi👋!</h1>
            <div className='flex flex-col items-center justify-center gap-4 overflow-auto w-full relative p-2 mt-2'>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder='Your Name' className='w-full border outline-4 outline-transparent focus:outline-black focus:border-transparent p-[5px_20px] rounded-lg transition-all duration-300' required />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Your Email' className='w-full border outline-4 outline-transparent focus:outline-black focus:border-transparent p-[5px_20px] rounded-lg transition-all duration-300' required />
            </div>
            <div className='w-full p-2'>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder='Your Message' className='border outline-4 outline-transparent focus:border-transparent focus:outline-black w-full p-[5px_20px] rounded-lg transition-all duration-300' rows={5} cols={15} autoCorrect='true' required />
            </div>
            <div className='w-full flex items-center justify-start p-2'>
              <button type="submit" className='bg-black text-white p-[8px_20px] rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed' disabled={loading}>{loading && <div className='w-5 h-5 border border-b-transparent border-white rounded-full animate-spin' />}{loading ? "Submiting..." : "Submit"}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default Contact
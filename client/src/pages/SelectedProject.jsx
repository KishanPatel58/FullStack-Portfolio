import React from 'react'
import { UseMyContext } from '../context/MyContext'
import { Link, useParams } from 'react-router-dom';
import { CodeXml, ExternalLink } from 'lucide-react';

const SelectedProject = () => {
    const { Projects } = UseMyContext();
    const params = useParams();
    const selectedProject = Projects.filter(project => project._id === params.id)[0];
    console.log(selectedProject)
    return (
        <div className='w-full h-auto mt-15 flex items-center justify-center flex-col'>
            <img src={selectedProject.image} alt={selectedProject.name} className='mx-auto w-[90%] object-cover rounded-lg' />
            {/* Project Title */}
            <h1 className='w-[90%] text-left text-lg mt-2 font-semibold'>
                {selectedProject.name}_
            </h1>

            {/* Project Tech Stack */}
            {/* Heading */}
            <h1 className='w-[90%] text-left text-sm mt-2 font-semibold'>
                Tech Stack_
            </h1>
            <div className='w-[90%] flex flex-wrap justify-start items-start gap-1 mt-2'>
                {
                    selectedProject.techStack.map((stack, idx) => (
                        <span key={idx} className='flex items-center justify-center gap-1 border relative w-auto h-auto rounded-full p-1'>
                            <img src={stack.icon} alt={stack.name} className='w-4 h-4 rounded-full' />
                            <p className='text-xs'>{stack.name}</p>
                        </span>
                    ))
                }
            </div>

            {/* Project Big Description */}
            {/* Heading */}
            <h1 className='w-[90%] text-left text-sm mt-2 font-semibold'>
                Description_
            </h1>
            {/* Description */}
            <p className='text-xs mt-2 text-justify w-[90%]'>
                {selectedProject.desc}
            </p>

            {/* Project Core Features */}
            {/* Heading */}
            <h1 className='w-[90%] text-left text-sm mt-2 font-semibold'>
                Core Features_
            </h1>
            {/* Core Features */}
            <div className='w-[90%] mt-2'>
                {
                    selectedProject.coreFeatures.map((feature, idx) => (
                        <div key={`${feature.title}-${idx}`} className='mt-2'>
                            <h1 className='text-xs font-semibold'>
                                {feature.title}_
                            </h1>
                            <ul className='w-full' style={{ listStyleType: "disc" }}>
                                {
                                    feature.description.map((description, index) => (
                                        <li key={index} className='text-xs ml-9 mt-1 !list-disc'>
                                            <span>{description.desc}</span>
                                            <ul className='w-full' style={{ listStyleType: "disc" }}>
                                                {
                                                    description?.points?.length > 0 && (
                                                        description?.points?.map((point, ind) => (
                                                            <li key={ind} className='ml-9 !list-disc'>{point}</li>
                                                        ))
                                                    )
                                                }
                                            </ul>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    ))
                }
            </div>

            {/* Project Links */}
            {/* Heading */}
            <h1 className='w-[90%] text-left text-sm mt-4 font-semibold'>
                Links_
            </h1>
            <div className='w-[90%] flex justify-start items-center'>
                <div className='relative w-full left-0 bottom-0 flex items-center justify-start mt-2 gap-2 mb-4 sm:w-[50vh]'>
                    {
                        selectedProject?.githubLink && <Link to={selectedProject.githubLink} className='w-1/2 h-auto py-1 bg-black text-white flex items-center justify-center gap-2 border border-black rounded-lg'>Code <CodeXml /></Link>
                    }
                    {
                        selectedProject?.publicLink && <Link to={selectedProject.publicLink} className='w-1/2 h-auto py-1 flex items-center justify-center gap-2 border border-black rounded-lg'>Live Demo <ExternalLink size={20} /></Link>
                    }
                </div>

            </div>
        </div>
    )
}

export default SelectedProject
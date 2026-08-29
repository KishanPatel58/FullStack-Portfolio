import React from 'react'
import GridCanvas from '../components/ui/GridCanvas'
import { UseMyContext } from '../context/MyContext'
import { Link } from 'react-router-dom';
import { CodeXml, ExternalLink } from 'lucide-react';

const Projects = () => {
  const { Projects } = UseMyContext();
  return (
    <div className='w-full h-full flex items-center justify-center flex-col mt-7'>
      <GridCanvas />
      <div className='relative flex flex-col justify-start items-start gap-2 w-[90%]'>
        <h1 className='w-full text-start text-3xl mt-6'>Projects<span className='animate-pulse'>_</span></h1>
      </div>
      <div className='w-full h-auto flex flex-col justify-center items-center gap-5 sm:grid md:grid-cols-2 lg:grid-cols-3 mb-3 mt-5 mx-auto'>
        {
          Projects.map((project, idx) => (
            <div key={idx} className='w-[90%] h-auto border p-2 rounded-lg flex flex-col items-start justify-start relative overflow-hidden bg-[#dadada] mx-auto'>
              {/* Project Name */}
              <span className='absolute top-0 left-0 w-auto h-auto text-xs border border-t border-r border-b border-black bg-black text-white p-2 rounded-br-lg font-semibold'>
                {project.name}
              </span>
              {/* Project Thumbnail Image */}
              <img src={project.image} alt={project.name} className='w-full rounded-lg' />
              {/* Tech Stack to Build Project. */}
              {/* Heading */}
              <h1 className='w-full text-left text-sm mt-2'>
                TechStack_
              </h1>
              <div className='flex flex-wrap justify-start items-start gap-1 mt-2'>
                {
                  project.techStack.map((stack, idx) => (
                    <span key={idx} className='flex items-center justify-center gap-1 border relative w-auto h-auto rounded-full p-1'>
                      <img src={stack.icon} alt={stack.name} className='w-4 h-4 rounded-full' />
                      <p className='text-xs'>{stack.name}</p>
                    </span>
                  ))
                }
              </div>
              {/* Project Description */}
              {/* Heading */}
              <h1 className='w-full text-left text-sm mt-2'>
                Description_
              </h1>
              <p className='text-xs mt-2 text-justify'>
                {project.shortdesc}
              </p>

                {/* More Info Link */}
              <Link to={`/projects/${project._id}`} className='w-auto text-left text-sm mt-1'>
                More...
              </Link>
              {/* Project Links */}
              {/* Heading */}
              <h1 className='w-full text-left text-sm mt-2'>
                Links_
              </h1>
              <div className='w-full h-auto flex items-center justify-center gap-2 mt-2'>
                {
                  project.githubLink && <Link to={project.githubLink} className='w-1/2 h-auto py-2 bg-black text-white flex items-center justify-center gap-2 border border-black rounded-lg'>Code <CodeXml /></Link>
                }
                {
                  project.publicLink && <Link to={project.publicLink} className='w-1/2 h-auto py-2 flex items-center justify-center gap-2 border border-black rounded-lg'>Live Demo <ExternalLink size={20} /></Link>
                }
              </div>
              
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Projects
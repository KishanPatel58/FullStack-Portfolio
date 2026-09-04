import { GraduationCap, Pencil, PencilSparkles, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { UseAdmin } from '../../context/AdminContext'
import { buildStyles, CircularProgressbar, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import ChangingProgressProvider from '../../components/ChangingProgressProvider';

const Skills = () => {
  const { admin } = UseAdmin()
  const [skillName, setSkillName] = useState("");
  const [knowledge, setKnowledge] = useState(["Beginner", "Elementary", "Intermediate", "Upper-Intermediate", "Advanced", "Expert", "Specialist"]);
  const [skillImage, setSkillImage] = useState(null)
  const [skillAddFormShow, setSkillAddFormShow] = useState(true)
  const [categoryAddFormShow, setCategoryAddFormShow] = useState(false)
  const [loading, setLoading] = useState(false)

  // Skills
  const skills = [
    { name: "TailwindCss", category: "Frontend", knowledge: "Upper-Intermediate", level: "70" },
    { name: "CSS", category: "Frontend", knowledge: "Upper-Intermediate", level: 70 },
    { name: "HTML", category: "Frontend", knowledge: "Upper-Intermediate", level: 70 },
    { name: "React", category: "Frontend", knowledge: "Upper-Intermediate", level: 70 },
    { name: "JavaScript", category: "Frontend", knowledge: "Intermediate", level: 60 },
    { name: "Node", category: "Backend", knowledge: "Elementary", level: 30 },
    { name: "MongoDB", category: "Database", knowledge: "Intermediate", level: 60 },
    { name: "Express", category: "Backend", knowledge: "Intermediate", level: 60 }
  ]
  const categories = [
    { name: "Frontend" },
    { name: "Backend" },
    { name: "Database" },
    { name: "Tools" },
  ]

  // Add Category Form.
  const handleCategory = async (e) => {
    e.preventDefault();
  }
  
  return (
    <>
      <div className='relative w-full h-screen flex flex-col justify-center items-center'>
        <div className='TopBar w-full h-[8%] border-b border-[#0000009b] flex items-center justify-between px-[28px]'>
          <span className='flex items-center justify-center gap-2 text-xl font-semibold'><GraduationCap size={30} /> Skills</span>
          {/* Add Skill Button */}
          <button type='button' onClick={() => setSkillAddFormShow(true)} className='bg-black text-white p-[5px_20px] rounded-lg flex items-center justify-center gap-2 font-semibold cursor-pointer'>Add <Plus color="#ffffff" size={18} /></button>
        </div>
        <div className='MainContent w-full h-[92%] flex flex-col justify-center items-center relative'>
          <div className='w-full h-[50%] border-b border-[#0000009b] p-4'>
            <h1 className='text-2xl'>Skills<span className='animate-pulse'>_</span></h1>
            <div className='w-full h-auto flex flex-wrap gap-2 px-2 mt-5'>
              {skills.map((skill, idx) => (
                <div className='h-30 w-30 relative flex justify-center items-center flex-col group' key={idx}>
                  {/* Tooltip for Delete and update */}
                  <div className='absolute top-0 right-0 w-auto h-auto flex items-center justify-between gap-2 z-20 bg-[#dadada] p-[5px] opacity-0 pointer-events-none group-hover:!pointer-events-auto group-hover:opacity-100 transition-all duration-300'>
                    <button className='p-1 bg-green-400 text-white rounded-lg '><Pencil /></button>
                    <button className='p-1 bg-red-400 text-white rounded-lg'><Trash2 /></button>
                  </div>
                  <ChangingProgressProvider values={[0, skill.level]}>
                    {() => (
                      <CircularProgressbarWithChildren value={skill.level} styles={buildStyles({
                        pathTransition:
                          skill.level === 0 ? "none" : "stroke-dashoffset 0.5s ease 0s",
                        pathColor: "#000",
                        trailColor: "#dadada"
                      })}>
                        {/* Put any JSX content in here that you'd like. It'll be vertically and horizonally centered. */}
                        <img
                          // 
                          style={{ width: 40, marginTop: -5 }}
                          src="https://i.imgur.com/b9NyUGm.png"
                          alt="doge"
                        />
                        <div style={{ fontSize: 12, marginTop: -5 }}>
                          <strong>{skill.level}%</strong> mate
                        </div>
                      </CircularProgressbarWithChildren>
                    )}
                  </ChangingProgressProvider>
                  <p>{skill.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className='w-full h-[50%] border-b border-[#0000009b] p-4'>
            <div className="flex w-full justify-between items-center">
              <h1 className='text-2xl'>Category<span className='animate-pulse'>_</span></h1>
              <button type='button' onClick={() => setCategoryAddFormShow(true)} className='bg-black text-white p-[5px_20px] rounded-lg flex items-center justify-center gap-2 font-semibold cursor-pointer'>Add <Plus color="#ffffff" size={18} /></button>
            </div>
            <div className='w-full h-auto flex flex-wrap gap-2 px-2 mt-5'>
              {
                categories.map((category, idx) => (
                  <span key={idx} className='w-auto shrink-0 flex items-center justify-between border border-[#0000009b] p-[5px] gap-3 rounded-lg font-semibold'>
                    {category.name}
                    {/* Delete Icon */}
                    <button className='p-1 bg-red-400 text-white rounded-lg'><Trash2 /></button>
                  </span>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Skill Add Form */}
      {/* Category Add Form */}
      {
        categoryAddFormShow && (
          <div
            onClick={() => setCategoryAddFormShow(false)}
            className='min-w-screen min-h-screen flex items-center justify-center absolute top-0 right-0 bg-black/20 z-[3000]'
          >
            <form
              onSubmit={handleCategory}
              onClick={(e) => e.stopPropagation()}
              className='w-[30%] h-auto flex flex-col justify-center items-center bg-white rounded-lg p-3 gap-3'
            >
              <h1 className='text-2xl font-semibold'>Add Category</h1>
              <div className='w-full flex justify-start items-start flex-col gap-2 '>
                <label htmlFor="category">Category</label>
                <input type="text" placeholder='Frontend' className='w-full border outline-4 outline-transparent focus:border-transparent focus:outline-black text-lg transition-all duration-300 p-[5px_20px] rounded-lg' required/>
              </div>
              <button className="w-full bg-black text-white text-xl py-2 rounded-lg font-semibold">Add</button>
            </form>
          </div>
        )
      }
    </>
  )
}

export default Skills
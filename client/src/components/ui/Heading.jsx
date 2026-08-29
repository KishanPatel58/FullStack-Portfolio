import React from 'react'

const Heading = ({ title, color }) => {
    return (
        <div className='px-15'>
            <div style={{ color: color }} className='class relative border border-dashed border-black'>
                <div className='Top-Left w-[8px] h-[8px] absolute -top-1 -left-1 border-dashed border-black bg-black' />
                <div className='Top-Right w-[8px] h-[8px] absolute -top-1 -right-1 border-dashed border-black bg-black' />
                <div className='Bottom-Left w-[8px] h-[8px] absolute -bottom-1 -left-1 border-dashed border-black bg-black' />
                <div className='Bottom-Right w-[8px] h-[8px] absolute -bottom-1 -right-1 border-dashed border-black bg-black' />
                {title}
            </div>
        </div>
    )
}

export default Heading
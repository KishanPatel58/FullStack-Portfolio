import React from 'react'
import { Link } from 'react-router-dom'

const Button = (props) => {
    if (props.type === "fill") {
        return (
            <Link to={props.link} className={`button-bg p-0.5 hover:scale-105 transition duration-300 active:scale-100 rounded-lg ${props.className}`}>
                <button className="bg-black text-white text-xl w-full rounded-lg py-2 flex items-center justify-center gap-4 cursor-pointer">{props.text} {props.icon}</button>
            </Link>
        )
    }
    else if (props.type === "border") {
        return (
            <button className={`text-black text-xl w-[35vh] rounded-lg py-2 flex items-center group justify-center gap-4 border-2 border-black hover:bg-black hover:text-white transition-all duration-300 cursor-pointer ${props.className}`}>{props.text} {props.icon}</button>
        )
    }
    else {
        return (
            <Link to={props.link} className={`${props.className}`}>{props.text} {props.icon}</Link>
        )
    }
}

export default Button
import React from 'react'
import styles from './Container.module.css'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ContainerProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>{
    
}

export default function Container({...props}: ContainerProps) {
    return (
        <div {...props} className={`relative w-full max-w-lg p-8 h-max bg-white bg-opacity-90 backdrop-blur-3xl shadow-lg rounded-2xl overflow-auto ${styles.main} ${props.className}`}>
            {props.children}
        </div>
    )
}

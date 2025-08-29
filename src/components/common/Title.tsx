import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TitleProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>{}

export default function Title({...props}: TitleProps) {
  return (
    <h1 {...props} className={`text-2xl font-bold mb-4 ${props.className}`}>{props.children}</h1>
  )
}

import React from 'react'
import { Input, InputProps } from '@nextui-org/input'

export default function FormInput({...props}: InputProps) {
    return (
        <Input
            radius='sm'
            size='sm'
            variant='underlined'
            {...props}
        />
    )
}

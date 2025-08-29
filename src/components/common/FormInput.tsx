import React from 'react'
import { Input, InputProps } from '@nextui-org/input'

const FormInput = React.memo(function FormInput({...props}: InputProps) {
    return (
        <Input
            radius='sm'
            size='sm'
            variant='underlined'
            {...props}
        />
    )
})

export default FormInput

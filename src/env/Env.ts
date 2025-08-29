import {config} from 'dotenv'

config()

const ENV = {
    NODE_ENV: process.env.NODE_ENV,
    SIIGO_USER_NAME: process.env.SIIGO_USER_NAME,
    SIIGO_ACCESS_KEY: process.env.SIIGO_ACCESS_KEY,
    NEXT_PUBLIC_WOMPI_PAYMENT_URL: process.env.NEXT_PUBLIC_WOMPI_PAYMENT_URL ?? ''
}

export default ENV;
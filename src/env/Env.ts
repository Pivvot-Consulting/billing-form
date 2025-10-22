import {config} from 'dotenv'

config()

const ENV = {
    NODE_ENV: process.env.NODE_ENV,
    SIIGO_USER_NAME: process.env.SIIGO_USER_NAME,
    SIIGO_ACCESS_KEY: process.env.SIIGO_ACCESS_KEY,
    SIIGO_DOCUMENT_ID: process.env.SIIGO_DOCUMENT_ID ? parseInt(process.env.SIIGO_DOCUMENT_ID) : 28010,
    SIIGO_COST_CENTER_ID: process.env.SIIGO_COST_CENTER_ID ? parseInt(process.env.SIIGO_COST_CENTER_ID) : 849,
    SIIGO_SELLER_ID: process.env.SIIGO_SELLER_ID ? parseInt(process.env.SIIGO_SELLER_ID) : 488,
    SIIGO_PAYMENT_ID: process.env.SIIGO_PAYMENT_ID ? parseInt(process.env.SIIGO_PAYMENT_ID) : 4366,
    NEXT_PUBLIC_WOMPI_PAYMENT_URL: process.env.NEXT_PUBLIC_WOMPI_PAYMENT_URL ?? '',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
}

export default ENV;
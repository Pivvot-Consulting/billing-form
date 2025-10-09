'use server'
import { cache } from "react";
import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";
import Constants from "@/constants/Constants";
import { cookies } from "next/headers";

// Services
import * as SiigoService from "../services/SiigoService"
import * as JwtService from "../services/JwtService"

const defaultHeaders: CreateAxiosDefaults ={
    headers: { 'Content-Type': 'application/json' }
}

const instance = axios.create(defaultHeaders);

const httpGet = cache((axiosInstance: AxiosInstance, base_url?: string)=> async (path: string)=> axiosInstance.get(`${base_url ? base_url : ''}${path}`))
const httpPost = cache((axiosInstance: AxiosInstance, base_url?: string)=> async (path: string, data: object)=> axiosInstance.post(`${base_url ? base_url : ''}${path}`, data))
const httpPut = cache((axiosInstance: AxiosInstance, base_url?: string)=> async (path: string, data?: object)=> axiosInstance.put(`${base_url ? base_url : ''}${path}`, data))
const httpDelete = cache((axiosInstance: AxiosInstance, base_url?: string)=> async (path: string)=> axiosInstance.delete(`${base_url ? base_url : ''}${path}`))

export const get = cache (httpGet(instance));
export const post = cache (httpPost(instance));
export const put = cache (httpPut(instance));
export const del = cache (httpDelete(instance));

// Siigo instance
const siigoInstance = axios.create(defaultHeaders);

siigoInstance.interceptors.request.use(
    async (config) => {
        const cookieToken = cookies().get(Constants.SIIGO_API_TOKEN_STORAGE_KEY)?.value;
        
        let token = cookieToken;
        
        // Si no hay token o el token está expirado, obtener uno nuevo
        if (!token || JwtService.isExpired(token)) {
            console.log('Token de Siigo no disponible o expirado, obteniendo uno nuevo...');
            token = await SiigoService.auth();
        } else {
            console.log('Usando token existente de Siigo');
        }
        
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['Partner-Id'] = 'Flotu';
        
        return config;
    },
    error => Promise.reject(error),
);

export const getSiigo = cache(httpGet(siigoInstance, Constants.SIIGO_API_BASE_URL));
export const postSiigo = cache(httpPost(siigoInstance, Constants.SIIGO_API_BASE_URL));
export const putSiigo = cache(httpPut(siigoInstance, Constants.SIIGO_API_BASE_URL));
export const deleteSiigo = cache(httpDelete(siigoInstance, Constants.SIIGO_API_BASE_URL));

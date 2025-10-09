import {jwtDecode} from "jwt-decode";

export function isExpired (token: string): boolean {
    try {
        const decodedToken: {exp: number} = jwtDecode(token);
        const currentDate = new Date();

        // JWT exp is in seconds
        return decodedToken.exp * 1000 < currentDate.getTime();
    } catch (error) {
        // Si no se puede decodificar el token, considerarlo como expirado
        console.error('Error decodificando token JWT:', error);
        return true;
    }
}
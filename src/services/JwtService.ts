import {jwtDecode} from "jwt-decode";

export function isExpired (token: string): boolean {
    const decodedToken: {exp: number} = jwtDecode(token);
    const currentDate = new Date();

    // JWT exp is in seconds
    return decodedToken.exp * 1000 < currentDate.getTime()
}
export function parseToNumber(input: string): number | null {
    // Eliminar todos los caracteres que no sean dígitos, un punto decimal o un signo negativo
    const cleanedString = input.replace(/[^0-9.-]/g, '');

    // Intentar convertir la cadena filtrada en un número
    const parsedNumber = parseFloat(cleanedString);

    // Verificar si la conversión fue exitosa
    if (isNaN(parsedNumber)) {
        return null; // Devolver null si no es un número válido
    }

    return parsedNumber;
}

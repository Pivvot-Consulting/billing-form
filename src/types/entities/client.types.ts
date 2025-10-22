import { DocumentTypeType } from '../enums';

/**
 * Entidad Cliente
 * Representa un cliente/comprador del sistema
 */
export interface Client {
  id: number;
  tipo_documento: DocumentTypeType;
  numero_documento: string;
  nombre: string;
  apellido: string;
  correo: string;
  direccion: string;
  celular: string;
  creado_en: string;
}

/**
 * Datos para crear un cliente
 */
export interface CreateClientData {
  tipo_documento: DocumentTypeType;
  numero_documento: string;
  nombre: string;
  apellido: string;
  correo: string;
  direccion: string;
  celular: string;
}

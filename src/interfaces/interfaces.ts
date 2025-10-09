// import { DocumentTypeType, ServiceTimeType } from "@/types/enumTypes"
import { DocumentTypeType } from "@/types/enumTypes"

export interface Bill {
    documentType?: DocumentTypeType,
    documentNumber?: number,
    name?: string,
    lastName?: string,
    email?: string,
    address?: string,
    phone?: string,
    // serviceTime?: ServiceTimeType,
    qtyHours?: number,
    qtyMinutes?: number,
    serviceValue?: number,
    isExtendedTime?: boolean
}

export interface BillErrors {
    documentType?: string,
    documentNumber?: string,
    name?: string,
    lastName?: string,
    email?: string,
    address?: string,
    phone?: string,
    // serviceTime?: string,
    qtyHours?: string,
    qtyMinutes?: string,
    serviceValue?: string
}

export interface TimeSelectorProps {
	qtyHours: number;
	qtyMinutes: number;
	handleTimeSelection: (hours: number, minutes: number) => void;
}
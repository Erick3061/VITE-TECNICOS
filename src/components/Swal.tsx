import { UseMutationResult } from "@tanstack/react-query";
import Swal, { SweetAlertIcon } from "sweetalert2";
import { PropsUpdateService, responseLoadFile, Service, Technical } from "../rules/interfaces";

export const ShowError = async (error: string) => {
    return await Swal.fire({
        title: 'ERROR',
        text: error,
        icon: 'error',
        confirmButtonColor: '#002f6c',
        iconColor: '#b20010',
        color: '#002f6c'
    });
}

export const ShowAlert = async (alert: string) => {
    return await Swal.fire({
        title: 'ALERTA',
        text: alert,
        icon: 'warning',
        confirmButtonColor: '#002f6c',
        iconColor: '#002f6c',
        color: '#002f6c'
    });
}

interface showMesage {
    title: string,
    text: string,
    timer?: number;
    icon?: SweetAlertIcon | undefined;
    func?: () => void | Promise<void>;
    confirmText?: string;
    denyText?: string;
}

export const ShowMessage = async ({ text, title, timer, icon }: showMesage) => {
    return await Swal.fire({
        title,
        text,
        icon: icon,
        timer,
        confirmButtonColor: '#002f6c',
        iconColor: '#002f6c',
        color: '#002f6c'
    });
}

export const ShowMessage2 = async ({ text, title, timer, func, icon, confirmText, denyText }: showMesage) => {
    return await Swal.fire({
        title,
        text,
        icon,
        timer,
        allowOutsideClick: false,
        showConfirmButton: true,
        confirmButtonText: (confirmText) ? confirmText : 'SI',
        showDenyButton: true,
        denyButtonText: (denyText) ? denyText : 'NO',
        denyButtonColor: '#7b0000',
        confirmButtonColor: '#002f6c',
        iconColor: '#002f6c',
        color: '#002f6c'
    }).then(async ({ isConfirmed }) => {
        if (isConfirmed && func) { func(); }
    })
}

interface PropsFunctionServiceValidate {
    mutate: UseMutationResult<{ service: Service; technicals: Technical[]; }, unknown, PropsUpdateService, unknown>;
    text: string;
    data: PropsUpdateService;
    op?: 'SF' | 'EF' | 'TS';
}

export const ShowServiceValidate = async ({ mutate, text, data, op }: PropsFunctionServiceValidate) => {
    Swal.fire({
        icon: 'warning',
        title: (op) ? `${(op === 'SF') ? 'Liberar sin folio' : (op === 'EF') ? 'Entregar folio' : (op === 'TS') && 'Terminar servicio'}` : `Alerta`,
        text: text,
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonColor: '#002f6c',
        cancelButtonColor: '#b20010',
        iconColor: '#002f6c',
        color: '#002f6c',
        confirmButtonText: (op) ? 'SI' : 'Continuar',
        cancelButtonText: (op) ? 'NO' : 'Cancelar'
    }).then(async ({ isConfirmed }) => {
        if (isConfirmed) {
            if (op && op === 'EF') {
                mutate.mutate(data);
            } else {
                await Swal.fire({
                    input: 'textarea',
                    inputLabel: 'Agregar un comentario',
                    inputPlaceholder: 'Escribe tu comentario aqui...',
                    inputAttributes: {
                        'aria-label': 'Type your message here'
                    },
                    showCancelButton: true,
                    cancelButtonColor: '#b20010',
                    confirmButtonColor: '#002f6c',
                    confirmButtonText: 'Continuar',
                    color: '#002f6c',
                    allowOutsideClick: false,
                }).then(({ value, isConfirmed }) => {
                    let { value: noUSar, ...rest } = data;
                    if (isConfirmed) {
                        if (op && op === 'SF' || op === 'TS') {
                            Swal.fire({
                                title: 'Estado del enlace',
                                icon: 'question',
                                allowOutsideClick: false,
                                showConfirmButton: true,
                                showCancelButton: true,
                                showDenyButton: true,
                                confirmButtonText: 'CON ENLACE',
                                denyButtonText: 'SIN ENLACE',
                                cancelButtonText: 'DESCONCOCIDO',
                                confirmButtonColor: '#002f6c',
                                denyButtonColor: '#7b0000',
                                cancelButtonColor: '#41579b',
                                iconColor: '#002f6c',
                                color: '#002f6c'
                            }).then(({ isConfirmed, isDenied, isDismissed }) => {
                                let { value: dataSend } = data;
                                if (typeof dataSend === 'object' && dataSend.binnacle) {
                                    let { link, ...binnacle } = dataSend.binnacle;
                                    if (isConfirmed) {
                                        mutate.mutate({ ...rest, value: { comment: value, binnacle: { link: 'con enlace', ...binnacle }, value: true } });
                                    }
                                    if (isDenied) {
                                        mutate.mutate({ ...rest, value: { comment: value, binnacle: { link: 'sin enlace', ...binnacle }, value: true } });
                                    }
                                    if (isDismissed) {
                                        mutate.mutate({ ...rest, value: { comment: value, binnacle: { link: 'desconocido', ...binnacle }, value: true } });
                                    }
                                } else { ShowError(`Faltan parametros`) }
                            })
                        } else {
                            mutate.mutate({ ...rest, value: { comment: value } });
                        }
                    }
                });
            }
        }
    });
}

export const SendValidate = async ({ mutate, data }: PropsFunctionServiceValidate) => {
    await Swal.fire({
        input: 'textarea',
        inputLabel: 'Agregar un comentario',
        inputPlaceholder: 'Escribe tu comentario aqui...',
        inputAttributes: {
            'aria-label': 'Type your message here'
        },
        showCancelButton: true,
        cancelButtonColor: '#b20010',
        confirmButtonColor: '#002f6c',
        confirmButtonText: 'Continuar',
        color: '#002f6c',
        allowOutsideClick: false,
    }).then(({ value, isConfirmed }) => {
        let { value: noUSar, ...rest } = data;
        if (isConfirmed) {
            mutate.mutate({ ...rest, value: { comment: value } });
        }
    });
}

interface SendFile {
    mutate: UseMutationResult<responseLoadFile, unknown, { file: FormData; id: string; type: string; }, unknown>;
    id: string;
    type: string;
    rol: string;
}

export const SendFile = async ({ rol, id, mutate, type }: SendFile) => {
    await Swal.fire({
        input: 'file',
        inputLabel: `Seleccione la foto de el ${rol}`,
        inputPlaceholder: 'Escribe tu comentario aqui...',
        inputAttributes: {
            'aria-label': 'Type your message here'
        },
        showCancelButton: true,
        cancelButtonColor: '#b20010',
        confirmButtonColor: '#002f6c',
        confirmButtonText: 'Continuar',
        color: '#002f6c',
        allowOutsideClick: false,
    }).then(({ value, isConfirmed }) => {
        if (isConfirmed) {
            const formData = new FormData();
            formData.append('file', value);
            mutate.mutate({ file: formData, id, type });
        }
    });
}

export const ViewImg = async (path: string) => {
    await Swal.fire({
        width: 'auto',
        confirmButtonColor: '#002f6c',
        confirmButtonText: 'cerrar',
        color: '#002f6c',
        title: 'IMÁGEN',
        html: `
                <img id="preview" src="${path}">
            `,
    });
}
import { LogInData, Person, ResponseApi, datalogIn, Service, Account, PropsnewService, Technical, Services, PropsUpdateService, PropsUpdateTechnical, ServiceDetails, Enterprices, ServicesTypes, Roles, actionPersonProps, bodyPerson, actionEnterpriceProps, enterprice, responseLoadFile } from '../rules/interfaces';

// const baseUrl = 'https://pem-sa.ddns.me:3007/api';
export const baseUrl = 'http://127.0.0.1:3007/api';

export const Api = (endpoint: string, data: object = {}, method: 'GET' | 'POST' = 'GET') => {
    const url = `${baseUrl}/${endpoint}`;
    const token = localStorage.getItem('token');
    const headers: HeadersInit | undefined = {};
    (token) ? Object.assign(headers, { 'Content-type': 'application/json', 'x-token': token }) : Object.assign(headers, { 'Content-type': 'application/json', });
    return (method === 'GET') ? fetch(url, { method, headers }) : fetch(url, { method, headers, body: JSON.stringify(data) });
}

export const addEnterprice = async (props: { enterprice: { shortName: string, name: string } }) => {
    try {
        const response = await Api('admin/addEnterprice', props, 'POST');
        const { status, data, errors }: ResponseApi<{ isInserted: boolean }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const addPerson = async (props: bodyPerson) => {
    try {
        const response = await Api('admin/addPerson', props, 'POST');
        const { status, data, errors }: ResponseApi<{ isInserted: boolean }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const addService = async (props: PropsnewService) => {
    try {
        const response = await Api('sys/addService', props, 'POST');
        const { status, data, errors }: ResponseApi<{ isInserted: boolean, asignados: Array<string> }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const loadFile = async ({ file, id, type }: { file: FormData, id: string, type: string }) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/files/loadFile/${id}/${type}`, {
            body: file,
            headers: (token) ? { 'x-token': token } : {},
            method: 'PUT'
        })
        const { status, data, errors }: ResponseApi<responseLoadFile> = await response.json();
        if (status && data) return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const logIn = async ({ acceso, password }: LogInData) => {
    try {
        const response = await Api('auth/logIn', { acceso, password }, 'POST');
        const { status, data, errors }: ResponseApi<datalogIn> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
};

export const validarJWT = async () => {
    try {
        const response = await Api('auth/validaJWT', {}, 'GET');
        const { status, data, errors }: ResponseApi<datalogIn> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
};

export const enterpriceActions = async (prop: actionEnterpriceProps) => {
    try {
        const response = await Api('admin/enterpriceActions', { ...prop }, 'POST');
        const { status, data, errors }: ResponseApi<{ isDeleted?: boolean, isUpdated?: boolean }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const personActions = async (prop: actionPersonProps) => {
    try {
        const response = await Api('admin/personActions', { ...prop }, 'POST');
        const { status, data, errors }: ResponseApi<{ isDeleted?: boolean, isUpdated?: boolean, passwordWasReset?: boolean, person?: Person }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const DisponibleTechnicals = async (enterprice?: Enterprices) => {
    try {
        const response = await Api(`sys/getDisponibleTechnicals${enterprice ? `?enterprice=${JSON.stringify(enterprice)}` : ''}`, {}, 'GET');
        const { status, data, errors }: ResponseApi<{ technicals: Array<{ id_person: string, name: string, id_enterprice: number }> }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const AllTechnicals = async () => {
    try {
        const response = await Api('sys/getPersons/1', {}, 'GET');
        const { status, data, errors }: ResponseApi<{ Persons: Array<Person> }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const getDirectory = async ({ id, type }: { id: string, type: string }) => {
    try {
        const response = await Api(`files/getImgs/${id}/${type}`, {}, 'GET');
        const { status, data, errors }: ResponseApi<{ files: Array<string> }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const AllPersonal = async (isDutyManager?: boolean) => {
    try {
        const response = await Api(`sys/getPersons/${(isDutyManager) ? '1' : '850827'}`, {}, 'GET');
        const { status, data, errors }: ResponseApi<{ Persons: Array<Person> }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const activeServices = async () => {
    try {
        const response = await Api('sys/getActiveServices', {}, 'GET');
        const { status, data, errors }: ResponseApi<{ services: Array<Services> }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const getService = async (id_service: string) => {
    try {
        const response = await Api(`sys/getActiveServices?id_service=${id_service}`, {}, 'GET');
        const { status, data, errors }: ResponseApi<{ service: Service, technicals: Array<Technical> }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const getServiceWithDetails = async (id_service: string) => {
    try {
        const response = await Api(`sys/getServiceDetails/${id_service}`, {}, 'GET');
        const { status, data, errors }: ResponseApi<ServiceDetails> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const getServices = async ({ end, start, account, technical }: { start: string, end: string, technical?: string, account?: string }) => {
    try {
        let path: string = `sys/getServices/${start}/${end}`;
        let query: string = `${(technical) ? `?technical=${technical}` : (account) ? `?account=${account}` : ''}`;
        if (technical && account) throw new Error("Solo se debe enviar un parámetro");
        const response = await Api(`${path}${query}`, {}, 'GET');
        const { status, data, errors }: ResponseApi<{ services: Array<Services> }> = await response.json();
        if (status && data)
            return data;

        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const AccountsMW = async (id_service?: string) => {
    try {
        const response = await Api(`sys/getAccountsMW${(id_service) ? `?id_service=${id_service}` : ''}`, {}, 'GET');
        const { status, data, errors }: ResponseApi<{ accounts?: Array<Account>, account?: Account }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const GetVerification = async (id_service: string) => {
    try {
        const response = await Api(`sys/verifyEventsService/${id_service}`, {}, 'GET');
        const { status, data, errors }: ResponseApi<{ zones: Array<string>, users: Array<string> }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const getGeneral = async () => {
    try {
        const response = await Api(`admin/getGeneral`, {}, 'GET');
        const { status, data, errors }: ResponseApi<{
            Enterprices: Array<Enterprices>,
            Roles: Array<Roles>,
            ServicesTypes: Array<ServicesTypes>;
        }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const getUsersMon = async () => {
    try {
        const response = await Api(`admin/getUsersMon`, {}, 'GET');
        const { status, data, errors }: ResponseApi<{
            users: Array<{
                user: string;
                password: string;
                name: string;
            }>
        }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const task = async () => {
    try {
        const response = await Api('sys/getTask', {}, 'GET');
        const { status, data, errors }: ResponseApi<{ task: Array<{ nameTask: string; running: boolean; cron: string }> }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const updateService = async (prop: PropsUpdateService) => {
    try {
        const response = await Api('sys/updateService', { ...prop }, 'POST');
        const { status, data, errors }: ResponseApi<{ service: Service, technicals: Array<Technical> }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}

export const updateTechnicals = async ({ id_service, technicals, op }: PropsUpdateTechnical) => {
    try {
        let path: string = (op === 'del')
            ? 'sys/modTechnicalToAService?del=true'
            : (op === 'cf')
                ? `sys/modTechnicalToAService?sf=false`
                : (op === 'sf')
                    ? `sys/modTechnicalToAService?sf=true` : 'sys/modTechnicalToAService';

        const response = await Api(path, { id_service: id_service, technicals: technicals }, 'POST');
        const { status, data, errors }: ResponseApi<{ id_service: string, asignados?: Array<string>, actualizados?: Array<string>, eliminados?: Array<string>, errors: Array<string> }> = await response.json();
        if (status && data)
            return data;
        throw new Error(errors![0].msg);
    } catch (error) { throw new Error(`${error}`); }
}
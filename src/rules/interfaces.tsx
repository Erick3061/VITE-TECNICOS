export interface AuthState {
    status: 'loged' | 'no-loged';
    file: string | undefined;
    person: Person | null;
}

export interface Account {
    CodigoCte: string;
    CodigoAbonado: string;
    Nombre: string;
    Direccion: string;
    partitions: Array<partition>;
    zones: Array<zone>;
    users: Array<user>;
    contacts: Array<contact>;
    panel: panel
}

export interface partition {
    codigo: number | null;
    descripcion: string | null;
}
export interface zone {
    codigo: number | null;
    descripcion: string | null;
}
export interface user {
    codigo: string | null;
    nombre: string | null;
    clave: string | null;
    descripcion: string | null;
}
export interface contact {
    codigo: number | null;
    telefono: string | null;
    contacto: string | null;
    descripcion: string | null;
}
export interface panel {
    nombre: string | null;
    ubicacion: string | null;
    descripcion: string | null;
}

export interface Person {
    id_person: string;
    id_enterprice: number;
    id_role: number;
    enterpriceShortName: string;
    personName: string;
    lastname: string;
    email: string | null;
    password: string;
    phoneNumber: string | null;
    employeeNumber: string;
    status: string;
    nameUser: string | null;
    withOutFolio?: boolean | null;
}

export interface ServiceSelected {
    service: Service;
    technicals: Array<Technical>;
}

export interface Technical {
    id_person: string;
    id_enterprice: number;
    enterpriceShortName: string;
    personName: string;
    lastname: string;
    phoneNumber: string | null;
    employeeNumber: string;
    nameUser: string | null;
    withOutFolio?: boolean | null;
}

export interface Services {
    id_service: string;
    accountMW: string;
    isTimeExpired?: boolean;
    isDelivered?: boolean;
    isActive?: boolean;
    entryDate: Date;
    exitDate: Date;
    folio: string;
    digital: string | null;
    nameAccount: string | null;
}

export interface Service {
    id_service: string;
    id_enterprice: number;
    grantedEntry: string;
    grantedExit: string | null;
    firstVerification: string | null;
    secondVerification: string | null;
    id_type: number;
    folio: string;
    entryDate: Date;
    exitDate: Date;
    accountMW: string;
    digital: string | null;
    nameAccount: string | null;
    isDelivered: boolean;
    isKeyCode: boolean;
    isOpCi: boolean;
    isTimeExpired: boolean;
    isActive: boolean;
    filesCron: string | null;
}

export interface LogInData {
    acceso: string;
    password: string;
}

export interface Errors {
    msg: string;
    param: string;
    value: string;
    location: string;
}

export interface ResponseApi<T> {
    status: boolean;
    data?: T;
    errors?: Array<Errors>
}


export interface datalogIn {
    Person: Person;
    token: string;
    directory?: Array<string>;
    Service?: Service;
}

export interface responseLoadFile {
    isInserted: boolean;
    nameFile: string;
    directoryFile: string;
    fullDirectory: string;
}


export interface PropsnewService {
    grantedEntry: { id: string, role: number, name: string }
    id_type: number;
    CodigoCte: string;
    isKeyCode: boolean;
    isOpCi: boolean;
    technicals: Array<string>;
    time: PropsMoreTime;
}

export type propiedad = 'isKeyCode' | 'accountMW' | 'firstVerification' | 'secondVerification' | 'moreTime' | 'SF' | 'EF' | 'TS';
export interface PropsBinnacle {
    ze: string;
    zf: string;
    zu: string;
    ue: string;
    uf: string;
    uu: string;
    link: 'con enlace' | 'sin enlace' | 'desconocido';
    technicals: string;
}
export interface PropsMoreTime {
    hours: number;
    minutes: number;
    seconds: number;
}
export interface PropsUpdateService {
    id_service: string;
    person: { id: string, role: number, name: string }
    prop: propiedad;
    value?: string | boolean | undefined | { value?: boolean, comment: string, binnacle?: PropsBinnacle, moreTime?: PropsMoreTime };
}

export interface PropsUpdateTechnical {
    id_service: string;
    technicals: Array<string>;
    op?: 'del' | 'cf' | 'sf';
}

export interface Comment {
    id_service: string;
    person: string;
    comment: string;
}

export interface Binnacle {
    id_service: string;
    zones: string;
    missingZones: string;
    zonesUndefined: string;
    users: string;
    missingUsers: string;
    usersUndefined: string;
    link: string;
    technicals: string;
}
export interface TechnicalInfo {
    id_enterprice: string;
    enterpriceShortName: number;
    fullName: string;
    nameUser: string;
    phoneNumber: string;
    employeeNumber: string;
    withOutFolio: string;
}

export interface ServiceDetails {
    service: Service;
    comments: Array<Comment>;
    binnacle: Array<Binnacle>;
}

export interface Enterprices {
    id_enterprice: number;
    shortName: string;
    name: string;
}

export interface Roles {
    id_role: number;
    name: string;
}

export interface ServicesTypes {
    id_type: number;
    name: string;
}

export interface enterprice {
    id: number;
    shortName: string;
}
export interface role {
    id: number;
    name: string;
    user?: string | null;
}

export interface bodyPerson {
    name: string;
    lastname: string;
    email: string | null;
    password: string;
    phoneNumber: string | null;
    employeeNumber: string;
    enterprice: enterprice;
    role: role;
}

export interface ExistPerson { id: string, role: number, name: string };

export interface optionsUpdatePerson {
    resetPassword?: boolean;
    deletePerson?: boolean;
    updateStatus?: 'ACTIVO' | 'INACTIVO';
    updateData?: bodyPerson;
}
export interface actionPersonProps {
    person: ExistPerson;
    option: optionsUpdatePerson
}

export interface optionsUpdateEnterprice {
    deleteEnterprice?: boolean;
    updateData?: { shortName: string, name: string };
}

export interface actionEnterpriceProps {
    enterprice: enterprice;
    option: optionsUpdateEnterprice;
}
import { Person } from '../rules/interfaces';

export type AuthContextProps = {
    status: 'loged' | 'no-loged';
    person: Person | null;
    setPerson: (person: Person, token: string) => void;
    logOut: () => void;
    logStatus: () => void;
}
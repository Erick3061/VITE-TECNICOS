import { Person } from '../rules/interfaces';

export type AuthContextProps = {
    status: 'loged' | 'no-loged';
    person: Person | null;
    file: string | undefined;
    setPerson: (person: Person, token: string, directory?: string) => void;
    logOut: () => void;
    logStatus: () => void;
}
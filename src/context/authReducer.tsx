import { AuthState, Person } from '../rules/interfaces';

type AuthAction =
    | { type: 'logIn', payload: { person: Person, directory?: string } }
    | { type: 'logOut' }

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {

        case 'logIn':
            return {
                ...state,
                status: 'loged',
                person: action.payload.person,
                file: action.payload.directory
            }

        case 'logOut':
            return {
                ...state,
                status: 'no-loged',
                person: null,
                file: undefined
            }

        default:
            return state;
    }
}

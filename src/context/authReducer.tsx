import { AuthState, Person } from '../rules/interfaces';

type AuthAction =
    | { type: 'logIn', payload: { person: Person } }
    | { type: 'logOut' }

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {

        case 'logIn':
            return {
                ...state,
                status: 'loged',
                person: action.payload.person
            }

        case 'logOut':
            return {
                ...state,
                status: 'no-loged',
                person: null,
            }

        default:
            return state;
    }
}

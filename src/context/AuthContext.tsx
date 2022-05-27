import React, { createContext, useReducer } from 'react';
import { AuthState, Person } from '../rules/interfaces';
import { AuthContextProps } from '../types/types';
import { authReducer } from './authReducer';

const estadoInicial: AuthState = { status: 'no-loged', person: null }

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: any) => {
    const [state, dispatch] = useReducer(authReducer, estadoInicial);

    const logStatus = () => {
        console.log(state);
    }

    const setPerson = (person: Person, token: string) => {
        localStorage.setItem('token', token);
        dispatch({
            type: 'logIn',
            payload: { person }
        })
    }

    const logOut = () => {
        localStorage.clear();
        dispatch({ type: 'logOut' });
    }

    return (
        <AuthContext.Provider
            value={{
                ...state,
                setPerson,
                logOut,
                logStatus,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}


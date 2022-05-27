import React, { useContext } from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { PrivateRoutes } from './PrivateRoutes';
import { PublicRoutes } from './PublicRoutes';

export const AppRouter = () => {
    const { status } = useContext(AuthContext);
    return (
        <HashRouter>
            {(status === 'no-loged') ? <PublicRoutes /> : <PrivateRoutes />}
        </HashRouter>
    )
}

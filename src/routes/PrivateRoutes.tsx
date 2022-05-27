import React, { useContext, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { AuthContext } from '../context/AuthContext';
import { AccountsMW, AllTechnicals, getGeneral, getUsersMon } from '../api/Api';
import { ShowError } from '../components/Swal';
import { errorFormat } from '../functions/Functions';
import { useQuery } from 'react-query';
import { NavBar } from '../navigation/NavBar';
import { NewServicePage } from '../pages/NewServicePage';
import { GiveFolioPage } from '../pages/GiveFolioPage';
import { ServicesPage } from '../pages/ServicesPage';
import { ServicesTechicalPage } from '../pages/ServicesTechicalPage';
import { ServicesAccountPage } from '../pages/ServicesAccountPage';
import { TasksPage } from '../pages/TasksPage';
import { PersonPage } from '../pages/PersonPage';
import { AddPersonPage } from '../pages/AddPersonPage';
import { EnterpricePage } from '../pages/EnterpricePage';

export const PrivateRoutes = () => {
    const { person, logOut } = useContext(AuthContext);
    const Redirect = ({ to }: { to: string }): any => {
        let navigate = useNavigate();
        useEffect(() => {
            navigate(to);
        });
        return null;
    }

    const Accounts = useQuery(['Accounts'], () => AccountsMW(), {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
        refetchInterval: (1000 * 60) * 10,
        onError: async error => {
            if (error !== null) {
                if (`${error}`.includes('JsonWebTokenError') || `${error}`.includes('TokenExpiredError')) {
                    localStorage.clear();
                    logOut();
                    (`${error}`.includes('TokenExpiredError')) ? await ShowError('La sesión expiró') : await ShowError('Token invalido');
                }
                await ShowError(errorFormat(`${error}`));
            }
        }
    });

    const Technicals = useQuery(['Technicals'], () => AllTechnicals(), {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
        refetchInterval: (1000 * 60) * 10,
        onError: async error => {
            if (error !== null) {
                if (`${error}`.includes('JsonWebTokenError') || `${error}`.includes('TokenExpiredError')) {
                    localStorage.clear();
                    logOut();
                    (`${error}`.includes('TokenExpiredError')) ? await ShowError('La sesión expiró') : await ShowError('Token invalido');
                }
                await ShowError(errorFormat(`${error}`));
            }
        }
    });

    const GetGeneral = useQuery(['GetGeneral'], () => getGeneral(), {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
        refetchInterval: (1000 * 60) * 10,
        onError: async error => {
            if (`${error}`.includes('JsonWebTokenError') || `${error}`.includes('TokenExpiredError')) {
                localStorage.clear();
                logOut();
                (`${error}`.includes('TokenExpiredError')) ? await ShowError('La sesión expiró') : await ShowError('Token invalido');
            }
            await ShowError(errorFormat(`${error}`));
        }
    });
    const GetUsersMon = useQuery(['GetUsersMon'], () => getUsersMon(), {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
        enabled: (person?.id_role === 4) ? true : false,
        refetchInterval: (1000 * 60) * 10,
        onError: async error => {
            if (`${error}`.includes('JsonWebTokenError') || `${error}`.includes('TokenExpiredError')) {
                localStorage.clear();
                logOut();
                (`${error}`.includes('TokenExpiredError')) ? await ShowError('La sesión expiró') : await ShowError('Token invalido');
            }
            await ShowError(errorFormat(`${error}`));
        }
    });

    return (
        <div className='containerFull'>
            {
                (Accounts.isLoading || Technicals.isLoading || GetGeneral.isLoading || GetUsersMon.isLoading)
                    ? <div className='logIn-container'><div className='spin'></div></div>
                    :
                    (Accounts.isError || Technicals.isError || GetGeneral.isError || GetUsersMon.isError)
                        ?
                        <div className='logIn-container'>
                            <section className='container-form'>
                                <p>Error en el servidor</p>
                            </section>
                        </div>
                        :
                        <>
                            <NavBar />
                            <div className='container-page'>
                                <Routes>
                                    {
                                        (person?.id_role === 2) ?
                                            <>
                                                <Route path='/' element={<HomePage />} />
                                                <Route path='/new-service' element={<NewServicePage />} />
                                                <Route path='/give-folio' element={<GiveFolioPage />} />
                                                <Route path='/services/all' element={<ServicesPage />} />
                                                <Route path='/services/techical' element={<ServicesTechicalPage />} />
                                                <Route path='/services/account' element={<ServicesAccountPage />} />
                                                <Route path='/task' element={<TasksPage />} />
                                            </>
                                            : (person?.id_role === 3) ?
                                                <>
                                                    <Route path='/' element={<HomePage />} />
                                                    <Route path='/services/techical' element={<ServicesTechicalPage />} />
                                                    <Route path='/services/account' element={<ServicesAccountPage />} />
                                                    <Route path='/person' element={<PersonPage />} />
                                                    <Route path='/add-person' element={<AddPersonPage />} />
                                                    <Route path='/give-folio' element={<GiveFolioPage />} />
                                                </>
                                                : (person?.id_role === 4) &&
                                                <>
                                                    <Route path='/' element={<HomePage />} />
                                                    <Route path='/new-service' element={<NewServicePage />} />
                                                    <Route path='/person' element={<PersonPage />} />
                                                    <Route path='/add-person' element={<AddPersonPage />} />
                                                    <Route path='/enterprice' element={<EnterpricePage />} />
                                                    <Route path='/new-service' element={<NewServicePage />} />
                                                    <Route path='/give-folio' element={<GiveFolioPage />} />
                                                    <Route path='/services/all' element={<ServicesPage />} />
                                                    <Route path='/services/techical' element={<ServicesTechicalPage />} />
                                                    <Route path='/services/account' element={<ServicesAccountPage />} />
                                                    <Route path='/task' element={<TasksPage />} />
                                                </>
                                    }
                                    <Route path="*" element={<Redirect to="/" />} />
                                </Routes>
                            </div>
                        </>
            }
        </div>

    )
}
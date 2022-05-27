import React, { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query';
import { activeServices } from '../api/Api';
import Swal from 'sweetalert2';
import { Account, Services } from '../rules/interfaces';
import { ModalService } from '../components/ModalService';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Icon } from '@mdi/react';
import { mdiMagnify as IconSearchService } from '@mdi/js';
import { formatDate, modDate } from '../functions/Functions';
import { color } from '../helpers/herpers';

export const GiveFolioPage = () => {
    const { logOut, person } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const [Accounts, setAccounts] = useState<Array<Account>>();
    const [filtrado, setfiltrado] = useState<Array<Services>>();
    const [services, setservices] = useState<Array<Services>>();
    const [Service, setService] = useState<Services | undefined>(undefined);
    const [active, setactive] = useState<"Nombre" | "Digital" | "CodigoCte">('Nombre');


    const { isSuccess, isLoading } = useQuery('serviceActive', () => activeServices(), {
        onSuccess: data => {
            setfiltrado(() => data.services);
            setservices(() => data.services);
            const acc: { accounts: Array<Account> } | undefined = queryClient.getQueryData(["Accounts"]);
            if (acc) {
                setAccounts(() => acc.accounts);
            } else {
                queryClient.invalidateQueries('Accounts');
            }
        },
        onError: error => {
            if (error !== null) {
                Swal.fire({ title: 'ERROR', text: `${error}`, icon: 'error' });
                if (`${error}`.includes('token no valido')) {
                    localStorage.clear();
                    logOut();
                }
            }
        }
    });

    const [name, setname] = useState('');

    const search = (txt: string) => {
        setname(txt);
        (active === 'Nombre') ?
            setfiltrado(services?.filter(el => ((el.nameAccount !== null) && el.nameAccount.toLowerCase().includes(txt))))
            : (active === 'Digital') ?
                setfiltrado(services?.filter(el => ((el.digital !== null) && el.digital.includes(txt))))
                : setfiltrado(services?.filter(el => (el.accountMW.includes(txt))));
        if (txt === '') setfiltrado(services);
    }

    return (
        <div className='giveFolio-container'>
            <ModalService
                Service={Service}
                setService={setService}
            />
            <header className='header header80'>
                <div className='search'>
                    <p className='title'>Servicios activos</p>
                    <div className='inputsContainer'>
                        <Icon path={IconSearchService} className='icon' />
                        <input
                            className='input'
                            type={(active === 'Nombre') ? "text" : 'number'}
                            value={name}
                            placeholder={((active) === 'Nombre') ? 'Nombre del cliente' : ((active) === 'Digital') ? 'Digital o Abonado' : 'Codigo de cliente'}
                            autoCorrect='false'
                            autoComplete='false'
                            onChange={({ target }) => search(target.value)}
                        />
                    </div>
                </div>
            </header>
            <main className='main'>
                {
                    (isLoading)
                        ? <div className='flex-center'><div className='spin'></div></div>
                        :
                        <div className='container-table'>
                            {
                                (isSuccess)
                                    ?
                                    <table>
                                        <thead>
                                            <tr key={`Indices`}>
                                                <th style={{ borderRight: `1px solid ${color.background}` }} className={(active === 'Nombre') ? 'active' : ''} onClick={() => setactive(() => 'Nombre')} >Nombre</th>
                                                <th style={{ borderRight: `1px solid ${color.background}` }} className={(active === 'Digital') ? 'active' : ''} onClick={() => setactive(() => 'Digital')} >Digital</th>
                                                <th style={{ borderRight: `1px solid ${color.background}` }} className={(active === 'CodigoCte') ? 'active' : ''} onClick={() => setactive(() => 'CodigoCte')} >CodigoCte</th>
                                                <th style={{ borderRight: `1px solid ${color.background}` }} >Hora entrada</th>
                                                <th style={{ borderRight: `1px solid ${color.background}` }} >Hora salida</th>
                                                <th >Folio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                (filtrado && filtrado.length > 0)
                                                    ? filtrado.map(el => {
                                                        const entry: formatDate = modDate({ dateI: new Date(el.entryDate) });
                                                        const exit: formatDate = modDate({ dateI: new Date(el.exitDate) });
                                                        return (
                                                            <tr
                                                                className={(el.isTimeExpired) ? 'timeExpired' : (el.isDelivered) ? 'delivered' : 'rows'}
                                                                key={`${el.id_service}`}
                                                                onClick={() => {
                                                                    const modal = document.querySelector('.Modal');
                                                                    if (modal) {
                                                                        modal.setAttribute('style', 'display: block');
                                                                    }
                                                                    setService(() => el);
                                                                }}>
                                                                <td style={{ borderRight: `1px solid ${color.background}` }}>{Accounts?.find(f => f.CodigoCte === el.accountMW)?.Nombre}</td>
                                                                <td style={{ borderRight: `1px solid ${color.background}` }}>{Accounts?.find(f => f.CodigoCte === el.accountMW)?.CodigoAbonado}</td>
                                                                <td style={{ borderRight: `1px solid ${color.background}` }}>{Accounts?.find(f => f.CodigoCte === el.accountMW)?.CodigoCte}</td>
                                                                <td style={{ borderRight: `1px solid ${color.background}` }}>{entry.date.date} {entry.time.time}</td>
                                                                <td style={{ borderRight: `1px solid ${color.background}` }}>{exit.date.date} {exit.time.time}</td>
                                                                <td>{el.folio}</td>
                                                            </tr>
                                                        )
                                                    })
                                                    :
                                                    <tr
                                                        key={`nohaydatos`}
                                                        className='ACS-tr'
                                                        style={{ fontSize: '1.2rem' }}
                                                    >
                                                        <td>NO HAY DATOS</td>
                                                    </tr>
                                            }
                                        </tbody>
                                    </table>
                                    : <div>Sin datos</div>
                            }
                        </div>
                }
            </main>
        </div >
    )
}

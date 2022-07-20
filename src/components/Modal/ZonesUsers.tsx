import React from 'react'
import { UseQueryResult } from '@tanstack/react-query';
import { Account } from '../../rules/interfaces';
interface props {
    Account: Account | undefined;
    Verify: {
        zones: Array<string>;
        users: Array<string>;
    } | undefined;
    verify: UseQueryResult<{
        zones: string[];
        users: string[];
    }, unknown>;
    accountMW: UseQueryResult<{
        account?: Account;
    }, unknown>;
}
export const Zones = ({ Account, Verify, verify, accountMW }: props) => {
    return (
        <div className='card'>
            <p>Zonas</p>
            <div className='list'>
                {
                    Account?.zones.map(z => (
                        <li key={`${z.codigo}`}>
                            <b>{z.codigo}</b>: {z.descripcion}
                        </li>
                    ))
                }
            </div>
            <div className='ze'>
                <p>Zonas enviadas</p>
                {
                    (Verify && Account) &&
                    Account.zones.map((el) => {
                        return (
                            <div
                                className='container-cuadro'
                                key={`CuadroZonas${el.codigo}`}
                                onClick={() => console.log(el)}
                                style={{ backgroundColor: ((`${el.codigo}` === Verify.zones.find(z => z === `${el.codigo}`)) ? `rgba(0, 160, 0, .9)` : `rgba(134, 134, 134, 0.5)`) }}
                            >
                                <p className='cuadro'>{el.codigo}</p>
                            </div>
                        )
                    })
                }
                <p style={{ marginTop: '20px' }}>Zonas no definidas en MW</p>
                {
                    (verify.isSuccess && accountMW.isSuccess) &&
                    verify.data.zones.map(ze => {
                        if (Account?.zones.find(f => `${f.codigo}` === `${ze}`) === undefined) {
                            return (
                                <div
                                    className='container-cuadro'
                                    key={`CuadroZonasUndefined${ze}`}
                                    onClick={() => console.log(ze)}
                                    style={{ backgroundColor: `rgba(160, 160, 0, .9)` }}
                                >
                                    <p className='cuadro'>{ze}</p>
                                </div>
                            )
                        }
                    })
                }
            </div>
        </div>
    )
}

export const Users = ({ Account, Verify, verify, accountMW }: props) => {
    return (
        <div className='card'>
            <p>Usuarios</p>
            <div className='list'>
                {
                    Account?.users.map(u => (
                        <li key={`${u.codigo}`}>
                            <b>{u.codigo}</b>: {u.nombre}
                        </li>
                    ))
                }
            </div>
            <div className='ue'>
                <p>Usuarios enviados</p>
                {
                    (Verify && Account) &&
                    Account.users.map((el) => {
                        return (
                            <div
                                className='container-cuadro'
                                key={`CuadroZonas${el.codigo}`}
                                onClick={() => console.log(el)}
                                style={{ backgroundColor: ((`${el.codigo}` === Verify.users.find(z => z === `${el.codigo}`)) ? `rgba(0, 160, 0, .9)` : `rgba(134, 134, 134, 0.5)`) }}
                            >
                                <p className='cuadro'>{el.codigo}</p>
                            </div>
                        )
                    })
                }
                <p style={{ marginTop: '20px' }}>Usuarios no definidos en MW</p>
                {
                    (verify.isSuccess && accountMW.isSuccess) &&
                    verify.data.users.map(ze => {
                        if (Account?.users.find(f => `${f.codigo}` === `${ze}`) === undefined) {
                            return (
                                <div
                                    className='container-cuadro'
                                    key={`CuadroZonasUndefined${ze}`}
                                    onClick={() => console.log(ze)}
                                    style={{ backgroundColor: `rgba(160, 160, 0, .9)` }}
                                >
                                    <p className='cuadro'>{ze}</p>
                                </div>
                            )
                        }
                    })
                }
            </div>
        </div>
    )
}

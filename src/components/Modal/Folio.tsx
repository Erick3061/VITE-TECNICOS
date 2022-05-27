import React from 'react'
import { UseMutationResult } from 'react-query';
import { Account, PropsUpdateService, Service, ServiceSelected, Technical } from '../../rules/interfaces';
import { ShowMessage } from '../Swal';
import { Switch } from '../Switch';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
interface props {
    Account: Account | undefined;
    service: ServiceSelected | undefined;
    updateServiceMutate: UseMutationResult<{
        service: Service;
        technicals: Technical[];
    }, unknown, PropsUpdateService, unknown>
}
export const Folio = ({ Account, service, updateServiceMutate }: props) => {
    const { person } = useContext(AuthContext);
    return (
        <div className='folio'>
            <h3>Datos del servicio</h3>
            <ul>
                <li><b>Nombre: </b>{Account?.Nombre}</li>
                <li><b>Abonado - Digital: </b>{Account?.CodigoAbonado}</li>
                <li><b>Numero de Cliente: </b>{Account?.CodigoCte}</li>
                <li><b>Dirección: </b> {Account?.Direccion}</li>
            </ul>
            <div>
                <div className='container-folio'>
                    <p>FOLIO:</p>
                    <b>{service?.service.folio}</b>
                    <button
                        className='btn2'
                        onClick={async () => {
                            if (service) {
                                navigator.clipboard.writeText(service.service.folio);
                                await ShowMessage({ title: 'Folio copiado', text: '', timer: 1500 });
                            }
                        }}
                    >Copiar</button>
                </div>
                <Switch
                    text='Puede ver claves'
                    value={service?.service.isKeyCode}
                    func={() => updateServiceMutate.mutate({ id_service: service!.service.id_service, person: { id: person!.id_person, role: person!.id_role, name: `${person?.personName} ${person?.lastname}` }, prop: 'isKeyCode', value: !service?.service.isKeyCode })}
                />
            </div>
        </div>
    )
}

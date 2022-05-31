import React, { useState } from 'react'
import { UseMutationResult } from 'react-query';
import { Account, PropsUpdateService, Service, ServiceSelected, Technical } from '../../rules/interfaces';
import { ShowMessage, ViewImg } from '../Swal';
import { Switch } from '../Switch';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Icon } from '@mdi/react';
import second from '@mdi/js';
import { mdiImage as IconImage, mdiClose as IconClose } from '@mdi/js';
import { baseUrl } from '../../api/Api';
import Swal from 'sweetalert2';

interface props {
    Account: Account | undefined;
    service: ServiceSelected | undefined;
    updateServiceMutate: UseMutationResult<{
        service: Service;
        technicals: Technical[];
    }, unknown, PropsUpdateService, unknown>;
    files: Array<string>;
}
export const Folio = ({ Account, service, updateServiceMutate, files }: props) => {
    const { person } = useContext(AuthContext);
    const [isPhotos, setIsPhotos] = useState<boolean>(false);
    return (
        <div className='folio'>
            <h3>Datos del servicio{isPhotos && ': Imágenes enviadas'}</h3>
            <i className='icon-photos' onClick={() => setIsPhotos(!isPhotos)}><Icon path={isPhotos ? IconClose : IconImage} size='40px' /></i>
            {
                (isPhotos)
                    ?
                    <div className='container-img'>
                        {
                            files?.map(file => {
                                return <img onClick={async () => {
                                    await ViewImg(`${baseUrl}/files/getImg?type=Service&id=${service?.service.id_service}&img=${file}`)
                                }} src={`${baseUrl}/files/getImg?type=Service&id=${service?.service.id_service}&img=${file}`} alt="img" />
                            })
                        }
                    </div>
                    :
                    <>
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
                    </>
            }
        </div>
    )
}

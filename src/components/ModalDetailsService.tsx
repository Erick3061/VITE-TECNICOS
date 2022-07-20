import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query';
import { baseUrl, getDirectory, getServiceWithDetails } from '../api/Api';
import { Person, ServiceDetails, Services, TechnicalInfo } from '../rules/interfaces';
import { ShowError, ShowMessage, ViewImg } from './Swal';
import { Icon } from '@mdi/react';
import { mdiAccount as IconTechnical } from '@mdi/js';
import { mdiClose as IconClose, mdiImage as IconImage } from '@mdi/js';

interface props {
    setService: React.Dispatch<React.SetStateAction<Services | undefined>>,
    Service: Services | undefined;
}

export const ModalDetailsService = ({ Service, setService }: props) => {
    const [service, setservice] = useState<ServiceDetails | undefined>();
    const [selectedTechnical, setselectedTechnical] = useState<TechnicalInfo | undefined>(undefined);
    const [Zones, setZones] = useState<Array<{ code: string, desc: string }>>();
    const [ZonesMissing, setZonesMissing] = useState<Array<{ code: string, desc: string }>>();
    const [ZonesUndefined, setZonesUndefined] = useState<Array<string>>();

    const [Users, setUsers] = useState<Array<{ code: string, name: string }>>();
    const [UsersMissing, setUsersMissing] = useState<Array<{ code: string, name: string }>>();
    const [Technicals, setTechnicals] = useState<Array<TechnicalInfo>>();
    const [UsersUndefined, setUsersUndefined] = useState<Array<string>>();

    const [files, setfiles] = useState<Array<string> | undefined>(undefined);
    const [isPhotos, setIsPhotos] = useState<boolean>(false);


    const directory = useMutation(['directory'], getDirectory, {
        retry: false,
        onError: error => {
            ShowMessage({ title: 'Error', text: `${error}`, icon: 'error', });
        },
        onSuccess: ({ files }) => {
            setfiles(files);
        }
    });



    const { refetch, isLoading, isFetching } = useQuery(["ServiceDetails"], () => getServiceWithDetails((Service) ? Service.id_service : ''),
        {
            enabled: false,
            retry: 1,
            refetchInterval: false,
            onSuccess: data => {
                setservice(() => data);
                const zones: Array<{ code: string, desc: string }> = JSON.parse(data.binnacle[0].zones);
                setZones(zones);
                const zonesMissing: Array<{ code: string, desc: string }> = JSON.parse(data.binnacle[0].missingZones);
                setZonesMissing(zonesMissing);
                const zonesUndefined = JSON.parse(data.binnacle[0].zonesUndefined);
                setZonesUndefined(zonesUndefined);
                const users: Array<{ code: string, name: string }> = JSON.parse(data.binnacle[0].users);
                setUsers(users);
                const usersMissing: Array<{ code: string, name: string }> = JSON.parse(data.binnacle[0].missingUsers);
                setUsersMissing(usersMissing);
                const usersUndefined = JSON.parse(data.binnacle[0].usersUndefined);
                setUsersUndefined(usersUndefined);
                const technicals = JSON.parse(data.binnacle[0].technicals);
                setTechnicals(technicals);

                if (data.service.filesCron === 'going up') directory.mutate({ id: data.service.id_service, type: 'Service' });
                else setfiles([]);
            },
            onError: async error => await ShowError(`${error}`)
        }
    );

    const close = (modal: Element | null) => {
        (modal) && modal.setAttribute('style', 'display: none');
    }

    useEffect(() => {
        if (Service !== undefined) refetch();
    }, [Service]);

    return (
        <div id='Modal' className='Modal'>
            <div className='modal-container'>
                {
                    (isLoading || isFetching)
                        ? <div className='spin'></div>
                        :
                        <div className='modal-content'>
                            <section className='header'>
                                <h1>{Service?.nameAccount}</h1>
                                <span className="close" onClick={() => close(document.querySelector('.Modal'))} > &times; </span>
                            </section>
                            <section className='body'>
                                <section style={{ height: '100%' }}>
                                    <article className='top2'>
                                        <div className='folio'>
                                            <p>DATOS DEL SERVICIO</p>
                                            <i className='icon-photos' onClick={() => setIsPhotos(!isPhotos)}><Icon path={isPhotos ? IconClose : IconImage} size='40px' /></i>
                                            {
                                                (isPhotos)
                                                    ?
                                                    <div className='container-img' >
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
                                                            <li><b>Nombre: </b>{service?.service?.nameAccount}</li>
                                                            <li><b>Abonado - Digital: </b>{service?.service?.digital}</li>
                                                            <li><b>Numero de Cliente: </b>{service?.service?.accountMW}</li>
                                                            <li><b>Folio: </b>{service?.service.folio}</li>
                                                        </ul>
                                                        <p>Entrada y salida</p>
                                                        <ul>
                                                            <li><b>Otorgó Entrada: </b>{service?.service.grantedEntry}</li>
                                                            <li><b>Fecha y Hora: </b>{`${service?.service.entryDate}`.replace('T', ' ').substring(0, 19)}</li>
                                                            <li><b>Otorgó Salida: </b>{service?.service.grantedExit}</li>
                                                            <li><b>Fecha y Hora: </b>{`${service?.service.exitDate}`.replace('T', ' ').substring(0, 19)}</li>
                                                        </ul>
                                                        <p>Verificaciones</p>
                                                        <ul>
                                                            <li><b>Primer verificación: </b>{service?.service.firstVerification}</li>
                                                            <li><b>Segunda verificación: </b>{service?.service.secondVerification}</li>
                                                        </ul>
                                                        <p>Otros</p>
                                                        <ul>
                                                            <li><b>¿Se entrego el folio?: </b>{service?.service.isDelivered ? 'SI' : 'NO'}</li>
                                                            <li><b>¿Se revisó apertura y cierre?: </b>{service?.service.isOpCi ? 'SI' : 'NO'}</li>
                                                            <li><b>¿Hubo enlace?: </b>{service?.binnacle[0].link}</li>
                                                        </ul>
                                                    </>
                                            }
                                        </div>
                                        <div className='folio'>
                                            <section className='container-technicals'>
                                                <p>Datos de los tecnicos que realizaron servicio</p>
                                                {
                                                    (selectedTechnical)
                                                        ?
                                                        <div className='technical'>
                                                            <i
                                                                onClick={() => {
                                                                    setselectedTechnical(() => undefined);
                                                                }}
                                                            >
                                                                <Icon path={IconClose} className='icon-close'
                                                                />
                                                            </i>
                                                            <h3>{selectedTechnical.fullName}</h3>
                                                            <div className='info'>
                                                                <b><span>Empresa: </span>{selectedTechnical.enterpriceShortName}</b>
                                                                <b><span>Número de empleado: </span>{selectedTechnical.employeeNumber}</b>
                                                                <b><span>Número telefonico: </span>{selectedTechnical.phoneNumber}</b>
                                                                <b><span>Nombre de usuario: </span>{selectedTechnical.nameUser}</b>
                                                                <b><span>¿Se retiró sin folio?: </span>{(selectedTechnical.withOutFolio === 'true') ? 'SI' : 'NO'}</b>
                                                            </div>
                                                        </div>
                                                        :
                                                        <div className='technicals'>
                                                            <section className='container-list'>
                                                                {
                                                                    Technicals?.map(t => {
                                                                        return (
                                                                            <div
                                                                                key={`${t.fullName}`}
                                                                                onClick={() => setselectedTechnical(() => t)}
                                                                            >
                                                                                <Icon path={IconTechnical} className='icon' />
                                                                                <p>{t.fullName}</p>
                                                                            </div>
                                                                        )
                                                                    })
                                                                }
                                                            </section>
                                                        </div>
                                                }
                                            </section>
                                            <section className='container-comments'>
                                                <p>Comentarios</p>
                                                <textarea
                                                    name=""
                                                    disabled
                                                    value={`${service?.comments.map(c => `${c.person}: ${c.comment}\n\n`)}`}
                                                >
                                                </textarea>
                                            </section>
                                        </div>
                                    </article>
                                    <article className='top2'>
                                        <div className='folio'>
                                            <p>Zonas Enviadas</p>
                                            <ul>
                                                {
                                                    Zones?.map((z, idx) => <li key={`${idx} ${z.code}`}><b>{z.code}: </b>{z.desc}</li>)
                                                }
                                            </ul>
                                        </div>
                                        <div className='folio'>
                                            <p>Zonas Faltantes</p>
                                            <ul>
                                                {
                                                    ZonesMissing?.map((z, idx) => <li key={`${idx} ${z.code}`}><b>{z.code}: </b>{z.desc}</li>)
                                                }
                                            </ul>
                                        </div>
                                    </article>
                                    <article className='top2'>
                                        {
                                            (service?.service.isOpCi) &&
                                            <>
                                                <div className='folio'>
                                                    <p>Usuarios Enviados</p>
                                                    <ul>
                                                        {
                                                            Users?.map((z, idx) => <li key={`${idx} ${z.code}`}><b>{z.code}: </b>{z.name}</li>)
                                                        }
                                                    </ul>
                                                </div>
                                                <div className='folio'>
                                                    <p>Usuarios Faltantes</p>
                                                    <ul>
                                                        {
                                                            UsersMissing?.map((z, idx) => <li key={`${idx} ${z.code}`}><b>{z.code}: </b>{z.name}</li>)
                                                        }
                                                    </ul>
                                                </div>
                                            </>
                                        }
                                    </article>
                                    <article className='top2'>
                                        {
                                            (service?.service.isOpCi) &&
                                            <>
                                                <div className='folio'>
                                                    <p>Zonas no definidas en el software</p>
                                                    <ul>
                                                        {
                                                            ZonesUndefined?.map((z, idx) => <li key={`${idx}`}><b>Zona: </b>{z}</li>)
                                                        }
                                                    </ul>
                                                </div>
                                                <div className='folio'>
                                                    <p>Usuarios no definidos en el software</p>
                                                    <ul>
                                                        {
                                                            UsersUndefined?.map((z, idx) => <li key={`${idx}`}><b>Usuario: </b>{z}</li>)
                                                        }
                                                    </ul>
                                                </div>
                                            </>
                                        }
                                    </article>
                                    <div style={{ height: '20px' }}></div>
                                </section>
                            </section>
                            <section className='footer'>
                                <button className='btn3' onClick={() => close(document.querySelector('.Modal'))}> cerrar</button>
                            </section>
                        </div>
                }
            </div>
        </div>
    )
}

import React, { useEffect, useState } from 'react'
import { DisponibleTechnicals, AccountsMW, getService, GetVerification, updateService, updateTechnicals, getDirectory } from '../api/Api';
import { ShowAlert, ShowError, ShowMessage, ShowServiceValidate, ShowMessage2, SendValidate } from './Swal';
import { ServiceSelected, Account, Technical, Services, PropsUpdateService, PropsBinnacle, TechnicalInfo } from '../rules/interfaces';
import { validateUsers, validateZones, errorFormat } from '../functions/Functions';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import CountDownTimer from './CountDownTimer';
import Select, { SingleValue } from 'react-select';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { Folio } from './Modal/Folio';
import { Users, Zones } from './Modal/ZonesUsers';
import { Time } from './Modal/MoreTime';
import { color as Colors } from '../helpers/herpers';
import { Icon } from '@mdi/react';
import { mdiAccount as IconTechnical } from '@mdi/js';
import { mdiAccountPlus as IconAddTechnical } from '@mdi/js';
import { mdiClose as IconClose } from '@mdi/js';

interface Props {
    setService: React.Dispatch<React.SetStateAction<Services | undefined>>,
    Service: Services | undefined;
}

export const ModalService = ({ Service, setService }: Props) => {
    const { person, logOut } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const [service, setservice] = useState<ServiceSelected | undefined>();
    const [Account, setAccount] = useState<Account | undefined>(undefined);
    const [Verify, setVerify] = useState<{ zones: Array<string>, users: Array<string> } | undefined>(undefined);
    const [selectedTechnical, setselectedTechnical] = useState<Technical | undefined>(undefined);
    const [AddTechnical, seAddTechnical] = useState<boolean>(false);
    const [technicals, settechnicals] = useState<Array<string>>([]);
    const [files, setfiles] = useState<Array<string>>([]);
    const color: string = Colors.SecondaryDark;

    const showError = async (error: string) => {
        if (`${error}`.toLowerCase().includes('servicio no existe')) {
            close(document.querySelector('.Modal'));
            ShowMessage({ title: 'Servicio Terminado', text: `Cliente: ${service?.service.accountMW}, Abonado: ${Account?.CodigoAbonado}`, icon: 'success' });
        } else {
            if (error.includes('JsonWebTokenError') || error.includes('TokenExpiredError')) {
                localStorage.clear();
                logOut();
                (error.includes('TokenExpiredError')) ? await ShowError('La sesión expiró') : await ShowError('Token invalido');
            }
            await ShowError(errorFormat(error));
        }
    }

    const directory = useMutation('directory', getDirectory, {
        retry: false,
        onError: error => {
            ShowMessage({ title: 'Error', text: `${error}`, icon: 'error', });
        },
        onSuccess: ({ files }) => {
            setfiles(files);
        }
    });

    const { refetch, isLoading } = useQuery(["Service"], () => getService((Service) ? Service.id_service : ''),
        {
            enabled: (Service) ? true : false,
            retry: 1,
            refetchInterval: false,
            onSuccess: data => {
                setservice(() => data);
                if (data.service.filesCron === 'going up') directory.mutate({ id: data.service.id_service, type: 'Service' });
                else setfiles([]);
                queryClient.invalidateQueries(['serviceActive']);
            },
            onError: async error => await showError(`${error}`)
        }
    );

    const accountMW = useQuery(["Account"], () => AccountsMW((Service?.id_service) ? Service.id_service : undefined), {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        enabled: false,
        retry: 1,
        onSuccess: data => {
            verify.refetch();
            setAccount(() => data.account);
        },
        onError: async error => await showError(`${error}`)
    });

    const verify = useQuery(["verify"], () => GetVerification((Service?.id_service) ? Service.id_service : ''), {
        refetchOnMount: false,
        enabled: (Service) ? true : false,
        retry: 1,
        onSuccess: data => setVerify(() => data),
        onError: async error => await showError(`${error}`)
    });

    const Technicals = useQuery('DisponibleTechnicals', () => DisponibleTechnicals(person?.id_role === 3 ? { id_enterprice: person.id_enterprice, shortName: person.enterpriceShortName, name: '' } : undefined), {
        retry: 1,
        refetchOnWindowFocus: false,
        refetchInterval: false,
        onError: async error => await showError(`${error}`)
    });

    const updateServiceMutate = useMutation(['updateService'], updateService, {
        retry: 1,
        onSuccess: async data => {
            setservice(() => data);
            if (!data.service.isActive) {
                queryClient.invalidateQueries(['serviceActive']);
                close(document.querySelector('.Modal'));
                ShowMessage({ title: 'Servicio Terminado', text: `Cliente: ${service?.service.accountMW}, Abonado: ${Account?.CodigoAbonado}`, icon: 'success' });
            }
        },
        onError: async error => await showError(`${error}`)
    });

    const updateTechnicalsMutate = useMutation(['updateTechnicals'], updateTechnicals, {
        retry: 1,
        onSuccess: async data => {
            const tech: { technicals: Array<{ id_person: string, name: string }> } | undefined = queryClient.getQueryData(['DisponibleTechnicals']);
            refetch();
            settechnicals(() => []);
            if (data.asignados) {
                seAddTechnical(() => false);
                settechnicals(() => []);
                await ShowMessage({ title: 'CORRECTO', text: `${data.asignados.map(a => tech?.technicals.find(f => f.id_person === a)?.name)} Asignado al servicio`, icon: 'success' });
            }
            if (data.eliminados) {
                await ShowMessage({ title: 'CORRECTO', text: `${selectedTechnical?.personName} ${selectedTechnical?.lastname} Eliminado del servicio`, icon: 'success' });
                setselectedTechnical(() => undefined);
            }
            if (data.actualizados) {
                await ShowMessage({ title: 'CORRECTO', text: `${selectedTechnical?.personName} ${selectedTechnical?.lastname} Se actualizó correctamente`, icon: 'success' });
                setselectedTechnical(() => undefined);
            }
        },
        onError: async error => await showError(`${error}`)
    });

    const addArray = async (value: SingleValue<{ label: string; value: string; }>) => {
        if (value?.value !== ('' || null || undefined)) {
            const existe = technicals.findIndex(f => f === value?.value);
            if (existe !== -1) await ShowAlert(`Técnico:${value?.label} ya esta incluido`);
            else settechnicals(() => [...technicals, value?.value]);
        }
    }

    const close = (modal: Element | null) => {
        (modal) && modal.setAttribute('style', 'display: none');
        setselectedTechnical(() => undefined);
        queryClient.removeQueries(['Service']);
        setService(() => undefined);
        setAccount(() => undefined);
    }

    const update = () => {
        queryClient.invalidateQueries(['serviceActive']);
        accountMW.refetch().then(() => verify.refetch());
    }

    const sendTechnicals = async () => updateTechnicalsMutate.mutate({ id_service: service!.service.id_service, technicals });

    const validarServicio = async () => {
        if (accountMW.isSuccess && verify.isSuccess) {
            const { indefiniteZone, missingZone } = validateZones(accountMW.data.account?.zones, verify.data.zones);
            const { indefiniteUser, missingUser } = validateUsers(accountMW.data.account?.users, verify.data.users);
            const data: PropsUpdateService = { id_service: service!.service.id_service, person: { id: person!.id_person, role: person!.id_role, name: `${person?.personName} ${person?.lastname}` }, prop: (person?.id_role === 2) ? 'secondVerification' : 'firstVerification' };
            if (service?.service.isOpCi) {
                if (missingZone && missingZone.length !== 0) {
                    await ShowServiceValidate({
                        text: `Faltan zonas por enviar ${(indefiniteZone && indefiniteZone.length > 0) ? `y existen zonas no registradas en el software` : ''} `,
                        mutate: updateServiceMutate,
                        data
                    });
                } else {
                    if (indefiniteZone && indefiniteZone.length > 0) {
                        await ShowServiceValidate({
                            text: `Existen zonas no registradas en el software`,
                            mutate: updateServiceMutate,
                            data
                        });
                    } else {
                        if (missingUser && accountMW.data.account && missingUser.length === accountMW.data.account.users.length) {
                            await ShowServiceValidate({
                                text: `Falta al menos una apertura o cierre por enviar ${(indefiniteZone && indefiniteZone.length > 0) ? `y existen usuarios no registrados en el software` : ''}`,
                                mutate: updateServiceMutate,
                                data
                            });
                        } else {
                            if (indefiniteUser && indefiniteUser.length > 0) {
                                await ShowServiceValidate({
                                    text: `Existen usuarios no registrados en el Software`,
                                    mutate: updateServiceMutate,
                                    data
                                });
                            } else {
                                await SendValidate({
                                    text: ``,
                                    mutate: updateServiceMutate,
                                    data
                                });
                            }
                        }
                    }
                }
            } else {
                if (missingZone && missingZone.length !== 0) {
                    await ShowServiceValidate({
                        text: `Faltan zonas por enviar ${(indefiniteZone && indefiniteZone.length > 0) ? `y existen zonas no registradas en el software` : ''} `,
                        mutate: updateServiceMutate,
                        data
                    });
                } else {
                    if (indefiniteZone && indefiniteZone.length > 0) {
                        await ShowServiceValidate({
                            text: `Existen zonas no registradas en el software`,
                            mutate: updateServiceMutate,
                            data
                        });
                    } else {
                        await SendValidate({
                            text: ``,
                            mutate: updateServiceMutate,
                            data
                        });
                    }
                }
            }


        }
    }

    const sendLiberation = async (op: 'SF' | 'EF' | 'TS') => {
        if (accountMW.isSuccess && verify.isSuccess) {
            const { indefiniteZone: zu, missingZone } = validateZones(accountMW.data.account?.zones, verify.data.zones);
            const { indefiniteUser: uu, missingUser } = validateUsers(accountMW.data.account?.users, verify.data.users);
            const ze = accountMW.data.account?.zones.filter(z => missingZone?.find(f => `${z.codigo}` === f) === undefined).map(m => { return { code: `${m.codigo}`, desc: `${m.descripcion}` } });
            const ue = accountMW.data.account?.users.filter(u => missingUser?.find(f => `${u.codigo}` === f) === undefined).map(m => { return { code: `${m.codigo}`, name: `${m.nombre}` } });
            const zf = accountMW.data.account?.zones.filter(z => missingZone?.find(f => `${z.codigo}` === f) !== undefined).map(m => { return { code: `${m.codigo}`, desc: `${m.descripcion}` } });
            const uf = accountMW.data.account?.users.filter(u => missingUser?.find(f => `${u.codigo}` === f) !== undefined).map(m => { return { code: `${m.codigo}`, name: `${m.nombre}` } });
            const technicals = service?.technicals.map(t => {
                return {
                    fullName: `${t.personName} ${t.lastname}`,
                    employeeNumber: `${t.employeeNumber}`,
                    id_enterprice: t.id_enterprice,
                    enterpriceShortName: `${t.enterpriceShortName}`,
                    nameUser: `${t.nameUser}`,
                    phoneNumber: `${t.phoneNumber}`,
                    withOutFolio: `${t.withOutFolio}`
                }
            });
            const binnacle: PropsBinnacle = {
                ze: JSON.stringify(ze),
                zf: JSON.stringify(zf),
                zu: JSON.stringify(zu),
                ue: JSON.stringify(ue),
                uf: JSON.stringify(uf),
                uu: JSON.stringify(uu),
                link: 'desconocido',
                technicals: JSON.stringify(technicals)
            };
            const data: PropsUpdateService =
                (op === 'SF')
                    ? { id_service: service!.service.id_service, person: { id: person!.id_person, role: person!.id_role, name: `${person?.personName} ${person?.lastname}` }, prop: op, value: { comment: '', value: true, binnacle } }
                    : (op === 'TS')
                        ? { id_service: service!.service.id_service, person: { id: person!.id_person, role: person!.id_role, name: `${person?.personName} ${person?.lastname}` }, prop: op, value: { comment: '', value: true, binnacle } }
                        : { id_service: service!.service.id_service, person: { id: person!.id_person, role: person!.id_role, name: `${person?.personName} ${person?.lastname}` }, prop: op, value: true };
            await ShowServiceValidate({ data, mutate: updateServiceMutate, text: '¿Quieres Continuar?', op });
        }
    }

    useEffect(() => {
        (Service !== undefined) && refetch()
    }, [Service]);

    useEffect(() => {
        if (service !== undefined && service.service.isActive) {
            accountMW.refetch();
            refetch();
        } else if (service !== undefined) {
            ShowMessage({ title: 'Servicio Terminado', text: `Nombre: ${service.service.nameAccount}\n Cliente: ${service?.service.accountMW}, Abonado: ${service.service.digital}`, icon: 'success' });
            setservice(undefined);
        }
    }, [service]);

    return (
        <div id='Modal' className='Modal'>
            <div className='modal-container'>
                {
                    (isLoading || accountMW.isLoading || verify.isLoading)
                        ? <div className='spin'></div>
                        :
                        <div className='modal-content'>
                            <section className='header' style={(!service?.service.firstVerification && person?.id_role === 2) ? { backgroundColor: `${color}` } : {}}>
                                <h1>{Account?.Nombre}</h1>
                                <span className="close" onClick={() => close(document.querySelector('.Modal'))} > &times; </span>
                            </section>
                            <section className='body'>
                                {
                                    (accountMW.isFetching || verify.isFetching) &&
                                    <div className='loading'>
                                        <div className='spin2'></div>
                                    </div>
                                }
                                <div className="container-countDown"
                                    style={(!service?.service.firstVerification && person?.id_role === 2) ? { backgroundColor: `${color}` } : {}}
                                >
                                    {(service && !service.service.isTimeExpired) ? <CountDownTimer refetch={refetch} service={service} /> : <p>El tiempo expiró</p>}
                                </div>
                                <section>
                                    <article className='top'>
                                        <Folio Account={Account} service={service} updateServiceMutate={updateServiceMutate} files={files} key='Folio' />
                                        {
                                            (service?.service.isTimeExpired)
                                                ? <Time service={service} updateServiceMutate={updateServiceMutate} key='MoreTime' />
                                                : (selectedTechnical !== undefined)
                                                    ?
                                                    <div className='technical'>
                                                        <i
                                                            onClick={() => {
                                                                setselectedTechnical(() => undefined);
                                                            }}
                                                        >
                                                            <Icon path={IconClose}
                                                                className='icon-close'
                                                            />
                                                        </i>
                                                        <div className='info'>
                                                            <b><span>Nombre: {selectedTechnical.personName} {selectedTechnical.lastname}</span></b>
                                                            <b><span>Empresa: </span>{selectedTechnical.enterpriceShortName}</b>
                                                            <b><span>Número de empleado: </span>{selectedTechnical.employeeNumber}</b>
                                                            <b><span>Número telefonico: </span>{selectedTechnical.phoneNumber}</b>
                                                            <b><span>Nombre de usuario: </span>{selectedTechnical.nameUser}</b>
                                                            <b><span>Sin folio: </span>{(selectedTechnical.withOutFolio) ? 'Si' : 'No'}</b>
                                                        </div>
                                                        <div className='btns'>
                                                            {
                                                                (!selectedTechnical.withOutFolio)
                                                                    ?
                                                                    <button className='btn'
                                                                        onClick={() => updateTechnicalsMutate.mutate({ id_service: service!.service.id_service, op: 'sf', technicals: [selectedTechnical.id_person] })}
                                                                    >sin folio</button>
                                                                    :
                                                                    <button
                                                                        className='btn'
                                                                        onClick={() => updateTechnicalsMutate.mutate({ id_service: service!.service.id_service, op: 'cf', technicals: [selectedTechnical.id_person] })}
                                                                    >con folio</button>
                                                            }
                                                            <button
                                                                className='btn'
                                                                onClick={() => updateTechnicalsMutate.mutate({ id_service: service!.service.id_service, op: 'del', technicals: [selectedTechnical.id_person] })}
                                                            >Eliminar por error<br></br> de asignación</button>
                                                        </div>
                                                    </div>
                                                    :
                                                    (AddTechnical)
                                                        ?
                                                        <div className='technical'>
                                                            <h3>Seleccione los tecnicos que desea agregar al servicio</h3>
                                                            <i
                                                                onClick={() => {
                                                                    seAddTechnical(() => false);
                                                                    settechnicals(() => []);
                                                                }}
                                                            >
                                                                <Icon path={IconClose}
                                                                    className='icon-close'
                                                                />
                                                            </i>
                                                            <div className='container-add'>
                                                                <div className='select'>
                                                                    <Select
                                                                        className='input'
                                                                        styles={{
                                                                            dropdownIndicator: () => ({ display: 'none' }),
                                                                            indicatorSeparator: () => ({ display: 'none' })
                                                                        }}
                                                                        value={{ label: 'Selecciona un Técnico', value: '' }}
                                                                        isSearchable={true}
                                                                        isLoading={Technicals.isFetching}
                                                                        options={Technicals.data?.technicals.map(Tech => { return { value: Tech.id_person, label: `${Tech.name}` } }).filter(f => f.value !== technicals.find(b => b === f.value))}
                                                                        onChange={(value) => addArray(value)}
                                                                        onFocus={() => { Technicals.refetch(); }}
                                                                    />
                                                                </div>
                                                                <div className='select'>
                                                                    <p className='title text-center'>Técnicos seleccionados</p>
                                                                    <div className='added'>
                                                                        {
                                                                            technicals.map(el => {
                                                                                return <p key={`${el}`}><b>Nombre: </b>{Technicals.data?.technicals.find(f => f.id_person === el)?.name}<i onClick={() => settechnicals(() => technicals.filter(f => f !== el))}><Icon path={IconClose} className='icon' /></i></p>
                                                                            })
                                                                        }
                                                                    </div>
                                                                    <div className='send'>
                                                                        <button
                                                                            className='btn2'
                                                                            onClick={
                                                                                async () => await ShowMessage2({
                                                                                    text: `${technicals.map(t => Technicals.data?.technicals.find(f => f.id_person === t)?.name)}`,
                                                                                    title: '¿De verdad deseas agregar estos Técnicos al servicio?', timer: undefined, func: () => sendTechnicals(),
                                                                                    confirmText: 'Continuar',
                                                                                    denyText: 'Cancelar'
                                                                                })
                                                                            }
                                                                        >enviar</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        :
                                                        <div className='technicals'>
                                                            <h3>Datos de los tecnicos en servicio</h3>
                                                            <i
                                                                onClick={() => seAddTechnical(() => true)}
                                                            >
                                                                <Icon path={IconAddTechnical}
                                                                    className='icon-add'
                                                                />
                                                            </i>
                                                            <section className='container-list'>
                                                                {
                                                                    (!AddTechnical)
                                                                        ?
                                                                        service?.technicals.map(t => {
                                                                            return (
                                                                                <div
                                                                                    style={(t.withOutFolio) ? { backgroundColor: '#fbc02d' } : {}}
                                                                                    key={`${t.id_person}`}
                                                                                    onClick={() => setselectedTechnical(() => service.technicals.find(f => f.id_person === t.id_person))}
                                                                                >
                                                                                    <Icon path={IconTechnical} className='icon' />
                                                                                    <p>{t.personName} {t.lastname}</p>
                                                                                </div>
                                                                            )
                                                                        })
                                                                        :
                                                                        <div>
                                                                            ldldld
                                                                        </div>
                                                                }
                                                            </section>
                                                        </div>
                                        }
                                    </article>
                                    <article className='bottom'>
                                        <Zones Account={Account} Verify={Verify} accountMW={accountMW} verify={verify} key='ZonesComponent' />
                                        {
                                            (service?.service.isOpCi) && <Users Account={Account} Verify={Verify} accountMW={accountMW} verify={verify} key='UsersComponent' />
                                        }
                                    </article>
                                </section>
                            </section>
                            <section className='footer' style={(!service?.service.firstVerification && person?.id_role === 2) ? { backgroundColor: `${color}` } : {}}>
                                {

                                    <>
                                        {
                                            (person?.id_role === 2)
                                                ? (service?.service.secondVerification)
                                                    ?
                                                    <>
                                                        <button className='btn3' onClick={async () => await sendLiberation('TS')}>Terminar servicio</button>
                                                        {(!service.service.isDelivered) && <button className='btn3' onClick={async () => await sendLiberation('EF')}>Entregar folio</button>}
                                                    </>
                                                    :
                                                    <button className='btn3' onClick={async () => {
                                                        if (service?.service.firstVerification) {
                                                            validarServicio();
                                                        } else {
                                                            await ShowMessage2({ text: '¿Quires continuar?', title: 'Aun no ha validado el encargado', icon: 'warning', timer: undefined, func: () => validarServicio() });
                                                        }
                                                    }}>Validar</button>
                                                : (service?.service.firstVerification)
                                                    ?
                                                    <>
                                                        {(!service.service.isDelivered) && <button className='btn3' onClick={async () => await sendLiberation('EF')}>Entregar folio</button>}
                                                    </>
                                                    :
                                                    <button className='btn3' onClick={validarServicio}>Validar</button>
                                        }
                                        {(!service?.service.isDelivered && person?.id_role === 2) && <button className='btn3' onClick={async () => await sendLiberation('SF')}>Sin folio</button>}
                                        <button className='btn3' onClick={() => update()}>Actualizar</button>
                                        <button className='btn3' onClick={() => close(document.querySelector('.Modal'))}> cerrar</button>
                                    </>
                                }
                            </section>
                        </div>
                }
            </div>
        </div >
    )
}

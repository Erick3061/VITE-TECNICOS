import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { AllPersonal, personActions } from '../api/Api';
import { ShowError, ShowMessage, ShowMessage2 } from '../components/Swal';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { errorFormat } from '../functions/Functions';
import { Enterprices, Person, Roles, ServicesTypes } from '../rules/interfaces';
import { ModalEditPerson } from '../components/ModalEditPerson';
import { color } from '../helpers/herpers';
import { Icon } from '@mdi/react'
import { mdiMagnify as IconSearchService } from '@mdi/js';
import { mdiDelete as IconDelete } from '@mdi/js';
import { mdiPencil as IconEdit } from '@mdi/js';
import { mdiLightbulbOn as IconPersonActive } from '@mdi/js';
import { mdiLightbulbVariantOutline as IconPersonInactive } from '@mdi/js';
import { mdiRefresh as IconRefresh } from '@mdi/js';
import { mdiLoading as IconLoading } from '@mdi/js';

export const PersonPage = () => {
    const { logOut, person } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const [filtro, setfiltro] = useState<'All' | 'Technical' | 'DutyManager' | 'Operator' | 'Actives' | 'Inactives'>('All');
    const [name, setname] = useState('');
    const [Search, setSearch] = useState<Array<Person>>();
    const [filtrado, setfiltrado] = useState<Array<Person>>();
    const [persons, setpersons] = useState<Array<Person>>();
    const [active, setactive] = useState<'name' | 'emplyeNumber' | 'enterprice'>('name');
    const [Person, setPerson] = useState<Person>();
    const [isLoading, setisLoading] = useState<boolean>(false);
    const [GetGeneral, setGetGeneral] = useState<{ Enterprices: Enterprices[]; Roles: Roles[]; ServicesTypes: ServicesTypes[]; }>();
    const [isRestoralPassword, setisRestoralPassword] = useState<boolean>(false);


    const search = (txt: string) => {
        setname(txt);
        (active === 'name') ?
            setSearch(filtrado?.filter(el => ((`${el.personName} ${el.lastname}` !== null) && `${el.personName} ${el.lastname}`.toLowerCase().includes(txt.toLowerCase()))))
            : (active === 'emplyeNumber') ?
                setSearch(filtrado?.filter(el => ((el.employeeNumber !== null) && el.employeeNumber.toLowerCase().includes(txt.toLowerCase()))))
                : setSearch(filtrado?.filter(el => (el.enterpriceShortName.toLowerCase().includes(txt.toLowerCase()))));
        if (txt.toLowerCase() === '') setSearch(filtrado);
    }

    const setFiltrado = () => {
        if (filtro === 'All') {
            setfiltrado(() => persons?.filter(p => p))
            setSearch(() => persons?.filter(p => p))
        }
        if (filtro === 'Actives') {
            setfiltrado(() => persons?.filter(p => (p.status === 'ACTIVO')))
            setSearch(() => persons?.filter(p => (p.status === 'ACTIVO')))
        }
        if (filtro === 'Inactives') {
            setfiltrado(() => persons?.filter(p => !(p.status === 'ACTIVO')))
            setSearch(() => persons?.filter(p => !(p.status === 'ACTIVO')))
        }
        if (filtro === 'Technical') {
            setfiltrado(() => persons?.filter(p => p.id_role === 1))
            setSearch(() => persons?.filter(p => p.id_role === 1))
        }
        if (filtro === 'Operator') {
            setfiltrado(() => persons?.filter(p => p.id_role === 2))
            setSearch(() => persons?.filter(p => p.id_role === 2))
        }
        if (filtro === 'DutyManager') {
            setfiltrado(() => persons?.filter(p => p.id_role === 3));
            setSearch(() => persons?.filter(p => p.id_role === 3));
        }
    }

    const showError = async (error: string) => {
        if (error.includes('JsonWebTokenError') || error.includes('TokenExpiredError')) {
            localStorage.clear();
            logOut();
            (error.includes('TokenExpiredError')) ? await ShowError('La sesión expiró') : await ShowError('Token invalido');
        }
        await ShowError(errorFormat(error));
    }

    const Persons = useQuery('Persons', () => AllPersonal((person?.id_role === 3) ? true : undefined), {
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        onSuccess: data => {
            const person = data.Persons.find(p => p.id_person === Person?.id_person);
            if (person) setPerson(person);
            setfiltrado(() => data.Persons);
            setpersons(() => data.Persons);
        },
        onError: async error => await showError(`${error}`),
    });

    const ActionPerson = useMutation('ActionPerson', personActions, {
        retry: 1,
        onMutate: () => {
            setisLoading(true);
        },
        onSuccess: data => {
            if (data.passwordWasReset) {
                ShowMessage({
                    title: 'Contraseña actualizada',
                    icon: 'success',
                    text: ''
                })
            }

            if (data.isDeleted) {
                ShowMessage({
                    title: 'Persona eliminada',
                    icon: 'success',
                    text: ''
                })
            }

            if (data.isUpdated) {
                ShowMessage({
                    title: 'Persona actualizada corretamente',
                    icon: 'success',
                    text: ''
                })
            }
            setisRestoralPassword(false);
            setisLoading(false);
            Persons.refetch();
        },
        onError: async error => {
            setisLoading(false);
            await showError(`${error}`)
        },
    });

    useEffect(() => {
        setFiltrado();
        setname('');
    }, [filtro, persons]);

    useEffect(() => {
        const data: { Enterprices: Enterprices[]; Roles: Roles[]; ServicesTypes: ServicesTypes[]; } | undefined = queryClient.getQueryData(["GetGeneral"]);
        if (data) setGetGeneral(() => data);
        else queryClient.invalidateQueries('GetGeneral');
    }, []);


    return (
        <section className='containerAdmin'>
            <ModalEditPerson
                key={'ModalEdit'}
                Person={Person}
                setPerson={setPerson}
                ActionPerson={ActionPerson}
                isRestoralPassword={isRestoralPassword}
                setisRestoralPassword={setisRestoralPassword}
                isLoading={isLoading}
            />
            <header className='header'>
                <div className='search'>
                    <p className='title'>Personal</p>
                    <div className='inputsContainer'>
                        <div className='container-icon'>
                            <Icon path={IconSearchService} className='icon' />
                        </div>
                        <input
                            type={'text'}
                            value={name}
                            placeholder={((active) === 'name') ? 'Nombre' : ((active) === 'enterprice') ? 'Empresa' : 'Número de empleado'}
                            autoCorrect='false'
                            autoComplete='false'
                            onChange={({ target }) => search(target.value)}
                        />
                    </div>
                </div>
                <div className='filter'>
                    <p className='text'>Filtro</p>
                    <div className='btnsFilter'>
                        <div className={(filtro === 'All') ? 'btnFilterActive' : 'btnFilter'} onClick={() => setfiltro(() => 'All')} >Todos</div>
                        {
                            (person?.id_role !== 3) &&
                            <>
                                <div className={(filtro === 'Technical') ? 'btnFilterActive' : 'btnFilter'} onClick={() => setfiltro(() => 'Technical')} >Tecnicos</div>
                                <div className={(filtro === 'DutyManager') ? 'btnFilterActive' : 'btnFilter'} onClick={() => setfiltro(() => 'DutyManager')} >Encargados</div>
                                <div className={(filtro === 'Operator') ? 'btnFilterActive' : 'btnFilter'} onClick={() => setfiltro(() => 'Operator')} >Monitoristas</div>
                            </>
                        }
                        <div className={(filtro === 'Actives') ? 'btnFilterActive' : 'btnFilter'} onClick={() => setfiltro(() => 'Actives')} >Activos</div>
                        <div className={(filtro === 'Inactives') ? 'btnFilterActive' : 'btnFilter'} onClick={() => setfiltro(() => 'Inactives')} >Inactivos</div>
                    </div>
                </div>
                <div className='containerCalendar'>
                    <div className='btns'>
                        <div className='containerIcon'>
                            {(Persons.isFetching) ? <i> <Icon spin path={IconLoading} className='icon' /> </i> : <i onClick={() => Persons.refetch()} > <Icon path={IconRefresh} className='icon' /> </i>}
                        </div>
                    </div>
                </div>
            </header>
            <main className='main'>
                <section className='container-table m0'>
                    {
                        (Persons.isLoading || isLoading)
                            ?
                            <div className='flex-center'>
                                <div className='spin'></div>
                            </div>
                            :
                            <table className='bord'>
                                <thead>
                                    <tr className='row' key={`Indices`}>
                                        <th >#</th>
                                        {(person?.id_role !== 3) && <th style={{ borderRight: `1px solid ${color.background}` }} className={(active === 'enterprice') ? 'active' : ''} onClick={() => setactive(() => 'enterprice')} >EMPRESA</th>}
                                        <th style={{ borderRight: `1px solid ${color.background}` }} className={(active === 'name') ? 'active' : ''} onClick={() => setactive(() => 'name')} >Nombre completo</th>
                                        <th style={{ borderRight: `1px solid ${color.background}` }} className={(active === 'emplyeNumber') ? 'active' : ''} onClick={() => setactive(() => 'emplyeNumber')} >#-Empleado</th>
                                        <th style={{ borderRight: `1px solid ${color.background}` }} >Correo</th>
                                        <th style={{ borderRight: `1px solid ${color.background}` }} >Usuario</th>
                                        <th style={{ borderRight: `1px solid ${color.background}` }} >Teléfono</th>
                                        <th style={{ borderRight: `1px solid ${color.background}` }} >Rol</th>
                                        <th style={{ borderRight: `1px solid ${color.background}` }} >Estado</th>
                                        <th >Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        (Search && Search.length > 0)
                                            ? Search.map((el, idx) => {
                                                return (
                                                    <tr
                                                        className={`${el.status !== 'ACTIVO' ? 'inactive' : 'rows'}`}
                                                        key={`${el.id_person}`}
                                                    >
                                                        <td>{idx + 1}</td>
                                                        {(person?.id_role !== 3) && <td style={{ borderRight: `1px solid ${color.background}` }}>{el.enterpriceShortName}</td>}
                                                        <td style={{ borderRight: `1px solid ${color.background}` }}>{`${el.personName} ${el.lastname}`}</td>
                                                        <td style={{ borderRight: `1px solid ${color.background}` }}>{el.employeeNumber}</td>
                                                        <td style={{ borderRight: `1px solid ${color.background}` }}>{el.email}</td>
                                                        <td style={{ borderRight: `1px solid ${color.background}` }}>{el.nameUser}</td>
                                                        <td style={{ borderRight: `1px solid ${color.background}` }}>{el.phoneNumber}</td>
                                                        <td style={{ borderRight: `1px solid ${color.background}` }}>{(el.id_role === 1) ? 'Técnico' : (el.id_role === 2) ? 'Monitorista' : (el.id_role === 3) ? 'Encargado' : 'Administrador'}</td>
                                                        <td>
                                                            <p style={{ textAlign: 'center' }}>
                                                                {
                                                                    (el.status === 'ACTIVO')
                                                                        ?
                                                                        <i
                                                                            onClick={() => ActionPerson.mutate({
                                                                                person: {
                                                                                    id: el.id_person,
                                                                                    role: el.id_role,
                                                                                    name: `${el.personName} ${el.lastname}`
                                                                                },
                                                                                option: { updateStatus: 'INACTIVO' }
                                                                            })}

                                                                        >
                                                                            <Icon path={IconPersonActive} className='iconaction iconActive' />
                                                                        </i>
                                                                        :
                                                                        <i
                                                                            onClick={() => ActionPerson.mutate({
                                                                                person: {
                                                                                    id: el.id_person,
                                                                                    role: el.id_role,
                                                                                    name: `${el.personName} ${el.lastname}`
                                                                                },
                                                                                option: { updateStatus: 'ACTIVO' }
                                                                            })}
                                                                        >
                                                                            <Icon path={IconPersonInactive} className='iconaction iconInactive' />
                                                                        </i>
                                                                }
                                                            </p>
                                                        </td>
                                                        <td>
                                                            <i
                                                                onClick={() => {
                                                                    if (el.status === 'ACTIVO') {
                                                                        const modal = document.querySelector('.Modal');
                                                                        if (modal) modal.setAttribute('style', 'display: block');
                                                                        setPerson(() => el);
                                                                    } else ShowMessage({ text: 'Para editar la información, esta persona debe estar activa', title: 'Persona inactiva', icon: 'warning' })

                                                                }}
                                                            > <Icon path={IconEdit} className='iconaction' /> </i>
                                                            <i
                                                                onClick={async () => {
                                                                    await ShowMessage2({
                                                                        title: `${el.personName} ${el.lastname} se ELIMINARÁ`,
                                                                        text: '¿Quiere continuar?',
                                                                        icon: 'warning',
                                                                        confirmText: 'SI', denyText: 'NO',
                                                                        func: () => ActionPerson.mutate({
                                                                            person: {
                                                                                id: el.id_person,
                                                                                role: el.id_role,
                                                                                name: `${el.personName} ${el.lastname}`
                                                                            },
                                                                            option: {
                                                                                deletePerson: true
                                                                            }
                                                                        })
                                                                    });
                                                                }}
                                                            > <Icon path={IconDelete} className='iconaction' />  </i>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                            :
                                            <tr key={`nohaydatos`} style={{ fontSize: '1.2rem' }} >
                                                <td colSpan={6}>NO HAY DATOS</td>
                                            </tr>
                                    }
                                </tbody>
                            </table>
                    }
                </section>
            </main>
        </section>
    )
}

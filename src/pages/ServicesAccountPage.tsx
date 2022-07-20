import React, { useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Select, { GroupBase, SingleValue, StylesConfig } from 'react-select';
import { getServices, validarJWT } from '../api/Api';
import { formatDate, getDate, modDate } from '../functions/Functions';
import { Account, Services } from '../rules/interfaces';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { ModalDetailsService } from '../components/ModalDetailsService';
import { ShowMessage } from '../components/Swal';
import moment from 'moment';
import { DatePicker } from '../components/DatePicker';
import { Icon } from '@mdi/react';
import { mdiCalendar as IconCalendar } from '@mdi/js';
import { mdiArrowLeft as IconArrowLeft } from '@mdi/js';
import { mdiArrowRight as IconArrowRight } from '@mdi/js';
import { color } from '../helpers/herpers';

export const ServicesAccountPage = () => {
    const { logOut, person } = useContext(AuthContext);
    const [start, setstart] = useState<formatDate>(getDate());
    const [end, setend] = useState<formatDate>(getDate());
    const [isOpen, setIsOpen] = useState<{ isStart: boolean, isEnd: boolean, isIndividual: boolean }>({ isStart: false, isEnd: false, isIndividual: false });
    const [filtrado, setfiltrado] = useState<Array<Services>>();
    const [interv, setinterv] = useState<boolean>(false);
    const [oneDay, setoneDay] = useState<boolean>(false);
    const [Service, setService] = useState<Services | undefined>(undefined);
    const queryClient = useQueryClient();
    const initialStateValueAccount: SingleValue<{ value: string; label: string; }> = { value: '', label: 'Seleccione una cuenta' };
    const [accountSelected, setaccountSelected] = useState<SingleValue<{ value: string; label: string; }>>(initialStateValueAccount);
    const [filtro, setfiltro] = useState<'Abonado' | 'Cliente' | 'Nombre'>('Abonado');
    const [Accounts, setAccounts] = useState<{ accounts: Array<Account> }>();

    const { isSuccess, isLoading, refetch, isFetching, isFetched } = useQuery(['Services'], () => getServices({ start: start.date.date, end: end.date.date, account: accountSelected?.value }), {
        enabled: false,
        refetchOnWindowFocus: false,
        onSuccess: data => {
            setfiltrado(() => data.services);
            setinterv(false);
            setoneDay(false);
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

    useEffect(() => {
        (accountSelected?.value !== '') ? refetch() : setfiltrado([]);
    }, [accountSelected])

    useEffect(() => {
        (interv === true || oneDay === true) && refetch();
    }, [interv, oneDay]);

    useEffect(() => {
        const acc: { accounts: Array<Account> } | undefined = queryClient.getQueryData(["Accounts"]);
        (acc) ? setAccounts(() => acc) : queryClient.invalidateQueries(['Accounts']);
    }, []);

    const customStyles: StylesConfig<{ value: string; label: string; }, false, GroupBase<{ value: string; label: string; }>> | undefined = {
        input: (props) => ({
            ...props,
            padding: 0, margin: 0,
        }),
        menu: (props) => ({
            ...props,
            backgroundColor: color.background,
            border: `1px solid ${color.PrimaryDark}`
        }),
        valueContainer: (props) => ({
            ...props,
            padding: 0, margin: 0
        }),
    }

    return (
        <div className='servicesTechAcc-container'>
            <ModalDetailsService Service={Service} setService={setService} />
            <header className='header header150'>
                <div className='search'>
                    <p className='title'>Servicios culminados</p>
                    <div className='inputsContainer'>
                        <div className='filter'>
                            <div className='btnsFilter'>
                                <div className={(filtro === 'Cliente') ? 'btnFilterActivo' : 'btnFilter'} onClick={() => setfiltro(() => 'Cliente')} >Cliente</div>
                                <div className={(filtro === 'Abonado') ? 'btnFilterActivo' : 'btnFilter'} onClick={() => setfiltro(() => 'Abonado')} >Abonado</div>
                                <div className={(filtro === 'Nombre') ? 'btnFilterActivo' : 'btnFilter'} onClick={() => setfiltro(() => 'Nombre')} >Nombre</div>
                            </div>
                        </div>
                        <div className='containerSelect'>
                            {
                                (Accounts?.accounts) &&
                                <Select
                                    hideSelectedOptions={true}
                                    className='select'
                                    placeholder='Selecciona'
                                    value={(accountSelected?.value !== '') ? accountSelected : initialStateValueAccount}
                                    styles={{ dropdownIndicator: () => ({ display: 'none' }), indicatorSeparator: () => ({ display: 'none' }), ...customStyles }}
                                    isSearchable={true}
                                    isClearable={true}
                                    options={Accounts.accounts.map(Acc => { return { value: Acc.CodigoCte, label: (filtro === 'Abonado') ? Acc.CodigoAbonado : (filtro === 'Cliente') ? Acc.CodigoCte : Acc.Nombre } })}
                                    onChange={(value) => (value === null) ? setaccountSelected(initialStateValueAccount) : setaccountSelected(value)}
                                />
                            }
                        </div>
                    </div>
                </div>
                {
                    (accountSelected?.value !== '' && isFetched) &&
                    <div className='containerCalendar'>
                        <div className='range'>
                            <div className='containerDatePicker'>
                                <DatePicker
                                    key={`start`}
                                    label={'Inicio'}
                                    date={start}
                                    isOpen={isOpen.isStart}
                                    setDate={setstart}
                                    maxDate={end.DATE}
                                    onOpen={() => setIsOpen({ ...isOpen, isStart: true })}
                                    onClose={() => setIsOpen({ ...isOpen, isStart: false })}
                                />

                                <DatePicker
                                    key={`end`}
                                    label={'Final'}
                                    date={end}
                                    isOpen={isOpen.isEnd}
                                    setDate={setend}
                                    onOpen={() => setIsOpen({ ...isOpen, isEnd: true })}
                                    onClose={() => setIsOpen({ ...isOpen, isEnd: false })}
                                    minDate={start.DATE}
                                />

                            </div>
                            <button className='btn' onClick={() => { setinterv(true); setstart(start); setend(end); }} >Consultar</button>
                        </div>
                        <div className='actual'>
                            <DatePicker
                                key={`individual`}
                                label={'individual'}
                                date={getDate()}
                                isOpen={isOpen.isIndividual}
                                onOpen={() => setIsOpen({ ...isOpen, isIndividual: true })}
                                onClose={() => setIsOpen({ ...isOpen, isIndividual: false })}
                                individual={{ setend, setstart, setoneDay }}
                                isHided
                            />
                            <p>selecione un dia</p>
                            <div className='containerIcon'>
                                <i onClick={() => setIsOpen({ ...isOpen, isIndividual: true })} ><Icon path={IconCalendar} className='icon' /></i>
                            </div>
                        </div>
                        <div className='btns'>
                            <div className='containerIcon'>
                                <i
                                    onClick={() => {
                                        setstart(modDate({ dateI: start.DATE, days: -1 }));
                                        setend(modDate({ dateI: start.DATE }));
                                        setoneDay(true);
                                    }}
                                >
                                    <Icon path={IconArrowLeft} className='icon' />
                                </i>
                            </div>
                            <div className='containerIcon'>
                                {
                                    (moment(modDate({ dateI: end.DATE, days: 1 }).DATE) <= moment(getDate().DATE)) ?
                                        <i
                                            onClick={() => {
                                                const newDate = modDate({ dateI: end.DATE, days: 1 });
                                                setstart(modDate({ dateI: newDate.DATE, days: -1 }));
                                                setend(newDate);
                                                setoneDay(true);
                                            }}
                                        >
                                            <Icon path={IconArrowRight} className='icon' />
                                        </i>
                                        :
                                        <Icon path={IconArrowRight} className='icon2' />
                                }
                            </div>
                        </div>
                    </div>

                }
            </header >
            <main className='main calc150'>
                <div className='container-table'>
                    {
                        (isLoading || isFetching)
                            ?
                            <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <div className='spin'></div>
                            </div>
                            :
                            (isSuccess && Accounts?.accounts) ?
                                <table className='bord'>
                                    <thead>
                                        <tr>
                                            <th colSpan={7} className='dates'>
                                                <b>Cuenta:</b> {Accounts.accounts.find(f => f.CodigoCte === accountSelected?.value)?.Nombre}
                                            </th>
                                        </tr>
                                        <tr>
                                            <th colSpan={7} className='dates'>
                                                <b>Inicio:</b> {start.date.date} ____ <b>Final:</b> {end.date.date}
                                            </th>
                                        </tr>
                                        <tr className='row' key={`Indices`}>
                                            <th >Nombre</th>
                                            <th >Digital</th>
                                            <th >CodigoCte</th>
                                            <th >Fecha y Hora entrada</th>
                                            <th >Fecha y Hora salida</th>
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
                                                            className={(el.isActive) ? 'serviceActive' : 'rows'}
                                                            key={`${el.id_service}`}
                                                            onClick={async () => {
                                                                if (el.isActive) {
                                                                    ShowMessage({ icon: 'warning', text: 'Verifique la información en Servicios activos', title: 'Servicio Activo' });
                                                                } else {
                                                                    const modal = document.querySelector('.Modal');
                                                                    if (modal) modal.setAttribute('style', 'display: block');
                                                                    setService(() => el);
                                                                }
                                                            }}>
                                                            <td>{el.nameAccount}</td>
                                                            <td>{el.digital}</td>
                                                            <td>{el.accountMW}</td>
                                                            <td>{entry.date.date} {entry.time.time}</td>
                                                            <td>{exit.date.date} {exit.time.time}</td>
                                                            <td>{el.folio}</td>
                                                        </tr>
                                                    )
                                                })
                                                :
                                                <tr key={`nohaydatos`} style={{ fontSize: '1.2rem' }} >
                                                    <td colSpan={6}>NO HAY DATOS</td>
                                                </tr>
                                        }
                                    </tbody>
                                </table>
                                : <div>Selecciona una cuenta</div>
                    }
                </div>
            </main>
        </div >
    )
}

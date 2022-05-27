import React, { useContext, useEffect, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query';
import { getServices } from '../api/Api';
import { customStyles, formatDate, getDate, modDate } from '../functions/Functions';
import { Person, Services } from '../rules/interfaces';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { ModalDetailsService } from '../components/ModalDetailsService';
import { ShowMessage } from '../components/Swal';
import Select, { GroupBase, SingleValue, StylesConfig } from 'react-select';
import { DatePicker } from '../components/DatePicker';
import moment from 'moment';
import { Icon } from '@mdi/react';
import { mdiCalendar as IconCalendar } from '@mdi/js';
import { mdiArrowLeft as IconArrowLeft } from '@mdi/js';
import { mdiArrowRight as IconArrowRight } from '@mdi/js';
import { color } from '../helpers/herpers';


export const ServicesTechicalPage = () => {
    const { logOut, person } = useContext(AuthContext);
    const [start, setstart] = useState<formatDate>(getDate());
    const [end, setend] = useState<formatDate>(getDate());
    const [isOpen, setIsOpen] = useState<{ isStart: boolean, isEnd: boolean, isIndividual: boolean }>({ isStart: false, isEnd: false, isIndividual: false });
    const [filtrado, setfiltrado] = useState<Array<Services>>();
    const [interv, setinterv] = useState<boolean>(false);
    const [oneDay, setoneDay] = useState<boolean>(false);
    const [Service, setService] = useState<Services | undefined>(undefined);
    const queryClient = useQueryClient();
    const initialStateValueTechnical: SingleValue<{ value: string; label: string; }> = { value: '', label: 'Seleccine un técnico' };
    const [technicalSelected, settechnicalSelected] = useState<SingleValue<{ value: string; label: string; }>>(initialStateValueTechnical);
    const [Technicals, setTechnicals] = useState<{ Persons: Array<Person> }>();

    const { isSuccess, isLoading, refetch, isFetching, isFetched } = useQuery('Services', () => getServices({ start: start.date.date, end: end.date.date, technical: technicalSelected?.value }), {
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
        (technicalSelected?.value !== '') ? refetch() : setfiltrado([]);
    }, [technicalSelected]);

    useEffect(() => {
        (interv === true || oneDay === true) && refetch();
    }, [interv, oneDay]);

    useEffect(() => {
        const technicals: { Persons: Array<Person> } | undefined = queryClient.getQueryData(["Technicals"]);
        if (technicals) {
            setTechnicals(() => technicals);
        } else {
            queryClient.invalidateQueries('Technicals');
        }
    }, []);

    return (
        <div className='servicesTechAcc-container'>
            <ModalDetailsService
                Service={Service}
                setService={setService}
            />
            <header className='header'>
                <div className='search'>
                    <p className='title'>Servicios por técnico</p>
                    <div className='inputsContainer'>
                        {
                            (Technicals?.Persons) &&
                            <Select
                                hideSelectedOptions={true}
                                className='select'
                                placeholder='Selecciona'
                                value={(technicalSelected?.value !== '') ? technicalSelected : initialStateValueTechnical}
                                styles={{
                                    dropdownIndicator: () => ({ display: 'none' }), indicatorSeparator: () => ({ display: 'none' }),
                                    ...customStyles
                                }}
                                isSearchable={true}
                                isClearable={true}
                                options={(person?.id_role === 3) ? Technicals.Persons.filter(p => p.id_enterprice === person?.id_enterprice).map(Tech => { return { value: Tech.id_person, label: `${Tech.personName} ${Tech.lastname}` } }) : Technicals.Persons.map(Tech => { return { value: Tech.id_person, label: `${Tech.personName} ${Tech.lastname}` } })}
                                onChange={(value) => (value === null) ? settechnicalSelected(initialStateValueTechnical) : settechnicalSelected(value)}
                            />
                        }
                    </div>
                </div>
                <div className='containerCalendar'>
                    {
                        (isFetched) &&
                        <>
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
                                    <i onClick={() => setIsOpen({ ...isOpen, isIndividual: true })}><Icon path={IconCalendar} className='icon' /></i>
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
                        </>
                    }
                </div>
            </header>
            <main className='main'>
                <div className='container-table'>
                    {
                        (isLoading || isFetching)
                            ?
                            <div className='flex-center'>
                                <div className='spin'></div>
                            </div>
                            :
                            (isSuccess && Technicals?.Persons) ?
                                <table className='bord'>
                                    <thead>
                                        <tr>
                                            <th colSpan={7} className='dates'>
                                                <b>Técnico:</b> {technicalSelected?.label}
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
                                                ?
                                                filtrado.map(el => {
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
                                : <div>Selecciona un técnico</div>
                    }
                </div>
            </main>
        </div >
    )
}

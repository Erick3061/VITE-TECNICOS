import React, { useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import { getServices } from '../api/Api';
import { formatDate, getDate, modDate } from '../functions/Functions';
import { Services } from '../rules/interfaces';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { ModalDetailsService } from '../components/ModalDetailsService';
import { ShowMessage } from '../components/Swal';
import { DatePicker } from '../components/DatePicker';
import moment from 'moment';
import { Icon } from '@mdi/react';
import { mdiMagnify as IconSearchService } from '@mdi/js';
import { mdiCalendar as IconCalendar } from '@mdi/js';
import { mdiArrowLeft as IconArrowLeft } from '@mdi/js';
import { mdiArrowRight as IconArrowRight } from '@mdi/js';

export const ServicesPage = () => {
    const { logOut } = useContext(AuthContext);
    const [start, setstart] = useState<formatDate>(getDate());
    const [end, setend] = useState<formatDate>(getDate());
    const [isOpen, setIsOpen] = useState<{ isStart: boolean, isEnd: boolean, isIndividual: boolean }>({ isStart: false, isEnd: false, isIndividual: false });
    const [name, setname] = useState('');
    const [filtrado, setfiltrado] = useState<Array<Services>>();
    const [services, setservices] = useState<Array<Services>>();
    const [active, setactive] = useState<"Nombre" | "Digital" | "CodigoCte">('Nombre');
    const [interv, setinterv] = useState<boolean>(false);
    const [oneDay, setoneDay] = useState<boolean>(false);
    const [Service, setService] = useState<Services | undefined>(undefined);

    const { isSuccess, isLoading, refetch, isFetching, isFetched } = useQuery(['Services'], () => getServices({ start: start.date.date, end: end.date.date }), {
        refetchOnWindowFocus: false,
        onSuccess: data => {
            setservices(() => data.services);
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

    const search = (txt: string) => {
        setname(txt);
        (active === 'Nombre') ?
            setfiltrado(services?.filter(el => ((el.nameAccount !== null) && el.nameAccount.toLowerCase().includes(txt))))
            : (active === 'Digital') ?
                setfiltrado(services?.filter(el => ((el.digital !== null) && el.digital.includes(txt))))
                : setfiltrado(services?.filter(el => (el.accountMW.includes(txt))));
        if (txt === '') setfiltrado(services);
    }

    useEffect(() => {
        if (interv === true || oneDay === true) {
            refetch();
        }
    }, [interv, oneDay]);

    return (
        <div className='services-container'>
            <ModalDetailsService
                Service={Service}
                setService={setService}
            />
            <header className='header'>
                <div className='search'>
                    <p className='title'>Servicios culminados</p>
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
                        <div className='containerIcon' onClick={() => setIsOpen({ ...isOpen, isIndividual: true })}>
                            <Icon path={IconCalendar} />
                        </div>
                    </div>
                    {
                        (isFetched) &&
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
                    }
                </div>
            </header>
            <main className='main'>
                <div className='container-table'>
                    {
                        (isLoading || isFetching)
                            ?
                            <div style={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                <div className='spin'></div>
                            </div>
                            :
                            (isSuccess) ?
                                <table className='bord'>
                                    <thead>
                                        <tr style={{ height: '50px' }}>
                                            <th style={{ textAlign: 'center' }} colSpan={7} className='dates'>
                                                <b>Inicio:</b> {start.date.date} ____ <b>Final:</b> {end.date.date}
                                            </th>
                                        </tr>
                                        <tr className='row' key={`Indices`}>
                                            <th>#</th>
                                            <th className={(active === 'Nombre') ? 'active' : ''} onClick={() => { setname(''); setfiltrado(services); setactive(() => 'Nombre') }} >Nombre</th>
                                            <th className={(active === 'Digital') ? 'active' : ''} onClick={() => { setname(''); setfiltrado(services); setactive(() => 'Digital') }} >Digital</th>
                                            <th className={(active === 'CodigoCte') ? 'active' : ''} onClick={() => { setname(''); setfiltrado(services); setactive(() => 'CodigoCte') }} >CodigoCte</th>
                                            <th >Fecha y Hora entrada</th>
                                            <th >Fecha y Hora salida</th>
                                            <th >Folio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            (filtrado && filtrado.length > 0)
                                                ? filtrado.map((el, idx) => {
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
                                                            <td>{idx + 1}</td>
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
                                : <div>Error</div>
                    }
                </div>
            </main>
            {/* 
            
            */}
        </div >
    )
}

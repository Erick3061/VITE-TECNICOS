import React, { useState } from 'react'
import { UseMutationResult } from 'react-query';
import { PropsUpdateService, Service, ServiceSelected, Technical } from '../../rules/interfaces';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Timepicker } from '../DatePicker';
import { formatDate, time } from '../../functions/Functions';
import { ShowError } from '../Swal';
interface props {
    updateServiceMutate: UseMutationResult<{
        service: Service;
        technicals: Technical[];
    }, unknown, PropsUpdateService, unknown>;
    service: ServiceSelected | undefined;
}
export const Time = ({ updateServiceMutate, service }: props) => {
    const { person } = useContext(AuthContext);
    const [date, setDate] = useState<formatDate | null>(null);
    return (
        <div className='technicals'>
            <h3 className='title text-center'>Defina el tiempo que desea agregar</h3>
            <div className='moreTime'>
                <button
                    className='btn2'
                    onClick={() => {
                        updateServiceMutate.mutate({
                            id_service: service!.service.id_service,
                            person: { id: person!.id_person, role: person!.id_role, name: `${person?.personName} ${person?.lastname}` },
                            prop: 'moreTime',
                            value: { comment: '', moreTime: { hours: 2, minutes: 0, seconds: 0 } }
                        });
                    }}
                >2 hrs</button>
                <div className='containerTime'>
                    <div className='time'>
                        <Timepicker label='Horas : Minutos' date={date} setDate={setDate} />
                        <button
                            className='btn2'
                            onClick={async () => {
                                if (date !== null) {
                                    if (date.time.minute === 0 && date.time.second === 0) return await ShowError(`Debes agregar al menos un minuto`);
                                    updateServiceMutate.mutate({
                                        id_service: service!.service.id_service,
                                        person: { id: person!.id_person, role: person!.id_role, name: `${person?.personName} ${person?.lastname}` },
                                        prop: 'moreTime',
                                        value: { comment: '', moreTime: { hours: date.time.minute, minutes: date.time.second, seconds: 0 } }
                                    });
                                } else {
                                    return await ShowError(`Formato de tiempo invalido`);
                                }
                            }}
                        >enviar</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

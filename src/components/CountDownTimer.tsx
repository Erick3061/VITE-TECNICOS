import React, { useEffect, useState } from 'react';
import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from "react-query";
import { getExpired } from '../functions/Functions';
import { Service, Technical, ServiceSelected } from '../rules/interfaces';

interface expire {
    refetch: <TPageData>(options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined) => Promise<QueryObserverResult<{
        service: Service;
        technicals: Technical[];
    }, unknown>>
    service: ServiceSelected;
}
const CountDownTimer = ({ refetch, service }: expire) => {
    const [[hrs, mins, secs], setTime] = useState([99, 99, 99]);
    const countDown = () => {
        if (hrs === 0 && mins === 0 && secs === 0)
            refetch();
        else if (mins === 0 && secs === 0) {
            setTime([hrs - 1, 59, 59]);
        } else if (secs === 0) {
            setTime([hrs, mins - 1, 59]);
        } else {
            setTime([hrs, mins, secs - 1]);
        }
    };

    useEffect(() => {
        const timerId = setInterval(() => countDown(), 1000);
        return () => clearInterval(timerId);
    });

    useEffect(() => {
        const expired = getExpired(service.service.exitDate);
        setTime([expired.hours, expired.minutes, expired.seconds]);
    }, [service]);

    return (<p>Tiempo restante: {`${hrs.toString().padStart(2, '0')} : ${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`}</p>);
}

export default CountDownTimer;
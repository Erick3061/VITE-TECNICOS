import React from 'react'
import { useQuery } from '@tanstack/react-query';
import { task } from '../api/Api';
export const TasksPage = () => {
    const { isSuccess, data } = useQuery(['task'], () => task(), { retry: 1 });
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <div>TasksPage</div>
            {
                (isSuccess) &&
                data?.task.map(t => {
                    return (
                        <div key={`${t.nameTask}`} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                            <p style={{ color: 'darkblue' }}>{t.nameTask}</p>
                            <p style={{ color: 'darkblue' }}>{JSON.stringify(t.running)}</p>
                            <p style={{ color: 'darkblue' }}>{JSON.stringify(t.cron)}</p>
                        </div>
                    )
                })
            }
        </div>
    )
}

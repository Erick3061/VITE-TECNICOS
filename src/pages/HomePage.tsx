import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
export const HomePage = () => {
    const { person } = useContext(AuthContext);
    return (
        <div className='container-home'>
            {
                person?.id_role === 3
                    ? <img src={`https://pem-sa.ddns.me/assets/logos/${person?.enterpriceShortName}.png`} alt={`${person?.enterpriceShortName}`} />
                    : <img src="https://pem-sa.ddns.me/assets/logos/PEMSA.png" alt="PEMSA" />
            }
        </div>
    )
}

import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NavDropDown } from './NavDropDown';
import { NavLink } from 'react-router-dom';
import { Icon } from '@mdi/react';
import { mdiHome as IconHome } from '@mdi/js';
import { mdiArchivePlus as IconNewService } from '@mdi/js';
import { mdiArchiveClock as IconActiveService } from '@mdi/js';
import { mdiAccountSupervisor as IconPersons } from '@mdi/js';
import { mdiAccountPlus as IconPersonAdd } from '@mdi/js';
import { mdiServer as IconEnterprice } from '@mdi/js';
import { mdiAccount as Logo } from '@mdi/js';
import { baseUrl } from '../api/Api';


export const NavBar = () => {
    const [IsOpen, setIsOpen] = useState<boolean>(false);
    const { person, logOut, file } = useContext(AuthContext);

    return (
        <section className='nav-container' id="nav">
            <div className='header'>
                <p className='nav-title1'>{person?.enterpriceShortName}</p>
                <div className='nav-container-img'>
                    {
                        (person?.id_role === 4 || file === undefined)
                            ?
                            <Icon path={Logo} className='img-mon' style={{}} />
                            :
                            <img
                                src={`${baseUrl}/files/getImg?type=Person&id=${person?.id_person}&img=${file}`}
                                className='img-mon'
                                alt="imagen" />
                    }
                </div>
                <hr className='sep' />
                <p className='nav-title2'><b>Nombre:</b> {person?.personName} {person?.lastname}</p>
                {
                    (person?.email)
                        ? <p className='nav-title2'><b>Correo:</b> {(person?.email) ? person.email : ''}</p>
                        : <p className='nav-title2'><b>Usuario: </b> {person?.nameUser}</p>
                }
                <hr className='sep' />
            </div>

            <div className='body invisible-scrollbar'>
                <ul>
                    <NavLink to="/home" className={({ isActive }) => `sinLinea ${isActive ? 'item-selected' : 'item'}`} onClick={() => setIsOpen(true)}>
                        <Icon path={IconHome} className='icon marL1 marR1' /> <p>HOME</p>
                    </NavLink>

                    {
                        (person?.id_role !== 3 && person?.id_role !== 2) &&
                        <NavLink to="/enterprice" className={({ isActive }) => `sinLinea ${isActive ? 'item-selected' : 'item'}`} onClick={() => setIsOpen(true)} >
                            <Icon path={IconEnterprice} className='icon marL1 marR1' /> <p>EMPRESAS</p>
                        </NavLink>
                    }
                    {
                        (person?.id_role !== 3) &&
                        <NavLink to="/new-service" className={({ isActive }) => `sinLinea ${isActive ? 'item-selected' : 'item'}`} onClick={() => setIsOpen(true)} >
                            <Icon path={IconNewService} className='icon marL1 marR1' /> <p> NUEVO SERVICIO</p>
                        </NavLink>
                    }

                    <NavLink to="/give-folio" className={({ isActive }) => `sinLinea ${isActive ? 'item-selected' : 'item'}`} onClick={() => setIsOpen(true)} >
                        <Icon path={IconActiveService} className='icon marL1 marR1' /> <p> SERVICIOS ACTIVOS</p>
                    </NavLink>
                    {
                        (person?.id_role !== 2) &&
                        <NavLink to="/add-person" className={({ isActive }) => `sinLinea ${isActive ? 'item-selected' : 'item'}`} onClick={() => setIsOpen(true)} >
                            <Icon path={IconPersonAdd} className='icon marL1 marR1' /> <p>{(person?.id_role === 3) ? 'AGREGAR TÉCNICOS' : 'AGREGAR PERSONAL'}</p>
                        </NavLink>
                    }

                    {
                        (person?.id_role === 4 || person?.id_role === 3) &&
                        < NavLink to="/person" className={({ isActive }) => `sinLinea ${isActive ? 'item-selected' : 'item'}`} onClick={() => setIsOpen(true)}>
                            <Icon path={IconPersons} className='icon marL1 marR1' /> <p>{(person.id_role === 3) ? 'TÉCNICOS' : 'PERSONAL'}</p>
                        </NavLink>
                    }
                    <NavDropDown isOpen={IsOpen} setIsOpen={setIsOpen} />
                </ul>
            </div>

            <div className='footer'>
                <div onClick={logOut} className='nav-buttom'>
                    CERRAR SESIÓN
                </div>
            </div>
        </section>
    )
}

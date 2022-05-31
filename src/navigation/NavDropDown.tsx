import React, { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Icon } from '@mdi/react';
import { mdiArchiveCheck as IconServices } from '@mdi/js';
import { mdiCheckAll as IconAllServices } from '@mdi/js';
import { mdiCardAccountDetails as IconAccountServices } from '@mdi/js';
import { mdiAccount as IconTechnicalServices } from '@mdi/js';

interface props {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const NavDropDown = ({ setIsOpen, isOpen }: props) => {
    const { person } = useContext(AuthContext);
    useEffect(() => {
        const drop = document.querySelector('#Drop');
        if (drop) {
            if (isOpen) {
                drop.setAttribute('style', 'display:none');
            } else {
                drop.setAttribute('style', 'display:block');
            }
        }
    }, [isOpen])

    return (
        <div className='dropdown' onClick={() => {
            setIsOpen(!isOpen);
        }}>
            <div className='dropDown'>
                <Icon path={IconServices} className='icon marL1 marR1' /> <p>SERVICIOS CULMINADOS</p>
            </div>

            <div id='Drop' className='content'>
                <NavLink className={({ isActive }) => `sinLinea ${isActive ? 'optionActive' : 'option'}`} to="/services/all">
                    <Icon path={IconAllServices} className='icon marL1 marR1' /> TODOS
                </NavLink>
                {
                    person?.id_role !== 3 &&
                    <NavLink className={({ isActive }) => `sinLinea ${isActive ? 'optionActive' : 'option'}`} to="/services/account">
                        <Icon path={IconAccountServices} className='icon marL1 marR1' />  POR CUENTA
                    </NavLink>
                }
                <NavLink className={({ isActive }) => `sinLinea ${isActive ? 'optionActive' : 'option'}`} to="/services/techical">
                    <Icon path={IconTechnicalServices} className='icon marL1 marR1' /> POR TÉCNICO
                </NavLink>
            </div>
        </div>
    )
}

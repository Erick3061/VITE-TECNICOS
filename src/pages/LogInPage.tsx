import React, { useContext, useState } from 'react';
import { SubmitHandler, useForm } from "react-hook-form";
import { logIn, validarJWT } from '../api/Api';
import { AuthContext } from '../context/AuthContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ShowError } from '../components/Swal';
import { errorFormat, getDate } from '../functions/Functions';
import { mdiAccount as IconAccount } from '@mdi/js';
import { mdiEyeOff as IconEyeOff } from '@mdi/js';
import { mdiLock as IconLock } from '@mdi/js';
import { mdiEye as IconEye } from '@mdi/js';
import { mdiTools as Logo } from '@mdi/js';
import { Icon } from '@mdi/react';

export const LogInPage = () => {
    const date = getDate();
    const { setPerson, logOut } = useContext(AuthContext);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<{ acceso: string, password: string }>({ criteriaMode: 'all' });

    // setValue('password', `pem${date.date.month}${date.date.day}${date.time.hour + 85}${date.weekday}`);

    const JWT = useQuery(["JWT"], () => validarJWT(),
        {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            enabled: true,
            retry: 1,
            onSuccess: async ({ Person, token, directory }) => {
                if (Person.id_role === 1) {
                    localStorage.clear();
                    await ShowError('No tienes acceso a este sistema');
                } else {
                    setPerson(Person, token, directory ? directory[0] : undefined);
                }
            },
            onError: async error => {
                if (`${error}`.includes('JsonWebTokenError') || `${error}`.includes('TokenExpiredError')) {
                    await ShowError('La sesión expiró');
                }
                if (!`${error}`.includes('No hay token en la petición'))
                    await ShowError(errorFormat(`${error}`));
                localStorage.clear();
                logOut();
            }
        }
    );

    const LogIn = useMutation(["LogIn"], logIn,
        {
            retry: 1,
            onSuccess: async ({ Person, token, directory }) => {
                if (Person.id_role === 1) {
                    localStorage.clear();
                    await ShowError('No tienes acceso a este sistema');
                } else {
                    reset();
                    setPerson(Person, token, directory ? directory[0] : undefined);
                }
            },
            onError: async error => await ShowError(`${error}`)
        }
    );

    const onSubmit: SubmitHandler<{ acceso: string, password: string }> = (data) => LogIn.mutate(data);

    return (
        <div className='logIn-container'>
            <section className='container-form'>
                {
                    (LogIn.isLoading || JWT.isFetching) ?
                        <div className='flex-center'><div className='spin'></div></div>
                        :
                        <>
                            <Icon path={Logo} className='logo' />
                            <div className='caja-form'>
                                <form className='form_login' action="" onSubmit={handleSubmit(onSubmit)}>
                                    <p className='tltle'>SERVICIO TÉCNICOS</p>
                                    <p className='subtitle'>INICIAR SESIÓN</p>
                                    <div className='container-inputs'>
                                        <label className='container-icon'>
                                            <Icon path={IconAccount} className='icon' />
                                        </label>
                                        <input
                                            className='inputs'
                                            type="text"
                                            placeholder='exmple@pem-sa.com o user'
                                            {...register("acceso", {
                                                required: { value: true, message: 'campo requerido' },
                                            })}
                                        />
                                    </div>
                                    <p> {errors.acceso && errors.acceso.message} </p>
                                    <div className='container-inputs'>
                                        <label className='container-icon'>
                                            <Icon path={IconLock} className='icon' />
                                        </label>
                                        <label className='container-icon-right' onClick={() => setShowPassword(!showPassword)}>
                                            {
                                                (showPassword)
                                                    ?
                                                    <Icon path={IconEye} className='icon' />
                                                    :
                                                    <Icon path={IconEyeOff} className='icon' />
                                            }
                                        </label>
                                        <input
                                            className='inputs'
                                            type={(showPassword) ? 'text' : "password"}
                                            placeholder='********'
                                            {...register("password", {
                                                required: { value: true, message: 'campo requerido' },
                                            })}
                                        />
                                    </div>
                                    <p> {errors.password && errors.password.message} </p>
                                    <input className='btn' type="submit" value="Iniciar Sesión" />
                                </form>
                            </div>
                        </>
                }
            </section >
        </div >
    )
}

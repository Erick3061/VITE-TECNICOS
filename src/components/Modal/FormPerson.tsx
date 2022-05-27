import React, { useContext, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { AuthContext } from '../../context/AuthContext';
import Select, { GroupBase, SingleValue, StylesConfig } from 'react-select';
import { Enterprices, Person, Roles, ServicesTypes } from '../../rules/interfaces';
import { useQueryClient } from 'react-query';
import { color } from '../../helpers/herpers';
import { Switch } from '../Switch';
import { customStyles } from '../../functions/Functions';

export interface AddPerson {
    name: string,
    lastname: string,
    email: string,
    password: string,
    phoneNumber: string,
    employeeNumber: string,
    user: string,
}

interface propsAddPerson {
    onSubmit: SubmitHandler<AddPerson>;
    isLoading: boolean;
    enterpriceSelected: SingleValue<{ value: number; label: string; }>;
    setenterpriceSelected: React.Dispatch<React.SetStateAction<SingleValue<{ value: number; label: string; }>>>;
    roleSelected: SingleValue<{ value: number; label: string; }>;
    setroleSelected: React.Dispatch<React.SetStateAction<SingleValue<{ value: number; label: string; }>>>;
    operatorSelected: SingleValue<{ value: string; label: string; }>;
    setoperatorSelected: React.Dispatch<React.SetStateAction<SingleValue<{ value: string; label: string; }>>>;
    isPasswordDefined: boolean;
    setisPasswordDefined: React.Dispatch<React.SetStateAction<boolean>>;
}

// const s: StylesConfig<any, false, GroupBase<any>> | undefined = {
//     dropdownIndicator: () => ({ display: 'none' }),
//     indicatorSeparator: () => ({ display: 'none' }),
//     container: (provided) => ({
//         ...provided,
//         width: '100%',
//         marginTop: '5px',
//     }),
// }

export const FormAddPerson = ({ onSubmit, isLoading, enterpriceSelected, setenterpriceSelected, roleSelected, setroleSelected, operatorSelected, setoperatorSelected, isPasswordDefined, setisPasswordDefined }: propsAddPerson) => {
    const initialStateValueEnterprice: SingleValue<{ value: number; label: string; }> = { value: 0, label: 'Seleccione una empresa' };
    const initialStateValueRole: SingleValue<{ value: number; label: string; }> = { value: 0, label: 'Seleccione un rol' };
    const initialStateValueOperator: SingleValue<{ value: string; label: string; }> = { value: '', label: 'Seleccione el monitorista' };
    const queryClient = useQueryClient();
    const { register, formState: { errors }, handleSubmit, setValue, reset } = useForm<AddPerson>({ criteriaMode: 'all' });
    const { person } = useContext(AuthContext);
    const [GetGeneral, setGetGeneral] = useState<{ Enterprices: Enterprices[]; Roles: Roles[]; ServicesTypes: ServicesTypes[]; }>();
    const [GetUsersMon, setGetUsersMon] = useState<Array<{ user: string; password: string; name: string; }>>();

    useEffect(() => {
        const data: { Enterprices: Enterprices[]; Roles: Roles[]; ServicesTypes: ServicesTypes[]; } | undefined = queryClient.getQueryData(["GetGeneral"]);
        if (data) setGetGeneral(() => data);
        else queryClient.invalidateQueries('GetGeneral');

        const dataOperators: { users: Array<{ user: string; password: string; name: string; }> } | undefined = queryClient.getQueryData(["GetUsersMon"]);
        if (dataOperators) setGetUsersMon(() => dataOperators.users);
        else queryClient.invalidateQueries('GetUsersMon');

        if (person?.id_role === 3) {
            setenterpriceSelected({ value: person.id_enterprice, label: person.enterpriceShortName });
            setroleSelected({ value: 1, label: 'Tecnico' });
        }
    }, []);

    useEffect(() => {
        if (roleSelected?.value === 2) {
            setisPasswordDefined(true);
        } else {
            setisPasswordDefined(false);
            reset();
            setoperatorSelected(initialStateValueOperator);
        }
    }, [roleSelected]);

    useEffect(() => {
        if (operatorSelected?.value !== '') {
            const Operator = GetUsersMon?.find(op => op.name === operatorSelected?.label);
            const fullName: Array<string> = Operator!.name.split(' ');
            let name: string = 're';
            let lastName: string = 're';
            name = (fullName.length === 1) ? Operator!.name : (fullName.length === 2) ? fullName[0] : (fullName.length === 3) ? fullName[0] : (fullName.length === 4) ? `${fullName[0]} ${fullName[1]}` : fullName[0];
            lastName = (fullName.length === 1) ? 'SA' : (fullName.length === 2) ? fullName[1] : (fullName.length === 3) ? `${fullName[1]} ${fullName[2]}` : (fullName.length === 4) ? `${fullName[2]} ${fullName[3]}` : Operator!.name.replace(`${fullName[0]}`, '');
            setValue('name', name, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue('lastname', lastName, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            setValue('user', Operator!.user);
            setValue('password', Operator!.password);
        }
    }, [operatorSelected])
    return (
        <form className='FormAddEdit' onSubmit={handleSubmit(onSubmit)}>
            <h1>{(person?.id_role === 3) ? 'Registro de técnicos' : 'Registro de personal'}</h1>
            {
                (isLoading) ?
                    <div className='flex-center'>
                        <div className='spin'></div>
                    </div>
                    :
                    <>
                        <label>
                            Empresa:
                            <Select
                                isDisabled={person?.id_role === 3 ? true : false}
                                hideSelectedOptions
                                isClearable
                                className='select'
                                styles={{ dropdownIndicator: () => ({ display: 'none' }), indicatorSeparator: () => ({ display: 'none' }), ...customStyles }}
                                value={(enterpriceSelected?.value !== 0) ? enterpriceSelected : (person?.id_role === 3) ? { value: person.id_enterprice, label: person.enterpriceShortName } : initialStateValueEnterprice}
                                isSearchable
                                options={GetGeneral?.Enterprices.map(T => { return { value: T.id_enterprice, label: T.shortName } })}
                                onChange={(value) => (value === null) ? setenterpriceSelected(initialStateValueEnterprice) : setenterpriceSelected(value)}
                            />
                        </label>
                        <div className='containerInput'>
                            <label>
                                Rol:
                                <Select
                                    isDisabled={person?.id_role === 3 ? true : false}
                                    hideSelectedOptions
                                    isClearable
                                    className='select'
                                    styles={{ dropdownIndicator: () => ({ display: 'none' }), indicatorSeparator: () => ({ display: 'none' }), ...customStyles }}
                                    value={(roleSelected?.value !== 0) ? roleSelected : (person?.id_role === 3) ? { value: 1, label: 'Tecnico' } : initialStateValueRole}
                                    isSearchable
                                    options={GetGeneral?.Roles.map(T => { return { value: T.id_role, label: T.name } })}
                                    onChange={(value) => (value === null) ? setroleSelected(initialStateValueEnterprice) : setroleSelected(value)}
                                />
                            </label>
                        </div>
                        {
                            (roleSelected?.value === 2) &&
                            <label>
                                Seleccionar monitorista:
                                <Select
                                    hideSelectedOptions
                                    isClearable
                                    className='select'
                                    styles={{ dropdownIndicator: () => ({ display: 'none' }), indicatorSeparator: () => ({ display: 'none' }), ...customStyles }}
                                    value={(operatorSelected?.value !== '') ? operatorSelected : initialStateValueOperator}
                                    isSearchable
                                    options={GetUsersMon?.map(T => { return { value: T.user, label: T.name } })}
                                    onChange={(value) => (value === null) ? setoperatorSelected(initialStateValueOperator) : setoperatorSelected(value)}
                                />
                            </label>
                        }

                        <div className='containerInput'>
                            <label>
                                Nombre(s):
                                <input
                                    disabled={(roleSelected?.value === 2) ? true : false}
                                    style={{ borderColor: (errors.name) && color.Secondary }}
                                    type={'text'}
                                    {...register("name", {
                                        required: { value: true, message: 'campo requerido' },
                                        maxLength: { value: 30, message: 'El nombre no debe exeder los 30 caracteres' },
                                        pattern: { value: /[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+[A-Za-z \d*\0-9*]+$/g, message: 'Solo caracteres del alfabeto y números' },
                                    })}
                                />
                                <p> {errors.name && errors.name.message} </p>
                            </label>
                            <label>
                                Apellidos:
                                <input
                                    disabled={(roleSelected?.value === 2) ? true : false}
                                    style={{ borderColor: (errors.lastname) && color.Secondary }}
                                    type={'text'}
                                    {...register("lastname", {
                                        required: { value: true, message: 'campo requerido' },
                                        maxLength: { value: 50, message: 'El nombre no debe exeder los 50 caracteres' },
                                        pattern: { value: /[a-zA-ZñÑáéíóúÁÉÍÓÚ\s\A-Za-z \d*\0-9*]+$/g, message: 'Solo caracteres del alfabeto y números' }
                                    })}
                                />
                                <p> {errors.lastname && errors.lastname.message} </p>
                            </label>
                        </div>

                        <div className='containerInput'>
                            <label>
                                Correo:
                                <input
                                    disabled={(roleSelected?.value === 2) ? true : false}
                                    style={{ borderColor: (errors.email) && color.Secondary }}
                                    type={'email'}
                                    {...register("email", {
                                        maxLength: { value: 50, message: 'El nombre no debe exeder los 50 caracteres' },
                                    })}
                                />
                                <p> {errors.email && errors.email.message} </p>
                            </label>
                            <label>
                                Usuario:
                                <input
                                    disabled={(roleSelected?.value === 2) ? true : false}
                                    style={{ borderColor: (errors.user) && color.Secondary }}
                                    type={'text'}
                                    {...register("user", {
                                        maxLength: { value: 40, message: 'El nombre no debe exeder los 40 caracteres' },
                                    })}
                                />
                                <p> {errors.user && errors.user.message} </p>
                            </label>
                        </div>

                        <div className='containerInput'>
                            <label>
                                Número de empleado:
                                <input
                                    style={{ borderColor: (errors.employeeNumber) && color.Secondary }}
                                    type={'text'}
                                    {...register("employeeNumber", {
                                        required: { value: true, message: 'campo requerido' },
                                        maxLength: { value: 20, message: 'El nombre no debe exeder los 20 caracteres' },
                                    })}
                                />
                                <p> {errors.employeeNumber && errors.employeeNumber.message} </p>
                            </label>
                            <label>
                                Número teléfonico:
                                <input
                                    disabled={(roleSelected?.value === 2) ? true : false}
                                    autoComplete='off'
                                    style={{ borderColor: (errors.phoneNumber) && color.Secondary }}
                                    type={'number'}
                                    {...register("phoneNumber", {
                                        minLength: { value: 10, message: 'Número de 10 digitos' },
                                        maxLength: {
                                            value: 10,
                                            message: "El número teléfonico debe contener 10 digitos"
                                        },
                                    })}
                                />
                                <p> {errors.phoneNumber && errors.phoneNumber.message} </p>
                            </label>
                        </div>

                        {
                            (roleSelected?.value !== 2) && <div className='containerInput'>
                                <Switch value={(roleSelected?.value === 2) ? true : isPasswordDefined} text='Definir contraseña' func={setisPasswordDefined} />
                                {
                                    isPasswordDefined ? operatorSelected?.value === '' &&
                                        <label>
                                            Contraseña:
                                            <input
                                                disabled={(roleSelected?.value === 2) ? true : false}
                                                style={{ borderColor: (errors.password) && color.Secondary }}
                                                type={(operatorSelected?.value !== '') ? 'password' : 'text'}
                                                {...register("password", {
                                                    required: { value: (isPasswordDefined) ? true : false, message: 'campo requerido' }
                                                })}
                                            />
                                            <p> {errors.password && errors.password.message} </p>
                                        </label>
                                        :
                                        <label></label>
                                }
                            </div>
                        }

                        <div className='containerBtn'>
                            <input className='btn' type="submit" value="REGISTRAR" />
                        </div>
                    </>
            }
        </form>
    )
}

interface propsEditPerson {
    onSubmit: SubmitHandler<AddPerson>;
    isLoading: boolean;
    isPasswordDefined: boolean;
    setisPasswordDefined: React.Dispatch<React.SetStateAction<boolean>>;
    Person: Person | undefined;
    GetGeneral: { Enterprices: Enterprices[]; Roles: Roles[]; ServicesTypes: ServicesTypes[]; } | undefined;
    setisRestoralPassword: React.Dispatch<React.SetStateAction<boolean>>
}

export const FormEditPerson = ({ onSubmit, isLoading, isPasswordDefined, setisPasswordDefined, Person, GetGeneral, setisRestoralPassword }: propsEditPerson) => {
    const { register, formState: { errors }, handleSubmit, setValue, reset } = useForm<AddPerson>({ criteriaMode: 'all' });

    useEffect(() => {
        if (Person) {
            reset();
            setValue('name', Person.personName);
            setValue('lastname', Person.lastname);
            setValue('email', (Person.email !== null) ? Person.email : '');
            setValue('employeeNumber', Person.employeeNumber);
            (Person.phoneNumber !== null) && setValue('phoneNumber', Person.phoneNumber);
            setValue('user', (Person.nameUser !== null) ? Person.nameUser : '');
            setValue('password', Person.password);
        }
    }, [Person]);

    return (
        <form className='FormAddEdit' onSubmit={handleSubmit(onSubmit)}>
            {
                (isLoading) ?
                    <div className='flex-center'>
                        <div className='spin'></div>
                    </div>
                    :
                    <>
                        <label>
                            Empresa:
                            <Select
                                isDisabled={true}
                                className='select'
                                styles={{ dropdownIndicator: () => ({ display: 'none' }), indicatorSeparator: () => ({ display: 'none' }), ...customStyles }}
                                value={{ value: Person?.id_enterprice, label: Person?.enterpriceShortName }}
                            />
                        </label>
                        <div className='containerInput'>
                            <label>
                                Rol:
                                <Select
                                    isDisabled={true}
                                    className='select'
                                    styles={{ dropdownIndicator: () => ({ display: 'none' }), indicatorSeparator: () => ({ display: 'none' }), ...customStyles }}
                                    value={{ value: Person?.id_role, label: GetGeneral?.Roles.find(f => f.id_role === Person?.id_role)?.name }}
                                />
                            </label>
                        </div>

                        <div className='containerInput'>
                            <label>
                                Nombre(s):
                                <input
                                    style={{ borderColor: (errors.name) && color.Secondary }}
                                    type={'text'}
                                    {...register("name", {
                                        required: { value: true, message: 'campo requerido' },
                                        maxLength: { value: 30, message: 'El nombre no debe exeder los 30 caracteres' },
                                        pattern: { value: /[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+[A-Za-z \d*\0-9*]+$/g, message: 'Solo caracteres del alfabeto y números' }
                                    })}
                                />
                                <p> {errors.name && errors.name.message} </p>
                            </label>
                            <label>
                                Apellidos:
                                <input
                                    style={{ borderColor: (errors.lastname) && color.Secondary }}
                                    type={'text'}
                                    {...register("lastname", {
                                        required: { value: true, message: 'campo requerido' },
                                        maxLength: { value: 50, message: 'El nombre no debe exeder los 50 caracteres' },
                                        pattern: { value: /[a-zA-ZñÑáéíóúÁÉÍÓÚ\s\A-Za-z \d*\0-9*]+$/g, message: 'Solo caracteres del alfabeto y números' }
                                    })}
                                />
                                <p> {errors.lastname && errors.lastname.message} </p>
                            </label>
                        </div>

                        <div className='containerInput'>
                            <label>
                                Correo:
                                <input
                                    disabled={(Person?.id_role === 2) ? true : false}
                                    style={{ borderColor: (errors.email) && color.Secondary }}
                                    type={'email'}
                                    {...register("email", {
                                        maxLength: { value: 50, message: 'El nombre no debe exeder los 50 caracteres' },
                                    })}
                                />
                                <p> {errors.email && errors.email.message} </p>
                            </label>
                            <label>
                                Usuario:
                                <input
                                    disabled={(Person?.id_role === 2) ? true : false}
                                    style={{ borderColor: (errors.user) && color.Secondary }}
                                    type={'text'}
                                    {...register("user", {
                                        maxLength: { value: 40, message: 'El nombre no debe exeder los 40 caracteres' },
                                    })}
                                />
                                <p> {errors.user && errors.user.message} </p>
                            </label>
                        </div>

                        <div className='containerInput'>
                            <label>
                                Número de empleado:
                                <input
                                    style={{ borderColor: (errors.employeeNumber) && color.Secondary }}
                                    type={'text'}
                                    {...register("employeeNumber", {
                                        required: { value: true, message: 'campo requerido' },
                                        maxLength: { value: 20, message: 'El nombre no debe exeder los 20 caracteres' },
                                    })}
                                />
                                <p> {errors.employeeNumber && errors.employeeNumber.message} </p>
                            </label>
                            <label>
                                Número teléfonico:
                                <input
                                    autoComplete='off'
                                    style={{ borderColor: (errors.phoneNumber) && color.Secondary }}
                                    type={'number'}
                                    {...register("phoneNumber", {
                                        minLength: { value: 10, message: 'Número de 10 digitos' },
                                        maxLength: {
                                            value: 10,
                                            message: "El número teléfonico debe contener 10 digitos"
                                        },
                                    })}
                                />
                                <p> {errors.phoneNumber && errors.phoneNumber.message} </p>
                            </label>
                        </div>

                        <div className='containerInput'>
                            {Person?.id_role !== 2 && <Switch value={(Person?.id_role === 2) ? true : isPasswordDefined} text='Cambiar contraseña' func={setisPasswordDefined} />}
                            {
                                isPasswordDefined ? Person?.id_role !== 2 &&
                                    <label>
                                        Contraseña:
                                        <input
                                            disabled={(Person?.id_role === 2) ? true : false}
                                            style={{ borderColor: (errors.password) && color.Secondary }}
                                            type={'text'}
                                            {...register("password", {
                                                required: { value: (isPasswordDefined) ? true : false, message: 'campo requerido' }
                                            })}
                                        />
                                        <p> {errors.password && errors.password.message} </p>
                                    </label>
                                    :
                                    <label></label>
                            }
                        </div>

                        <div className='containerInput'>
                            {
                                !isPasswordDefined && Person?.id_role !== 2 &&
                                <div className='containerBtn marL1 marR1'>
                                    <button onClick={() => setisRestoralPassword(true)} type='button' className='btn'>RESTABLECER CONTRASEÑA</button>
                                </div>
                            }
                            <div className='containerBtn marL1 marR1'>
                                <input id='btn2' className='btn' type="submit" value="ATUALIZAR" />
                            </div>
                        </div>
                    </>
            }
        </form>
    )
}

import React, { useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { actionPersonProps, Enterprices, Person, Roles, ServicesTypes } from '../rules/interfaces';
import { AddPerson, FormEditPerson } from './Modal/FormPerson';
import { SubmitHandler } from 'react-hook-form';
import { useQueryClient, UseMutationResult } from 'react-query';
import { ShowMessage } from './Swal';


interface props {
    setPerson: React.Dispatch<React.SetStateAction<Person | undefined>>;
    Person: Person | undefined;
    ActionPerson: UseMutationResult<{ isDeleted?: boolean | undefined; isUpdated?: boolean | undefined; passwordWasReset?: boolean | undefined; person?: Person | undefined; }, unknown, actionPersonProps, void>;
    isRestoralPassword: boolean;
    setisRestoralPassword: React.Dispatch<React.SetStateAction<boolean>>;
    isLoading: boolean;
}
export const ModalEditPerson = ({ Person, setPerson, ActionPerson, isRestoralPassword, setisRestoralPassword, isLoading }: props) => {
    const queryClient = useQueryClient();
    const { logOut } = useContext(AuthContext);
    const [isPasswordDefined, setisPasswordDefined] = useState(false);
    const [GetGeneral, setGetGeneral] = useState<{ Enterprices: Enterprices[]; Roles: Roles[]; ServicesTypes: ServicesTypes[]; }>();


    const close = (modal: Element | null) => {
        (modal) && modal.setAttribute('style', 'display: none');
        setPerson(undefined);
    }

    const onSubmit: SubmitHandler<AddPerson> = async (props) => {
        if (Person) {
            const { email, employeeNumber, lastname, name, password, phoneNumber, user } = props;
            const { enterpriceShortName, id_enterprice, id_person, id_role, status, withOutFolio, ...rest } = Person;

            const data = {
                name, email, employeeNumber, lastname, password: (isPasswordDefined) ? password : rest.password,
                phoneNumber: `${phoneNumber}`,
                role: {
                    user,
                    id: id_role,
                    name: `${GetGeneral?.Roles.find(f => f.id_role === id_role)?.name}`
                },
                enterprice: {
                    id: id_enterprice,
                    shortName: enterpriceShortName
                }
            }
            if (
                data.name === Person.personName &&
                data.lastname === Person.lastname &&
                data.email === (Person.email === null ? '' : Person.email) &&
                data.password === Person.password &&
                data.phoneNumber === (Person.phoneNumber === null ? '' : Person.phoneNumber) &&
                data.employeeNumber === Person.employeeNumber &&
                data.role.user === (Person.nameUser === null ? '' : Person.nameUser)) return await ShowMessage({ text: `No se detecto nigún cambio en los parametros`, title: 'ALERTA', icon: 'warning' });
            if (data.email === '' && data.role.user === '') return await ShowMessage({ text: `Debe de registrar al menos un USUARIO o CORREO`, title: 'ALERTA', icon: 'warning' });


            ActionPerson.mutate({
                person: {
                    id: Person!.id_person,
                    role: Person!.id_role,
                    name: `${Person?.personName} ${Person?.lastname}`
                },
                option: {
                    updateData: data
                }
            })
        }
    }

    useEffect(() => {
        const data: { Enterprices: Enterprices[]; Roles: Roles[]; ServicesTypes: ServicesTypes[]; } | undefined = queryClient.getQueryData(["GetGeneral"]);
        if (data) setGetGeneral(() => data);
        else queryClient.invalidateQueries('GetGeneral');
    }, []);

    useEffect(() => {
        if (isRestoralPassword) {
            ActionPerson.mutate({
                person: {
                    id: Person!.id_person,
                    role: Person!.id_role,
                    name: `${Person?.personName} ${Person?.lastname}`
                },
                option: {
                    'resetPassword': true
                }
            })
        }
    }, [isRestoralPassword]);

    useEffect(() => {
        if (ActionPerson.isSuccess && ActionPerson.data.passwordWasReset) {
            close(document.querySelector('.Modal'));
        }
    }, [ActionPerson.data]);



    return (
        <div id='Modal' className='Modal'>
            <div className='modal-container'>
                <div className='modal-content FormCustom'>
                    <section className='header'>
                        <h1>EDITAR PERSONA</h1>
                        <span className="close" onClick={() => close(document.querySelector('.Modal'))} > &times; </span>
                    </section>
                    <section className='body'>
                        {
                            isLoading
                                ?
                                <div className='flex-center'>
                                    <div className='spin'></div>
                                </div>
                                :
                                <div className='containerForm'>
                                    <FormEditPerson
                                        isLoading={false}
                                        isPasswordDefined={isPasswordDefined}
                                        setisPasswordDefined={setisPasswordDefined}
                                        onSubmit={onSubmit}
                                        Person={Person}
                                        GetGeneral={GetGeneral}
                                        setisRestoralPassword={setisRestoralPassword}
                                    />
                                </div>
                        }
                    </section>
                    <section className='footer'>
                        {/* <button className='btn3' onClick={() => { }}> Restablecer contraseña </button>
                        <button className='btn3' onClick={() => { }}> Actualizar </button> */}
                    </section>
                </div>
            </div>
        </div >
    )
}

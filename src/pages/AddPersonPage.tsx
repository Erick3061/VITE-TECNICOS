import React, { useState } from 'react';
import { SingleValue } from 'react-select';
import { useMutation } from 'react-query';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { addPerson } from '../api/Api';
import { ShowError, ShowMessage } from '../components/Swal';
import { useForm, SubmitHandler } from 'react-hook-form';
import { AddPerson, FormAddPerson } from '../components/Modal/FormPerson';
import { bodyPerson } from '../rules/interfaces';


export const AddPersonPage = () => {
    const { logOut, person } = useContext(AuthContext);
    const initialStateValueEnterprice: SingleValue<{ value: number; label: string; }> = { value: 0, label: 'Seleccione una empresa' };
    const initialStateValueRole: SingleValue<{ value: number; label: string; }> = { value: 0, label: 'Seleccione un rol' };
    const initialStateValueOperator: SingleValue<{ value: string; label: string; }> = { value: '', label: 'Seleccione el monitorista' };
    const [enterpriceSelected, setenterpriceSelected] = useState<SingleValue<{ value: number; label: string; }>>(initialStateValueEnterprice);
    const [roleSelected, setroleSelected] = useState<SingleValue<{ value: number; label: string; }>>(initialStateValueRole);
    const [operatorSelected, setoperatorSelected] = useState<SingleValue<{ value: string; label: string; }>>(initialStateValueOperator);
    const [isPasswordDefined, setisPasswordDefined] = useState(false);
    const [isLoading, setisLoading] = useState<boolean>(false);
    const { reset } = useForm<AddPerson>({ criteriaMode: 'all' });

    const MaddPerson = useMutation(addPerson, {
        retry: 1,
        onMutate: () => {
            setisLoading(() => true);
        },
        onSuccess: async () => {
            setisLoading(() => false);
            await ShowMessage({ text: 'Persona registrada correctamente', title: '', icon: 'success' });
            reset();
            setenterpriceSelected(initialStateValueEnterprice);
            setroleSelected(initialStateValueRole);
            if (person?.id_role === 3) {
                setenterpriceSelected({ value: person.id_enterprice, label: person.enterpriceShortName });
                setroleSelected({ value: 1, label: 'Tecnico' });
            }
        },
        onError: async error => {
            setisLoading(() => false);
            if (`${error}`.includes('JsonWebTokenError') || `${error}`.includes('TokenExpiredError')) {
                localStorage.clear();
                logOut();
                (`${error}`.includes('TokenExpiredError')) ? await ShowError('La sesión expiró') : await ShowError('Token invalido');
            }
            await ShowError(`${error}`);
        }
    });

    const onSubmit: SubmitHandler<AddPerson> = async (data, event) => {
        event?.preventDefault();
        const { email, employeeNumber, lastname, name, password, phoneNumber, user } = data;
        if (enterpriceSelected?.value !== 0 && roleSelected?.value !== 0) {
            const data: bodyPerson = {
                name, email, employeeNumber, lastname, password: (isPasswordDefined) ? password : employeeNumber, phoneNumber,
                role: {
                    user,
                    id: roleSelected!.value,
                    name: roleSelected!.label
                },
                enterprice: {
                    id: enterpriceSelected!.value,
                    shortName: enterpriceSelected!.label
                }
            }
            MaddPerson.mutate(data);
        } else {
            if (enterpriceSelected?.value === 0) await ShowMessage({ text: 'No se ha seleccionado la empresa que le corresponde a este usuario', title: '', icon: 'warning' });
            if (roleSelected?.value === 0) await ShowMessage({ text: 'No se ha seleccionado el ROL del usuario', title: '', icon: 'warning' });
        }
    }


    return (
        <section className='containerAddPerson'>
            <div className='containerForm'>
                <FormAddPerson
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                    enterpriceSelected={enterpriceSelected}
                    operatorSelected={operatorSelected}
                    roleSelected={roleSelected}
                    setenterpriceSelected={setenterpriceSelected}
                    setoperatorSelected={setoperatorSelected}
                    setroleSelected={setroleSelected}
                    setisPasswordDefined={setisPasswordDefined}
                    isPasswordDefined={isPasswordDefined}
                />
            </div>
        </section>
    )
}

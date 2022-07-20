import React, { useEffect, useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { Enterprices } from '../rules/interfaces';
import Select, { GroupBase, SingleValue, StylesConfig } from 'react-select';
import { color } from '../helpers/herpers';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ShowError, ShowMessage } from '../components/Swal';
import { addEnterprice, enterpriceActions } from '../api/Api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { customStyles, errorFormat } from '../functions/Functions';
import { Icon } from '@mdi/react';
import { mdiDelete as IconDelete } from '@mdi/js';
import { mdiPencil as IconEdit } from '@mdi/js';
import { mdiClose as IconClose } from '@mdi/js';

interface value { value: number; label: string; };
interface inputs {
    name: string;
    shortName: string;
    btn: 'update' | 'insert';
}

export const EnterpricePage = () => {
    const { logOut } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const initialStateValueEnterprice: SingleValue<value> = { value: 0, label: 'Seleccine una empresa' };
    const [Enterprices, setEnterprices] = useState<Array<Enterprices>>();
    const [enterpriceSelected, setEnterpriceSelected] = useState<SingleValue<value>>(initialStateValueEnterprice);
    const [isLoading, setisLoading] = useState<boolean>(false);

    const addEnterpriceM = useMutation(['addEnterpriceM'], addEnterprice, {
        retry: 1,
        onMutate: () => {
            setisLoading(true);
        },
        onSuccess: async data => {
            setisLoading(false);
            queryClient.invalidateQueries(['GetGeneral']);
            await ShowMessage({ title: 'Correcto', text: 'Empresa insertada', icon: 'success' });
        },
        onError: err => {
            setisLoading(false);
            showError(`${err}`);
        }
    });

    const enterpriceActionsM = useMutation(['enterpriceActionsM'], enterpriceActions, {
        retry: 1,
        onMutate: () => {
            setisLoading(true);
        },
        onSuccess: async data => {
            setisLoading(false);
            queryClient.invalidateQueries(['GetGeneral']);
            if (data.isUpdated) {
                await ShowMessage({ title: 'Correcto', text: 'Empresa actualizada', icon: 'success' });
            }
            if (data.isDeleted) {
                await ShowMessage({ title: 'Correcto', text: 'Empresa eliminada', icon: 'success' });
            }
        },
        onError: err => {
            setisLoading(false);
            showError(`${err}`);
        }
    });

    const showError = async (error: string) => {
        if (error.includes('JsonWebTokenError') || error.includes('TokenExpiredError')) {
            localStorage.clear();
            logOut();
            (error.includes('TokenExpiredError')) ? await ShowError('La sesión expiró') : await ShowError('Token invalido');
        }
        await ShowError(errorFormat(error));
    }

    const { register, formState: { errors }, handleSubmit, setValue, reset } = useForm<inputs>({ criteriaMode: 'all' });

    const onSubmit: SubmitHandler<inputs> = async (props) => {
        const { btn, name, shortName } = props;
        if (enterpriceSelected?.label === shortName && Enterprices?.find(f => f.id_enterprice === enterpriceSelected.value)?.name === name) {
            return await ShowMessage({ title: 'Alerta', text: `No se detectaron cambios`, icon: 'warning' });
        }
        if (btn === 'update') {
            enterpriceActionsM.mutate({
                enterprice: { id: enterpriceSelected!.value, shortName: enterpriceSelected!.label },
                option: {
                    updateData: { name, shortName }
                }
            })
        } else {
            addEnterpriceM.mutate({ enterprice: { name, shortName } });
        }
    }

    useEffect(() => {
        const data: { Enterprices: Enterprices[]; } | undefined = queryClient.getQueryData(["GetGeneral"]);
        if (data) setEnterprices(() => data.Enterprices);
        else queryClient.invalidateQueries(['GetGeneral']);
    }, []);

    useEffect(() => {
        setEnterpriceSelected(initialStateValueEnterprice);
        const data: { Enterprices: Enterprices[]; } | undefined = queryClient.getQueryData(["GetGeneral"]);
        if (data) setEnterprices(() => data.Enterprices);
    }, [queryClient.getQueryData(['GetGeneral'])]);

    useEffect(() => {
        reset();
        if (enterpriceSelected?.value !== 0) {
            setValue('shortName', `${Enterprices?.find(f => f.id_enterprice === enterpriceSelected?.value)?.shortName}`);
            setValue('name', `${Enterprices?.find(f => f.id_enterprice === enterpriceSelected?.value)?.name}`);
        }
    }, [enterpriceSelected]);

    return (
        <div className='enterpriceContainer'>
            <header className='header'>
                <div className='search'>
                    <p className='title'>Empresas</p>
                </div>
                <div className='search'>
                    <p className='title subTitle'>Seleccione la empresa a editar</p>
                    <div className='inputsContainer'>
                        {
                            <Select
                                hideSelectedOptions={true}
                                className='select'
                                placeholder='Selecciona'
                                value={(enterpriceSelected?.value !== 0) ? enterpriceSelected : initialStateValueEnterprice}
                                styles={{
                                    dropdownIndicator: () => ({ display: 'none' }), indicatorSeparator: () => ({ display: 'none' }),
                                    ...customStyles
                                }}
                                isSearchable={true}
                                isClearable={true}
                                options={Enterprices?.map(Entr => { return { value: Entr.id_enterprice, label: Entr.shortName } })}
                                onChange={(value) => (value === null) ? setEnterpriceSelected(initialStateValueEnterprice) : setEnterpriceSelected(value)}
                            />
                        }
                    </div>
                </div>
            </header>
            <main className='main'>
                <div className='containerForm'>
                    <h2>{(enterpriceSelected?.value !== 0) ? 'Editar empresa' : 'Registar empresa'}</h2>
                    <form className='FormAddEdit' onSubmit={handleSubmit(onSubmit)}>
                        <div className='containerIcon'>
                            <i onClick={() => { setEnterpriceSelected(initialStateValueEnterprice) }}>
                                < Icon path={IconClose} className='icon' />
                            </i>
                        </div>
                        {
                            (isLoading) ?
                                <div className='flex-center'>
                                    <div className='spin'></div>
                                </div>
                                :
                                <>
                                    {/* <div className='containerInput'> */}
                                    <label>
                                        Nombre corto:
                                        <input
                                            style={{ borderColor: (errors.shortName) && color.Secondary }}
                                            type={'text'}
                                            {...register("shortName", {
                                                required: { value: true, message: 'campo requerido' },
                                                maxLength: { value: 50, message: 'El nombre no debe exeder los 50 caracteres' },
                                                pattern: { value: /[a-zA-ZñÑáéíóúÁÉÍÓÚ\s\A-Za-z \d*\0-9*]+$/g, message: 'Solo caracteres del alfabeto y números' }
                                            })}
                                        />
                                        <p> {errors.shortName && errors.shortName.message} </p>
                                    </label>
                                    <label>
                                        Nombre completo:
                                        <input
                                            style={{ borderColor: (errors.name) && color.Secondary }}
                                            type={'text'}
                                            {...register("name", {
                                                required: { value: true, message: 'campo requerido' },
                                                maxLength: { value: 150, message: 'El nombre no debe exeder los 30 caracteres' },
                                                pattern: { value: /[a-zA-ZñÑáéíóúÁÉÍÓÚ\s\A-Za-z \d*\0-9*]+$/g, message: 'Solo caracteres del alfabeto y números' }
                                            })}
                                        />
                                        <p> {errors.name && errors.name.message} </p>
                                    </label>
                                    {/* </div> */}

                                    <div className='containerInput'>
                                        {
                                            enterpriceSelected?.value !== 0
                                                ?
                                                <div className='containerBtn marL1 marR1'>
                                                    <input onClick={() => setValue('btn', 'update')} className='btn' type="submit" value="ATUALIZAR" />
                                                </div>
                                                :
                                                <div className='containerBtn marL1 marR1'>
                                                    <input onClick={() => setValue('btn', 'insert')} className='btn' type="submit" value="REGISTRAR" />
                                                </div>
                                        }
                                    </div>
                                </>
                        }
                    </form>
                </div>
                <section className='container-table'>
                    <h2>Empresas</h2>
                    {
                        (queryClient.isFetching(['GetGeneral']) || isLoading)
                            ?
                            <div className='flex-center'>
                                <div className='spin'></div>
                            </div>
                            :
                            <table className='bord'>
                                <thead>
                                    <tr className='row' key={`Indices`}>
                                        <th >#</th>
                                        <th style={{ borderRight: `1px solid ${color.background}` }} >Nombre corto</th>
                                        <th style={{ borderRight: `1px solid ${color.background}` }} >Nombre</th>
                                        <th >Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        (Enterprices && Enterprices.length > 0)
                                            ? Enterprices.map((el, idx) => {
                                                return (
                                                    <tr
                                                        className='rows'
                                                        key={`${el.id_enterprice}`}
                                                    >
                                                        <td>{idx + 1}</td>
                                                        <td style={{ borderRight: `1px solid ${color.background}` }}>{el.shortName}</td>
                                                        <td style={{ borderRight: `1px solid ${color.background}` }}>{el.name}</td>
                                                        <td>
                                                            <i onClick={() => { setEnterpriceSelected({ value: el.id_enterprice, label: el.shortName }) }}>
                                                                <Icon path={IconEdit} className='iconaction' />
                                                            </i>
                                                            <i onClick={async () => { }}>
                                                                <Icon path={IconDelete} className='iconaction' />
                                                            </i>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                            :
                                            <tr key={`nohaydatos`} style={{ fontSize: '1.2rem' }} >
                                                <td colSpan={6}>NO HAY DATOS</td>
                                            </tr>
                                    }
                                </tbody>
                            </table>
                    }
                </section>
            </main>
        </div>
    )
}

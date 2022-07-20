import React, { useState, useContext, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DisponibleTechnicals, addService } from '../api/Api';
import Select, { SingleValue } from 'react-select';
import { AuthContext } from '../context/AuthContext';
import { PropsnewService, Account, Enterprices, ServicesTypes, Roles } from '../rules/interfaces';
import { ShowAlert, ShowError, ShowMessage } from '../components/Swal';
import { Switch } from '../components/Switch';
import { customStyles } from '../functions/Functions';
// import { ReactComponent as IconDelete } from '../assets/close.svg';
import { Icon } from '@mdi/react';
import { mdiClose as IconDelete } from '@mdi/js';
export const NewServicePage = () => {
    const queryClient = useQueryClient();
    const initialStateValueEnterprice: SingleValue<{ value: number; label: string; }> = { value: 0, label: 'Seleccione una empresa' };
    const initialStateValueAccount: SingleValue<{ value: string; label: string; }> = { value: '', label: 'Seleccione una cuenta' };
    const initialStateValueTypeS: SingleValue<{ value: number; label: string; }> = { value: 0, label: 'Seleccione un tipo' };
    const { person, logOut } = useContext(AuthContext);
    const [filtro, setfiltro] = useState<'Abonado' | 'Cliente' | 'Nombre'>('Abonado');
    const [isKeyCode, setisKeyCode] = useState(false);
    const [isOpCi, setisOpCi] = useState(false);
    const [accountSelected, setaccountSelected] = useState<SingleValue<{ value: string; label: string; }>>(initialStateValueAccount);
    const [enterpriceSelected, setenterpriceSelected] = useState<SingleValue<{ value: number; label: string; }>>(initialStateValueEnterprice);
    const [typeSelected, settypeSelected] = useState<SingleValue<{ value: number; label: string; }>>(initialStateValueTypeS);
    const [technicals, settechnicals] = useState<Array<string>>([]);
    const [loading, setloading] = useState(false);
    const [Accounts, setAccounts] = useState<{ accounts: Array<Account> }>();
    const [Disponible, setDisponible] = useState<Array<{ id_person: string; name: string; id_enterprice: number; }>>([]);
    const [GetGeneral, setGetGeneral] = useState<{ Enterprices: Enterprices[]; Roles: Roles[]; ServicesTypes: ServicesTypes[]; }>();

    useEffect(() => {
        const data: { accounts: Array<Account> } | undefined = queryClient.getQueryData(["Accounts"]);
        if (data) setAccounts(() => data);
        else queryClient.invalidateQueries(['Accounts']);

        const dataGeneral: { Enterprices: Enterprices[]; Roles: Roles[]; ServicesTypes: ServicesTypes[]; } | undefined = queryClient.getQueryData(["GetGeneral"]);
        if (dataGeneral) setGetGeneral(() => dataGeneral);
        else queryClient.invalidateQueries(['GetGeneral']);
    }, []);

    const Technicals = useQuery(['DisponibleTechnicals'], () => DisponibleTechnicals((enterpriceSelected?.value !== 0) ? GetGeneral?.Enterprices.find(e => e.id_enterprice === enterpriceSelected?.value) : undefined), {
        retry: 1,
        refetchOnWindowFocus: false,
        refetchInterval: false,
        onError: async error => {
            if (`${error}`.includes('JsonWebTokenError') || `${error}`.includes('TokenExpiredError')) {
                localStorage.clear();
                logOut();
                (`${error}`.includes('TokenExpiredError')) ? await ShowError('La sesión expiró') : await ShowError('Token invalido');
            }
            await ShowError(`${error}`);
        },
        onSuccess: data => {
            setDisponible(data.technicals);
        }
    });

    const MaddService = useMutation(addService, {
        retry: 1,
        onMutate: () => {
            setloading(() => true);
        },
        onSuccess: async () => {
            setloading(() => false);
            await ShowMessage({ text: 'Servicio creado correctamente', timer: 3000, title: '', icon: 'success' });
            setaccountSelected(() => initialStateValueAccount);
            settypeSelected(() => initialStateValueTypeS);
            settechnicals(() => []);
        },
        onError: async error => {
            setloading(() => false);
            if (`${error}`.includes('JsonWebTokenError') || `${error}`.includes('TokenExpiredError')) {
                localStorage.clear();
                logOut();
                (`${error}`.includes('TokenExpiredError')) ? await ShowError('La sesión expiró') : await ShowError('Token invalido');
            }
            await ShowError(`${error}`);
        }
    });

    const addArray = async (value: SingleValue<{ label: string; value: string; }>) => {
        if (value?.value !== ('' || null || undefined)) {
            const existe = technicals.findIndex(f => f === value?.value);
            if (existe !== -1) {
                await ShowAlert(`Técnico:${value?.label} ya esta incluido`);
            } else {
                settechnicals(() => [...technicals, value?.value]);
            }
        }
    }

    const handleSubmit = async () => {
        if (accountSelected?.value === '') {
            return await ShowAlert('Debes seleccionar una cuenta');
        } else if (technicals.length === 0) {
            return await ShowAlert('Debes seleccionar al menos un técnico');
        } else if (typeSelected?.value === 0) {
            return await ShowAlert('Debes seleccionar un tipo de servicio');
        } else {
            const data: PropsnewService = {
                CodigoCte: accountSelected!.value,
                grantedEntry: { id: person!.id_person, role: person!.id_role, name: `${person?.personName} ${person?.lastname}` },
                isKeyCode,
                isOpCi,
                technicals,
                id_type: typeSelected!.value,
                time: { hours: 2, minutes: 0, seconds: 0 }
            }
            MaddService.mutate(data);
        }
    }

    const filter = async () => {
        setDisponible([]);
        Technicals.refetch();
    }

    useEffect(() => {
        settechnicals([]);
        setDisponible([]);
    }, [enterpriceSelected]);



    return (
        <div className='newService-container'>
            <header className='header'>
                <div className='search'>
                    <p className='title'>Crear servico</p>
                </div>
            </header>
            <main className='main'>
                {

                    (queryClient.isFetching(['Accounts']) || Technicals.isLoading)
                        ?
                        <div className='flex-center'>
                            <div className='spin'></div>
                        </div>
                        : (Accounts?.accounts) &&
                        <>
                            <div className='containerForm'>
                                <h1>Selección de parámetros</h1>
                                <div className={`container-search`}>
                                    <div className='filter'>
                                        <p className='texto2'>Filtro</p>
                                        <div className='btns'>
                                            <div className={(filtro === 'Cliente') ? 'btnFilterActivo' : 'btnFilter'} onClick={() => setfiltro(() => 'Cliente')} >Cliente</div>
                                            <div className={(filtro === 'Abonado') ? 'btnFilterActivo' : 'btnFilter'} onClick={() => setfiltro(() => 'Abonado')} >Abonado</div>
                                            <div className={(filtro === 'Nombre') ? 'btnFilterActivo' : 'btnFilter'} onClick={() => setfiltro(() => 'Nombre')} >Nombre</div>
                                        </div>
                                    </div>
                                    <div>
                                        <Select
                                            hideSelectedOptions={true}
                                            className='select'
                                            placeholder='Selecciona'
                                            value={(accountSelected?.value !== '') ? accountSelected : initialStateValueAccount}
                                            styles={{
                                                dropdownIndicator: () => ({ display: 'none' }), indicatorSeparator: () => ({ display: 'none' }), ...customStyles
                                            }}
                                            isSearchable={true}
                                            isClearable={true}
                                            options={Accounts.accounts.map(Acc => { return { value: Acc.CodigoCte, label: (filtro === 'Abonado') ? Acc.CodigoAbonado : (filtro === 'Cliente') ? Acc.CodigoCte : Acc.Nombre } })}
                                            onChange={(value) => (value === null) ? setaccountSelected(initialStateValueAccount) : setaccountSelected(value)}
                                        />
                                    </div>
                                </div>
                                <div className={`container-search`}>
                                    <p className='text1'>Tipo de servicio</p>
                                    <div>
                                        <Select
                                            hideSelectedOptions={true}
                                            isClearable={true}
                                            className='select'
                                            styles={{
                                                dropdownIndicator: () => ({ display: 'none' }), indicatorSeparator: () => ({ display: 'none' }), ...customStyles
                                            }}
                                            value={(typeSelected?.value !== 0) ? typeSelected : initialStateValueTypeS}
                                            isSearchable={true}
                                            options={GetGeneral?.ServicesTypes.map(T => { return { value: T.id_type, label: T.name } })}
                                            onChange={(value) => (value === null) ? settypeSelected(initialStateValueTypeS) : settypeSelected(value)}
                                        />
                                    </div>
                                </div>
                                <br />
                                <br />
                                <div className={`container-search`}>
                                    <p className='text1'>{`Filtrar Técnicos por empresa (opcional)`}</p>
                                    <div>
                                        <Select
                                            hideSelectedOptions={true}
                                            isClearable={true}
                                            className='select'
                                            styles={{
                                                dropdownIndicator: () => ({ display: 'none' }), indicatorSeparator: () => ({ display: 'none' }), ...customStyles
                                            }}
                                            value={(enterpriceSelected?.value !== 0) ? enterpriceSelected : initialStateValueEnterprice}
                                            isSearchable={true}
                                            options={GetGeneral?.Enterprices.map(T => { return { value: T.id_enterprice, label: T.shortName } })}
                                            onChange={(value) => (value === null) ? setenterpriceSelected(initialStateValueEnterprice) : setenterpriceSelected(value)}
                                        />
                                    </div>
                                </div>
                                <div className={`container-search`}>
                                    <p className='text1'>Seleccione uno o varios técnicos</p>
                                    <div>
                                        <Select
                                            className='select'
                                            styles={{
                                                dropdownIndicator: () => ({ display: 'none' }), indicatorSeparator: () => ({ display: 'none' }), ...customStyles
                                            }}
                                            value={{ label: 'Selecciona un Técnico', value: '' }}
                                            isSearchable={true}
                                            isLoading={Technicals.isFetching}
                                            options={(!Technicals.isSuccess) ? [] : Disponible.map(Tech => { return { value: Tech.id_person, label: `${Tech.name}` } }).filter(f => f.value !== technicals.find(b => b === f.value))}
                                            onChange={(value) => addArray(value)}
                                            onFocus={() => filter()}
                                        />
                                    </div>
                                </div>

                                <div className='switchs'>
                                    <Switch value={isKeyCode} text='Puede ver claves' func={setisKeyCode} />
                                    <Switch value={isOpCi} text='Verificar Aperturas y Cierres' func={setisOpCi} />
                                </div>
                            </div>
                            <div className='containerData'>
                                {
                                    (loading)
                                        ? <div className='spin'></div>
                                        :
                                        <div className='info'>
                                            <h1>Datos del servicio</h1>
                                            {
                                                (typeSelected?.value !== 0) &&
                                                <section>
                                                    <h4>Tipo de servicio</h4>
                                                    <p><b>Servicio: </b>{typeSelected?.label}</p>
                                                </section>
                                            }
                                            {
                                                (accountSelected?.value !== '') &&
                                                <section>
                                                    <h4>Datos de la cuenta</h4>
                                                    <p><b>Nombre: </b> {Accounts.accounts.find(f => f.CodigoCte === accountSelected?.value)?.Nombre}</p>
                                                    <p><b>Codigo Cliente: </b> {Accounts.accounts.find(f => f.CodigoCte === accountSelected?.value)?.CodigoCte}</p>
                                                    <p><b>Codigo Abonado: </b> {Accounts.accounts.find(f => f.CodigoCte === accountSelected?.value)?.CodigoAbonado}</p>
                                                    <p><b>Dirección: </b> {Accounts.accounts.find(f => f.CodigoCte === accountSelected?.value)?.Direccion}</p>
                                                </section>
                                            }
                                            <section>
                                                <h4>Opciones</h4>
                                                <p><b>El Técnico puede ver claves: </b> {(isKeyCode) ? 'SI' : 'NO'}</p>
                                                <p><b>Se verificará Apertura o Cierre: </b> {(isOpCi) ? 'SI' : 'NO'}</p>
                                            </section>
                                            <section>
                                                <h4>Tecnicos</h4>
                                                {
                                                    technicals.map(el => {
                                                        return (
                                                            <p key={`${el}`}><b>Nombre: </b>{Technicals.data?.technicals.find(f => f.id_person === el)?.name}
                                                                <i className='containerIcon' onClick={() => settechnicals(() => technicals.filter(f => f !== el))}><Icon path={IconDelete} className='icon' /></i>
                                                            </p>
                                                        )
                                                    })
                                                }
                                            </section>
                                            <div className='btnContainer'>
                                                <button className='btn' onClick={handleSubmit}>CREAR SERVICIO</button>
                                            </div>
                                        </div>
                                }
                            </div>
                        </>
                }
            </main>
        </div >
    )
}

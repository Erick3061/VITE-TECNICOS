import { GroupBase, StylesConfig } from "react-select";
import { color } from "../helpers/herpers";
import { user, zone } from "../rules/interfaces";

export const getExpired = (date: Date) => {
    const Fecha = new Date(date);
    const Final = new Date(Fecha.getTime() + Fecha.getTimezoneOffset() * 60000);
    const actual = new Date();
    const time = (Final.getTime() - actual.getTime());

    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);

    return { hours: hours + (days * 24), minutes, seconds }
}

export const FormatoFechaPlusMinus = (seconds: number, minutes: number, hours: number): string => {
    const fecha = new Date();
    fecha.setHours(fecha.getHours() + hours);
    fecha.setMinutes(fecha.getMinutes() + minutes);
    fecha.setSeconds(fecha.getSeconds() + seconds);
    const a: number = fecha.getFullYear();
    const m: number = fecha.getMonth();
    const d: number = fecha.getDate();
    const h: number = fecha.getHours();
    const min: number = fecha.getMinutes();
    const seg: number = fecha.getSeconds();
    return `${a}-${m + 1}-${d} ${h}:${min}:${seg}`;
}

export const validateZones = (z?: Array<zone>, ze?: Array<string>) => {
    const missingZone = z?.filter(f => `${f.codigo}` !== ze?.find(fi => fi === `${f.codigo}`)).map(z => `${z.codigo}`);
    const indefiniteZone = ze?.filter(f => z?.find(fi => `${fi.codigo}` === f) === undefined);
    return { missingZone, indefiniteZone }
}

export const validateUsers = (u?: Array<user>, ue?: Array<string>) => {
    const missingUser = u?.filter(f => `${f.codigo}` !== ue?.find(fi => fi === f.codigo)).map(z => `${z.codigo}`);
    const indefiniteUser = ue?.filter(f => u?.find(fi => `${fi.codigo}` === f) === undefined);
    return { missingUser, indefiniteUser }
}

export const errorFormat = (msg: string) => {
    return msg.replace(/Error/g, '').replace(/:/g, '');
}

export interface date {
    date: string;
    day: number;
    month: number;
    year: number;
};

export interface time {
    time: string;
    hour: number;
    minute: number;
    second: number;
};
export interface formatDate {
    DATE: Date;
    date: date;
    time: time;
    weekday: number;
}

export const getDate = (): formatDate => {
    const newDate: Date = new Date();
    const [day, month, year]: Array<string> = newDate.toLocaleDateString().split('/');
    const date: string = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const time: string = `${newDate.toTimeString().slice(0, 8)}`;
    const [hour, minute, second]: Array<number> = time.split(':').map(m => parseInt(m));
    const json: string = `${date}T${time}.000Z`;
    const dateGenerated: Date = new Date(json);
    const weekday = dateGenerated.getDay();
    return {
        DATE: dateGenerated,
        date: { date, day: parseInt(day), month: parseInt(month), year: parseInt(year) },
        time: { time, hour, minute, second },
        weekday
    };
}

export const modDate = ({ hours, minutes, seconds, dateI, days, months }: { dateI?: Date, seconds?: number, minutes?: number, hours?: number, days?: number, months?: number }): formatDate => {
    const newDate = (dateI) ? new Date(dateI.toJSON()) : getDate().DATE;
    (hours) && newDate.setHours(newDate.getHours() + hours);
    (minutes) && newDate.setMinutes(newDate.getMinutes() + minutes);
    (seconds) && newDate.setSeconds(newDate.getSeconds() + seconds);
    (days) && newDate.setDate(newDate.getDate() + days);
    (months) && newDate.setMonth(newDate.getMonth() + months);
    const [date, time] = newDate.toJSON().split('.')[0].split('T');
    const [year, month, day]: Array<number> = date.split('-').map(m => parseInt(m));
    const [hour, minute, second]: Array<number> = time.split(':').map(m => parseInt(m));
    const weekday = newDate.getDay();
    return {
        DATE: newDate,
        date: { date, day, month, year },
        time: { time, hour, minute, second },
        weekday
    };
}

export const customStyles: StylesConfig<{ value: any; label: any; }, false, GroupBase<{ value: any; label: any; }>> | undefined = {
    input: (props) => ({
        ...props,
        padding: 0, margin: 0,
    }),
    menu: (props) => ({
        ...props,
        height: 'max-content',
    }),
    menuList: (props) => ({
        ...props,
    }),
    valueContainer: (props) => ({
        ...props,
        padding: 0, margin: 0
    }),
}
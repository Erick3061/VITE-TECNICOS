import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import { KeyboardDatePicker, MuiPickersUtilsProvider, KeyboardTimePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import es from 'date-fns/locale/es';
import { formatDate, modDate } from '../functions/Functions';
import { ParsableDate } from '@material-ui/pickers/constants/prop-types';
import { color } from '../helpers/herpers';
import { createTheme, alpha } from '@material-ui/core/styles';

const theme = createTheme({
    unstable_strictMode: true,
    palette: {
        primary: {
            main: alpha(color.PrimaryDark, 1),
            dark: alpha(color.Primary, 1),
            light: alpha(color.PrimaryLight, 1),
            contrastText: alpha(color.background, 1),
        },
        secondary: {
            main: alpha(color.SecondaryDark, 1),
            dark: alpha(color.Secondary, 1),
            light: alpha(color.SecondaryLight, 1),
            contrastText: alpha(color.background, 1),
        },
    },
    overrides: {
        MuiDialog: {
            paper: {
                zIndex: 100
            }
        }
    }
});

interface individual {
    setoneDay: React.Dispatch<React.SetStateAction<boolean>>;
    setstart: React.Dispatch<React.SetStateAction<formatDate>>;
    setend: React.Dispatch<React.SetStateAction<formatDate>>;
}
interface props {
    date: formatDate;
    isOpen: boolean;
    label: string;
    setDate?: React.Dispatch<React.SetStateAction<formatDate>>;
    onOpen?: (() => void);
    onClose?: (() => void);
    maxDate?: ParsableDate;
    minDate?: ParsableDate;
    individual?: individual;
    isHided?: boolean;
}
export const DatePicker = ({ label, date, setDate, isOpen, maxDate, onClose, onOpen, minDate, individual, isHided }: props) => {
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es} >
            <ThemeProvider theme={theme}>
                <span className={(isHided) ? 'none' : ''}>
                    <KeyboardDatePicker
                        className='DatePicker'
                        value={date.DATE}
                        placeholder={`${date.date.date}`}
                        format="yyyy-MM-dd"
                        variant="dialog"
                        autoOk
                        label={label}
                        onChange={date => {
                            if (date && date?.toJSON() !== null) {
                                if (individual) {
                                    const { setend, setstart, setoneDay } = individual;
                                    const dateSelected = modDate({ dateI: new Date(date.toJSON()) });
                                    setstart(dateSelected);
                                    setend(dateSelected);
                                    setoneDay(true);
                                } else {
                                    setDate && setDate(() => modDate({ dateI: new Date(date.toJSON()) }));
                                }
                            }
                        }}
                        disableFuture
                        open={isOpen}
                        onOpen={onOpen}
                        onClose={onClose}
                        maxDate={maxDate}
                        minDate={minDate}
                        allowKeyboardControl={false}
                        clearLabel={false}
                        okLabel={false}
                    />
                </span>
            </ThemeProvider>
        </MuiPickersUtilsProvider >
    )
}

interface propsTime {
    date: formatDate | null;
    setDate: React.Dispatch<React.SetStateAction<formatDate | null>>
    label?: string;
}
export const Timepicker = ({ label, date, setDate }: propsTime) => {
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={es} >
            <ThemeProvider theme={theme}>
                <KeyboardTimePicker
                    className='timePicker'
                    autoOk
                    ampm={false}
                    openTo="minutes"
                    views={["minutes", "seconds"]}
                    format="mm:ss"
                    label={label}
                    value={(date !== null) ? date.DATE : null}
                    onChange={date => {
                        if (date && date?.toJSON() !== null) {
                            setDate && setDate(() => modDate({ dateI: new Date(date.toJSON()) }));
                        }
                    }}
                    onOpen={() => {
                        (setDate !== null) && date ? setDate(modDate({ dateI: date.DATE, minutes: -date.time.minute, seconds: -date.time.second })) : setDate(date);
                    }}
                    okLabel={false}
                />
            </ThemeProvider>
        </MuiPickersUtilsProvider >
    )
}

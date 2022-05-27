import React from 'react'
interface Props {
    func: React.Dispatch<React.SetStateAction<boolean>> | (() => void);
    text: string;
    value: boolean | undefined;
}
export const Switch = ({ text, func, value }: Props) => {
    return (
        <div className='switch-gral-container'>
            <p>{text}</p>
            <label className="switch" onClick={() => func(!value)}  >
                {(!value) ? <span className="desplaza"></span> : < span className="desplaza2"></span>}
            </label>
        </div>
    )
}

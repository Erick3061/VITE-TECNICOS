import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { LogInPage } from '../pages/LogInPage';

export const PublicRoutes = () => {
    const Redirect = ({ to }: { to: string }): any => {
        let navigate = useNavigate();
        useEffect(() => {
            navigate(to);
        });
        return null;
    }
    return (
        <Routes>
            <Route path="/" element={<LogInPage />} />
            <Route path="login" element={<LogInPage />} />
            <Route path="*" element={<Redirect to="/" />} />
        </Routes >
    )
}

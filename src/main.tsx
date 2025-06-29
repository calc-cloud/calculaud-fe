import React from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {AuthProvider} from "react-oidc-context";

const cognitoAuthConfig = {
    authority: "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_jdDrJBCLe",
    client_id: "7918m61oh13tamdmmkebkaectb",
    redirect_uri: "http://localhost:8080/",
    response_type: "code", response_mode: "query",
    scope: "email openid phone",
};

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <AuthProvider {...cognitoAuthConfig}>
            <App/>
        </AuthProvider>
    </React.StrictMode>
);

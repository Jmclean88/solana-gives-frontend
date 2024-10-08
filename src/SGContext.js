// SGContext.js
import React, { createContext, useState } from 'react';

export const SGContext = createContext();

export const SGProvider = ({ children }) => {
    const [balance, setBalance] = useState(0);
    const [authToken, setAuthToken] = useState(null);

    return (
        <SGContext.Provider value={{ balance, setBalance, authToken, setAuthToken }}>
            {children}
        </SGContext.Provider>
    );
};

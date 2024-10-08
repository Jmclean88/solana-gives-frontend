// Header.js
import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { SGContext } from '../SGContext';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
} from '@mui/material';
import './Header.css';

const Header = () => {
    const { balance, setBalance, authToken } = useContext(SGContext);

    useEffect(() => {
        const fetchBalance = async () => {
            if (authToken) {
                try {
                    const response = await fetch('http://localhost:5001/api/transactions/balance', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error fetching balance:', errorData.message);
                        return;
                    }

                    const data = await response.json();
                    setBalance(data.balance);
                } catch (error) {
                    console.error('Error fetching balance:', error);
                }
            }
        };

        fetchBalance();
    }, [authToken, setBalance]);

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component={Link} to="/" className="logo">
                    Solana Gives
                </Typography>
                <Box sx={{ flexGrow: 1, display: 'flex', marginLeft: 2 }}>
                    <Button color="inherit" component={Link} to="/">
                        Dashboard
                    </Button>
                    <Button color="inherit" component={Link} to="/donate-and-fund">
                        Fund Account
                    </Button>
                    <Button color="inherit" component={Link} to="/donate-to-charity">
                        Grant to Charity
                    </Button>

                </Box>
                <Typography variant="body1" sx={{ marginRight: 2 }}>
                    SG Balance: ${balance ? balance.toFixed(2) : '0.00'} USD
                </Typography>
                <WalletMultiButton />
            </Toolbar>
        </AppBar>
    );
};

export default Header;

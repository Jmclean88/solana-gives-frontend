// LandingPage.js
import React, { useContext, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { SGContext } from '../SGContext';
import {
    Container,
    Typography,
    Button,
    Box,
    List,
    ListItem,
    ListItemText,
    Link as MuiLink,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const { publicKey } = useWallet();
    const { authToken } = useContext(SGContext);
    const [previousTransactions, setPreviousTransactions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTransactions = async () => {
            if (authToken) {
                try {
                    const response = await fetch('http://localhost:5001/api/transactions/all', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`,
                        },
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error fetching transactions:', errorData.message);
                        return;
                    }

                    const data = await response.json();
                    if (data.transactions && Array.isArray(data.transactions)) {
                        setPreviousTransactions(data.transactions);
                    } else {
                        console.error('Invalid data structure:', data);
                    }
                } catch (error) {
                    console.error('Error fetching transactions:', error);
                }
            }
        };

        fetchTransactions();
    }, [authToken]);

    const handleOpen = (transaction) => {
        navigate('/tax-receipt', { state: { transaction } });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',  // Center horizontally
                alignItems: 'center',       // Center vertically
                minHeight: '100vh',         // Full viewport height
                textAlign: 'center',        // Optional: Center text
            }}
        >
            <Container>
                <Box my={4}>
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
                        Welcome to Solana Gives
                    </Typography>

                    {publicKey ? (
                        <>
                            <Box mt={2}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    component={Link}
                                    to="/donate-and-fund"
                                    sx={{ marginRight: 2 }}
                                >
                                    Fund Account
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component={Link}
                                    to="/donate-to-charity"

                                >
                                    Grant to Charity
                                </Button>

                            </Box>
                            <Typography variant="h6" gutterBottom mt={4}>
                                Previous Transactions
                            </Typography>
                            {previousTransactions.length > 0 ? (
                                <List>
                                    {previousTransactions.map((tx, index) => (
                                        <ListItem key={index}>
                                            <ListItemText
                                                primary={
                                                    <>
                                                        {/* Show type-specific icons */}
                                                        {tx.type === 'funding' ? '✅ Fund' : '🩸 Grant'}
                                                        <br />
                                                        {/* Show details depending on transaction type */}
                                                        {tx.type === 'funding'
                                                            ? `${tx.originalTokenQuantity} ${tx.originalToken} to ${tx.usdcFunded} USDC`
                                                            : `$${tx.usdAmountDonated} to ${tx.charity}`}

                                                        {/* Add Solana Explorer link for all transactions */}
                                                        {tx.transactionId && (
                                                            <>
                                                                <br />
                                                                <MuiLink
                                                                    href={`https://explorer.solana.com/tx/${tx.transactionId}?cluster=devnet`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    View on Solana Explorer
                                                                </MuiLink>
                                                                <br />
                                                            </>
                                                        )}

                                                        {/* Show 'Download Tax Receipt' button only for funding transactions */}
                                                        {tx.type === 'funding' && (
                                                            <Button
                                                                variant="text"
                                                                onClick={() => handleOpen(tx)}
                                                            >
                                                                Download Tax Receipt
                                                            </Button>
                                                        )}
                                                    </>
                                                }
                                                secondary={new Date(tx.dateTime).toLocaleString()}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="body1">
                                    You have no transactions yet.
                                </Typography>
                            )}
                        </>
                    ) : (
                        <Typography variant="body1">
                            Please connect your wallet to view your dashboard.
                        </Typography>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default LandingPage;

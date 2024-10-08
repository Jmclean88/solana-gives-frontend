// DonateAndFundPage.js
import React, { useEffect, useState, useContext } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress,
    createTransferInstruction,
} from '@solana/spl-token';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Checkbox,
    TextField,
    Button,
    Box,
} from '@mui/material';
import { SGContext } from '../SGContext';
import './DonateAndFundPage.css';

const SPL_TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const BONK_MINT = 'AMsar3VatRbMhnbG2FU4k6wxejDW89gTuUgkBBVAKCUf'; // Your token mint for BONK

const DonateAndFundPage = () => {
    const [tokenBalances, setTokenBalances] = useState([]);
    const [prices, setPrices] = useState({});
    const [sortedTokens, setSortedTokens] = useState([]);
    const [selectedToken, setSelectedToken] = useState(null);
    const [donationAmount, setDonationAmount] = useState(0);
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { setBalance, authToken } = useContext(SGContext);
    const donationWalletAddress = process.env.REACT_APP_DONATION_WALLET_ADDRESS;

    useEffect(() => {
        const fetchTokenData = async () => {
            if (publicKey) {
                try {
                    // Fetch SOL balance
                    const solBalanceLamports = await connection.getBalance(publicKey);
                    const solBalanceInSOL = solBalanceLamports / 1e9;

                    // Fetch SPL tokens
                    const tokens = await connection.getParsedTokenAccountsByOwner(publicKey, {
                        programId: SPL_TOKEN_PROGRAM_ID,
                    });

                    const fungibleTokens = tokens.value.filter(
                        (token) => token.account.data.parsed.info.tokenAmount.decimals > 0
                    );

                    const tokenData = [
                        {
                            mint: 'So11111111111111111111111111111111111111112',
                            balance: solBalanceInSOL,
                            symbol: 'solana',
                            decimals: 9,
                        },
                        ...fungibleTokens.map((token) => ({
                            mint: token.account.data.parsed.info.mint,
                            balance: token.account.data.parsed.info.tokenAmount.uiAmount,
                            symbol:
                                token.account.data.parsed.info.mint === BONK_MINT
                                    ? 'bonk'
                                    : token.account.data.parsed.info.tokenAmount.symbol || 'unknown',
                            decimals: token.account.data.parsed.info.tokenAmount.decimals,
                        })),
                    ];

                    setTokenBalances(tokenData);

                    // Fetch token prices
                    const symbols = tokenData.map((t) => t.symbol);
                    const tokenPrices = await fetchTokenPrices(symbols);

                    // Sort tokens by USD value
                    sortTokensByUSD(tokenData, tokenPrices);
                } catch (error) {
                    console.error('Error fetching token data:', error);
                }
            }
        };

        const fetchTokenPrices = async (symbols) => {
            // Convert symbols to CoinGecko IDs
            const symbolToId = {
                solana: 'solana',
                bonk: 'bonk',
                // Add other tokens as needed
            };

            const ids = symbols
                .map((symbol) => symbolToId[symbol] || '')
                .filter((id) => id !== '')
                .join(',');

            try {
                const response = await fetch(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
                );
                const pricesData = await response.json();

                // Map prices back to symbols
                const prices = {};
                for (const symbol of symbols) {
                    const id = symbolToId[symbol];
                    if (id && pricesData[id]) {
                        prices[symbol] = pricesData[id];
                    } else {
                        prices[symbol] = { usd: 0 };
                    }
                }

                setPrices(prices);
                return prices;
            } catch (error) {
                console.error('Error fetching token prices:', error);
                return {};
            }
        };

        const sortTokensByUSD = (tokens, prices) => {
            const tokensWithUSD = tokens.map((token) => {
                const usdValue = token.balance * (prices[token.symbol]?.usd || 0);
                return { ...token, usdValue };
            });
            const sorted = tokensWithUSD.sort((a, b) => b.usdValue - a.usdValue);
            setSortedTokens(sorted);
        };

        fetchTokenData();
    }, [publicKey, connection, donationWalletAddress, authToken]);

    const handleTokenSelection = (token) => {
        setSelectedToken(token);
        setDonationAmount(0);
    };

    const handleDonationAmountChange = (e) => {
        const value = e.target.value;
        setDonationAmount(value);
    };

    const handleDonation = async () => {
        if (donationAmount > 0 && selectedToken) {
            const usdValue = (donationAmount * prices[selectedToken.symbol]?.usd).toFixed(2);

            try {
                const transaction = new Transaction();

                if (selectedToken.symbol.toLowerCase() === 'solana') {
                    const transferInstruction = SystemProgram.transfer({
                        fromPubkey: publicKey,
                        toPubkey: new PublicKey(donationWalletAddress),
                        lamports: donationAmount * 1e9,
                    });
                    transaction.add(transferInstruction);
                } else {
                    const fromTokenAccount = await getAssociatedTokenAddress(
                        new PublicKey(selectedToken.mint),
                        publicKey
                    );
                    const toTokenAccount = await getAssociatedTokenAddress(
                        new PublicKey(selectedToken.mint),
                        new PublicKey(donationWalletAddress)
                    );

                    const transferInstruction = createTransferInstruction(
                        fromTokenAccount,
                        toTokenAccount,
                        publicKey,
                        donationAmount * 10 ** selectedToken.decimals,
                        [],
                        TOKEN_PROGRAM_ID
                    );
                    transaction.add(transferInstruction);
                }

                const signature = await sendTransaction(transaction, connection);

                const confirmation = await connection.confirmTransaction(signature, 'confirmed');

                // Prepare request body with correct field name
                const requestBody = {
                    originalToken: selectedToken.symbol.toUpperCase(),
                    originalTokenPrice: prices[selectedToken.symbol]?.usd || 0,
                    originalTokenQuantity: parseFloat(donationAmount),
                    usdcFunded: parseFloat(usdValue),
                    transactionId: signature, // Renamed to match backend expectation
                };

                // Record funding transaction in the backend
                const response = await fetch('http://localhost:5001/api/transactions/fund', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(requestBody),
                });

                let data;
                try {
                    data = await response.json();
                } catch (jsonError) {
                    console.error('Error parsing backend response as JSON:', jsonError);
                    data = { message: 'Invalid JSON response from server.' };
                }

                if (response.ok) {
                    setBalance((prevBalance) => prevBalance + parseFloat(usdValue));

                    alert(
                        `Successfully donated ${donationAmount} ${selectedToken.symbol.toUpperCase()}, which is  $${usdValue} USD!`
                    );
                } else {
                    console.error('Error recording transaction:', data.message || data.error || 'Unknown error');
                    alert('Failed to record the transaction on the server.');
                }
            } catch (error) {
                console.error('Error during donation:', error);
                alert('Failed to complete the donation.');
            }
        } else {
            alert('Please enter a valid donation amount.');
        }
    };

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" gutterBottom>
                    Donate To Fund Your Account
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Select</TableCell>
                            <TableCell>Token</TableCell>
                            <TableCell>Balance</TableCell>
                            <TableCell>USD Equivalent</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedTokens.map((token, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedToken?.mint === token.mint}
                                        onChange={() => handleTokenSelection(token)}
                                    />
                                </TableCell>
                                <TableCell>
                                    {token.symbol.toUpperCase() === 'SOLANA' ? (
                                        <img
                                            src="https://cryptologos.cc/logos/solana-sol-logo.png"
                                            alt="SOL Icon"
                                            style={{ width: 24 }}
                                        />
                                    ) : token.symbol.toUpperCase() === 'BONK' ? (
                                        <img src="/bonk-logo.png" alt="BONK Icon" style={{ width: 24 }} />
                                    ) : (
                                        token.symbol.toUpperCase()
                                    )}
                                </TableCell>
                                <TableCell>{token.balance.toFixed(2)}</TableCell>
                                <TableCell>${token.usdValue.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {selectedToken && (
                    <Box mt={4}>
                        <Typography variant="h6">
                            Donate {selectedToken.symbol.toUpperCase()}
                        </Typography>
                        <Box display="flex" alignItems="center" mt={2}>
                            <TextField
                                type="number"
                                value={donationAmount}
                                onChange={handleDonationAmountChange}
                                placeholder="Enter amount"
                                inputProps={{ min: 0 }}
                                sx={{ marginRight: 2, width: '200px' }}
                            />
                            <Typography variant="body1">
                                {donationAmount > 0 && prices[selectedToken.symbol]?.usd
                                    ? `$${(donationAmount * prices[selectedToken.symbol]?.usd).toFixed(2)} USD`
                                    : '$0.00 USD'}
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleDonation}
                                sx={{ marginLeft: 2 }}
                            >
                                Donate
                            </Button>
                        </Box>
                        {donationAmount > 0 && (
                            <Typography variant="body2" color="textSecondary" mt={1}>
                                You are donating {donationAmount} {selectedToken.symbol.toUpperCase()}, which
                                is approximately $
                                {(donationAmount * prices[selectedToken.symbol]?.usd).toFixed(2)} USD.
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
        </Container>
    );

};

export default DonateAndFundPage;

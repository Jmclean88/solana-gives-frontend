// DonateToCharityPage.js
import React, { useState, useContext } from 'react';
import { SGContext } from '../SGContext';
import {
    Container,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Button,
    Box,
} from '@mui/material';

const DonateToCharityPage = () => {
    const [selectedCharity, setSelectedCharity] = useState('');
    const [donationAmount, setDonationAmount] = useState('');
    const { balance, setBalance, authToken } = useContext(SGContext);

    const charities = [
        'United Way',
        'SPCA',
        'Canadian Mental Health Association',
        'Centre for Addiction and Mental Health',
        'The Nature Conservancy',
        'World Wildlife Fund',
        'Food Banks Canada',
        'Canadian Feed the Children',
        'Canadian Red Cross',
        'Canadian Cancer Society',
        'KidsHelpPhone',
    ];

    const handleCharityChange = (event) => {
        setSelectedCharity(event.target.value);
    };

    const handleDonationChange = (event) => {
        setDonationAmount(event.target.value);
    };

    const handleDonation = async () => {
        if (!selectedCharity) {
            alert('Please select a charity.');
            return;
        }
        if (donationAmount <= 0) {
            alert('Please enter a valid donation amount.');
            return;
        }
        if (donationAmount > balance) {
            alert('You do not have enough balance to make this donation.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/transactions/donate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    usdAmountDonated: parseFloat(donationAmount),
                    charity: selectedCharity,
                }),
            });

            const data = await response.json();
            console.log('Donation Response:', data);

            if (response.ok) {
                // Update the balance
                setBalance(prevBalance => prevBalance - parseFloat(donationAmount));
                alert(`Successfully donated $${donationAmount} to ${selectedCharity}`);
                // Reset selections
                setSelectedCharity('');
                setDonationAmount('');
            } else {
                console.error('Donation failed:', data.message);
                alert('Donation failed: ' + data.message);
            }
        } catch (error) {
            console.error('Error during donation:', error);
            alert('Failed to complete the donation.');
        }
    };

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" gutterBottom>
                    Grant to Charity
                </Typography>

                {/* Charity Dropdown */}
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel id="charity-select-label">Select Charity</InputLabel>
                    <Select
                        labelId="charity-select-label"
                        value={selectedCharity}
                        onChange={handleCharityChange}
                        label="Select Charity"
                    >
                        {charities.map((charity, index) => (
                            <MenuItem key={index} value={charity}>
                                {charity}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {/* Donation Amount Input */}
                <TextField
                    type="number"
                    label="Donation Amount (USD)"
                    variant="outlined"
                    fullWidth
                    value={donationAmount}
                    onChange={handleDonationChange}
                    inputProps={{ min: 0 }}
                    sx={{ mb: 2 }}
                />

                {/* Donate Button */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDonation}
                    disabled={!selectedCharity || donationAmount <= 0}
                    fullWidth
                >
                    Donate
                </Button>
            </Box>
        </Container>
    );

};

export default DonateToCharityPage;

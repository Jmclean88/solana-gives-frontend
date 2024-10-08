// TaxReceiptPage.js
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, TextField } from '@mui/material';

const TaxReceiptPage = () => {
    const location = useLocation();
    const { transaction } = location.state || {};

    const [donorName, setDonorName] = useState('');
    const [donorAddress, setDonorAddress] = useState('');

    if (!transaction) {
        return <div>No transaction data available.</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Print Styles */}
            <style>
                {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printableArea, #printableArea * {
              visibility: visible;
            }
            #printableArea {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            /* Optional: Adjust font sizes for print */
            #printableArea h2 {
              font-size: 24px;
            }
            #printableArea p {
              font-size: 16px;
            }
          }
        `}
            </style>

            <h2>Official Donation Receipt</h2>
            {/* Input Fields for Donor Information */}
            <TextField
                label="Donor Name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Donor Address"
                value={donorAddress}
                onChange={(e) => setDonorAddress(e.target.value)}
                fullWidth
                margin="normal"
            />
            {/* Receipt Content */}
            <div id="printableArea" style={{ marginTop: '20px' }}>
                <img
                    src={`${process.env.PUBLIC_URL}/Solana.png`}
                    alt="Solana Gives Logo"
                    style={{ width: '450px', marginBottom: '10px' }}
                />
                <p><strong>Organization Name:</strong> Solana Gives</p>
                <p><strong>Address:</strong> Solana HQ</p>
                <p><strong>Charitable Registration Number:</strong> THIS IS DEMO TAX RECIPT</p>
                <hr />
                <p><strong>Donor Name:</strong> {donorName || 'Donor Name'}</p>
                <p><strong>Donor Address:</strong> {donorAddress || 'Donor Address'}</p>
                <p><strong>Date of Donation:</strong> {new Date(transaction.dateTime).toLocaleDateString()}</p>
                <p><strong>Amount:</strong> ${transaction.usdAmountDonated || transaction.usdcFunded} USD</p>
                <p><strong>Eligible Amount:</strong> ${transaction.usdAmountDonated || transaction.usdcFunded} USD</p>
                <p><strong>Advantage Received:</strong> None</p>
                <p><strong>Recipt Number:</strong> 0000000000</p>
                <hr />
                <p>This receipt is issued is part of a Solana Hackathon and is not an real Tax Recipt</p>
            </div>
            <Button
                variant="contained"
                color="primary"
                onClick={() => window.print()}
                sx={{ marginTop: 2 }}
                disabled={!donorName || !donorAddress}
            >
                Print Receipt
            </Button>
        </div>
    );
};

export default TaxReceiptPage;

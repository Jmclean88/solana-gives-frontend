// TaxReceipt.js
import React, { useRef, useState } from 'react';
import { Button, TextField } from '@mui/material';
import { useReactToPrint } from 'react-to-print';

const TaxReceiptContent = ({ transaction, donorName, donorAddress }) => {
    console.log('TaxReceiptContent rendered');

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            {/* Your receipt content */}
            <h2>Official Donation Receipt</h2>
            <p><strong>Organization Name:</strong> Solana Gives</p>
            <p><strong>Address:</strong> [Organization Address]</p>
            <p><strong>Charitable Registration Number:</strong> [Registration Number]</p>
            <hr />
            <p><strong>Donor Name:</strong> {donorName || 'Donor Name'}</p>
            <p><strong>Donor Address:</strong> {donorAddress || 'Donor Address'}</p>
            <p><strong>Date of Donation:</strong> {new Date(transaction.dateTime).toLocaleDateString()}</p>
            <p><strong>Amount:</strong> ${transaction.usdAmountDonated || transaction.usdcFunded} USD</p>
            <p><strong>Description:</strong> {transaction.type === 'funding' ? 'Funding' : 'Donation'}</p>
            <p><strong>Transaction ID:</strong> {transaction.transactionId}</p>
            <p><strong>Eligible Amount:</strong> ${transaction.usdAmountDonated || transaction.usdcFunded} USD</p>
            <p><strong>Advantage Received:</strong> None</p>
            <p><strong>Authorized Signature:</strong> ______________________</p>
            <hr />
            <p>This receipt is issued under the Income Tax Act.</p>
        </div>
    );
};

const TaxReceipt = ({ transaction }) => {
    const [donorName, setDonorName] = useState('');
    const [donorAddress, setDonorAddress] = useState('');
    const componentRef = useRef(null);

    console.log('TaxReceipt rendered');

    const handlePrint = useReactToPrint({
        content: () => {
            console.log('handlePrint called');
            console.log('componentRef.current:', componentRef.current);
            return componentRef.current;
        },
        documentTitle: `TaxReceipt_${transaction.transactionId}`,
        onBeforePrint: () => console.log('onBeforePrint'),
        onAfterPrint: () => console.log('onAfterPrint'),
        onPrintError: (err) => console.error('Print error:', err),
    });
    console.log('handlePrint:', handlePrint);

    return (
        <div>
            {/* Input Fields for Name and Address */}
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
            <div ref={componentRef}>
                <TaxReceiptContent
                    transaction={transaction}
                    donorName={donorName}
                    donorAddress={donorAddress}
                />
            </div>

            <Button
                variant="contained"
                color="primary"
                onClick={() => {
                    console.log('Button clicked');
                    handlePrint();
                }}
                // Remove the 'disabled' prop temporarily
                sx={{ marginTop: 2 }}
            >
                Download Tax Receipt
            </Button>
        </div>
    );
};

export default TaxReceipt;
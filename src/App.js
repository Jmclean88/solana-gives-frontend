// App.js
import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SGContext, SGProvider } from './SGContext';
import LandingPage from './pages/LandingPage';
import DonateAndFundPage from './pages/DonateAndFundPage';
import DonateToCharityPage from './pages/DonateToCharityPage';
import TaxReceiptPage from './pages/TaxReceiptPage.js';
import Header from './components/Header';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SGProvider>
        <InnerApp />
      </SGProvider>
    </ThemeProvider>
  );
}

const InnerApp = () => {
  const { publicKey } = useWallet();
  const { setAuthToken } = useContext(SGContext);

  useEffect(() => {
    const authenticateUser = async (walletAddress) => {
      try {
        const response = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress }),
        });
        const data = await response.json();
        if (response.ok) {
          setAuthToken(data.token);
        } else {
          console.error('Authentication failed:', data.message);
          setAuthToken(null);
        }
      } catch (error) {
        console.error('Error during authentication:', error);
        setAuthToken(null);
      }
    };

    if (publicKey) {
      authenticateUser(publicKey.toBase58());
    } else {
      setAuthToken(null);
    }
  }, [publicKey, setAuthToken]);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/donate-and-fund" element={<DonateAndFundPage />} />
        <Route path="/donate-to-charity" element={<DonateToCharityPage />} />
        <Route path="/tax-receipt" element={<TaxReceiptPage />} />
      </Routes>
    </Router>
  );
};

export default App;

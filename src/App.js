import * as React from "react";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import TopNav from './components/TopNav'
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import IndexPage from './pages/index';
import SignInPage from './pages/sign-in';
import SignUpPage from './pages/sign-up';
import ErrorPage from './pages/error';
import SuccessPage from './pages/success';
import SettingsPage from './pages/settings';
import { lightTheme, darkTheme } from './theme';
import { useCookies } from 'react-cookie';
import { updateUser } from './helpers/api';

function App() {
  const [cookies] = useCookies();
  const [user, setUser] = React.useState(null);
  const [darkMode, setDarkMode] = React.useState(() => {
    try {
      const stored = localStorage.getItem('darkMode');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    if (user && typeof user.dark_mode === 'boolean') {
      setDarkMode(user.dark_mode);
      localStorage.setItem('darkMode', JSON.stringify(user.dark_mode));
    }
  }, [user]);

  const handleToggleTheme = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    if (user && cookies.token) {
      try {
        const res = await updateUser(cookies.token, { dark_mode: newDarkMode });
        if (!res.ok) {
          console.error('Failed to save theme to server:', res.status, await res.text());
        }
      } catch (err) {
        console.error('Failed to save theme preference:', err);
      }
    }
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <BrowserRouter basename="/">
        <TopNav user={user} setUser={setUser} darkMode={darkMode} handleToggleTheme={handleToggleTheme} />
        <Routes >
          <Route path="/" element={<IndexPage user={user} setUser={setUser} />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

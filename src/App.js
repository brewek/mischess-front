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
import { lightTheme, darkTheme } from './theme';

function App() {
  const [user, setUser] = React.useState(null);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <BrowserRouter basename="/">
        <TopNav user={user} setUser={setUser} darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes >
          <Route path="/" element={<IndexPage user={user} setUser={setUser} />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

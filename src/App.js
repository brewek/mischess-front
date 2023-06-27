import * as React from "react";
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

const apiUrl = "https://api.the226.pl";

function App() {
  const [user, setUser] = React.useState(null);

  return (
    <>
      <BrowserRouter basename="/">
        <TopNav user={user} setUser={setUser} />
        <Routes >
          <Route path="/" element={<IndexPage user={user} setUser={setUser} />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

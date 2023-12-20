import { Navigate, BrowserRouter, Route, Routes } from 'react-router-dom';
import Editor from './pages/Editor';
import Signin from './pages/Signin';
import Login from './pages/Login';
import { useState } from 'react';

const AppRouter = () => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loggedInId, setLoggedInId] = useState<string>('');

  const handleLogin = (
    loggedInId: string,
  ) => {
    setLoggedInId(loggedInId);
    setLoggedIn(true);
  };
  const handleLogout = () => {
    setLoggedInId('');
    setLoggedIn(false);
  };

  console.log(`Loggedin? ${loggedIn}`);

  const TokenProps = { loggedInId };
  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route
            path="/editor/"
            element={
              loggedIn ? (
                <Editor TokenProps={TokenProps} onLogout={handleLogout} />
              ) : (
                <Navigate replace to="/login/" />
              )
            }
          />
          <Route path="/login/" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup/" element={<Signin />} />
          <Route path="/" element={<Navigate to="/editor/" />} />
          
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default AppRouter;

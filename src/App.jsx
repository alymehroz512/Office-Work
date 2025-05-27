import React from 'react';
import { useSelector } from 'react-redux';
import SignInForm from './components/SignInForm'; 
import DashboardLayout from './components/DashboardLayout'; 
import './index.css'

const App = () => {
  // const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.token);

  return (
    <>
      {token ? <DashboardLayout /> : <SignInForm />}
    </>
  );
};

export default App;

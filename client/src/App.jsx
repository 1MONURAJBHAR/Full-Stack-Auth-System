import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Emailverify from './pages/Emailverify'
import Home from './pages/Home'
import Login from './pages/Login'
import ResetPassword from './pages/resetPassword'
import { ToastContainer } from "react-toastify";
   
const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verify" element={<Emailverify />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
      </Routes>
    </div>
  );
}

export default App

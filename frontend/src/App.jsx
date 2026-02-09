import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from './pages/auth/Auth.jsx'
import Landing from './pages/Landing.jsx'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Auth />} />
          <Route path="/User" element={<Auth />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App


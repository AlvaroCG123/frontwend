import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Login } from "./pages/Login"
import { Recepcao } from "./pages/Recepcao"
import { Dashboard } from "./pages/Dashboard"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Login"/>}/>

        <Route path="/login" element={<Login />}/>
        <Route path="/Recepcao" element={<Recepcao/>}/>
        <Route path="/Dashboard" element={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App

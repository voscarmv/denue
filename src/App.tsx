import './App.css'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MapWithTable from "./Map";
function App() {
  return (
    <BrowserRouter basename="/daniel">
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link to="/">Inicio</Link>
        <Link to="/about">Acerca de</Link>
        <Link to="/map">Map</Link> 
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/map" element={<MapWithTable />} />
      </Routes>
    </BrowserRouter>
  )
}
function Home() {
  return <h1>Home page in /daniel/</h1>;
}

function About() {
  return <h1>About page in /daniel/about</h1>;
}
export default App

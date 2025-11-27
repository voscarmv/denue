import './App.css'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import MapWithTable from "./Map";
import MapPage from "./Map2";
import MapPage3 from "./Map3";
function App() {
  return (
    <BrowserRouter basename="/daniel">
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link to="/">Inicio</Link>
        <Link to="/about">Acerca de</Link>
        <Link to="/map">Map</Link> 
        <Link to="/map2">Map2</Link>
        <Link to="/map3">Map3++</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/map" element={<MapWithTable />} />
        <Route path="/map2" element={<MapPage />} />
        <Route path="/map3" element={<MapPage3 />} />
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

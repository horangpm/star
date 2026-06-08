import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import CosmosBackground from './components/CosmosBackground';
import Home from './pages/Home';
import Shape from './pages/Shape';
import Star from './pages/Star';
import Saju from './pages/Saju';
import './index.css';

function App() {
  return (
    <Router basename="/star">
      <CosmosBackground />
      <Header />
      <div style={{ position: 'relative', zIndex: 1, paddingTop: '80px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shape" element={<Shape />} />
          <Route path="/star" element={<Star />} />
          <Route path="/saju" element={<Saju />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

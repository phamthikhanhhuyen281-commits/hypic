import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Speaking from './pages/Speaking';
import Listening from './pages/Listening';
import Writing from './pages/Writing';
import Lexivault from './pages/Lexivault';
import Planner from './pages/Planner';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/speaking" element={<Speaking />} />
          <Route path="/listening" element={<Listening />} />
          <Route path="/writing" element={<Writing />} />
          <Route path="/lexivault" element={<Lexivault />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  );
}

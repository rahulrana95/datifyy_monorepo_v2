/**
 * Datifyy App
 * Main application component with routing
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from './providers/ChakraProvider';
import { LandingPage } from './pages/LandingPage';
import { ThemePreview } from './pages/ThemePreview/ThemePreview';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/theme-components" element={<ThemePreview />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;

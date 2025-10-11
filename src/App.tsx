import { useState } from 'react';
import { Outlet } from 'react-router';
import FloatingDock from './components/common/FloatingDock';
import { LayoutContext } from './context/LayoutContext';
import { AppDataProvider } from './context/DataContext';

function App() {
  const [layout, setLayout] = useState('grid');

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      <AppDataProvider>
        <main className="grid min-h-screen">
          {/* Persistent dock, theme, and global UI here */}
          <FloatingDock />
          <Outlet />
        </main>
      </AppDataProvider>
    </LayoutContext.Provider>
  );
}

export default App;

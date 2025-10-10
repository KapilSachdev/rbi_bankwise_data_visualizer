import { Suspense, useState } from 'react';
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
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <Outlet />
          </Suspense>
        </main>
      </AppDataProvider>
    </LayoutContext.Provider>
  );
}

export default App;

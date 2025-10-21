import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';
import App from './App';
import Loading from './components/common/Loading';
import CreditCardDashboard from './components/CreditCardDashboard';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import './index.css';

const BankProfileDashboard = lazy(() => import('./components/BankProfileDashboard'));
const FilterLab = lazy(() => import('./components/FilterLab'));
const SVGLab = lazy(() => import('./components/SVGLab'));

const router = createHashRouter([
  {
    path: '/',
    element: <App />, // root layout loads data and shows Outlet
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Home /> },
      { path: 'cards', element: <CreditCardDashboard /> },
      { path: 'bank_profile', element: <BankProfileDashboard /> },
      { path: 'filter_lab', element: <FilterLab /> },
      { path: 'svg_lab', element: <SVGLab /> },
    ],
  },
]);

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Suspense fallback={<Loading />}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>
);

import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';
import './index.css';
import App from './App';

const Dashboard = lazy(() => import('./components/Dashboard'));
const CreditCardDashboard = lazy(() => import('./components/CreditCardDashboard'));
const BankProfileDashboard = lazy(() => import('./components/BankProfileDashboard'));
const FilterLab = lazy(() => import('./components/FilterLab'));
const SVGLab = lazy(() => import('./components/SVGLab'));

const router = createHashRouter([
  {
    path: '/',
    element: <App />, // root layout loads data and shows Outlet
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'cards', element: <CreditCardDashboard /> },
      { path: 'bank_profile', element: <BankProfileDashboard /> },
      { path: 'filter_lab', element: <FilterLab /> },
      { path: 'svg_lab', element: <SVGLab /> },
    ],
  },
]);

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

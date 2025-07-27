// src/constants/bankProfiles.ts
// Extended bank profiles for runtime use in dashboards and UI

export interface Bank {
  shortName: string;
  primaryName: string;
  type: string;
  image?: string; // e.g. 'bob.svg' (add SVGs to src/assets/icons/)
  color?: string; // e.g. '#0057B7' (for theming)
  website?: string;
  customerCare?: Array<{
    type: string; // e.g., 'Toll-Free', 'Email', 'Branch'
    value: string;
    hours?: string;
    notes?: string;
  }>;
  grievanceMatrix?: Array<{
    level: string; // e.g., 'Branch', 'Nodal Officer', 'Principal Nodal Officer', 'Ombudsman'
    contact: string;
    email?: string;
    phone?: string;
    escalationUrl?: string;
    notes?: string;
  }>;
}

export const BANKS: Record<string, Bank> = {
  BOB: {
    shortName: 'BOB',
    primaryName: 'BANK OF BARODA',
    type: 'Public Sector Banks',
    image: 'bob.svg',
    color: '#0057B7',
    website: 'https://www.bankofbaroda.in/',
    customerCare: [
      {
        type: 'Toll-Free',
        value: '1800 102 4455',
        notes: 'General customer care',
      },
      // Add more as needed
    ],
    grievanceMatrix: [
      {
        level: 'Branch',
        contact: 'Contact your branch manager',
      },
      {
        level: 'Nodal Officer',
        contact: 'Mr. XYZ',
        email: 'nodalofficer@bankofbaroda.com',
        phone: '022-12345678',
        escalationUrl: 'https://www.bankofbaroda.in/grievance-redressal',
        notes: 'Escalate if not resolved at branch',
      },
      // Add more as needed
    ],
  },
  HDFC: {
    shortName: 'HDFC',
    primaryName: 'HDFC BANK LTD',
    type: 'Private Sector Banks',
    image: 'hdfc.svg',
    color: '#003366',
    website: 'https://www.hdfcbank.com/',
    customerCare: [
      {
        type: 'Toll-Free',
        value: '1800 202 6161',
      },
    ],
    grievanceMatrix: [
      {
        level: 'Branch',
        contact: 'Contact your branch manager',
      },
      {
        level: 'Nodal Officer',
        contact: 'Ms. ABC',
        email: 'nodalofficer@hdfcbank.com',
        phone: '022-98765432',
        escalationUrl: 'https://www.hdfcbank.com/personal/help/grievance-redressal',
      },
    ],
  },
  SBI: {
    shortName: 'SBI',
    primaryName: 'STATE BANK OF INDIA',
    type: 'Public Sector Banks',
    image: 'sbi.svg',
    color: '#00B2E3',
    website: 'https://www.onlinesbi.com/',
    customerCare: [
      {
        type: 'Toll-Free',
        value: '1800 425 3800',
      },
    ],
    grievanceMatrix: [
      {
        level: 'Branch',
        contact: 'Contact your branch manager',
      },
      {
        level: 'Principal Nodal Officer',
        contact: 'Mr. DEF',
        email: 'pno@sbi.co.in',
        phone: '022-33445566',
        escalationUrl: 'https://www.sbi.co.in/web/customer-care/grievance-redressal',
      },
    ],
  },
  ICICI: {
    shortName: 'ICICI',
    primaryName: 'ICICI BANK LTD',
    type: 'Private Sector Banks',
    image: 'icici.svg',
    color: '#F47B20',
    website: 'https://www.icicibank.com/',
    customerCare: [
      {
        type: 'Toll-Free',
        value: '1800 200 3344',
      },
    ],
    grievanceMatrix: [
      {
        level: 'Branch',
        contact: 'Contact your branch manager',
      },
      {
        level: 'Principal Nodal Officer',
        contact: 'Mr. GHI',
        email: 'nodalofficer@icicibank.com',
        phone: '022-55667788',
        escalationUrl: 'https://www.icicibank.com/grievance-redressal',
      },
    ],
  },
};

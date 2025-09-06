// Global project types and interfaces

import type { EChartsType } from 'echarts';

// Infrastructure and Bank Data
export interface BankInfrastructure {
  ATMs_CRMs: {
    On_site: number;
    Off_site: number;
  };
  PoS: number;
  Micro_ATMs: number;
  Bharat_QR_Codes: number;
  UPI_QR_Codes: number;
  Credit_Cards: number;
  Debit_Cards: number;
}

/**
 * Common structure for transaction details (Volume, Value)
 */
export interface TxnDetail {
  Volume: number;
  Value: number;
}

/**
 * Cash withdrawal details (ATM and optional PoS)
 */
export interface CashWithdrawal {
  At_ATM: TxnDetail;
  At_PoS?: TxnDetail;
}

/**
 * Cash withdrawal details for credit card (ATM only)
 */
export interface CreditCardCashWithdrawal {
  At_ATM: TxnDetail;
}

/**
 * Cash withdrawal details for debit card (ATM and optional PoS)
 */
export interface DebitCardCashWithdrawal {
  At_ATM: TxnDetail;
  At_PoS?: TxnDetail;
}

/**
 * Card payment transactions for a bank
 */
export interface CardPaymentsTransactions {
  Credit_Card: {
    at_PoS: TxnDetail;
    Online_ecom: TxnDetail;
    Others: TxnDetail;
    Cash_Withdrawal: CreditCardCashWithdrawal;
  };
  Debit_Card: {
    at_PoS: TxnDetail;
    Online_ecom: TxnDetail;
    Others: TxnDetail;
    Cash_Withdrawal: DebitCardCashWithdrawal;
  };
}

export interface BankData {
  Bank_Type: string;
  Sr_No: number;
  Bank_Name: string;
  Bank_Short_Name?: string;
  Infrastructure: BankInfrastructure;
  Card_Payments_Transactions?: CardPaymentsTransactions;
}

// NEFT Data
export interface NeftData {
  Sr_No: number;
  Bank_Name: string;
  Bank_Short_Name: string;
  Bank_Type: string;
  Received_Inward_Credits: {
    No: number;
    Amount: number;
  };
  Total_Outward_Debits: {
    No: number;
    Amount: number;
  };
}

// RTGS Data
export interface RtgsData {
  Sr_No: number;
  Bank_Name: string;
  Bank_Short_Name: string;
  Bank_Type: string;
  Outward_Transactions: {
    No: number;
    Amount: number;
  };
  Inward_Transactions: {
    No: number;
    Amount: number;
  };
}

// Mobile Banking Data
export interface MobileBankingData {
  Sr_No: number;
  Bank_Name: string;
  Bank_Short_Name: string;
  Bank_Type: string;
  Volume: number;
  Value: number;
  Active_Customers: number;
}

// Internet Banking Data
export interface InternetBankingData {
  Sr_No: number;
  Bank_Name: string;
  Bank_Short_Name: string;
  Bank_Type: string;
  Volume: number;
  Value: number;
  Active_Customers: number;
}

// Digital Banking Data Structure
export interface DigitalBankingData {
  NEFT?: NeftData[];
  RTGS?: RtgsData[];
  Mobile_Banking?: MobileBankingData[];
  Internet_Banking?: InternetBankingData[];
}

export interface MonthlyBankData {
  month: string; // e.g., '2025-03'
  banks: BankData[];
}

// Common type for monthly data maps
export type MonthlyBankDataMap = Record<string, BankData[]>;

// Credit Card Time Series
export interface CreditCardTimeSeries {
  bank: string;
  values: { month: string; creditCards: number }[];
}

export interface CreditCardTimeSeriesChartProps {
  data: CreditCardTimeSeries[];
  months: string[];
}

// Infra Bar Chart
export interface BankInfraBarChartProps {
  allData: MonthlyBankDataMap;
  months: string[];
  chartRef?: { current: EChartsType | null };
}

// DataFilter
export interface DataFilterProps {
  months?: string[];
  bankTypes?: string[];
  selectedMonth?: string;
  selectedBankType?: string;
  onMonthChange?: (month: string) => void;
  onBankTypeChange?: (type: string) => void;
  filters?: {
    month?: boolean;
    bankType?: boolean;
  };
}

// Bank Profile Dashboard
export interface BankProfileDashboardProps {
  posBanksData: MonthlyBankDataMap;
  digitalBankingData: {
    [month: string]: DigitalBankingData;
  };
  months: string[];
  rtgsBanksData?: { [month: string]: RtgsData[] };
  mobileBanksData?: { [month: string]: MobileBankingData[] };
  internetBanksData?: { [month: string]: InternetBankingData[] };
}

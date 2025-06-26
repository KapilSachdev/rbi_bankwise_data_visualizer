// Global project types and interfaces

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

export interface MonthlyBankData {
  month: string; // e.g., '2025-03'
  banks: BankData[];
}

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
export interface ATMData {
  Bank_Type: string;
  Bank_Name: string;
  Bank_Short_Name: string;
  Infrastructure: BankInfrastructure;
}

export interface BankInfraBarChartProps {
  data: ATMData[];
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

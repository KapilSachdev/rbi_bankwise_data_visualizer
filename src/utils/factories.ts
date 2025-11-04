import { CardPaymentsTransactions, Card, TxnDetail, CashWithdrawal } from '../types/global.types';

// Helper to create a default TxnDetail
export function createTxnDetail(): TxnDetail {
  return { Volume: 0, Value: 0 };
}

// Helper to create a default CashWithdrawal
export function createCashWithdrawal(): CashWithdrawal {
  return { At_ATM: createTxnDetail(), At_PoS: createTxnDetail(), Total: createTxnDetail() };
}

// Helper to create a default Card
export function createCard(): Card {
  return {
    at_PoS: createTxnDetail(),
    Online_ecom: createTxnDetail(),
    Others: createTxnDetail(),
    Cash_Withdrawal: createCashWithdrawal(),
    Total: createTxnDetail(),
  };
}

// Factory function to create a default CardPaymentsTransactions object
export function createCardPaymentsTransactions(): CardPaymentsTransactions {
  return {
    Credit_Card: createCard(),
    Debit_Card: createCard(),
  };
}

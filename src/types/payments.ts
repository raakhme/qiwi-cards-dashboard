export interface PaymentTransactionData {
  account: string;
  comment: string;
  commission: {
    amount: number;
    currency: number;
  };
  currencyRate: number;
  date: string;
  error: string;
  errorCode: number;
  personId: number;
  provider: {
    description: string;
    extras: Array<{
      key: string;
      value: string;
    }>;
    id: number;
    keys: string;
    logoUrl: string;
    longName: string;
    shortName: string;
    siteUrl: string;
  };
  source: {
    description: string;
    extras: Array<{
      key: string;
      value: string;
    }>;
    id: number;
    keys: string;
    logoUrl: string;
    longName: string;
    shortName: string;
    siteUrl: string;
  };
  view: { title: string; account: string };
  status: "SUCCESS" | "WAITING" | "ERROR";
  statusText: string;
  sum: {
    amount: number;
    currency: number;
  };
  total: {
    amount: number;
    currency: number;
  };

  trmTxnId: string;
  txnId: number;
  type: "ALL" | "IN" | "OUT" | "QIWI_CARD";
}

export interface PaymentsFilters {
  operation: "ALL" | "IN" | "OUT" | "QIWI_CARD";
  rows: number;
  sources: Array<"QW_RUB" | "QW_USD" | "QW_EUR" | "CARD" | "MK">;
  startDate: string;
  endDate: string;
  nextTxnDate?: string;
  nextTxnId?: number;
}

export const PaymentStatusColors = {
  SUCCESS: "green",
  WAITING: "yellow",
  ERROR: "red",
};

export const PaymentStatusTranslates = {
  SUCCESS: "Успешно",
  WAITING: "Ожидает",
  ERROR: "Ошибка",
};

export const PaymentTypeTranslates = {
  ALL: "Все",
  IN: "Пополнение",
  OUT: "Платеж",
  QIWI_CARD: "Платеж с карты",
};

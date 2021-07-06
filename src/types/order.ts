import { CardType } from "./card";

export interface CreateOrderResponse {
  id: string;
  cardAlias: CardType;
  status: "DRAFT";
  price: null;
  cardId: null;
}

export interface ConfirmedOrderResponse {
  id: string;
  cardAlias: CardType;
  status: "COMPLETED";
  price: {
    amount: number;
    currency: number;
  };
  cardId: string | null;
}

export interface PaymentInfo {
  id: string;
  terms: string;
  fields: {
    account: string;
  };
  sum: {
    amount: number;
    currency: string;
  };
  transaction: {
    id: string;
    state: {
      code: string;
    };
  };
  source: string;
  comment: string | null;
}

export const OrderPrice = {
  "qvc-cpa": 99,
  "qvc-cpa-debit": 199,
};

export const OrderPriceTranslate = {
  "qvc-cpa": "QIWI Мастер Prepaid",
  "qvc-cpa-debit": "QIWI Мастер Debit",
};

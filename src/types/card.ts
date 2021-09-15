export type CardType = "qvc-cpa" | "qvc-cpa-debit";

export type CardStatus =
  | "ACTIVE"
  | "SENDED_TO_BANK"
  | "SENDED_TO_USER"
  | "BLOCKED"
  | "UNKNOWN";

export interface QiwiCard {
  qvx: {
    id: number;
    maskedPan: string;
    status: CardStatus;
    cardExpire: string;
    cardType: "VIRTUAL";
    cardAlias: string;
    cardLimit: {
      value: number;
      currencyCode: number;
    } | null;
    activated: string;
    smsResended: string;
    blockedDate: string;
    unblockAvailable: boolean;
    txnId: string;
    cardExpireMonth: string;
    cardExpireYear: string;
  };
  balance: {
    amount: number;
    currency: number;
  } | null;
  info: {
    id: number;
    name: string;
    alias: CardType;
    price: {
      amount: number;
      currency: number;
    };
    period: string;
    tariffLink: string;
    offerLink: string;
    requisites: { name: string; value: string }[];
  };
}

export const CardStatusColors = {
  ACTIVE: "green",
  SENDED_TO_BANK: "yellow",
  SENDED_TO_USER: "blue",
  BLOCKED: "red",
  UNKNOWN: "neutral",
};

export const CardStatusTranslates = {
  ACTIVE: "Активная",
  SENDED_TO_BANK: "Отправлена в банк",
  SENDED_TO_USER: "Отправлена к вам",
  BLOCKED: "Заблокирована",
  UNKNOWN: "Неизвестно",
};

export interface CardSecrets {
  pan: string;
  cvv: string;
}

export const CardFilterStatuses = [
  { label: "Активные", value: "ACTIVE" },
  { label: "Заблокированые", value: "BLOCKED" },
  // { label: "Отправлены в банк", value: "SENDED_TO_BANK" },
  // { label: "Отправлены в вам", value: "SENDED_TO_USER" },
  // { label: "Неизвестно", value: "UNKNOWN" },
];

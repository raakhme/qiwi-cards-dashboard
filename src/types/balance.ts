export const BalanceCurrencies = {
  rub: 643,
  usd: 840,
  eur: 978,
};

export const BalanceCurrenciesTrans = {
  [BalanceCurrencies.rub]: "₽",
  [BalanceCurrencies.usd]: "$",
  [BalanceCurrencies.eur]: "€",
};

export interface Balance {
  alias: string;
  fsAlias: string;
  bankAlias: string;
  title: string;
  defaultAccount: boolean;
  type: {
    id: string;
    title: string;
  };
  hasBalance: boolean;
  balance: {
    amount: number;
    currency: number;
  } | null;
  currency: number;
}

export interface BalancesResponse {
  accounts: Balance[];
}

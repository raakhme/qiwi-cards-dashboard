export interface StatisticsPaymentResponse {
  incomingTotal: {
    amount: number;
    currency: number;
  }[];
  outgoingTotal: {
    amount: number;
    currency: number;
  }[];
}

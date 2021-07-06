export interface AuthInfo {
  authInfo: {
    boundEmail: string;
    ip: string;
    lastLoginDate: string;
    mobilePinInfo: {
      lastMobilePinChange: string;
      mobilePinUsed: boolean;
      nextMobilePinChange: string;
    };
    passInfo: {
      lastPassChange: string;
      nextPassChange: string;
      passwordUsed: boolean;
    };
    personId: number;
    pinInfo: {
      pinUsed: boolean;
    };
    registrationDate: string;
  };
  contractInfo: {
    blocked: boolean;
    contractId: number;
    creationDate: string;
    features: [];
    identificationInfo: [
      {
        bankAlias: string;
        identificationLevel: string;
      }
    ];
  };
  userInfo: {
    defaultPayCurrency: number;
    defaultPaySource: number;
    email: string | null;
    firstTxnId: number;
    language: string;
    operator: string;
    phoneHash: string;
    promoEnabled: boolean | null;
  };
}

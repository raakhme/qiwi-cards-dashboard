import { qiwiApiPath } from "../config/constants";
import {
  BalancesResponse,
  CardSecrets,
  ConfirmedOrderResponse,
  CreateOrderResponse,
  OrderPrice,
  PaymentInfo,
  QiwiCard,
} from "../types";
import { AuthInfo } from "../types/auth";
import _merge from "lodash/merge";
import qs from "query-string";
import _random from "lodash/random";

import { v4 as uuid } from "uuid";

import { toaster } from "evergreen-ui";
import { toUTCISODate } from "./date";
import { endOfDay, sub } from "date-fns";
import { StatisticsPaymentResponse } from "../types/statistics";
import { PaymentsFilters, PaymentTransactionData } from "../types/payments";

type FetchParams = Omit<Partial<RequestInit>, "url" | "body"> & {
  body?: string;
  type?: "json" | "blob" | "arrayBuffer" | "text";
  query?: Record<string, any>;
};

export class QiwiApiClass {
  private _authInfo: AuthInfo | null = null;
  private proxy: boolean = true;

  private token: string = localStorage.getItem("qiwi-token") || "";
  private personId: string = localStorage.getItem("qiwi-personId") || "";

  constructor() {}

  protected path(path: string, query?: Record<string, any>) {
    const basePath = this.proxy ? window.location.origin : qiwiApiPath;

    return qs.stringifyUrl({
      url: `${basePath}${`/${
        path.startsWith("/") ? path.slice(1) || "" : path
      }`}`,
      query,
    });
  }

  public clearAuth() {
    this.setToken("");
    this.setPersonId("");
    this.setAuthInfo(null);
  }

  public setAuthInfo(authInfo: AuthInfo | null) {
    this._authInfo = authInfo;
  }

  public getAuthInfo() {
    return this._authInfo;
  }

  public setToken(token: string) {
    this.token = token;
    localStorage.setItem("qiwi-token", token);
  }

  public setPersonId(personId: string) {
    this.personId = personId;
    localStorage.setItem("qiwi-personId", personId);
  }

  public getHeaders(headers: Record<string, string>) {
    return new Headers(headers);
  }

  async fetch(path: string, params?: FetchParams) {
    const defaultParams: FetchParams = {
      type: "json",
      mode: "cors",
    };
    params = _merge(defaultParams, params);
    const resp = await fetch(this.path(path, params.query), {
      ...params,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + this.token,
        Origin: window.location.origin,
        ...params.headers,
      },
    });
    if (resp.ok) {
      try {
        if (params?.type === "json") {
          return await resp.json();
        } else if (params?.type === "blob") {
          return await resp.blob();
        } else if (params?.type === "arrayBuffer") {
          return await resp.arrayBuffer();
        } else if (params?.type === "text") {
          return await resp.text();
        }
      } catch (err) {
        console.error(err);
        return null;
      }
    } else {
      try {
        const result = await resp.json();
        if (result.serviceName) {
          toaster.danger(result.userMessage, { id: "qiwi-error" });
        }
        return null;
      } catch (err) {
        throw err;
      }
    }
  }

  public async getCards() {
    const list: QiwiCard[] = await this.fetch("/cards/v1/cards", {
      method: "GET",
      query: {
        "vas-alias": "qvc-master",
      },
    });
    return list;
  }

  public async checkToken(token: string): Promise<AuthInfo | false> {
    try {
      const info: AuthInfo = await this.fetch(
        "/person-profile/v1/profile/current",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return info;
    } catch (err) {
      return false;
    }
  }

  // public async auth(token: string) {
  //   const info: AuthInfo = await this.fetch(
  //     "/person-profile/v1/profile/current",
  //     {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }
  //   );
  //   this._authInfo = info;
  //   return info;
  // }

  public async blockCard(qiwiCard: QiwiCard) {
    const { qvx } = qiwiCard;
    const { _authInfo } = this;
    try {
      await this.fetch(
        `/cards/v2/persons/${_authInfo?.authInfo.personId}/cards/${qvx.id}/block`,
        {
          method: "PUT",
        }
      );
      toaster.success("?????????? ???????? ?????????????? ??????????????????????????", {
        id: "success-blocked",
      });
    } catch (err) {
      toaster.danger("???? ?????????????? ?????????????????????????? ??????????", { id: "error-blocked" });
    }
  }

  public async unblockCard(qiwiCard: QiwiCard) {
    const { qvx } = qiwiCard;
    const { _authInfo } = this;
    try {
      await this.fetch(
        `/cards/v2/persons/${_authInfo?.authInfo.personId}/cards/${qvx.id}/unblock`,
        {
          method: "PUT",
        }
      );
      toaster.success("?????????? ???????? ?????????????? ????????????????????????????", {
        id: "success-unlocked",
      });
    } catch (err) {
      toaster.danger("???? ?????????????? ???????????????????????????? ??????????", {
        id: "error-unlocked",
      });
    }
  }

  public async fetchCardSecret(qiwiCard: QiwiCard) {
    return (await this.fetch(`/cards/v1/cards/${qiwiCard.qvx.id}/details`, {
      method: "PUT",
      body: JSON.stringify({
        operationId: uuid(),
      }),
    })) as CardSecrets;
  }

  public async createOrder(cardAlias: QiwiCard["info"]["alias"]) {
    const { _authInfo } = this;

    try {
      let order: any = await this.fetch(
        `/cards/v2/persons/${_authInfo?.authInfo.personId}/orders`,
        {
          body: JSON.stringify({ cardAlias }),
          method: "POST",
        }
      );

      if (order.status === "DRAFT") {
        order = await this.confirmOrder(order);
      } else {
        throw new Error();
      }

      if (order.status === "PAYMENT_REQUIRED") {
        toaster.success(`?????????? ???????? ?????????????? ????????????????`);
        return await this.payOrder(order);
      } else {
        throw new Error();
      }
    } catch (err) {
      toaster.danger(
        `?????? ?????????????? ?????????? ${OrderPrice[cardAlias]}??? ???????????????? ????????????`
      );
    }
  }

  public async confirmOrder(order: CreateOrderResponse) {
    const { _authInfo } = this;
    const result: ConfirmedOrderResponse = await this.fetch(
      `/cards/v2/persons/${_authInfo?.authInfo.personId}/orders/${order.id}/submit`,
      {
        method: "PUT",
      }
    );
    return result;
  }

  public async payOrder(order: ConfirmedOrderResponse) {
    const { _authInfo } = this;

    const result: PaymentInfo = await this.fetch(
      `/sinap/api/v2/terms/32064/payments`,
      {
        method: "POST",
        body: JSON.stringify({
          id: `15661800${_random(10000, 99999)}`,
          sum: {
            amount: order.price.amount,
            currency: "643",
          },
          fields: {
            account: `${_authInfo?.authInfo.personId}`,
            order_id: order.id,
          },
          paymentMethod: {
            type: "Account",
            accountId: "643",
          },
        }),
      }
    );

    return result;
  }

  public async renameCard(qiwiCard: QiwiCard, alias: string) {
    try {
      const result = await this.fetch(
        `/cards/v1/cards/${qiwiCard.qvx.id}/alias`,
        {
          body: JSON.stringify({
            alias,
          }),
          method: "PUT",
        }
      );
      if (result.status === "OK") {
        toaster.success(
          `?????????? ${qiwiCard.qvx.maskedPan} ?????????????? ??????????????????????????`,
          { id: "success-rename" }
        );
      } else {
        toaster.danger(
          `???????????????? ???????????? ?????? ???????????????????????????? ?????????? ${qiwiCard.qvx.maskedPan}`,
          { id: "error-rename" }
        );
      }
    } catch (err) {
      console.log(err);
      toaster.danger(
        `???????????????? ???????????? ?????? ???????????????????????????? ?????????? ${qiwiCard.qvx.maskedPan}`,
        { id: "error-rename" }
      );
    }
  }

  public async paymentHistory(
    qiwiCard: QiwiCard,
    dateFrom: Date,
    dateTo: Date
  ) {
    const { _authInfo } = this;
    const { qvx } = qiwiCard;
    const result = await this.fetch(
      `/payment-history/v1/persons/${_authInfo?.authInfo.personId}/cards/${qvx.id}/statement`,
      {
        type: "blob",
        query: {
          from: toUTCISODate(dateFrom),
          till: toUTCISODate(dateTo),
        },
        headers: {
          "Content-Type": "application/pdf",
          Accept: "application/pdf",
        },
      }
    );
    if (result) {
      const fileURL = URL.createObjectURL(result);
      window.open(fileURL);
    }
  }

  public async payments(filters: PaymentsFilters) {
    return (await this.fetch(
      `/payment-history/v2/persons/${this.personId}/payments`,
      { query: filters }
    )) as {
      data: PaymentTransactionData[];
      nextTxnId: number;
      nextTxnDate: string;
    };
  }

  public async paymentStats(
    filters: Pick<
      PaymentsFilters,
      "sources" | "operation" | "startDate" | "endDate"
    >
  ) {
    const { _authInfo } = this;
    const result = await this.fetch(
      `/payment-history/v2/persons/${this.personId}/payments/total`,
      {
        method: "GET",
        type: "json",
        query: filters,
      }
    );
    return result as StatisticsPaymentResponse;
  }

  public async getBalances() {
    const result: BalancesResponse = await this.fetch(
      `/funding-sources/v2/persons/${this.personId}/accounts`
    );
    return result;
  }

  public async getStatistics(dateFrom: Date, dateTo: Date) {
    const result = await this.fetch(
      `/payment-history/v2/persons/${this.personId}/payments/total`,
      {
        method: "GET",
        type: "json",
        query: {
          startDate: toUTCISODate(dateFrom),
          endDate: toUTCISODate(dateTo),
        },
      }
    );
    return result;
  }

  public async getStatisticsByLastWeek() {
    const dateFrom = endOfDay(sub(new Date(), { days: 7 }));
    const dateTo = new Date();
    const result: StatisticsPaymentResponse = await this.getStatistics(
      dateFrom,
      dateTo
    );
    return result;
  }
}

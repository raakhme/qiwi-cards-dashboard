import { qiwiApiPath } from "../config/constants";
import axios, { AxiosRequestConfig } from "axios";
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

type FetchParams = Omit<Partial<RequestInit>, "url" | "body"> & {
  body?: string;
  type?: "json" | "blob" | "arrayBuffer" | "text";
  query?: Record<string, any>;
};

export class QiwiApi {
  private static _token: string = "";
  private static _authInfo: AuthInfo | null = null;
  private static proxy: boolean = true;
  private static axios = axios.create({
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  protected static path(path: string, query?: Record<string, any>) {
    const basePath = QiwiApi.proxy ? window.location.origin : qiwiApiPath;

    return qs.stringifyUrl({
      url: `${basePath}${`/${
        path.startsWith("/") ? path.slice(1) || "" : path
      }`}`,
      query,
    });
  }

  public static getAuthInfo() {
    return this._authInfo;
  }

  public static setToken(token: string) {
    QiwiApi._token = token;
    localStorage.setItem("qiwi-token", token);
  }

  public static getHeaders(headers: Record<string, string>) {
    return new Headers(headers);
  }

  static async axiosFetch(path: string, params?: AxiosRequestConfig) {
    const defaultParams: AxiosRequestConfig = {
      responseType: "json",
      headers: {
        Authorization: `Bearer ${QiwiApi._token}`,
        origin: window.location.origin,
      },
    };
    params = _merge(defaultParams, params);

    const resp = await QiwiApi.axios({
      ...params,
      url: QiwiApi.path(path),
    });

    if (resp.status >= 200 && resp.status < 400) {
      return resp.data;
    } else {
      try {
        const { data: result } = await QiwiApi.axios({
          ...params,
          url: QiwiApi.path(path),
          responseType: "json",
        });
        if (result.serviceName) {
          toaster.danger(result.userMessage, { id: "qiwi-error" });
        }
        return null;
      } catch (err) {
        toaster.danger("Произошла внутренняя ошибка приложения", {
          id: "internal-error",
        });
      }
    }
  }

  static async fetch(path: string, params?: FetchParams) {
    const defaultParams: FetchParams = {
      type: "json",
      // credentials: "include",
      mode: "cors",
      // referrerPolicy: "origin-when-cross-origin",
    };
    params = _merge(defaultParams, params);
    const resp = await fetch(QiwiApi.path(path, params.query), {
      ...params,
      headers: {
        ...params.headers,
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + QiwiApi._token,
        // "accept-encoding": "gzip, deflate, br",
        // "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        // "access-control-allow-credentials": "true",
        // "access-control-request-headers":
        //   "access-control-expose-headers,access-control-allow-origin,access-control-allow-headers,access-control-allow-credentials,access-control-allow-methods,authorization,content-type",
        // "access-control-allow-methods":
        //   "GET, PUT, POST, DELETE, HEAD, OPTIONS, PATCH, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK",
        // "access-control-allow-origin": window.location.origin,
        Origin: window.location.origin,
        // referer: window.location.href,
        // "sec-ch-ua-mobile": "?0",
        // "sec-fetch-dest": "empty",
        // "sec-fetch-mode": "cors",
        // "sec-fetch-site": "cross-site",
      },
    });
    console.log(resp);
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
        toaster.danger("Произошла внутренняя ошибка приложения", {
          id: "internal-error",
        });
        // throw err;
      }
    }
  }

  public static async getCards() {
    const list: QiwiCard[] = await QiwiApi.fetch("/cards/v1/cards", {
      method: "GET",
      query: {
        "vas-alias": "qvc-master",
      },
    });
    return list;
  }

  public static async profileInfo() {
    const info: AuthInfo = await QiwiApi.fetch(
      "/person-profile/v1/profile/current"
    );
    QiwiApi._authInfo = info;
    return info;
  }

  public static async blockCard(qiwiCard: QiwiCard) {
    const { qvx } = qiwiCard;
    const { _authInfo } = QiwiApi;
    try {
      await QiwiApi.fetch(
        `/cards/v2/persons/${_authInfo?.authInfo.personId}/cards/${qvx.id}/block`,
        {
          method: "PUT",
        }
      );
      toaster.success("Карта была успешно заблокирована", {
        id: "success-blocked",
      });
    } catch (err) {
      toaster.danger("Не удалось заблокировать карту", { id: "error-blocked" });
    }
  }

  public static async unblockCard(qiwiCard: QiwiCard) {
    const { qvx } = qiwiCard;
    const { _authInfo } = QiwiApi;
    try {
      await QiwiApi.fetch(
        `/cards/v2/persons/${_authInfo?.authInfo.personId}/cards/${qvx.id}/unblock`,
        {
          method: "PUT",
        }
      );
      toaster.success("Карта была успешно разблокирована", {
        id: "success-unlocked",
      });
    } catch (err) {
      toaster.danger("Не удалось разблокировать карту", {
        id: "error-unlocked",
      });
    }
  }

  public static async fetchCardSecret(qiwiCard: QiwiCard) {
    return (await QiwiApi.fetch(`/cards/v1/cards/${qiwiCard.qvx.id}/details`, {
      method: "PUT",
      body: JSON.stringify({
        operationId: uuid(),
      }),
    })) as CardSecrets;
  }

  public static async createOrder(cardAlias: QiwiCard["info"]["alias"]) {
    const { _authInfo } = QiwiApi;

    try {
      let order: any = await this.fetch(
        `/cards/v2/persons/${_authInfo?.authInfo.personId}/orders`,
        {
          body: JSON.stringify({ cardAlias }),
          method: "POST",
        }
      );

      if (order.status === "DRAFT") {
        order = await QiwiApi.confirmOrder(order);
      } else {
        throw new Error();
      }

      if (order.status === "PAYMENT_REQUIRED") {
        toaster.success(`Карта была успешно выпущена`);
        return await QiwiApi.payOrder(order);
      } else {
        throw new Error();
      }
    } catch (err) {
      toaster.danger(
        `При выпуске карты ${OrderPrice[cardAlias]}₽ возникла ошибка`
      );
    }
  }

  public static async confirmOrder(order: CreateOrderResponse) {
    const { _authInfo } = QiwiApi;
    const result: ConfirmedOrderResponse = await QiwiApi.fetch(
      `/cards/v2/persons/${_authInfo?.authInfo.personId}/orders/${order.id}/submit`,
      {
        method: "PUT",
      }
    );
    return result;
  }

  public static async payOrder(order: ConfirmedOrderResponse) {
    const { _authInfo } = QiwiApi;

    const result: PaymentInfo = await QiwiApi.fetch(
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

  public static async renameCard(qiwiCard: QiwiCard, alias: string) {
    try {
      const result = await QiwiApi.fetch(
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
          `Карта ${qiwiCard.qvx.maskedPan} успешно переименована`,
          { id: "success-rename" }
        );
      } else {
        toaster.danger(
          `Возникла ошибка при переименовании карты ${qiwiCard.qvx.maskedPan}`,
          { id: "error-rename" }
        );
      }
    } catch (err) {
      console.log(err);
      toaster.danger(
        `Возникла ошибка при переименовании карты ${qiwiCard.qvx.maskedPan}`,
        { id: "error-rename" }
      );
    }
  }

  public static async paymentHistory(
    qiwiCard: QiwiCard,
    dateFrom: Date,
    dateTo: Date
  ) {
    const { _authInfo } = QiwiApi;
    const { qvx } = qiwiCard;
    const result = await QiwiApi.fetch(
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

  public static async getBalances() {
    const { _authInfo } = QiwiApi;
    const result: BalancesResponse = await QiwiApi.fetch(
      `/funding-sources/v2/persons/${_authInfo?.authInfo.personId}/accounts`
    );
    return result;
  }

  public static async getStatistics(dateFrom: Date, dateTo: Date) {
    const { _authInfo } = QiwiApi;
    const result = await QiwiApi.fetch(
      `/payment-history/v2/persons/${_authInfo?.authInfo.personId}/payments/total`,
      {
        method: "GET",
        type: "json",
        query: {
          startDate: toUTCISODate(dateFrom),
          endDate: toUTCISODate(dateTo),
        },
      }
    );
    console.log(result);
    return result;
  }

  public static async getStatisticsByLastWeek() {
    const dateFrom = endOfDay(sub(new Date(), { days: 7 }));
    const dateTo = new Date();
    const result: StatisticsPaymentResponse = await QiwiApi.getStatistics(
      dateFrom,
      dateTo
    );
    return result;
  }
}

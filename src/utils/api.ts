import { qiwiApiPath, qiwiPersonalToken } from "../config/constants";

export class QiwiApi {
  private static _token: string = qiwiPersonalToken || "";

  protected static path(path: string) {
    return `${qiwiApiPath}${`/${path.startsWith("/") ? path.slice(1) : path}`}`;
  }

  static async fetch(path: string, params?: Omit<Partial<Request>, "url">) {
    const resp = await fetch(QiwiApi.path(path), {
      ...params,
      headers: {
        "Content-Type": "application/json",
        // Accept: "application/json",
        Authorization: `Bearer ${QiwiApi._token}`,
      },
    });
    return await resp.json();
  }

  public static async getCards() {
    const list = await QiwiApi.fetch("/cards/v1/cards/?vas-alias=qvc-master", {
      method: "GET",
    });
    console.log(list);
  }

  public static async payPackage() {
    const result = await QiwiApi.fetch("/sinap/api/v2/terms/28004/payments", {
      method: "POST",
    });
    console.log(result);
  }

  public static async profileInfo() {
    const info = await QiwiApi.fetch("/person-profile/v1/profile/current");
    return info;
  }
}

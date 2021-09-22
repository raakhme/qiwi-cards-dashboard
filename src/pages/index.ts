import { PaymentsPage } from "./payments";
import { AuthPage } from "./auth";
import { MainPage } from "./main";
import { FunctionComponent } from "react";

export default {
  payments: PaymentsPage,
  auth: AuthPage,
  "/": MainPage,
} as Record<string, FunctionComponent<any>>;

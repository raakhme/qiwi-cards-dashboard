import React, { PropsWithChildren } from "react";
import { useAuth } from "../hooks";
import { QiwiApiClass } from "../utils/api";

export interface PagesContextValue {
  api: QiwiApiClass;
  isAuth: boolean;
  tokenChecked: boolean;
  setToken: (token: string) => void;
}

export const PagesContext = React.createContext<PagesContextValue>({
  isAuth: false,
  api: new QiwiApiClass(),
  setToken: () => {},
  tokenChecked: false,
});

export const PagesContextProvider = ({ children }: PropsWithChildren<any>) => {
  const { isAuth, api, setToken, tokenChecked } = useAuth();

  return (
    <PagesContext.Provider value={{ isAuth, setToken, tokenChecked, api }}>
      {children}
    </PagesContext.Provider>
  );
};

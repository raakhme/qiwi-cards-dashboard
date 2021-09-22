import { toaster } from "evergreen-ui";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { QiwiApiClass } from "../utils/api";

const QIWI_TOKEN_KEY = "qiwi-token";
const QIWI_PERSON_ID_KEY = "qiwi-personId";

export const useAuth = () => {
  const history = useHistory<{ redirectUrl: string }>();

  const [token, setToken] = useState(
    localStorage.getItem(QIWI_TOKEN_KEY) || ""
  );
  const [redirectUrl, setRedirectUrl] = useState("/");
  const [tokenChecked, setTokenChecked] = useState(false);
  const [personId, setPersonId] = useState(
    localStorage.getItem(QIWI_PERSON_ID_KEY) || ""
  );
  const [isAuth, setIsAuth] = useState(false);
  const [api, setApi] = useState<QiwiApiClass>(new QiwiApiClass());

  const checkToken = async (token: string) => {
    console.log(redirectUrl);
    if (token && token !== "") {
      const result = await api.checkToken(token);
      if (result) {
        const personId = result.authInfo.personId.toString();
        api.setAuthInfo(result);
        api.setToken(token);
        setToken(token);

        api.setPersonId(personId);
        setPersonId(personId);

        setIsAuth(true);
        toaster.closeAll();
        history.replace(redirectUrl);
      } else {
        toaster.danger("Токен устарел, введите актуальный токен");
        api.clearAuth();
        setIsAuth(false);
        setRedirectUrl(history.location.pathname);
        history.replace("/auth");
      }
    } else {
      api.clearAuth();
      setIsAuth(false);
      setRedirectUrl(history.location.pathname);
      history.replace("/auth");
    }
    setTokenChecked(true);
  };

  useEffect(() => {
    checkToken(token);
  }, [token]);

  return {
    token,
    setToken,
    personId,
    isAuth,
    tokenChecked,
    redirectUrl,
    api,
  };
};

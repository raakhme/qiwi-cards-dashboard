import { Pane, TextInput, Button } from "evergreen-ui";
import { ChangeEvent, useCallback, useContext, useState } from "react";
import { useLocation } from "react-router";
import { PagesContext } from "../context/page";

export const AuthPage = () => {
  const location = useLocation();
  const { setToken } = useContext(PagesContext);
  const [tokenValue, setTokenValue] = useState("");

  const submitForm = useCallback(() => {
    setToken(tokenValue);
  }, [tokenValue]);

  return (
    <Pane
      display="flex"
      alignItems="center"
      height="100vh"
      background="#f5f5f5"
      justifyContent="center"
    >
      <TextInput
        value={tokenValue}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setTokenValue(e.target.value)
        }
        height={48}
        placeholder="Введите токен"
      />
      <Button
        appearance="primary"
        onClick={submitForm}
        height={48}
        marginLeft={16}
      >
        Войти
      </Button>
    </Pane>
  );
};

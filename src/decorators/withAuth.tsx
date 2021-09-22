import { ReactNode, ComponentType, FunctionComponent, useContext } from "react";

import { PagesContext } from "../context/page";
import { QiwiApiClass } from "../utils/api";

export interface WithAuthProps {
  api: typeof QiwiApiClass;
}

export function withAuth(
  value?: ReactNode
): <P extends WithAuthProps>(
  WrappedComponent: ComponentType<P>
) => FunctionComponent<P> {
  return <P extends object>(WrappedComponent: ComponentType<P>) => {
    function SecuredComponent(props: P) {
      const { isAuth, tokenChecked } = useContext(PagesContext);

      return isAuth && tokenChecked ? <WrappedComponent {...props} /> : null;
    }
    SecuredComponent.displayName = `Secured(${
      WrappedComponent.displayName ||
      WrappedComponent.name ||
      WrappedComponent.constructor.name
    })`;

    return SecuredComponent;
  };
}

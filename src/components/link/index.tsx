import { Link as RouteLink, LinkProps } from "react-router-dom";
import styles from "./styles.module.css";

export const Link = (props: LinkProps) => {
  return <RouteLink {...props} className={styles.link} />;
};

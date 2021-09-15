import { KeyboardEventHandler, useCallback, useState } from "react";

import styles from "./styles.module.css";

export interface RenameFieldProps {
  value: string;
  onSubmit: (value: string) => Promise<void>;
}

export const RenameField = ({ value, onSubmit }: RenameFieldProps) => {
  const [stateValue, setStateValue] = useState(value);

  const handleChange = useCallback((e: React.ChangeEvent<any>) => {
    setStateValue(e.target.value);
  }, []);

  const handleKeyUp = useCallback(
    ((e) => {
      if (e.key === "Enter") {
        onSubmit(stateValue);
      }
    }) as KeyboardEventHandler<any>,
    [stateValue]
  );

  return (
    <input
      className={styles.contentEditable}
      value={stateValue}
      onKeyUp={handleKeyUp}
      onChange={handleChange}
    />
  );
};

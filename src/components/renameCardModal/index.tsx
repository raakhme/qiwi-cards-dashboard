import { Dialog, TextInput } from "evergreen-ui";
import React, { useCallback, useEffect, useState } from "react";
import { QiwiCard } from "../../types";
import { QiwiApi } from "../../utils/api";

export interface RenameCardModalProps {
  qiwiCard: QiwiCard;
  children: (showModal: () => void) => React.ReactNode;
  onConfirm: () => void;
}

export const RenameCardModal = ({
  children,
  qiwiCard,
  onConfirm,
}: RenameCardModalProps) => {
  const [show, setShow] = useState(false);
  const [inputValue, setInputValue] = useState(
    qiwiCard.qvx.cardAlias || qiwiCard.info.name
  );

  const handleRename = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const confirmRename = useCallback(async () => {
    await QiwiApi.renameCard(qiwiCard, inputValue);
    onConfirm();
    setShow(false);
  }, [qiwiCard, onConfirm, inputValue]);

  useEffect(() => {
    if (!show) {
      setInputValue(qiwiCard.qvx.cardAlias || qiwiCard.info.name);
    }
  }, [show, qiwiCard]);

  return (
    <>
      <Dialog
        onCloseComplete={() => setShow(false)}
        isShown={show}
        title={`Переименование карты ${qiwiCard.qvx.maskedPan}`}
        confirmLabel="Переименовать"
        onConfirm={confirmRename}
        cancelLabel="Отмена"
      >
        <TextInput width="100%" onChange={handleRename} value={inputValue} />
      </Dialog>
      {children(() => setShow(true))}
    </>
  );
};

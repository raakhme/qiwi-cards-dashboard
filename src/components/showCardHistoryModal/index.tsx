import { Button, Dialog, HistoryIcon, Popover, TextInput } from "evergreen-ui";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { QiwiCard } from "../../types";
import { QiwiApi } from "../../utils/api";
import { StaticDateRangePicker, DateRange } from "@material-ui/pickers";

import add from "date-fns/add";
import startOfDay from "date-fns/startOfDay";
import format from "date-fns/format";

export interface ShowCardHistoryModalProps {
  qiwiCard: QiwiCard;
  children: (showModal: () => void) => React.ReactNode;
}

export const ShowCardHistoryModal = ({
  children,
  qiwiCard,
}: ShowCardHistoryModalProps) => {
  const [show, setShow] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>(
    startOfDay(add(new Date(), { days: -7 }))
  );
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const cardName = useMemo(
    () => qiwiCard.qvx.cardAlias || qiwiCard.info.name,
    [qiwiCard]
  );

  const handleChangePeriod = useCallback(
    ([dateFrom, dateTo]: DateRange<Date>) => {
      setDateFrom(dateFrom as any);
      setDateTo(dateTo as any);
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    await QiwiApi.paymentHistory(qiwiCard, dateFrom, dateTo);
  }, [dateTo, dateFrom, qiwiCard]);

  return (
    <>
      <Dialog
        onCloseComplete={() => setShow(false)}
        isShown={show}
        title={
          <>
            <HistoryIcon marginRight={10} verticalAlign="middle" />
            Выписка по карте "{cardName}" ({qiwiCard.qvx.maskedPan})
          </>
        }
        cancelLabel="Отмена"
        confirmLabel="Загрузить"
        onConfirm={handleSubmit}
      >
        <Popover
          content={
            <StaticDateRangePicker
              displayStaticWrapperAs="mobile"
              value={[dateFrom, dateTo]}
              onChange={handleChangePeriod}
              renderInput={(startProps, endProps) => (
                <React.Fragment></React.Fragment>
              )}
            />
          }
        >
          <Button>
            {dateFrom ? format(dateFrom, "dd.MM.yyyy") : ""}-
            {dateTo ? format(dateTo, "dd.MM.yyyy") : ""}
          </Button>
        </Popover>
      </Dialog>
      {children(() => setShow(true))}
    </>
  );
};

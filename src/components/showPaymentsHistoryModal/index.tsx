import { Button, Dialog, HistoryIcon, Popover } from "evergreen-ui";
import React, { useCallback, useState, useContext } from "react";
import { StaticDateRangePicker, DateRange } from "@material-ui/pickers";

import add from "date-fns/add";
import startOfDay from "date-fns/startOfDay";
import format from "date-fns/format";
import { PagesContext } from "../../context/page";

export interface ShowPaymentsHistoryModalProps {
  children: (showModal: () => void) => React.ReactNode;
}

export const ShowPaymentsHistoryModal = ({
  children,
}: ShowPaymentsHistoryModalProps) => {
  const { api } = useContext(PagesContext);
  const [show, setShow] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>(
    startOfDay(add(new Date(), { days: -7 }))
  );
  const [dateTo, setDateTo] = useState<Date>(new Date());

  const handleChangePeriod = useCallback(
    ([dateFrom, dateTo]: DateRange<Date>) => {
      setDateFrom(dateFrom as any);
      setDateTo(dateTo as any);
    },
    []
  );

  const authInfo = api.getAuthInfo();

  return (
    <>
      <Dialog
        onCloseComplete={() => setShow(false)}
        isShown={show}
        title={
          <>
            <HistoryIcon marginRight={10} verticalAlign="middle" />
            Выписка по счету +{authInfo?.authInfo.personId}
          </>
        }
        hasFooter={false}
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

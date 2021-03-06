import React, { useContext, useMemo } from 'react';

import {
  Pane,
  Menu,
  Table,
  Badge,
  Spinner,
  Button,
  ArrowLeftIcon,
  Heading,
  Text,
} from 'evergreen-ui';
import { useCallback, useEffect, useState } from 'react';
import {
  PaymentsFilters,
  PaymentStatusColors,
  PaymentStatusTranslates,
  PaymentTransactionData,
  PaymentTypeTranslates,
} from '../../types/payments';
import { StaticDateRangePicker, DateRange } from '@material-ui/pickers';
import InfiniteScroll from 'react-infinite-scroller';
import { Link } from '../../components';

import sub from 'date-fns/sub';
import startOfDay from 'date-fns/startOfDay';
import endOfDay from 'date-fns/endOfDay';
import { format, toUTCISODate } from '../../utils/date';
import _groupBy from 'lodash/groupBy';
import { BalanceCurrenciesTrans } from '../../types/balance';
import { StatisticsPaymentResponse } from '../../types/statistics';
import { PagesContext } from '../../context/page';
import { withAuth } from '../../decorators/withAuth';
import { useThemeContext } from '../../themes/provider';

const periodOptions = [
  { label: 'Сегодня', value: 'DAY' },
  { label: 'Вчера', value: 'YESTERDAY' },
  { label: 'Месяц', value: 'MONTH' },
  { label: 'Все время (макс. 90 дней)', value: 'ALL' },
  { label: 'Другой период', value: 'CUSTOM' },
];

const operationOptions = [
  { label: 'Все', value: 'ALL' },
  { label: 'Только пополнения', value: 'IN' },
  { label: 'Платежи и переводы в кошельке', value: 'OUT' },
  { label: 'Платежи по картам QIWI', value: 'QIWI_CARD' },
];

const sourcesOptions = [
  { label: 'Рублевый (RUB)', value: 'QW_RUB' },
  { label: 'Долларовый (USD)', value: 'QW_USD' },
  { label: 'Евро (EUR)', value: 'QW_EUR' },
  { label: 'Банковские карты', value: 'CARD' },
  { label: 'Баланс телефона', value: 'MK' },
];

export const PaymentsPage = withAuth()(() => {
  const { api } = useContext(PagesContext);
  const { theme, setTheme } = useThemeContext();

  const [data, setData] = useState<PaymentTransactionData[]>([]);
  const [period, setPeriod] = useState<
    'ALL' | 'YESTERDAY' | 'DAY' | 'MONTH' | 'CUSTOM'
  >('MONTH');
  const [nextTxnDate, setNextTxnDate] = useState<string | undefined>();
  const [nextTxnId, setNextTxnId] = useState<number | undefined>();
  const [incomingTotal, setIncomingTotal] = useState<
    StatisticsPaymentResponse['incomingTotal']
  >([]);
  const [outgoingTotal, setOutgoingTotal] = useState<
    StatisticsPaymentResponse['outgoingTotal']
  >([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<PaymentsFilters>({
    rows: 50,
    operation: 'ALL',
    sources: ['QW_RUB'],
    startDate: toUTCISODate(startOfDay(sub(new Date(), { days: 90 }))),
    endDate: toUTCISODate(endOfDay(new Date())),
  });

  const changeFilter = (key: keyof PaymentsFilters, value: any) => {
    setFilters((filters) => ({
      ...filters,
      [key]: value,
    }));
  };

  const handleSelectSource = useCallback(
    (source: any) => {
      const { sources } = filters;
      console.log('sources', sources, source);
      if (!sources.includes(source)) {
        changeFilter('sources', [...sources, source]);
      } else {
        changeFilter(
          'sources',
          [...sources].filter((src) => src !== source)
        );
      }
    },
    [filters]
  );

  useEffect(() => {
    if (period === 'DAY') {
      const startDate = startOfDay(new Date());
      const endDate = endOfDay(new Date());
      changeFilter('startDate', toUTCISODate(startDate));
      changeFilter('endDate', toUTCISODate(endDate));
    } else if (period === 'YESTERDAY') {
      const startDate = startOfDay(sub(new Date(), { days: 1 }));
      const endDate = endOfDay(sub(new Date(), { days: 1 }));
      changeFilter('startDate', toUTCISODate(startDate));
      changeFilter('endDate', toUTCISODate(endDate));
    } else if (period === 'MONTH') {
      const startDate = startOfDay(sub(new Date(), { months: 1 }));
      const endDate = endOfDay(new Date());
      changeFilter('startDate', toUTCISODate(startDate));
      changeFilter('endDate', toUTCISODate(endDate));
    } else if (period === 'ALL') {
      const startDate = startOfDay(sub(new Date(), { days: 90 }));
      const endDate = endOfDay(new Date());
      changeFilter('startDate', toUTCISODate(startDate));
      changeFilter('endDate', toUTCISODate(endDate));
    }
  }, [period]);

  const handleChangePeriod = useCallback(
    ([dateFrom, dateTo]: DateRange<Date>) => {
      if (dateFrom) {
        changeFilter('startDate', toUTCISODate(startOfDay(dateFrom)));
      }
      if (dateTo) {
        changeFilter('endDate', toUTCISODate(endOfDay(dateTo)));
      }
    },
    []
  );

  const loadMore = async () => {
    const response = await api.payments({
      ...filters,
      nextTxnDate,
      nextTxnId,
    });
    setData((data) => data.concat(response.data));
    setNextTxnDate(response.nextTxnDate);
    setNextTxnId(response.nextTxnId);
  };

  const fetchPayments = async (filters: PaymentsFilters) => {
    setLoading(true);
    const response = await api.payments({
      ...filters,
    });
    setData(response.data);
    setNextTxnDate(response.nextTxnDate);
    setNextTxnId(response.nextTxnId);
    setLoading(false);
  };

  const fetchStats = async (filters: PaymentsFilters) => {
    console.log({ filters });
    const { incomingTotal, outgoingTotal } = await api.paymentStats(filters);
    setIncomingTotal(incomingTotal);
    setOutgoingTotal(outgoingTotal);
  };

  useEffect(() => {
    fetchPayments(filters);
  }, [filters]);

  useEffect(() => {
    fetchStats(filters);
  }, [filters]);

  const groupedData = useMemo(
    () =>
      _groupBy(data, (value) => toUTCISODate(startOfDay(new Date(value.date)))),
    [data]
  );

  function renderStatus(status: PaymentTransactionData['status']) {
    return (
      <Badge color={PaymentStatusColors[status] as any}>
        {PaymentStatusTranslates[status]}
      </Badge>
    );
  }

  const isLight = theme === 'light';

  return (
    <Pane
      display="flex"
      position="relative"
      backgroundColor={isLight ? '#f5f5f5' : '#1B1E1E'}
    >
      <Pane flexBasis="70%" margin={16}>
        <Pane
          marginBottom={16}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <div>
            <Link to="/">
              <Button iconBefore={<ArrowLeftIcon />}>Вернуться</Button>
            </Link>
            <Heading is="h2" marginY="16px">
              История
            </Heading>
            <Text>Сумма платежей с начала месяца</Text>
          </div>
          <Pane display="flex" gap="16px">
            <div>
              {incomingTotal.map((cur) => (
                <Text style={{ color: 'green' }}>
                  + {cur.amount} {BalanceCurrenciesTrans[cur.currency]}
                </Text>
              ))}
            </div>
            <div>
              {outgoingTotal.map((cur) => (
                <Text>
                  - {cur.amount} {BalanceCurrenciesTrans[cur.currency]}
                </Text>
              ))}
            </div>
          </Pane>
        </Pane>
        <Pane>
          {loading ? (
            <Pane
              height={200}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Spinner size={50} />
            </Pane>
          ) : data.length ? (
            <InfiniteScroll
              pageStart={0}
              hasMore={Boolean(nextTxnDate && nextTxnId)}
              loader={
                <Pane
                  display="flex"
                  height={50}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Spinner size={30} />
                </Pane>
              }
              loadMore={loadMore}
            >
              {Object.keys(groupedData).map((date) => {
                const data = groupedData[date];
                return (
                  <React.Fragment key={date}>
                    <Heading is="h3" marginY="8px">
                      {format(new Date(date), 'dd MMMM')}
                    </Heading>
                    <Table>
                      <Table.Body>
                        {data.map((txn) => {
                          return (
                            <Table.Row key={txn.txnId}>
                              <Table.TextCell
                                flexBasis={60}
                                flexShrink={0}
                                flexGrow={0}
                              >
                                {format(new Date(txn.date), `HH:mm`)}
                              </Table.TextCell>
                              <Table.TextCell
                                flexBasis={150}
                                flexShrink={0}
                                flexGrow={0}
                              >
                                {renderStatus(txn.status)}
                              </Table.TextCell>
                              <Table.TextCell
                                flexBasis={150}
                                flexShrink={0}
                                flexGrow={0}
                              >
                                {PaymentTypeTranslates[txn.type]}
                              </Table.TextCell>
                              <Table.TextCell>
                                {txn.view.title} {txn.view.account}
                              </Table.TextCell>
                              <Table.TextCell>
                                <Text
                                  style={{
                                    fontSize: 20,
                                    color:
                                      txn.status === 'ERROR'
                                        ? '#ccc'
                                        : 'inherit',
                                  }}
                                >
                                  {txn.sum.amount}&nbsp;
                                  {BalanceCurrenciesTrans[txn.sum.currency]}
                                </Text>
                              </Table.TextCell>
                            </Table.Row>
                          );
                        })}
                      </Table.Body>
                    </Table>
                  </React.Fragment>
                );
              })}
            </InfiniteScroll>
          ) : (
            <Pane
              display="flex"
              alignItems="center"
              justifyContent="center"
              height={200}
              fontSize={20}
            >
              <Text>За данный период данных нет</Text>
            </Pane>
          )}
        </Pane>
      </Pane>
      <Pane flexBasis="30%" margin={16}>
        <Pane position="sticky" top="0">
          <Pane overflowY="auto" height="calc(100vh - 32px)">
            <Menu>
              <Menu.OptionsGroup
                title="Период"
                options={periodOptions}
                selected={period}
                onChange={(selected) => setPeriod(selected)}
              />
              {period === 'CUSTOM' && (
                <>
                  <StaticDateRangePicker
                    displayStaticWrapperAs="mobile"
                    value={[
                      new Date(filters.startDate),
                      new Date(filters.endDate),
                    ]}
                    onChange={handleChangePeriod}
                    renderInput={(startProps, endProps) => (
                      <React.Fragment></React.Fragment>
                    )}
                  />
                </>
              )}
              <Menu.Divider />
              <Menu.OptionsGroup
                title="Тип операций"
                options={operationOptions}
                selected={filters.operation}
                onChange={(selected) => changeFilter('operation', selected)}
              />
              <Menu.Divider />
              <Menu.Group title="Счет">
                {sourcesOptions.map((source) => (
                  <Menu.Option
                    isSelected={
                      filters.sources.findIndex(
                        (opt) => opt === source.value
                      ) !== -1
                    }
                    onSelect={() => handleSelectSource(source.value)}
                    key={source.value}
                  >
                    <Text>{source.label}</Text>
                  </Menu.Option>
                ))}
              </Menu.Group>
            </Menu>
          </Pane>
        </Pane>
      </Pane>
    </Pane>
  );
});

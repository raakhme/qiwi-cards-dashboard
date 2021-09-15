import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Popover,
  Menu,
  Position,
  CreditCardIcon,
  AddIcon,
  IconButton,
  CogIcon,
  EyeOpenIcon,
  Pane,
  Badge,
  toaster,
  LockIcon,
  UnlockIcon,
  HistoryIcon,
  Spinner,
  RefreshIcon,
  SegmentedControl,
} from "evergreen-ui";

import { initApi, QiwiApi } from "../utils/api";
import { copyToClipboard } from "../utils/clipboard";
import {
  Balance,
  BalanceCurrencies,
  BalanceCurrenciesTrans,
  CardFilterStatuses,
  CardSecrets,
  CardStatus,
  CardStatusColors,
  CardStatusTranslates,
  CreateOrderResponse,
  OrderPrice,
  OrderPriceTranslate,
  QiwiCard,
} from "../types";
import { ShowCardHistoryModal, RenameField, Link } from "../components";
import { StatisticsPaymentResponse } from "../types/statistics";

export function MainPage() {
  const [cards, setCards] = useState<QiwiCard[]>([]);
  const [secrets, setSecrets] = useState<Record<string, CardSecrets>>({});
  const [loading, setLoading] = useState(false);
  const [lastWeek, setLastWeek] = useState<StatisticsPaymentResponse | null>(
    null
  );
  const [status, setStatus] = useState<CardStatus>("ACTIVE");
  const [balances, setBalances] = useState<Balance[]>([]);

  const init = useCallback(async () => {
    setLoading(true);
    await initApi();
    const cards = await QiwiApi.getCards();
    const lastWeek = await QiwiApi.getStatisticsByLastWeek();
    const balances = await QiwiApi.getBalances();
    setBalances(balances.accounts);
    setLastWeek(lastWeek);
    setCards(cards);
    setLoading(false);
  }, []);

  function renderCardStatus(status: QiwiCard["qvx"]["status"]) {
    return (
      <Badge color={CardStatusColors[status] as any}>
        {CardStatusTranslates[status]}
      </Badge>
    );
  }

  async function copyData(data: string) {
    await copyToClipboard(data.trim());
    toaster.success("Данные были скопированы в буффер", {
      id: "success-clipboard",
    });
  }

  const balance = useMemo(() => {
    return balances.find(
      (balance) => balance.currency === BalanceCurrencies.rub
    );
  }, [balances]);

  async function blockCard(qiwiCard: QiwiCard) {
    await QiwiApi.blockCard(qiwiCard);
    setTimeout(init, 300);
  }

  async function unblockCard(qiwiCard: QiwiCard) {
    await QiwiApi.unblockCard(qiwiCard);
    setTimeout(init, 300);
  }

  const getSecretPan = useCallback(
    (qiwiCard: QiwiCard) => {
      const { qvx } = qiwiCard;
      if (secrets[qvx.id]) {
        return secrets[qvx.id].pan;
      }
      return null;
    },
    [secrets]
  );

  const getSecretCvv = useCallback(
    (qiwiCard: QiwiCard) => {
      const { qvx } = qiwiCard;
      if (secrets[qvx.id]) {
        return secrets[qvx.id].cvv;
      }
      return null;
    },
    [secrets]
  );

  const showSecrets = useCallback(async (qiwiCard: QiwiCard) => {
    const { qvx } = qiwiCard;
    const secret = await QiwiApi.fetchCardSecret(qiwiCard);
    setSecrets((secrets) => ({
      ...secrets,
      [qvx.id]: secret,
    }));
  }, []);

  const orderCard = useCallback(
    async (type: CreateOrderResponse["cardAlias"]) => {
      await QiwiApi.createOrder(type);
      setTimeout(init, 300);
    },
    []
  );

  const filteredCards = useMemo(() => {
    return cards.filter((card) => card.qvx.status === status);
  }, [status, cards]);

  const handleRename = (qiwiCard: QiwiCard) => async (value: string) => {
    await QiwiApi.renameCard(qiwiCard, value);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Pane
        marginTop={16}
        marginX={16}
        display="flex"
        justifyContent="space-between"
      >
        <SegmentedControl
          options={CardFilterStatuses}
          value={status}
          onChange={setStatus as any}
        />
        <Pane display="flex" gap={16}>
          <Button appearance="minimal" onClick={init}>
            <RefreshIcon />
          </Button>
          <Link to="/payments">
            <Button>Расходы</Button>
          </Link>
          <Popover
            position={Position.BOTTOM_LEFT}
            content={
              <Menu>
                <Menu.Group>
                  <Menu.Item
                    icon={CreditCardIcon}
                    onClick={() => orderCard("qvc-cpa")}
                  >
                    {OrderPriceTranslate["qvc-cpa"]} ({OrderPrice["qvc-cpa"]}₽)
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    icon={CreditCardIcon}
                    onClick={() => orderCard("qvc-cpa-debit")}
                  >
                    {OrderPriceTranslate["qvc-cpa-debit"]} (
                    {OrderPrice["qvc-cpa-debit"]}₽)
                  </Menu.Item>
                </Menu.Group>
              </Menu>
            }
          >
            <Button iconBefore={AddIcon} appearance="primary">
              Выпустить карту
            </Button>
          </Popover>
        </Pane>
      </Pane>
      <Pane paddingX={16} paddingY={16}>
        <Table>
          <Table.Head>
            <Table.TextHeaderCell flexBasis={200} flexShrink={0} flexGrow={0}>
              Статус
            </Table.TextHeaderCell>
            <Table.TextHeaderCell>Имя карты</Table.TextHeaderCell>
            <Table.TextHeaderCell>Номер карты</Table.TextHeaderCell>
            <Table.TextHeaderCell>Дата окончания</Table.TextHeaderCell>
            <Table.TextHeaderCell>CVV</Table.TextHeaderCell>
            <Table.TextHeaderCell></Table.TextHeaderCell>
          </Table.Head>
          <Table.Body
            minHeight="calc(100vh - 300px)"
            maxHeight="calc(100vh - 300px)"
          >
            {loading ? (
              <Spinner
                position="absolute"
                left="50%"
                right="50%"
                top="50%"
                transform="translateY(-50%)"
              />
            ) : (
              filteredCards !== null &&
              filteredCards.map((card) => (
                <Table.Row key={card.qvx.id} isSelectable>
                  <Table.TextCell flexBasis={200} flexShrink={0} flexGrow={0}>
                    {renderCardStatus(card.qvx.status)}
                  </Table.TextCell>
                  <Table.TextCell>
                    <RenameField
                      onSubmit={handleRename(card)}
                      value={card.qvx.cardAlias || card.info.name}
                    />
                  </Table.TextCell>
                  <Table.TextCell
                    onClick={() =>
                      getSecretPan(card) &&
                      copyData(`
                        ${getSecretPan(card)} ${
                        card.qvx.cardExpireMonth
                      }/${new Date(card.qvx.cardExpire)
                        .getFullYear()
                        .toString()
                        .substr(-2)} ${getSecretCvv(card)}
                      `)
                    }
                  >
                    {getSecretPan(card) || `********${card.qvx.maskedPan}`}
                  </Table.TextCell>
                  <Table.TextCell>
                    {card.qvx.cardExpireMonth}/{card.qvx.cardExpireYear}
                  </Table.TextCell>
                  <Table.TextCell>{getSecretCvv(card) || `***`}</Table.TextCell>
                  <Table.TextCell>
                    <Pane display="flex" justifyContent="flex-end">
                      <IconButton
                        icon={EyeOpenIcon}
                        onClick={() => showSecrets(card)}
                        marginRight={8}
                      ></IconButton>
                      <ShowCardHistoryModal qiwiCard={card}>
                        {(showCardHistory) => (
                          <Popover
                            position={Position.BOTTOM_LEFT}
                            content={
                              <Menu>
                                <Menu.Group>
                                  <Menu.Item
                                    icon={HistoryIcon}
                                    onClick={showCardHistory}
                                  >
                                    Выписка по карте
                                  </Menu.Item>
                                  <Menu.Item
                                    icon={
                                      card.qvx.status === "ACTIVE"
                                        ? LockIcon
                                        : UnlockIcon
                                    }
                                    onClick={async () =>
                                      card.qvx.status === "ACTIVE"
                                        ? await blockCard(card)
                                        : await unblockCard(card)
                                    }
                                    intent={
                                      card.qvx.status === "ACTIVE"
                                        ? "danger"
                                        : "success"
                                    }
                                  >
                                    {card.qvx.status === "ACTIVE"
                                      ? "Заблокировать"
                                      : "Разблокировать"}
                                  </Menu.Item>
                                </Menu.Group>
                              </Menu>
                            }
                          >
                            <IconButton icon={CogIcon}></IconButton>
                          </Popover>
                        )}
                      </ShowCardHistoryModal>
                    </Pane>
                  </Table.TextCell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
        {lastWeek && (
          <Pane>
            <h3>Статистика</h3>
            <Pane display="flex" gap="16px">
              <Pane>
                <h4>Текущий баланс</h4>
                {balance && balance.hasBalance
                  ? `${balance.balance?.amount} ${
                      BalanceCurrenciesTrans[BalanceCurrencies.rub]
                    }`
                  : `0 ${BalanceCurrenciesTrans[BalanceCurrencies.rub]}`}
              </Pane>
              <Pane>
                <h4>Поступления за неделю</h4>
                {lastWeek?.incomingTotal.map(
                  (v) => `
              ${v.amount} ${BalanceCurrenciesTrans[v.currency]}
            `
                )}
              </Pane>
              <Pane>
                <Pane>
                  <h4>Расходы за неделю</h4>
                  {lastWeek?.outgoingTotal.map(
                    (v) => `
              ${v.amount} ${BalanceCurrenciesTrans[v.currency]}
            `
                  )}
                </Pane>
              </Pane>
            </Pane>
          </Pane>
        )}
      </Pane>
    </>
  );
}

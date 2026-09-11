import {
  Alert,
  Card,
  Col,
  Empty,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";

import {
  DollarOutlined,
} from "@ant-design/icons";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getMyWalletRequest,
  getTransactionsRequest,
} from "../../api/payments";

import type {
  Transaction,
  TransactionStatus,
  TransactionType,
} from "../../types/payment";

const { Title, Text } = Typography;

const transactionTypeConfig: Record<
  TransactionType,
  {
    label: string;
    color: string;
  }
> = {
  DEPOSIT: {
    label: "Deposit",
    color: "green",
  },
  WITHDRAW: {
    label: "Withdraw",
    color: "orange",
  },
  PAYMENT: {
    label: "Payment",
    color: "blue",
  },
  REFUND: {
    label: "Refund",
    color: "cyan",
  },
  COMMISSION: {
    label: "Commission",
    color: "red",
  },
};

const transactionStatusConfig: Record<
  TransactionStatus,
  {
    label: string;
    color: string;
  }
> = {
  PENDING: {
    label: "Pending",
    color: "gold",
  },
  COMPLETED: {
    label: "Completed",
    color: "green",
  },
  FAILED: {
    label: "Failed",
    color: "red",
  },
};

export default function Payments() {
  const {
    data: wallet,
    isLoading: walletLoading,
    isError: walletError,
  } = useQuery({
    queryKey: ["my-wallet"],
    queryFn: getMyWalletRequest,
  });

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    isError: transactionsError,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactionsRequest,
  });

  if (
    walletLoading ||
    transactionsLoading
  ) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (
    walletError ||
    transactionsError
  ) {
    return (
      <Alert
        type="error"
        message="Не удалось загрузить платежи"
        description="Проверьте доступность payment API."
      />
    );
  }

  const transactions =
    transactionsData?.results ?? [];

  return (
    <div>
      <Title level={2}>
        Payments
      </Title>

      <Text type="secondary">
        Управление кошельком и история
        финансовых операций.
      </Text>

      <Row
        gutter={[
          16,
          16,
        ]}
        style={{
          marginTop: 24,
        }}
      >
        <Col
          xs={24}
          md={8}
        >
          <Card>
            <Statistic
              title="Wallet Balance"
              value={Number(
                wallet?.balance ?? 0
              )}
              precision={2}
              prefix={
                <DollarOutlined />
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          md={8}
        >
          <Card>
            <Statistic
              title="Transactions"
              value={
                transactions.length
              }
            />
          </Card>
        </Col>

        <Col
          xs={24}
          md={8}
        >
          <Card>
            <Statistic
              title="Wallet"
              value={
                wallet
                  ? "Active"
                  : "Not created"
              }
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Transaction History"
        style={{
          marginTop: 24,
        }}
      >
        {transactions.length === 0 ? (
          <Empty
            description="Транзакций пока нет"
          />
        ) : (
          <Table<Transaction>
            rowKey="id"
            dataSource={
              transactions
            }
            pagination={{
              pageSize: 10,
            }}
            columns={[
              {
                title: "Type",
                dataIndex:
                  "transaction_type",
                key: "transaction_type",
                render: (
                  value: TransactionType
                ) => {
                  const config =
                    transactionTypeConfig[
                      value
                    ];

                  return (
                    <Tag
                      color={
                        config.color
                      }
                    >
                      {config.label}
                    </Tag>
                  );
                },
              },
              {
                title: "Amount",
                dataIndex: "amount",
                key: "amount",
                render: (
                  value: string,
                  record
                ) => {
                  const positive =
                    record.transaction_type ===
                      "DEPOSIT" ||
                    record.transaction_type ===
                      "REFUND";

                  return (
                    <Text
                      strong
                      type={
                        positive
                          ? "success"
                          : record.transaction_type ===
                            "COMMISSION"
                          ? "danger"
                          : undefined
                      }
                    >
                      {positive
                        ? "+"
                        : "-"}
                      ${value}
                    </Text>
                  );
                },
              },
              {
                title: "Status",
                dataIndex:
                  "status",
                key: "status",
                render: (
                  value: TransactionStatus
                ) => {
                  const config =
                    transactionStatusConfig[
                      value
                    ];

                  return (
                    <Tag
                      color={
                        config.color
                      }
                    >
                      {config.label}
                    </Tag>
                  );
                },
              },
              {
                title: "Description",
                dataIndex:
                  "description",
                key: "description",
                render: (
                  value: string
                ) =>
                  value || "—",
              },
              {
                title: "Date",
                dataIndex:
                  "created_at",
                key: "created_at",
                render: (
                  value: string
                ) =>
                  new Date(
                    value
                  ).toLocaleString(),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
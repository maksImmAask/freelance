import {
  Alert,
  Card,
  Col,
  Empty,
  Row,
  Spin,
  Tag,
  Typography,
} from "antd";

import { useQuery } from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

import { getContractsRequest } from "../../api/contracts";

import type { ContractStatus } from "../../types/contract";

const { Title, Text } = Typography;

const statusConfig: Record<
  ContractStatus,
  {
    color: string;
    label: string;
  }
> = {
  ACTIVE: {
    color: "blue",
    label: "Active",
  },
  COMPLETED: {
    color: "green",
    label: "Completed",
  },
  CANCELLED: {
    color: "red",
    label: "Cancelled",
  },
};

export default function Contracts() {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContractsRequest,
  });

  if (isLoading) {
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

  if (isError) {
    return (
      <Alert
        type="error"
        message="Не удалось загрузить контракты"
      />
    );
  }

  const contracts =
    data?.results ?? [];

  return (
    <div>
      <Title level={2}>
        Contracts
      </Title>

      <Text type="secondary">
        Your active and completed contracts.
      </Text>

      <div style={{ marginTop: 24 }}>
        {contracts.length === 0 ? (
          <Card>
            <Empty description="Контрактов пока нет" />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {contracts.map((contract) => {
              const status =
                statusConfig[
                  contract.status
                ];

              return (
                <Col
                  xs={24}
                  sm={12}
                  lg={8}
                  key={contract.id}
                >
                  <Card
                    hoverable
                    onClick={() =>
                      navigate(
                        `/contracts/${contract.id}`
                      )
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        marginBottom: 16,
                      }}
                    >
                      <Text strong>
                        Contract #
                        {contract.id}
                      </Text>

                      <Tag
                        color={
                          status.color
                        }
                      >
                        {status.label}
                      </Tag>
                    </div>

                    <div
                      style={{
                        marginBottom: 12,
                      }}
                    >
                      <Text type="secondary">
                        Project
                      </Text>

                      <br />

                      <Text strong>
                        #{contract.project}
                      </Text>
                    </div>

                    <div
                      style={{
                        marginBottom: 12,
                      }}
                    >
                      <Text type="secondary">
                        Client
                      </Text>

                      <br />

                      <Text>
                        #{contract.client}
                      </Text>
                    </div>

                    <div
                      style={{
                        marginBottom: 12,
                      }}
                    >
                      <Text type="secondary">
                        Freelancer
                      </Text>

                      <br />

                      <Text>
                        #{contract.freelancer}
                      </Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginTop: 20,
                      }}
                    >
                      <Text strong>
                        $
                        {
                          contract.total_amount
                        }
                      </Text>

                      <Text type="secondary">
                        {new Date(
                          contract.deadline
                        ).toLocaleDateString()}
                      </Text>
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </div>
  );
}
import {
  Alert,
  Card,
  Col,
  Empty,
  Row,
  Select,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { getProposalsRequest } from "../../api/proposals";
import type { ProposalStatus } from "../../types/proposal";

const { Title, Text, Paragraph } = Typography;

const statusConfig: Record<
  ProposalStatus,
  {
    color: string;
    label: string;
  }
> = {
  PENDING: {
    color: "gold",
    label: "Pending",
  },
  ACCEPTED: {
    color: "green",
    label: "Accepted",
  },
  REJECTED: {
    color: "red",
    label: "Rejected",
  },
  WITHDRAWN: {
    color: "default",
    label: "Withdrawn",
  },
};

export default function Proposals() {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["proposals"],
    queryFn: getProposalsRequest,
  });

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: 60,
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
        message="Не удалось загрузить предложения"
        description="Проверь, запущен ли Django backend."
      />
    );
  }

  const proposals = data?.results ?? [];

  return (
    <div>
      <Title level={2}>My Proposals</Title>

      <Text type="secondary">
        Здесь отображаются предложения, отправленные тобой или
        предложения по твоим проектам.
      </Text>

      <div style={{ marginTop: 24 }}>
        {proposals.length === 0 ? (
          <Card>
            <Empty description="Предложений пока нет" />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {proposals.map((proposal) => {
              const status =
                statusConfig[proposal.status];

              return (
                <Col
                  xs={24}
                  md={12}
                  lg={8}
                  key={proposal.id}
                >
                  <Card
                    hoverable
                    onClick={() =>
                      navigate(
                        `/proposals/${proposal.id}`
                      )
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <Text strong>
                        Proposal #{proposal.id}
                      </Text>

                      <Tag color={status.color}>
                        {status.label}
                      </Tag>
                    </div>

                    <Text type="secondary">
                      Project #{proposal.project}
                    </Text>

                    <Paragraph
                      ellipsis={{
                        rows: 3,
                      }}
                      style={{
                        marginTop: 12,
                      }}
                    >
                      {proposal.cover_letter}
                    </Paragraph>

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginTop: 16,
                      }}
                    >
                      <Text strong>
                        ${proposal.price}
                      </Text>

                      <Text>
                        {proposal.delivery_days} days
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
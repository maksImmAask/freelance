import {
  Alert,
  Button,
  Card,
  Descriptions,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import {
  acceptProposalRequest,
  getProposalRequest,
  rejectProposalRequest,
} from "../../api/proposals";
import { useAuthStore } from "../../store/authStore";
import type { ProposalStatus } from "../../types/proposal";

const { Title, Paragraph } = Typography;

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

export default function ProposalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);

  const proposalId = Number(id);

  const {
    data: proposal,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["proposal", proposalId],
    queryFn: () => getProposalRequest(proposalId),
    enabled: Number.isFinite(proposalId),
  });

  const acceptMutation = useMutation({
    mutationFn: () =>
      acceptProposalRequest(proposalId),

    onSuccess: () => {
      message.success(
        "Предложение принято. Контракт создан."
      );

      queryClient.invalidateQueries({
        queryKey: ["proposal", proposalId],
      });

      queryClient.invalidateQueries({
        queryKey: ["proposals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["contracts"],
      });
    },

    onError: () => {
      message.error(
        "Не удалось принять предложение"
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      rejectProposalRequest(proposalId),

    onSuccess: () => {
      message.success("Предложение отклонено");

      queryClient.invalidateQueries({
        queryKey: ["proposal", proposalId],
      });

      queryClient.invalidateQueries({
        queryKey: ["proposals"],
      });
    },

    onError: () => {
      message.error(
        "Не удалось отклонить предложение"
      );
    },
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

  if (isError || !proposal) {
    return (
      <Alert
        type="error"
        message="Предложение не найдено"
      />
    );
  }

  const status =
    statusConfig[proposal.status];

  const isClient = user?.role === "CLIENT";
  const isAdmin = user?.role === "ADMIN";
  const isPending = proposal.status === "PENDING";

  return (
    <div>
      <Button
        type="link"
        onClick={() => navigate(-1)}
        style={{ paddingLeft: 0 }}
      >
        ← Назад
      </Button>

      <Card style={{ marginTop: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Title
            level={2}
            style={{ margin: 0 }}
          >
            Proposal #{proposal.id}
          </Title>

          <Tag color={status.color}>
            {status.label}
          </Tag>
        </div>

        <Descriptions
          bordered
          column={1}
        >
          <Descriptions.Item label="Project">
            #{proposal.project}
          </Descriptions.Item>

          <Descriptions.Item label="Freelancer">
            #{proposal.freelancer}
          </Descriptions.Item>

          <Descriptions.Item label="Price">
            ${proposal.price}
          </Descriptions.Item>

          <Descriptions.Item label="Delivery">
            {proposal.delivery_days} days
          </Descriptions.Item>

          <Descriptions.Item label="Created">
            {new Date(
              proposal.created_at
            ).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        <Card
          type="inner"
          title="Cover Letter"
          style={{ marginTop: 24 }}
        >
          <Paragraph>
            {proposal.cover_letter}
          </Paragraph>
        </Card>

        {isPending && (isClient || isAdmin) && (
          <Space style={{ marginTop: 24 }}>
            <Popconfirm
              title="Принять предложение?"
              description="После принятия будет создан контракт."
              onConfirm={() =>
                acceptMutation.mutate()
              }
              okText="Да"
              cancelText="Нет"
            >
              <Button
                type="primary"
                loading={acceptMutation.isPending}
              >
                Accept Proposal
              </Button>
            </Popconfirm>

            <Popconfirm
              title="Отклонить предложение?"
              onConfirm={() =>
                rejectMutation.mutate()
              }
              okText="Да"
              cancelText="Нет"
            >
              <Button
                danger
                loading={rejectMutation.isPending}
              >
                Reject
              </Button>
            </Popconfirm>
          </Space>
        )}
      </Card>
    </div>
  );
}
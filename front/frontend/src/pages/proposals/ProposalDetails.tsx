import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";

import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getProposalRequest,
  acceptProposalRequest,
  rejectProposalRequest,
} from "../../api/proposals";

import { useAuthStore } from "../../store/authStore";

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

export default function ProposalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useAuthStore(
    (state) => state.user
  );

  const proposalId = Number(id);

  const {
    data: proposal,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["proposal", proposalId],
    queryFn: () =>
      getProposalRequest(proposalId),
    enabled: Number.isFinite(proposalId),
  });

  const acceptMutation = useMutation({
    mutationFn: () =>
      acceptProposalRequest(proposalId),

    onSuccess: () => {
      message.success(
        "Proposal accepted"
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

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },

    onError: () => {
      message.error(
        "Не удалось принять proposal"
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      rejectProposalRequest(proposalId),

    onSuccess: () => {
      message.success(
        "Proposal rejected"
      );

      queryClient.invalidateQueries({
        queryKey: ["proposal", proposalId],
      });

      queryClient.invalidateQueries({
        queryKey: ["proposals"],
      });
    },

    onError: () => {
      message.error(
        "Не удалось отклонить proposal"
      );
    },
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

  if (isError || !proposal) {
    return (
      <Alert
        type="error"
        message="Proposal not found"
      />
    );
  }

  const status =
    statusConfig[proposal.status];

  const canAccept =
    user?.role === "CLIENT" &&
    proposal.status === "PENDING";

  const canReject =
    user?.role === "CLIENT" &&
    proposal.status === "PENDING";

  const canEdit =
    user?.role === "FREELANCER" &&
    user.id === proposal.freelancer &&
    proposal.status === "PENDING";

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() =>
          navigate("/proposals")
        }
        style={{ marginBottom: 20 }}
      >
        Back
      </Button>

      <Card>
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <Title
              level={2}
              style={{ margin: 0 }}
            >
              Proposal #{proposal.id}
            </Title>

            <Tag
              color={status.color}
            >
              {status.label}
            </Tag>
          </div>

          <Divider />

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
              <Text strong>
                ${proposal.price}
              </Text>
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

          <div>
            <Title level={4}>
              Cover Letter
            </Title>

            <Paragraph>
              {proposal.cover_letter}
            </Paragraph>
          </div>

          {(canAccept ||
            canReject ||
            canEdit) && (
            <>
              <Divider />

              <Space wrap>
                {canAccept && (
                  <Popconfirm
                    title="Accept this proposal?"
                    description="A contract will be created."
                    okText="Accept"
                    cancelText="Cancel"
                    onConfirm={() =>
                      acceptMutation.mutate()
                    }
                  >
                    <Button
                      type="primary"
                      icon={
                        <CheckOutlined />
                      }
                      loading={
                        acceptMutation.isPending
                      }
                    >
                      Accept Proposal
                    </Button>
                  </Popconfirm>
                )}

                {canReject && (
                  <Popconfirm
                    title="Reject this proposal?"
                    okText="Reject"
                    cancelText="Cancel"
                    onConfirm={() =>
                      rejectMutation.mutate()
                    }
                  >
                    <Button
                      danger
                      icon={
                        <CloseOutlined />
                      }
                      loading={
                        rejectMutation.isPending
                      }
                    >
                      Reject
                    </Button>
                  </Popconfirm>
                )}

                {canEdit && (
                  <Button>
                    Edit Proposal
                  </Button>
                )}
              </Space>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
}
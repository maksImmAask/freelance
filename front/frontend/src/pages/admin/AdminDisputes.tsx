import React from "react";

import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Input,
  List,
  Modal,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";

import {
  CheckOutlined,
  EyeOutlined,
  FileSearchOutlined,
  CloseOutlined,
} from "@ant-design/icons";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getDisputesRequest,
  rejectDisputeRequest,
  resolveDisputeClientRequest,
  resolveDisputeFreelancerRequest,
  startDisputeReviewRequest,
} from "../../api/disputes";

import type {
  Dispute,
  DisputeStatus,
} from "../../types/dispute";

const { Title, Text } = Typography;

const statusConfig: Record<
  DisputeStatus,
  {
    color: string;
    label: string;
  }
> = {
  OPEN: {
    color: "red",
    label: "Open",
  },
  IN_REVIEW: {
    color: "orange",
    label: "In Review",
  },
  RESOLVED_CLIENT: {
    color: "green",
    label: "Resolved for Client",
  },
  RESOLVED_FREELANCER: {
    color: "blue",
    label: "Resolved for Freelancer",
  },
  REJECTED: {
    color: "default",
    label: "Rejected",
  },
};

export default function AdminDisputes() {
  const queryClient =
    useQueryClient();

  const [
    selectedDispute,
    setSelectedDispute,
  ] =
    React.useState<Dispute | null>(
      null
    );

  const [
    resolution,
    setResolution,
  ] = React.useState("");

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["disputes"],
    queryFn:
      getDisputesRequest,
  });

  const startMutation =
    useMutation({
      mutationFn:
        startDisputeReviewRequest,

      onSuccess: () => {
        message.success(
          "Dispute moved to review"
        );

        queryClient.invalidateQueries({
          queryKey: ["disputes"],
        });
      },

      onError: () => {
        message.error(
          "Не удалось начать рассмотрение"
        );
      },
    });

  const resolveClientMutation =
    useMutation({
      mutationFn: ({
        id,
        text,
      }: {
        id: number;
        text: string;
      }) =>
        resolveDisputeClientRequest(
          id,
          text
        ),

      onSuccess: () => {
        message.success(
          "Dispute resolved for client"
        );

        setSelectedDispute(
          null
        );
        setResolution("");

        queryClient.invalidateQueries({
          queryKey: ["disputes"],
        });
      },

      onError: () => {
        message.error(
          "Не удалось разрешить спор"
        );
      },
    });

  const resolveFreelancerMutation =
    useMutation({
      mutationFn: ({
        id,
        text,
      }: {
        id: number;
        text: string;
      }) =>
        resolveDisputeFreelancerRequest(
          id,
          text
        ),

      onSuccess: () => {
        message.success(
          "Dispute resolved for freelancer"
        );

        setSelectedDispute(
          null
        );
        setResolution("");

        queryClient.invalidateQueries({
          queryKey: ["disputes"],
        });
      },

      onError: () => {
        message.error(
          "Не удалось разрешить спор"
        );
      },
    });

  const rejectMutation =
    useMutation({
      mutationFn: ({
        id,
        text,
      }: {
        id: number;
        text: string;
      }) =>
        rejectDisputeRequest(
          id,
          text
        ),

      onSuccess: () => {
        message.success(
          "Dispute rejected"
        );

        setSelectedDispute(
          null
        );
        setResolution("");

        queryClient.invalidateQueries({
          queryKey: ["disputes"],
        });
      },

      onError: () => {
        message.error(
          "Не удалось отклонить спор"
        );
      },
    });

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent:
            "center",
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
        message="Не удалось загрузить disputes"
      />
    );
  }

  const disputes =
    data?.results ?? [];

  const closeModal = () => {
    setSelectedDispute(
      null
    );
    setResolution("");
  };

  return (
    <div>
      <Title level={2}>
        Disputes
      </Title>

      <Text type="secondary">
        Управление спорами между
        клиентами и фрилансерами.
      </Text>

      <Card
        style={{
          marginTop: 24,
        }}
      >
        {disputes.length === 0 ? (
          <Empty description="Споров пока нет" />
        ) : (
          <List
            dataSource={disputes}
            renderItem={(
              dispute
            ) => {
              const status =
                statusConfig[
                  dispute.status
                ];

              return (
                <List.Item
                  actions={[
                    <Button
                      icon={
                        <EyeOutlined />
                      }
                      onClick={() =>
                        setSelectedDispute(
                          dispute
                        )
                      }
                    >
                      View
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>
                          Dispute #
                          {
                            dispute.id
                          }
                        </Text>

                        <Tag
                          color={
                            status.color
                          }
                        >
                          {
                            status.label
                          }
                        </Tag>
                      </Space>
                    }
                    description={
                      <>
                        Contract #
                        {
                          dispute.contract
                        }
                        {" • "}
                        Opened by #
                        {
                          dispute.opened_by
                        }
                      </>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>

      <Modal
        title={
          selectedDispute
            ? `Dispute #${selectedDispute.id}`
            : "Dispute"
        }
        open={
          !!selectedDispute
        }
        onCancel={closeModal}
        footer={null}
        width={650}
      >
        {selectedDispute && (
          <Space
            direction="vertical"
            size="large"
            style={{
              width: "100%",
            }}
          >
            <Descriptions
              bordered
              column={1}
            >
              <Descriptions.Item label="Contract">
                #
                {
                  selectedDispute.contract
                }
              </Descriptions.Item>

              <Descriptions.Item label="Opened By">
                #
                {
                  selectedDispute.opened_by
                }
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Tag
                  color={
                    statusConfig[
                      selectedDispute
                        .status
                    ].color
                  }
                >
                  {
                    statusConfig[
                      selectedDispute
                        .status
                    ].label
                  }
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Reason">
                {
                  selectedDispute.reason
                }
              </Descriptions.Item>

              {selectedDispute.resolution && (
                <Descriptions.Item label="Resolution">
                  {
                    selectedDispute.resolution
                  }
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedDispute.status ===
              "OPEN" && (
              <Button
                type="primary"
                icon={
                  <FileSearchOutlined />
                }
                loading={
                  startMutation.isPending
                }
                onClick={() =>
                  startMutation.mutate(
                    selectedDispute.id
                  )
                }
              >
                Start Review
              </Button>
            )}

            {selectedDispute.status ===
              "IN_REVIEW" && (
              <>
                <Input.TextArea
                  rows={5}
                  value={
                    resolution
                  }
                  onChange={(event) =>
                    setResolution(
                      event.target
                        .value
                    )
                  }
                  placeholder="Write the resolution..."
                />

                <Space wrap>
                  <Button
                    type="primary"
                    icon={
                      <CheckOutlined />
                    }
                    loading={
                      resolveClientMutation.isPending
                    }
                    disabled={
                      !resolution.trim()
                    }
                    onClick={() =>
                      resolveClientMutation.mutate(
                        {
                          id: selectedDispute.id,
                          text: resolution,
                        }
                      )
                    }
                  >
                    Resolve for Client
                  </Button>

                  <Button
                    icon={
                      <CheckOutlined />
                    }
                    loading={
                      resolveFreelancerMutation.isPending
                    }
                    disabled={
                      !resolution.trim()
                    }
                    onClick={() =>
                      resolveFreelancerMutation.mutate(
                        {
                          id: selectedDispute.id,
                          text: resolution,
                        }
                      )
                    }
                  >
                    Resolve for Freelancer
                  </Button>

                  <Button
                    danger
                    icon={
                      <CloseOutlined />
                    }
                    loading={
                      rejectMutation.isPending
                    }
                    disabled={
                      !resolution.trim()
                    }
                    onClick={() =>
                      rejectMutation.mutate(
                        {
                          id: selectedDispute.id,
                          text: resolution,
                        }
                      )
                    }
                  >
                    Reject
                  </Button>
                </Space>
              </>
            )}
          </Space>
        )}
      </Modal>
    </div>
  );
}
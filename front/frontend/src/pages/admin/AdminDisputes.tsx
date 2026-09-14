import { useEffect, useState } from "react";
import {
  Button,
  Card,
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
  CloseOutlined,
  EyeOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
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

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const statusColors: Record<
  DisputeStatus,
  string
> = {
  OPEN: "orange",
  IN_REVIEW: "blue",
  RESOLVED_CLIENT: "green",
  RESOLVED_FREELANCER: "green",
  REJECTED: "red",
};

const statusLabels: Record<
  DisputeStatus,
  string
> = {
  OPEN: "Open",
  IN_REVIEW: "In review",
  RESOLVED_CLIENT: "Resolved for client",
  RESOLVED_FREELANCER: "Resolved for freelancer",
  REJECTED: "Rejected",
};

export default function AdminDisputes() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const [disputes, setDisputes] = useState<
    Dispute[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);

  const [selectedDispute, setSelectedDispute] =
    useState<Dispute | null>(null);

  const [resolution, setResolution] =
    useState("");

  const loadDisputes = async () => {
    setLoading(true);

    try {
      const response =
        await getDisputesRequest();

      setDisputes(response.results);
    } catch {
      message.error(
        "Не удалось загрузить disputes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (user.role !== "ADMIN") {
      navigate("/dashboard", {
        replace: true,
      });

      return;
    }

    loadDisputes();
  }, [user, navigate]);

  const closeModal = () => {
    setSelectedDispute(null);
    setResolution("");
  };

  const runAction = async (
    action: () => Promise<Dispute>,
    successText: string
  ) => {
    setActionLoading(true);

    try {
      await action();

      message.success(successText);
      closeModal();
      await loadDisputes();
    } catch {
      message.error(
        "Не удалось выполнить действие"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartReview = () => {
    if (!selectedDispute) {
      return;
    }

    runAction(
      () =>
        startDisputeReviewRequest(
          selectedDispute.id
        ),
      "Dispute отправлен на рассмотрение"
    );
  };

  const handleResolveClient = () => {
    if (!selectedDispute) {
      return;
    }

    if (!resolution.trim()) {
      message.warning(
        "Введите решение"
      );

      return;
    }

    runAction(
      () =>
        resolveDisputeClientRequest(
          selectedDispute.id,
          resolution.trim()
        ),
      "Dispute решён в пользу клиента"
    );
  };

  const handleResolveFreelancer = () => {
    if (!selectedDispute) {
      return;
    }

    if (!resolution.trim()) {
      message.warning(
        "Введите решение"
      );

      return;
    }

    runAction(
      () =>
        resolveDisputeFreelancerRequest(
          selectedDispute.id,
          resolution.trim()
        ),
      "Dispute решён в пользу freelancer"
    );
  };

  const handleReject = () => {
    if (!selectedDispute) {
      return;
    }

    if (!resolution.trim()) {
      message.warning(
        "Введите решение"
      );

      return;
    }

    runAction(
      () =>
        rejectDisputeRequest(
          selectedDispute.id,
          resolution.trim()
        ),
      "Dispute отклонён"
    );
  };

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div>
      <Title level={2}>
        Disputes
      </Title>

      <Text type="secondary">
        Управление спорами между клиентами и
        freelancer-ами
      </Text>

      <div style={{ marginTop: 24 }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: 48,
            }}
          >
            <Spin size="large" />
          </div>
        ) : disputes.length === 0 ? (
          <Empty description="Disputes не найдены" />
        ) : (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 1,
              md: 2,
              lg: 3,
            }}
            dataSource={disputes}
            renderItem={(dispute) => (
              <List.Item>
                <Card
                  title={`Dispute #${dispute.id}`}
                  extra={
                    <Tag
                      color={
                        statusColors[
                          dispute.status
                        ]
                      }
                    >
                      {
                        statusLabels[
                          dispute.status
                        ]
                      }
                    </Tag>
                  }
                  actions={[
                    <Button
                      key="view"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        setSelectedDispute(
                          dispute
                        );
                        setResolution(
                          dispute.resolution || ""
                        );
                      }}
                    >
                      Open
                    </Button>,
                  ]}
                >
                  <Space
                    direction="vertical"
                    size={8}
                    style={{ width: "100%" }}
                  >
                    <Text>
                      Contract:{" "}
                      {dispute.contract}
                    </Text>

                    <Text>
                      Opened by:{" "}
                      {dispute.opened_by}
                    </Text>

                    <Paragraph
                      ellipsis={{
                        rows: 3,
                      }}
                    >
                      {dispute.reason}
                    </Paragraph>

                    <Text type="secondary">
                      {new Date(
                        dispute.created_at
                      ).toLocaleString()}
                    </Text>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>

      <Modal
        open={!!selectedDispute}
        title={
          selectedDispute
            ? `Dispute #${selectedDispute.id}`
            : "Dispute"
        }
        onCancel={closeModal}
        footer={null}
        width={700}
      >
        {selectedDispute && (
          <Space
            direction="vertical"
            size={16}
            style={{ width: "100%" }}
          >
            <div>
              <Text strong>
                Status:{" "}
              </Text>

              <Tag
                color={
                  statusColors[
                    selectedDispute.status
                  ]
                }
              >
                {
                  statusLabels[
                    selectedDispute.status
                  ]
                }
              </Tag>
            </div>

            <div>
              <Text strong>
                Contract:
              </Text>{" "}
              {selectedDispute.contract}
            </div>

            <div>
              <Text strong>
                Opened by:
              </Text>{" "}
              {selectedDispute.opened_by}
            </div>

            <div>
              <Text strong>
                Reason:
              </Text>

              <Paragraph>
                {selectedDispute.reason}
              </Paragraph>
            </div>

            <div>
              <Text strong>
                Resolution:
              </Text>

              <TextArea
                rows={4}
                value={resolution}
                onChange={(event) => {
                  setResolution(
                    event.target.value
                  );
                }}
                placeholder="Введите решение по спору"
                disabled={
                  selectedDispute.status ===
                    "RESOLVED_CLIENT" ||
                  selectedDispute.status ===
                    "RESOLVED_FREELANCER" ||
                  selectedDispute.status ===
                    "REJECTED"
                }
              />
            </div>

            <Space wrap>
              {selectedDispute.status ===
                "OPEN" && (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  loading={actionLoading}
                  onClick={handleStartReview}
                >
                  Start review
                </Button>
              )}

              {(selectedDispute.status ===
                "OPEN" ||
                selectedDispute.status ===
                  "IN_REVIEW") && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    loading={actionLoading}
                    onClick={
                      handleResolveClient
                    }
                  >
                    Resolve client
                  </Button>

                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    loading={actionLoading}
                    onClick={
                      handleResolveFreelancer
                    }
                  >
                    Resolve freelancer
                  </Button>

                  <Button
                    danger
                    icon={<CloseOutlined />}
                    loading={actionLoading}
                    onClick={handleReject}
                  >
                    Reject
                  </Button>
                </>
              )}
            </Space>
          </Space>
        )}
      </Modal>
    </div>
  );
}
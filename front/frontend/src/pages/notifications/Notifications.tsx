import {
  Alert,
  Button,
  Card,
  Empty,
  List,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";

import {
  CheckOutlined,
  BellOutlined,
} from "@ant-design/icons";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getNotificationsRequest,
  markAllNotificationsReadRequest,
  markNotificationReadRequest,
} from "../../api/notifications";

import type {
  NotificationType,
} from "../../types/notification";

const { Title, Text } = Typography;

const typeConfig: Record<
  NotificationType,
  {
    label: string;
    color: string;
  }
> = {
  PROPOSAL: {
    label: "Proposal",
    color: "blue",
  },
  CONTRACT: {
    label: "Contract",
    color: "green",
  },
  MILESTONE: {
    label: "Milestone",
    color: "orange",
  },
  PAYMENT: {
    label: "Payment",
    color: "cyan",
  },
  REVIEW: {
    label: "Review",
    color: "purple",
  },
  DISPUTE: {
    label: "Dispute",
    color: "red",
  },
  SYSTEM: {
    label: "System",
    color: "default",
  },
};

export default function Notifications() {
  const queryClient =
    useQueryClient();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn:
      getNotificationsRequest,
  });

  const readMutation =
    useMutation({
      mutationFn:
        markNotificationReadRequest,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "notifications",
          ],
        });
      },

      onError: () => {
        message.error(
          "Не удалось отметить уведомление"
        );
      },
    });

  const markAllMutation =
    useMutation({
      mutationFn:
        markAllNotificationsReadRequest,

      onSuccess: () => {
        message.success(
          "All notifications marked as read"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "notifications",
          ],
        });
      },

      onError: () => {
        message.error(
          "Не удалось обновить уведомления"
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
        message="Не удалось загрузить уведомления"
      />
    );
  }

  const notifications =
    data?.results ?? [];

  const unreadCount =
    notifications.filter(
      (item) =>
        !item.is_read
    ).length;

  return (
    <div>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: 16,
            flexWrap:
              "wrap",
          }}
        >
          <div>
            <Title
              level={2}
              style={{
                margin: 0,
              }}
            >
              <BellOutlined />{" "}
              Notifications
            </Title>

            <Text type="secondary">
              {unreadCount} unread
              notification
              {unreadCount === 1
                ? ""
                : "s"}
            </Text>
          </div>

          {unreadCount > 0 && (
            <Button
              icon={
                <CheckOutlined />
              }
              loading={
                markAllMutation.isPending
              }
              onClick={() =>
                markAllMutation.mutate()
              }
            >
              Mark all as read
            </Button>
          )}
        </div>
      </Card>

      <Card
        style={{
          marginTop: 20,
        }}
      >
        {notifications.length ===
        0 ? (
          <Empty description="Уведомлений пока нет" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={
              notifications
            }
            renderItem={(
              notification
            ) => {
              const config =
                typeConfig[
                  notification
                    .notification_type
                ];

              return (
                <List.Item
                  style={{
                    padding: 16,
                    background:
                      notification.is_read
                        ? undefined
                        : "#f0f5ff",
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                  actions={
                    !notification.is_read
                      ? [
                          <Button
                            type="link"
                            loading={
                              readMutation.isPending
                            }
                            onClick={() =>
                              readMutation.mutate(
                                notification.id
                              )
                            }
                          >
                            Mark as read
                          </Button>,
                        ]
                      : undefined
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <BellOutlined
                        style={{
                          fontSize: 22,
                        }}
                      />
                    }
                    title={
                      <div>
                        <Text strong>
                          {
                            notification.title
                          }
                        </Text>{" "}
                        <Tag
                          color={
                            config.color
                          }
                        >
                          {
                            config.label
                          }
                        </Tag>
                        {!notification.is_read && (
                          <Tag color="blue">
                            New
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div
                          style={{
                            marginBottom: 6,
                          }}
                        >
                          {
                            notification.message
                          }
                        </div>

                        <Text type="secondary">
                          {new Date(
                            notification.created_at
                          ).toLocaleString()}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
}
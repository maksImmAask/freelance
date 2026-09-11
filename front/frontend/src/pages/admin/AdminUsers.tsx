import {
  Alert,
  Avatar,
  Button,
  Card,
  Empty,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";

import {
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  blockAdminUserRequest,
  getAdminUsersRequest,
  unblockAdminUserRequest,
} from "../../api/admin";

import type { AdminUser } from "../../api/admin";

import {
  useAuthStore,
} from "../../store/authStore";

const { Title, Text } = Typography;

export default function AdminUsers() {
  const currentUser =
    useAuthStore(
      (state) => state.user
    );

  const queryClient =
    useQueryClient();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn:
      getAdminUsersRequest,
  });

  const blockMutation =
    useMutation({
      mutationFn:
        blockAdminUserRequest,

      onSuccess: () => {
        message.success(
          "Пользователь заблокирован"
        );

        queryClient.invalidateQueries({
          queryKey: ["admin-users"],
        });
      },

      onError: () => {
        message.error(
          "Не удалось заблокировать пользователя"
        );
      },
    });

  const unblockMutation =
    useMutation({
      mutationFn:
        unblockAdminUserRequest,

      onSuccess: () => {
        message.success(
          "Пользователь разблокирован"
        );

        queryClient.invalidateQueries({
          queryKey: ["admin-users"],
        });
      },

      onError: () => {
        message.error(
          "Не удалось разблокировать пользователя"
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

  if (isError) {
    return (
      <Alert
        type="error"
        message="Не удалось загрузить пользователей"
        description="Проверьте admin API."
      />
    );
  }

  const users =
    data?.results ?? [];

  return (
    <div>
      <Title level={2}>
        Users
      </Title>

      <Text type="secondary">
        Управление пользователями платформы.
      </Text>

      <Card
        style={{
          marginTop: 24,
        }}
      >
        {users.length === 0 ? (
          <Empty description="Пользователей нет" />
        ) : (
          <Table<AdminUser>
            rowKey="id"
            dataSource={users}
            scroll={{
              x: 900,
            }}
            pagination={{
              pageSize: 10,
            }}
            columns={[
              {
                title: "User",
                key: "user",
                render: (_, record) => (
                  <Space>
                    <Avatar
                      icon={
                        <UserOutlined />
                      }
                    />

                    <div>
                      <Text strong>
                        {
                          record.username
                        }
                      </Text>

                      <br />

                      <Text type="secondary">
                        {record.email}
                      </Text>
                    </div>
                  </Space>
                ),
              },

              {
                title: "Role",
                dataIndex: "role",
                key: "role",
                render: (
                  role: AdminUser["role"]
                ) => (
                  <Tag
                    color={
                      role === "ADMIN"
                        ? "red"
                        : role ===
                          "CLIENT"
                        ? "green"
                        : "blue"
                    }
                  >
                    {role}
                  </Tag>
                ),
              },

              {
                title: "Verified",
                dataIndex:
                  "is_verified",
                key: "is_verified",
                render: (
                  verified: boolean
                ) => (
                  <Tag
                    color={
                      verified
                        ? "green"
                        : "orange"
                    }
                  >
                    {verified
                      ? "Verified"
                      : "Not verified"}
                  </Tag>
                ),
              },

              {
                title: "Status",
                dataIndex:
                  "is_active",
                key: "is_active",
                render: (
                  active: boolean
                ) => (
                  <Tag
                    color={
                      active
                        ? "green"
                        : "red"
                    }
                  >
                    {active
                      ? "Active"
                      : "Blocked"}
                  </Tag>
                ),
              },

              {
                title: "Joined",
                dataIndex:
                  "date_joined",
                key: "date_joined",
                render: (
                  value: string
                ) =>
                  new Date(
                    value
                  ).toLocaleDateString(),
              },

              {
                title: "Actions",
                key: "actions",
                render: (_, record) => {
                  const isSelf =
                    currentUser?.id ===
                    record.id;

                  if (isSelf) {
                    return (
                      <Tag>
                        Current user
                      </Tag>
                    );
                  }

                  return record.is_active ? (
                    <Popconfirm
                      title="Block this user?"
                      description="Пользователь больше не сможет войти."
                      okText="Block"
                      cancelText="Cancel"
                      onConfirm={() =>
                        blockMutation.mutate(
                          record.id
                        )
                      }
                    >
                      <Button
                        danger
                        icon={
                          <LockOutlined />
                        }
                        loading={
                          blockMutation.isPending
                        }
                      >
                        Block
                      </Button>
                    </Popconfirm>
                  ) : (
                    <Button
                      type="primary"
                      icon={
                        <UnlockOutlined />
                      }
                      loading={
                        unblockMutation.isPending
                      }
                      onClick={() =>
                        unblockMutation.mutate(
                          record.id
                        )
                      }
                    >
                      Unblock
                    </Button>
                  );
                },
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
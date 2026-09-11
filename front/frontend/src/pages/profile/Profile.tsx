import React from "react";

import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";

import {
  EditOutlined,
  UserOutlined,
  SaveOutlined,
} from "@ant-design/icons";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getClientProfileRequest,
  getFreelancerProfileRequest,
  updateClientProfileRequest,
  updateFreelancerProfileRequest,
} from "../../api/users";

import {
  useAuthStore,
} from "../../store/authStore";

const {
  Title,
  Text,
} = Typography;

interface FreelancerFormValues {
  bio: string;
  specialization: string;
  hourly_rate: number | null;
  experience_years: number;
}

interface ClientFormValues {
  company_name: string;
  bio: string;
}

export default function Profile() {
  const user =
    useAuthStore(
      (state) => state.user
    );

  const queryClient =
    useQueryClient();

  const [
    editing,
    setEditing,
  ] = React.useState(false);

  const [
    freelancerForm,
  ] =
    Form.useForm<FreelancerFormValues>();

  const [
    clientForm,
  ] =
    Form.useForm<ClientFormValues>();

  const isFreelancer =
    user?.role ===
    "FREELANCER";

  const isClient =
    user?.role ===
    "CLIENT";

  const freelancerQuery =
    useQuery({
      queryKey: [
        "freelancer-profile",
      ],
      queryFn:
        getFreelancerProfileRequest,
      enabled:
        isFreelancer,
    });

  const clientQuery =
    useQuery({
      queryKey: [
        "client-profile",
      ],
      queryFn:
        getClientProfileRequest,
      enabled:
        isClient,
    });

  React.useEffect(() => {
    if (
      freelancerQuery.data &&
      isFreelancer
    ) {
      freelancerForm.setFieldsValue({
        bio:
          freelancerQuery.data.bio,
        specialization:
          freelancerQuery.data
            .specialization,
        hourly_rate:
          freelancerQuery.data
            .hourly_rate
            ? Number(
                freelancerQuery.data
                  .hourly_rate
              )
            : null,
        experience_years:
          freelancerQuery.data
            .experience_years,
      });
    }
  }, [
    freelancerQuery.data,
    isFreelancer,
    freelancerForm,
  ]);

  React.useEffect(() => {
    if (
      clientQuery.data &&
      isClient
    ) {
      clientForm.setFieldsValue({
        company_name:
          clientQuery.data
            .company_name,
        bio:
          clientQuery.data.bio,
      });
    }
  }, [
    clientQuery.data,
    isClient,
    clientForm,
  ]);

  const updateFreelancerMutation =
    useMutation({
      mutationFn:
        updateFreelancerProfileRequest,

      onSuccess: () => {
        message.success(
          "Профиль обновлён"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "freelancer-profile",
          ],
        });

        setEditing(false);
      },

      onError: () => {
        message.error(
          "Не удалось обновить профиль"
        );
      },
    });

  const updateClientMutation =
    useMutation({
      mutationFn:
        updateClientProfileRequest,

      onSuccess: () => {
        message.success(
          "Профиль обновлён"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "client-profile",
          ],
        });

        setEditing(false);
      },

      onError: () => {
        message.error(
          "Не удалось обновить профиль"
        );
      },
    });

  const loading =
    freelancerQuery.isLoading ||
    clientQuery.isLoading;

  const error =
    freelancerQuery.isError ||
    clientQuery.isError;

  const handleFreelancerSubmit =
    async (
      values: FreelancerFormValues
    ) => {
      updateFreelancerMutation.mutate({
        bio: values.bio,
        specialization:
          values.specialization,
        hourly_rate:
          values.hourly_rate ===
          null
            ? "0"
            : String(
                values.hourly_rate
              ),
        experience_years:
          values.experience_years,
      });
    };

  const handleClientSubmit =
    async (
      values: ClientFormValues
    ) => {
      updateClientMutation.mutate({
        company_name:
          values.company_name,
        bio: values.bio,
      });
    };

  if (!user) {
    return (
      <Alert
        type="error"
        message="Пользователь не найден"
      />
    );
  }

  if (loading) {
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

  if (error) {
    return (
      <Alert
        type="error"
        message="Не удалось загрузить профиль"
        description="Проверьте profile API на Django."
      />
    );
  }

  return (
    <div>
      <Card>
        <Row
          gutter={[
            24,
            24,
          ]}
          align="middle"
        >
          <Col>
            <Avatar
              size={100}
              src={user.avatar || undefined}
              icon={
                <UserOutlined />
              }
            />
          </Col>

          <Col flex="1">
            <Title
              level={2}
              style={{
                margin: 0,
              }}
            >
              {user.username}
            </Title>

            <Text type="secondary">
              {user.email}
            </Text>

            <div
              style={{
                marginTop: 10,
              }}
            >
              <Tag
                color={
                  user.role ===
                  "FREELANCER"
                    ? "blue"
                    : user.role ===
                      "CLIENT"
                    ? "green"
                    : "red"
                }
              >
                {user.role}
              </Tag>

              <Tag
                color={
                  user.is_verified
                    ? "green"
                    : "orange"
                }
              >
                {user.is_verified
                  ? "Verified"
                  : "Not verified"}
              </Tag>
            </div>
          </Col>

          {!editing && (
            <Col>
              <Button
                type="primary"
                icon={
                  <EditOutlined />
                }
                onClick={() =>
                  setEditing(true)
                }
              >
                Edit Profile
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      <Card
        title={
          isFreelancer
            ? "Freelancer Profile"
            : isClient
            ? "Client Profile"
            : "Profile"
        }
        style={{
          marginTop: 24,
        }}
      >
        {isFreelancer &&
          freelancerQuery.data && (
            <>
              {!editing ? (
                <Descriptions
                  bordered
                  column={1}
                >
                  <Descriptions.Item label="Specialization">
                    {freelancerQuery.data
                      .specialization ||
                      "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Bio">
                    {freelancerQuery.data
                      .bio || "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Hourly Rate">
                    {freelancerQuery.data
                      .hourly_rate
                      ? `$${freelancerQuery.data.hourly_rate}/hour`
                      : "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Experience">
                    {
                      freelancerQuery.data
                        .experience_years
                    }{" "}
                    years
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Form
                  form={
                    freelancerForm
                  }
                  layout="vertical"
                  onFinish={
                    handleFreelancerSubmit
                  }
                >
                  <Form.Item
                    name="specialization"
                    label="Specialization"
                    rules={[
                      {
                        required: true,
                        message:
                          "Введите специализацию",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Frontend Developer"
                    />
                  </Form.Item>

                  <Form.Item
                    name="bio"
                    label="Bio"
                  >
                    <Input.TextArea
                      rows={5}
                      placeholder="Расскажите о себе..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="hourly_rate"
                    label="Hourly Rate"
                    rules={[
                      {
                        type: "number",
                        min: 0,
                        message:
                          "Цена не может быть отрицательной",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{
                        width: "100%",
                      }}
                      min={0}
                      precision={2}
                      prefix="$"
                    />
                  </Form.Item>

                  <Form.Item
                    name="experience_years"
                    label="Experience"
                    rules={[
                      {
                        required: true,
                        message:
                          "Введите опыт",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{
                        width: "100%",
                      }}
                      min={0}
                      max={100}
                    />
                  </Form.Item>

                  <Divider />

                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={
                      <SaveOutlined />
                    }
                    loading={
                      updateFreelancerMutation.isPending
                    }
                  >
                    Save Changes
                  </Button>

                  <Button
                    style={{
                      marginLeft: 8,
                    }}
                    onClick={() =>
                      setEditing(false)
                    }
                  >
                    Cancel
                  </Button>
                </Form>
              )}
            </>
          )}

        {isClient &&
          clientQuery.data && (
            <>
              {!editing ? (
                <Descriptions
                  bordered
                  column={1}
                >
                  <Descriptions.Item label="Company">
                    {clientQuery.data
                      .company_name ||
                      "—"}
                  </Descriptions.Item>

                  <Descriptions.Item label="Bio">
                    {clientQuery.data
                      .bio || "—"}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Form
                  form={
                    clientForm
                  }
                  layout="vertical"
                  onFinish={
                    handleClientSubmit
                  }
                >
                  <Form.Item
                    name="company_name"
                    label="Company Name"
                  >
                    <Input
                      placeholder="My Company"
                    />
                  </Form.Item>

                  <Form.Item
                    name="bio"
                    label="Bio"
                  >
                    <Input.TextArea
                      rows={5}
                      placeholder="Расскажите о компании..."
                    />
                  </Form.Item>

                  <Divider />

                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={
                      <SaveOutlined />
                    }
                    loading={
                      updateClientMutation.isPending
                    }
                  >
                    Save Changes
                  </Button>

                  <Button
                    style={{
                      marginLeft: 8,
                    }}
                    onClick={() =>
                      setEditing(false)
                    }
                  >
                    Cancel
                  </Button>
                </Form>
              )}
            </>
          )}

        {user.role ===
          "ADMIN" && (
          <Alert
            type="info"
            message="Administrator account"
            description="Для администратора отдельные профильные поля не требуются."
          />
        )}
      </Card>
    </div>
  );
}
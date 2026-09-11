import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Typography,
  message,
} from "antd";

import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

import type {
  RegisterData,
  UserRole,
} from "../../types/auth";

const { Title, Text } =
  Typography;

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export default function Register() {
  const navigate = useNavigate();

  const register =
    useAuthStore(
      (state) => state.register
    );

  const isLoading =
    useAuthStore(
      (state) => state.isLoading
    );

  const [form] =
    Form.useForm<RegisterFormValues>();

  const handleSubmit = async (
    values: RegisterFormValues
  ) => {
    try {
      const data: RegisterData = {
        username: values.username,
        email: values.email,
        password: values.password,
        role: values.role,
      };

      await register(data);

      message.success(
        "Регистрация прошла успешно"
      );

      navigate("/dashboard");
    } catch (error: any) {
      const responseData =
        error?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const firstError =
          Object.values(
            responseData
          )[0];

        if (
          Array.isArray(firstError)
        ) {
          message.error(
            String(firstError[0])
          );
        } else {
          message.error(
            String(firstError)
          );
        }
      } else {
        message.error(
          "Не удалось зарегистрироваться"
        );
      }
    }
  };

  return (
    <Card>
      <Title
        level={3}
        style={{
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Create Account
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[
            {
              required: true,
              message:
                "Введите username",
            },
            {
              min: 3,
              message:
                "Минимум 3 символа",
            },
          ]}
        >
          <Input
            prefix={
              <UserOutlined />
            }
            placeholder="Username"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            {
              required: true,
              message:
                "Введите email",
            },
            {
              type: "email",
              message:
                "Введите корректный email",
            },
          ]}
        >
          <Input
            prefix={
              <MailOutlined />
            }
            placeholder="Email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            {
              required: true,
              message:
                "Введите пароль",
            },
            {
              min: 8,
              message:
                "Пароль должен содержать минимум 8 символов",
            },
          ]}
        >
          <Input.Password
            prefix={
              <LockOutlined />
            }
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm Password"
          dependencies={[
            "password",
          ]}
          rules={[
            {
              required: true,
              message:
                "Повторите пароль",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (
                  !value ||
                  getFieldValue(
                    "password"
                  ) === value
                ) {
                  return Promise.resolve();
                }

                return Promise.reject(
                  new Error(
                    "Пароли не совпадают"
                  )
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={
              <LockOutlined />
            }
            placeholder="Confirm Password"
          />
        </Form.Item>

        <Form.Item
          name="role"
          label="Account Type"
          initialValue="FREELANCER"
          rules={[
            {
              required: true,
              message:
                "Выберите тип аккаунта",
            },
          ]}
        >
          <Select
            options={[
              {
                value: "FREELANCER",
                label:
                  "Freelancer",
              },
              {
                value: "CLIENT",
                label: "Client",
              },
            ]}
          />
        </Form.Item>

        <Form.Item
          style={{
            marginBottom: 12,
          }}
        >
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isLoading}
          >
            Create Account
          </Button>
        </Form.Item>

        <div
          style={{
            textAlign: "center",
          }}
        >
          <Text type="secondary">
            Already have an account?{" "}
          </Text>

          <Link to="/login">
            Login
          </Link>
        </div>
      </Form>
    </Card>
  );
}
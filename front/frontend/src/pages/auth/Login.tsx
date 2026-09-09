import { useState } from "react";
import { Button, Form, Input, Card, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const { Title } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [error, setError] = useState("");

  const onFinish = async (values: LoginForm) => {
    try {
      setError("");

      await login(values);

      message.success("Успешный вход");
      navigate("/dashboard");
    } catch {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card style={{ width: 400 }}>
        <Title level={2}>Вход</Title>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: "Введите username",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[
              {
                required: true,
                message: "Введите пароль",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
          >
            Войти
          </Button>
        </Form>
      </Card>
    </div>
  );
}
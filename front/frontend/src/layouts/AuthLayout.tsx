import {
  Layout,
  Typography,
} from "antd";

import {
  Outlet,
} from "react-router-dom";

const { Content } = Layout;

const { Title, Text } =
  Typography;

export default function AuthLayout() {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
      }}
    >
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <Title
              level={2}
              style={{
                marginBottom: 4,
              }}
            >
              Freelance Marketplace
            </Title>

            <Text type="secondary">
              Find projects. Work. Earn.
            </Text>
          </div>

          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
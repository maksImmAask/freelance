import {
  Card,
  Col,
  Row,
  Statistic,
  Tag,
  Typography,
} from "antd";
import {
  FileDoneOutlined,
  FolderOpenOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "../../store/authStore";

const { Title, Text } = Typography;

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  const roleLabel = {
    CLIENT: "Client",
    FREELANCER: "Freelancer",
    ADMIN: "Administrator",
  }[user.role];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          Welcome, {user.username}! 👋
        </Title>

        <Text type="secondary">
          Your marketplace dashboard
        </Text>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" gutter={24}>
          <Col>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
            >
              {user.username
                .charAt(0)
                .toUpperCase()}
            </div>
          </Col>

          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {user.username}
            </Title>

            <Text type="secondary">
              {user.email}
            </Text>

            <br />

            <Tag color="blue">
              {roleLabel}
            </Tag>

            {user.is_verified && (
              <Tag color="green">
                Verified
              </Tag>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title={
                user.role === "FREELANCER"
                  ? "Available Projects"
                  : "My Projects"
              }
              value={0}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Proposals"
              value={0}
              prefix={<FolderOpenOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Active Contracts"
              value={0}
              prefix={<FileDoneOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
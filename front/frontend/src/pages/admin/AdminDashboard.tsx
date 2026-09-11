import {
  Alert,
  Card,
  Col,
  Row,
  Spin,
  Statistic,
  Typography,
} from "antd";

import {
  UserOutlined,
  TeamOutlined,
  ProjectOutlined,
  FileTextOutlined,
  SolutionOutlined,
  StarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAdminDashboardRequest,
} from "../../api/admin";

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn:
      getAdminDashboardRequest,
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

  if (isError || !data) {
    return (
      <Alert
        type="error"
        message="Не удалось загрузить Admin Dashboard"
        description="Проверьте admin API и права администратора."
      />
    );
  }

  return (
    <div>
      <Title level={2}>
        Admin Dashboard
      </Title>

      <Text type="secondary">
        Общая статистика платформы.
      </Text>

      <Row
        gutter={[16, 16]}
        style={{
          marginTop: 24,
        }}
      >
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Users"
              value={data.users}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Clients"
              value={data.clients}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Freelancers"
              value={data.freelancers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Projects"
              value={data.projects}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Published Projects"
              value={data.published_projects}
              prefix={
                <CheckCircleOutlined />
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Proposals"
              value={data.proposals}
              prefix={
                <SolutionOutlined />
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Contracts"
              value={data.contracts}
              prefix={
                <FileTextOutlined />
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Contracts"
              value={data.active_contracts}
              prefix={
                <CheckCircleOutlined />
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Reviews"
              value={data.reviews}
              prefix={<StarOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Open Disputes"
              value={data.open_disputes}
              prefix={
                <WarningOutlined />
              }
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
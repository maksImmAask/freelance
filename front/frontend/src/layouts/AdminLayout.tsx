import {
  Avatar,
  Layout,
  Menu,
  Typography,
} from "antd";

import {
  DashboardOutlined,
  UserOutlined,
  ProjectOutlined,
  FileTextOutlined,
  WarningOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuthStore,
} from "../store/authStore";

const {
  Sider,
  Header,
  Content,
} = Layout;

const { Text } = Typography;

export default function AdminLayout() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const user =
    useAuthStore(
      (state) => state.user
    );

  const logout =
    useAuthStore(
      (state) => state.logout
    );

  const selectedKey =
    location.pathname;

  const handleLogout =
    () => {
      logout();
      navigate(
        "/login"
      );
    };

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        width={230}
        theme="dark"
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Marketplace Admin
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[
            selectedKey,
          ]}
          items={[
            {
              key: "/admin/dashboard",
              icon: (
                <DashboardOutlined />
              ),
              label: "Dashboard",
              onClick: () =>
                navigate(
                  "/admin/dashboard"
                ),
            },

            {
              key: "/admin/users",
              icon: (
                <UserOutlined />
              ),
              label: "Users",
              onClick: () =>
                navigate(
                  "/admin/users"
                ),
            },

            {
              key: "/admin/projects",
              icon: (
                <ProjectOutlined />
              ),
              label: "Projects",
              onClick: () =>
                navigate(
                  "/projects"
                ),
            },

            {
              key: "/admin/contracts",
              icon: (
                <FileTextOutlined />
              ),
              label: "Contracts",
              onClick: () =>
                navigate(
                  "/contracts"
                ),
            },

            {
              key: "/admin/disputes",
              icon: (
                <WarningOutlined />
              ),
              label: "Disputes",
              onClick: () =>
                navigate(
                  "/admin/disputes"
                ),
            },

            {
              key: "logout",
              icon: (
                <LogoutOutlined />
              ),
              label: "Logout",
              onClick:
                handleLogout,
            },
          ]}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background:
              "#fff",
            padding:
              "0 24px",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "flex-end",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: 12,
            }}
          >
            <Avatar
              icon={
                <UserOutlined />
              }
            />

            <div>
              <Text strong>
                {user?.username}
              </Text>

              <br />

              <Text type="secondary">
                Administrator
              </Text>
            </div>
          </div>
        </Header>

        <Content
          style={{
            padding: 24,
            background:
              "#f5f5f5",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
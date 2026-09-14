import {
  Avatar,
  Button,
  Layout,
  Menu,
  Typography,
} from "antd";

import {
  DashboardOutlined,
  FileTextOutlined,
  ProjectOutlined,
  DollarOutlined,
  StarOutlined,
  MessageOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import {
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "../store/authStore";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore(
    (state) => state.user
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  const isClient = user?.role === "CLIENT";

  const isFreelancer =
    user?.role === "FREELANCER";

  const isAdmin = user?.role === "ADMIN";

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/projects",
      icon: <ProjectOutlined />,
      label: isFreelancer
        ? "Find Projects"
        : "Projects",
    },
    {
      key: "/proposals",
      icon: <FileTextOutlined />,
      label: "Proposals",
    },
    {
      key: "/contracts",
      icon: <SafetyCertificateOutlined />,
      label: "Contracts",
    },
    {
      key: "/payments",
      icon: <DollarOutlined />,
      label: "Payments",
    },
    {
      key: "/reviews",
      icon: <StarOutlined />,
      label: "Reviews",
    },
    {
      key: "/chat",
      icon: <MessageOutlined />,
      label: "Chat",
    },
    {
      key: "/notifications",
      icon: <BellOutlined />,
      label: "Notifications",
    },
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
  ];

  const selectedKey =
    menuItems.find((item) =>
      location.pathname.startsWith(item.key)
    )?.key || "/dashboard";

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
      }}
    >
      <Sider
        theme="dark"
        width={240}
        collapsible={false}
        style={{
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            padding: "20px 16px",
            textAlign: "center",
          }}
        >
          Marketplace
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key);
          }}
        />
      </Sider>

      <Layout
        style={{
          minWidth: 0,
        }}
      >
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Text strong>
            {isAdmin
              ? "Administrator"
              : isClient
                ? "Client"
                : isFreelancer
                  ? "Freelancer"
                  : "User"}
          </Text>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Avatar
              src={user?.avatar || undefined}
              icon={<UserOutlined />}
            />

            <Text>
              {user?.username || "User"}
            </Text>

            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Header>

        <Content
          style={{
            padding: 24,
            minHeight: 280,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
import {
  AppstoreOutlined,
  BellOutlined,
  FileDoneOutlined,
  FolderOpenOutlined,
  MessageOutlined,
  ProjectOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Layout,
  Menu,
  Typography,
} from "antd";
import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const menuItems = useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.role === "CLIENT") {
      return [
        {
          key: "/dashboard",
          icon: <AppstoreOutlined />,
          label: "Dashboard",
        },
        {
          key: "/projects",
          icon: <ProjectOutlined />,
          label: "Projects",
        },
        {
          key: "/proposals",
          icon: <FolderOpenOutlined />,
          label: "My Proposals",
        },
        {
          key: "/contracts",
          icon: <FileDoneOutlined />,
          label: "Contracts",
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
    }

    if (user.role === "FREELANCER") {
      return [
        {
          key: "/dashboard",
          icon: <AppstoreOutlined />,
          label: "Dashboard",
        },
        {
          key: "/projects",
          icon: <ProjectOutlined />,
          label: "Find Projects",
        },
        {
          key: "/proposals",
          icon: <FolderOpenOutlined />,
          label: "My Proposals",
        },
        {
          key: "/contracts",
          icon: <FileDoneOutlined />,
          label: "My Contracts",
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
    }

    if (user.role === "ADMIN") {
      return [
        {
          key: "/dashboard",
          icon: <AppstoreOutlined />,
          label: "Dashboard",
        },
        {
          key: "/admin/users",
          icon: <UserOutlined />,
          label: "Users",
        },
        {
          key: "/projects",
          icon: <ProjectOutlined />,
          label: "Projects",
        },
        {
          key: "/contracts",
          icon: <FileDoneOutlined />,
          label: "Contracts",
        },
        {
          key: "/disputes",
          icon: <FolderOpenOutlined />,
          label: "Disputes",
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
    }

    return [];
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentKey =
    menuItems.find((item) =>
      location.pathname.startsWith(item.key)
    )?.key || "/dashboard";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Marketplace
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />

        <div
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
          }}
        >
          <Button
            danger
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: "#fff", width: "100%" }}
          >
            Logout
          </Button>
        </div>
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid #eee",
          }}
        >
          <Avatar
            src={user?.avatar || undefined}
            icon={<UserOutlined />}
          />

          <div>
            <Text strong>{user?.username}</Text>
            <br />
            <Text type="secondary">
              {user?.role}
            </Text>
          </div>
        </Header>

        <Content
          style={{
            margin: 24,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
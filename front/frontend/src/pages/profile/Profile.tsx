import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Spin,
  Typography,
  message,
} from "antd";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";

import { useAuthStore } from "../../store/authStore";
import {
  getClientProfileRequest,
  getFreelancerProfileRequest,
  updateClientProfileRequest,
  updateFreelancerProfileRequest,
} from "../../api/users";

import type {
  ClientProfile,
  FreelancerProfile,
} from "../../types/user";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Profile() {
  const user = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [freelancerProfile, setFreelancerProfile] =
    useState<FreelancerProfile | null>(null);

  const [clientProfile, setClientProfile] =
    useState<ClientProfile | null>(null);

  const [form] = Form.useForm();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      if (user.role === "ADMIN") {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        if (user.role === "FREELANCER") {
          const profile =
            await getFreelancerProfileRequest();

          setFreelancerProfile(profile);

          form.setFieldsValue({
            bio: profile.bio,
            specialization:
              profile.specialization,
            hourly_rate:
              profile.hourly_rate
                ? Number(profile.hourly_rate)
                : null,
            experience_years:
              profile.experience_years,
          });
        }

        if (user.role === "CLIENT") {
          const profile =
            await getClientProfileRequest();

          setClientProfile(profile);

          form.setFieldsValue({
            company_name:
              profile.company_name,
            bio: profile.bio,
          });
        }
      } catch {
        message.error(
          "Не удалось загрузить профиль"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, form]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    if (freelancerProfile) {
      form.setFieldsValue({
        bio: freelancerProfile.bio,
        specialization:
          freelancerProfile.specialization,
        hourly_rate:
          freelancerProfile.hourly_rate
            ? Number(freelancerProfile.hourly_rate)
            : null,
        experience_years:
          freelancerProfile.experience_years,
      });
    }

    if (clientProfile) {
      form.setFieldsValue({
        company_name:
          clientProfile.company_name,
        bio: clientProfile.bio,
      });
    }

    setEditing(false);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      setSaving(true);

      if (user?.role === "FREELANCER") {
        const updated =
          await updateFreelancerProfileRequest({
            bio: values.bio,
            specialization:
              values.specialization,
            hourly_rate:
              values.hourly_rate === null ||
              values.hourly_rate === undefined
                ? null
                : String(values.hourly_rate),
            experience_years:
              values.experience_years,
          });

        setFreelancerProfile(updated);
      }

      if (user?.role === "CLIENT") {
        const updated =
          await updateClientProfileRequest({
            company_name:
              values.company_name,
            bio: values.bio,
          });

        setClientProfile(updated);
      }

      message.success(
        "Профиль успешно обновлён"
      );

      setEditing(false);
    } catch {
      message.error(
        "Не удалось сохранить профиль"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: 48,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>
        Profile
      </Title>

      <Card
        title={user?.username || "User"}
        extra={
          user?.role !== "ADMIN" &&
          !editing ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          ) : null
        }
      >
        <Form
          form={form}
          layout="vertical"
          disabled={!editing}
        >
          <Form.Item label="Username">
            <Input
              value={user?.username || ""}
              disabled
            />
          </Form.Item>

          <Form.Item label="Email">
            <Input
              value={user?.email || ""}
              disabled
            />
          </Form.Item>

          <Form.Item label="Role">
            <Input
              value={user?.role || ""}
              disabled
            />
          </Form.Item>

          {user?.role === "FREELANCER" && (
            <>
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
                <Input />
              </Form.Item>

              <Form.Item
                name="bio"
                label="Bio"
              >
                <TextArea rows={4} />
              </Form.Item>

              <Form.Item
                name="hourly_rate"
                label="Hourly rate"
              >
                <InputNumber
                  min={0}
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>

              <Form.Item
                name="experience_years"
                label="Experience years"
              >
                <InputNumber
                  min={0}
                  style={{
                    width: "100%",
                  }}
                />
              </Form.Item>
            </>
          )}

          {user?.role === "CLIENT" && (
            <>
              <Form.Item
                name="company_name"
                label="Company name"
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="bio"
                label="Bio"
              >
                <TextArea rows={4} />
              </Form.Item>
            </>
          )}

          {editing && user?.role !== "ADMIN" && (
            <Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={handleSave}
              >
                Save
              </Button>

              <Button
                style={{
                  marginLeft: 8,
                }}
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            </Form.Item>
          )}
        </Form>

        {user?.role === "ADMIN" && (
          <Text type="secondary">
            Admin profile editing is not available.
          </Text>
        )}
      </Card>
    </div>
  );
}
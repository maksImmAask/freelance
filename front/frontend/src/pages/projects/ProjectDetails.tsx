import React from "react";

import {
  Alert,
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  SendOutlined,
} from "@ant-design/icons";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import dayjs from "dayjs";

import {
  deleteProjectRequest,
  getProjectRequest,
  publishProjectRequest,
} from "../../api/projects";

import { createProposalRequest } from "../../api/proposals";

import type { ProposalFormData } from "../../types/proposal";

import { useAuthStore } from "../../store/authStore";

import type { ProjectStatus } from "../../types/project";

import { AxiosError } from "axios";
const { Title, Text, Paragraph } = Typography;

const statusConfig: Record<
  ProjectStatus,
  {
    color: string;
    label: string;
  }
> = {
  DRAFT: {
    color: "default",
    label: "Draft",
  },
  PUBLISHED: {
    color: "blue",
    label: "Published",
  },
  IN_PROGRESS: {
    color: "orange",
    label: "In Progress",
  },
  COMPLETED: {
    color: "green",
    label: "Completed",
  },
  CANCELLED: {
    color: "red",
    label: "Cancelled",
  },
};

interface ProposalFormValues {
  cover_letter: string;
  price: number;
  delivery_days: number;
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);

  const projectId = Number(id);

  const [proposalForm] =
    Form.useForm<ProposalFormValues>();

  const [proposalModalOpen, setProposalModalOpen] =
    React.useState(false);

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectRequest(projectId),
    enabled: Number.isFinite(projectId),
  });

  const publishMutation = useMutation({
    mutationFn: () =>
      publishProjectRequest(projectId),

    onSuccess: () => {
      message.success("Project published");

      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },

    onError: () => {
      message.error("Не удалось опубликовать проект");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      deleteProjectRequest(projectId),

    onSuccess: () => {
      message.success("Project deleted");

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      navigate("/projects");
    },

    onError: () => {
      message.error("Не удалось удалить проект");
    },
  });

  const createProposalMutation = useMutation({
    mutationFn: (values: ProposalFormValues) => {
      const data: ProposalFormData = {
        project: projectId,
        cover_letter: values.cover_letter,
        price: String(values.price),
        delivery_days: values.delivery_days,
      };

      return createProposalRequest(data);
    },

    onSuccess: () => {
      message.success("Proposal sent successfully");

      proposalForm.resetFields();
      setProposalModalOpen(false);

      queryClient.invalidateQueries({
        queryKey: ["proposals"],
      });
    },

    onError: (error) => {
      if (error instanceof AxiosError) {
        const data = error.response?.data;

        if (data && typeof data === "object") {
          const firstError = Object.values(data)[0];

          if (Array.isArray(firstError)) {
            message.error(String(firstError[0]));
            return;
          }

          if (typeof firstError === "string") {
            message.error(firstError);
            return;
          }
        }
      }

      message.error("Не удалось отправить proposal");
    },
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

  if (isError || !project) {
    return (
      <Alert
        type="error"
        message="Project not found"
        description="Не удалось загрузить проект."
      />
    );
  }

  const isOwner =
    user?.role === "CLIENT" &&
    user.id === project.client;

  const isAdmin =
    user?.role === "ADMIN";

  const canEdit =
    isOwner || isAdmin;

  const canDelete =
    isOwner || isAdmin;

  const canPublish =
    isOwner &&
    project.status === "DRAFT";

  const canSendProposal =
    user?.role === "FREELANCER" &&
    project.status === "PUBLISHED";

  const status =
    statusConfig[project.status];

  const openProposalModal = () => {
    proposalForm.resetFields();

    proposalForm.setFieldsValue({
      price: Number(project.budget_min),
      delivery_days: 7,
    });

    setProposalModalOpen(true);
  };

  const submitProposal = async () => {
    try {
      const values =
        await proposalForm.validateFields();

      createProposalMutation.mutate(values);
    } catch {
      // Ant Design показывает ошибки формы самостоятельно.
    }
  };

  return (
    <div>
      <Space
        style={{
          marginBottom: 20,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            navigate("/projects")
          }
        >
          Back
        </Button>
      </Space>

      <Card>
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <Title
                level={2}
                style={{ marginBottom: 8 }}
              >
                {project.title}
              </Title>

              <Space>
                <Tag color={status.color}>
                  {status.label}
                </Tag>

                <Text type="secondary">
                  Project #{project.id}
                </Text>
              </Space>
            </div>

            <Space wrap>
              {canEdit && (
                <Button
                  icon={<EditOutlined />}
                  onClick={() =>
                    navigate(
                      `/projects/${project.id}/edit`
                    )
                  }
                >
                  Edit
                </Button>
              )}

              {canDelete && (
                <Popconfirm
                  title="Delete project?"
                  description="This action cannot be undone."
                  okText="Delete"
                  cancelText="Cancel"
                  onConfirm={() =>
                    deleteMutation.mutate()
                  }
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    loading={
                      deleteMutation.isPending
                    }
                  >
                    Delete
                  </Button>
                </Popconfirm>
              )}

              {canPublish && (
                <Button
                  type="primary"
                  loading={
                    publishMutation.isPending
                  }
                  onClick={() =>
                    publishMutation.mutate()
                  }
                >
                  Publish Project
                </Button>
              )}

              {canSendProposal && (
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={openProposalModal}
                >
                  Send Proposal
                </Button>
              )}
            </Space>
          </div>

          <Divider />

          <Descriptions
            bordered
            column={{
              xs: 1,
              sm: 2,
              md: 3,
            }}
          >
            <Descriptions.Item label="Category">
              #{project.category}
            </Descriptions.Item>

            <Descriptions.Item label="Experience">
              <Tag>
                {project.experience_level}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Client">
              #{project.client}
            </Descriptions.Item>

            <Descriptions.Item label="Budget">
              ${project.budget_min} — $
              {project.budget_max}
            </Descriptions.Item>

            <Descriptions.Item label="Deadline">
              {dayjs(project.deadline).format(
                "DD.MM.YYYY HH:mm"
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Created">
              {dayjs(project.created_at).format(
                "DD.MM.YYYY HH:mm"
              )}
            </Descriptions.Item>
          </Descriptions>

          <div>
            <Title level={4}>
              Description
            </Title>

            <Paragraph>
              {project.description}
            </Paragraph>
          </div>

          <div>
            <Title level={4}>
              Skills
            </Title>

            <Space wrap>
              {project.skills.map((skill) => (
                <Tag key={skill}>
                  #{skill}
                </Tag>
              ))}
            </Space>
          </div>
        </Space>
      </Card>

      <Modal
        title="Send Proposal"
        open={proposalModalOpen}
        onCancel={() => {
          if (!createProposalMutation.isPending) {
            setProposalModalOpen(false);
          }
        }}
        onOk={submitProposal}
        okText="Send Proposal"
        cancelText="Cancel"
        confirmLoading={
          createProposalMutation.isPending
        }
        destroyOnClose
      >
        <Form
          form={proposalForm}
          layout="vertical"
        >
          <Form.Item
            label="Cover Letter"
            name="cover_letter"
            rules={[
              {
                required: true,
                message:
                  "Введите cover letter",
              },
              {
                min: 20,
                message:
                  "Минимум 20 символов",
              },
            ]}
          >
            <Input.TextArea
              rows={6}
              placeholder="Tell the client why you are the right freelancer..."
              showCount
              maxLength={5000}
            />
          </Form.Item>

          <Form.Item
            label="Your Price"
            name="price"
            rules={[
              {
                required: true,
                message:
                  "Введите цену",
              },
              {
                type: "number",
                min: 0,
                message:
                  "Цена не может быть отрицательной",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              precision={2}
              addonAfter="$"
            />
          </Form.Item>

          <Form.Item
            label="Delivery Days"
            name="delivery_days"
            rules={[
              {
                required: true,
                message:
                  "Введите количество дней",
              },
              {
                type: "number",
                min: 1,
                message:
                  "Минимум 1 день",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              precision={0}
              addonAfter="days"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
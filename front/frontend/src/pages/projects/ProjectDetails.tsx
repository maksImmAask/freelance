import { useState } from "react";

import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
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

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  deleteProjectRequest,
  getProjectRequest,
  publishProjectRequest,
} from "../../api/projects";

import { createProposalRequest } from "../../api/proposals";

import type { ProposalFormData } from "../../types/proposal";

import { useAuthStore } from "../../store/authStore";

const { Title, Paragraph } = Typography;

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);

  const [proposalModalOpen, setProposalModalOpen] =
    useState(false);

  const [proposalForm] =
    Form.useForm<ProposalFormData>();

  const projectId = Number(id);

  const {
    data: project,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectRequest(projectId),
    enabled: Number.isFinite(projectId),
  });

  const createProposalMutation = useMutation({
    mutationFn: createProposalRequest,

    onSuccess: () => {
      message.success(
        "Предложение успешно отправлено"
      );

      setProposalModalOpen(false);

      proposalForm.resetFields();

      queryClient.invalidateQueries({
        queryKey: ["proposals"],
      });
    },

    onError: (error: any) => {
      const detail =
        error?.response?.data?.detail;

      if (detail) {
        message.error(detail);
      } else {
        message.error(
          "Не удалось отправить предложение"
        );
      }
    },
  });
  const publishMutation = useMutation({
    mutationFn: () =>
      publishProjectRequest(projectId),

    onSuccess: () => {
      message.success(
        "Project published successfully"
      );

      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },

    onError: (error: any) => {
      const detail =
        error?.response?.data?.detail;

      message.error(
        detail || "Failed to publish project"
      );
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

    onError: (error: any) => {
      const detail =
        error?.response?.data?.detail;

      message.error(
        detail || "Failed to delete project"
      );
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
      <Card>
        <Empty description="Project not found" />

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/projects")}
        >
          Back to projects
        </Button>
      </Card>
    );
  }

  const isOwner =
    user?.role === "CLIENT" &&
    user.id === project.client;

  const isAdmin =
    user?.role === "ADMIN";

  const isFreelancer =
    user?.role === "FREELANCER";

  const canManage =
    isOwner || isAdmin;

  const canSendProposal =
    isFreelancer &&
    project.status === "PUBLISHED";


  const openProposalModal = () => {
    proposalForm.resetFields();

    setProposalModalOpen(true);
  };


  const handleProposalSubmit = (
    values: ProposalFormData
  ) => {
    createProposalMutation.mutate({
      project: project.id,
      cover_letter: values.cover_letter,
      price: String(values.price),
      delivery_days: Number(
        values.delivery_days
      ),
    });
  };


  return (
    <div>
      {/* BACK */}

      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/projects")}
        style={{
          marginBottom: 20,
        }}
      >
        Back
      </Button>

      <Card>
        {/* HEADER */}

        <Row
          justify="space-between"
          align="middle"
          gutter={[16, 16]}
        >
          <Col>
            <Title
              level={2}
              style={{
                marginBottom: 8,
              }}
            >
              {project.title}
            </Title>

            <Space>
              <Tag
                color={
                  project.status === "PUBLISHED"
                    ? "green"
                    : project.status ===
                        "IN_PROGRESS"
                      ? "blue"
                      : project.status ===
                          "COMPLETED"
                        ? "success"
                        : project.status ===
                            "CANCELLED"
                          ? "red"
                          : "default"
                }
              >
                {project.status}
              </Tag>

              <Tag>
                {project.experience_level}
              </Tag>
            </Space>
          </Col>

          {/* CLIENT / ADMIN ACTIONS */}

          {canManage && (
            <Col>
              <Space>
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

                <Popconfirm
                  title="Delete this project?"
                  description="This action cannot be undone."
                  onConfirm={() =>
                    deleteMutation.mutate()
                  }
                  okText="Delete"
                  cancelText="Cancel"
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
              </Space>
            </Col>
          )}
        </Row>

        <Divider />

        {/* DESCRIPTION */}

        <Title level={4}>
          Description
        </Title>

        <Paragraph>
          {project.description}
        </Paragraph>

        <Divider />

        {/* INFORMATION */}

        <Descriptions
          column={{
            xs: 1,
            sm: 2,
            md: 3,
          }}
          bordered
        >
          <Descriptions.Item label="Budget">
            {project.budget_min} –{" "}
            {project.budget_max}
          </Descriptions.Item>

          <Descriptions.Item label="Deadline">
            {new Date(
              project.deadline
            ).toLocaleString()}
          </Descriptions.Item>

          <Descriptions.Item label="Experience">
            {project.experience_level}
          </Descriptions.Item>

          <Descriptions.Item label="Category">
            #{project.category}
          </Descriptions.Item>

          <Descriptions.Item label="Created">
            {new Date(
              project.created_at
            ).toLocaleDateString()}
          </Descriptions.Item>

          <Descriptions.Item label="Project ID">
            #{project.id}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* SKILLS */}

        <Title level={4}>
          Skills
        </Title>

        <Space wrap>
          {project.skills.length > 0 ? (
            project.skills.map((skillId) => (
              <Tag key={skillId}>
                Skill #{skillId}
              </Tag>
            ))
          ) : (
            <Typography.Text type="secondary">
              No skills specified
            </Typography.Text>
          )}
        </Space>

        {/* PUBLISH */}

        {isOwner &&
          project.status === "DRAFT" && (
            <>
              <Divider />

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
            </>
          )}

        {/* SEND PROPOSAL */}

        {canSendProposal && (
          <>
            <Divider />

            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={openProposalModal}
            >
              Send Proposal
            </Button>
          </>
        )}
      </Card>

      {/* =========================
          PROPOSAL MODAL
          ========================= */}

      <Modal
        title="Send Proposal"
        open={proposalModalOpen}
        onCancel={() => {
          if (
            createProposalMutation.isPending
          ) {
            return;
          }

          setProposalModalOpen(false);
          proposalForm.resetFields();
        }}
        okText="Send Proposal"
        cancelText="Cancel"
        confirmLoading={
          createProposalMutation.isPending
        }
        onOk={() => {
          proposalForm.submit();
        }}
        destroyOnHidden
      >
        <Form
          form={proposalForm}
          layout="vertical"
          onFinish={handleProposalSubmit}
        >
          {/* COVER LETTER */}

          <Form.Item
            name="cover_letter"
            label="Cover Letter"
            rules={[
              {
                required: true,
                message:
                  "Напиши сопроводительное письмо",
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
              placeholder="Расскажи клиенту о своём опыте и почему ты подходишь для этого проекта..."
              showCount
              maxLength={5000}
            />
          </Form.Item>

          {/* PRICE */}

          <Form.Item
            name="price"
            label="Your Price"
            rules={[
              {
                required: true,
                message: "Укажи цену",
              },
              {
                type: "number",
                min: 0,
                message:
                  "Цена должна быть положительной",
              },
            ]}
          >
            <InputNumber
              style={{
                width: "100%",
              }}
              placeholder="Например: 500"
              min={0}
              precision={2}
            />
          </Form.Item>

          {/* DELIVERY */}

          <Form.Item
            name="delivery_days"
            label="Delivery Days"
            rules={[
              {
                required: true,
                message:
                  "Укажи срок выполнения",
              },
              {
                type: "number",
                min: 1,
                message:
                  "Минимальный срок — 1 день",
              },
            ]}
          >
            <InputNumber
              style={{
                width: "100%",
              }}
              placeholder="Например: 7"
              min={1}
              precision={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import {
  createProjectRequest,
  getCategoriesRequest,
  getSkillsRequest,
} from "../../api/projects";

import type {
  ExperienceLevel,
  ProjectFormData,
} from "../../types/project";

const { Title } = Typography;
const { TextArea } = Input;

export default function CreateProject() {
  const navigate = useNavigate();

  const [form] = Form.useForm();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesRequest,
  });

  const skillsQuery = useQuery({
    queryKey: ["skills"],
    queryFn: getSkillsRequest,
  });

  const mutation = useMutation({
    mutationFn: createProjectRequest,

    onSuccess: (project) => {
      message.success(
        "Project created successfully"
      );

      navigate(
        `/projects/${project.id}`
      );
    },

    onError: () => {
      message.error(
        "Failed to create project"
      );
    },
  });

  const onFinish = (
    values: ProjectFormData & {
      deadline: dayjs.Dayjs;
    }
  ) => {
    mutation.mutate({
      ...values,
      deadline:
        values.deadline.toISOString(),
      budget_min: String(
        values.budget_min
      ),
      budget_max: String(
        values.budget_max
      ),
    });
  };

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() =>
          navigate("/projects")
        }
        style={{
          marginBottom: 20,
        }}
      >
        Back
      </Button>

      <Card>
        <Title level={2}>
          Create Project
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{
            maxWidth: 900,
          }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[
              {
                required: true,
                message:
                  "Please enter project title",
              },
            ]}
          >
            <Input
              placeholder="e.g. Build Django REST API"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message:
                  "Please enter description",
              },
            ]}
          >
            <TextArea
              rows={7}
              placeholder="Describe your project..."
            />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[
              {
                required: true,
                message:
                  "Please select category",
              },
            ]}
          >
            <Select
              size="large"
              loading={
                categoriesQuery.isLoading
              }
              placeholder="Select category"
              options={(
                categoriesQuery.data || []
              ).map((category) => ({
                value: category.id,
                label: category.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Skills"
            name="skills"
            rules={[
              {
                required: true,
                message:
                  "Please select at least one skill",
              },
            ]}
          >
            <Select
              mode="multiple"
              size="large"
              loading={
                skillsQuery.isLoading
              }
              placeholder="Select skills"
              options={(
                skillsQuery.data || []
              ).map((skill) => ({
                value: skill.id,
                label: skill.name,
              }))}
            />
          </Form.Item>

          <Space
            size="large"
            style={{
              display: "flex",
            }}
          >
            <Form.Item
              label="Minimum budget"
              name="budget_min"
              rules={[
                {
                  required: true,
                  message:
                    "Enter minimum budget",
                },
              ]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{
                  width: 220,
                }}
                placeholder="100"
              />
            </Form.Item>

            <Form.Item
              label="Maximum budget"
              name="budget_max"
              rules={[
                {
                  required: true,
                  message:
                    "Enter maximum budget",
                },
              ]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{
                  width: 220,
                }}
                placeholder="500"
              />
            </Form.Item>
          </Space>

          <Form.Item
            label="Deadline"
            name="deadline"
            rules={[
              {
                required: true,
                message:
                  "Please select deadline",
              },
            ]}
          >
            <DatePicker
              showTime
              size="large"
              style={{
                width: 300,
              }}
              disabledDate={(current) =>
                current &&
                current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            label="Experience level"
            name="experience_level"
            rules={[
              {
                required: true,
                message:
                  "Select experience level",
              },
            ]}
          >
            <Select<ExperienceLevel>
              size="large"
              placeholder="Select experience level"
              options={[
                {
                  value: "BEGINNER",
                  label: "Beginner",
                },
                {
                  value: "INTERMEDIATE",
                  label: "Intermediate",
                },
                {
                  value: "EXPERT",
                  label: "Expert",
                },
              ]}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={mutation.isPending}
          >
            Create Project
          </Button>
        </Form>
      </Card>
    </div>
  );
}
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getProjectRequest,
  updateProjectRequest,
  getCategoriesRequest,
  getSkillsRequest,
} from "../../api/projects";

import type {
  ExperienceLevel,
  ProjectFormData,
} from "../../types/project";

const { Title } = Typography;
const { TextArea } = Input;

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form] = Form.useForm();

  const projectId = Number(id);

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () =>
      getProjectRequest(projectId),
    enabled: Number.isFinite(projectId),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesRequest,
  });

  const skillsQuery = useQuery({
    queryKey: ["skills"],
    queryFn: getSkillsRequest,
  });

  const mutation = useMutation({
    mutationFn: (
      data: Partial<ProjectFormData>
    ) =>
      updateProjectRequest(
        projectId,
        data
      ),

    onSuccess: () => {
      message.success(
        "Project updated successfully"
      );

      queryClient.invalidateQueries({
        queryKey: ["project", projectId],
      });

      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      navigate(
        `/projects/${projectId}`
      );
    },

    onError: () => {
      message.error(
        "Failed to update project"
      );
    },
  });

  if (
    projectQuery.isLoading ||
    categoriesQuery.isLoading ||
    skillsQuery.isLoading
  ) {
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

  if (!projectQuery.data) {
    return null;
  }

  const project = projectQuery.data;

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
          navigate(
            `/projects/${projectId}`
          )
        }
        style={{
          marginBottom: 20,
        }}
      >
        Back
      </Button>

      <Card>
        <Title level={2}>
          Edit Project
        </Title>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            title: project.title,
            description:
              project.description,
            category: project.category,
            skills: project.skills,
            budget_min: Number(
              project.budget_min
            ),
            budget_max: Number(
              project.budget_max
            ),
            deadline: dayjs(
              project.deadline
            ),
            experience_level:
              project.experience_level,
          }}
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
            <Input size="large" />
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
            <TextArea rows={7} />
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
                  "Please select skills",
              },
            ]}
          >
            <Select
              mode="multiple"
              size="large"
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
                },
              ]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{
                  width: 220,
                }}
              />
            </Form.Item>

            <Form.Item
              label="Maximum budget"
              name="budget_max"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{
                  width: 220,
                }}
              />
            </Form.Item>
          </Space>

          <Form.Item
            label="Deadline"
            name="deadline"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <DatePicker
              showTime
              size="large"
              style={{
                width: 300,
              }}
            />
          </Form.Item>

          <Form.Item
            label="Experience level"
            name="experience_level"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select<ExperienceLevel>
              size="large"
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
            Save Changes
          </Button>
        </Form>
      </Card>
    </div>
  );
}
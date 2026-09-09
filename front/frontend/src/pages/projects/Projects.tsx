import {
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Skeleton,
  Tag,
  Typography,
} from "antd";
import { Button } from "antd";
import {
  SearchOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getProjectsRequest,
} from "../../api/projects";

import type {
  ExperienceLevel,
  Project,
} from "../../types/project";

const { Title, Text, Paragraph } = Typography;

export default function Projects() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [experience, setExperience] =
    useState<ExperienceLevel | undefined>();

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["projects", search],
    queryFn: () => getProjectsRequest(search),
  });

  const projects = data?.results || [];

  const filteredProjects = experience
    ? projects.filter(
        (project) =>
          project.experience_level === experience
      )
    : projects;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Search is handled by React Query queryKey.
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div>
      <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            gap: 16,
        }}
        >
        <div>
            <Title level={2} style={{ marginBottom: 4 }}>
            Projects
            </Title>

            <Text type="secondary">
            Find the right project for your skills
            </Text>
        </div>

        <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
            navigate("/projects/create")
            }
        >
            Create Project
        </Button>
        </div>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Input
              size="large"
              prefix={<SearchOutlined />}
              placeholder="Search projects..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              allowClear
            />
          </Col>

          <Col xs={24} md={8}>
            <Select
              size="large"
              style={{ width: "100%" }}
              placeholder="Experience level"
              value={experience}
              onChange={setExperience}
              allowClear
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
          </Col>
        </Row>
      </Card>

      {isLoading && (
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((item) => (
            <Col xs={24} lg={8} key={item}>
              <Card>
                <Skeleton active />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {isError && (
        <Card>
          <Empty description="Failed to load projects" />
        </Card>
      )}

      {!isLoading &&
        !isError &&
        filteredProjects.length === 0 && (
          <Card>
            <Empty description="No projects found" />
          </Card>
        )}

      <Row gutter={[16, 16]}>
        {filteredProjects.map((project) => (
          <Col
            xs={24}
            md={12}
            xl={8}
            key={project.id}
          >
            <ProjectCard
              project={project}
              onClick={() =>
                navigate(`/projects/${project.id}`)
              }
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

function ProjectCard({
  project,
  onClick,
}: ProjectCardProps) {
  return (
    <Card
      hoverable
      onClick={onClick}
      style={{
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <Title
          level={4}
          style={{
            margin: 0,
          }}
        >
          {project.title}
        </Title>

        <Tag color="green">
          {project.status}
        </Tag>
      </div>

      <Paragraph
        ellipsis={{
          rows: 3,
        }}
        type="secondary"
      >
        {project.description}
      </Paragraph>

      <div style={{ marginBottom: 12 }}>
        <Tag>
          {project.experience_level}
        </Tag>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Text>
          <DollarOutlined />{" "}
          {project.budget_min} –{" "}
          {project.budget_max}
        </Text>

        <Text>
          <ClockCircleOutlined />{" "}
          {new Date(
            project.deadline
          ).toLocaleDateString()}
        </Text>
      </div>
    </Card>
  );
}
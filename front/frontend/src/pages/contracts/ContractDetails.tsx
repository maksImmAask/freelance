import React from "react";

import {
  Alert,
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
  Statistic,
  Tag,
  Typography,
  message,
} from "antd";

import {
  ArrowLeftOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  DollarOutlined,
  PlusOutlined,
  SendOutlined,
  WalletOutlined,
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

import dayjs from "dayjs";

import {
  completeContractRequest,
  getContractRequest,
} from "../../api/contracts";

import {
  approveMilestoneRequest,
  createMilestoneRequest,
  deleteMilestoneRequest,
  getMilestonesRequest,
  rejectMilestoneRequest,
  startMilestoneRequest,
  submitMilestoneRequest,
} from "../../api/milestones";

import {
  getEscrowsRequest,
  fundEscrowRequest,
  releaseEscrowRequest,
  refundEscrowRequest,
} from "../../api/payments";

import { useAuthStore } from "../../store/authStore";

import type {
  ContractStatus,
  Milestone,
  MilestoneStatus,
} from "../../types/contract";

import type {
  EscrowStatus,
} from "../../types/payment";

const {
  Title,
  Text,
  Paragraph,
} = Typography;

const contractStatusConfig: Record<
  ContractStatus,
  {
    color: string;
    label: string;
  }
> = {
  ACTIVE: {
    color: "blue",
    label: "Active",
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

const milestoneStatusConfig: Record<
  MilestoneStatus,
  {
    color: string;
    label: string;
  }
> = {
  PENDING: {
    color: "default",
    label: "Pending",
  },
  IN_PROGRESS: {
    color: "blue",
    label: "In Progress",
  },
  SUBMITTED: {
    color: "orange",
    label: "Submitted",
  },
  APPROVED: {
    color: "green",
    label: "Approved",
  },
  REJECTED: {
    color: "red",
    label: "Rejected",
  },
};

const escrowStatusConfig: Record<
  EscrowStatus,
  {
    color: string;
    label: string;
  }
> = {
  PENDING: {
    color: "gold",
    label: "Pending",
  },
  FUNDED: {
    color: "blue",
    label: "Funded",
  },
  RELEASED: {
    color: "green",
    label: "Released",
  },
  REFUNDED: {
    color: "red",
    label: "Refunded",
  },
};

interface MilestoneFormValues {
  title: string;
  description: string;
  amount: number;
  deadline: string;
}

export default function ContractDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const queryClient =
    useQueryClient();

  const user = useAuthStore(
    (state) => state.user
  );

  const contractId = Number(id);

  const [
    milestoneModalOpen,
    setMilestoneModalOpen,
  ] = React.useState(false);

  const [
    milestoneForm,
  ] =
    Form.useForm<MilestoneFormValues>();

  const {
    data: contract,
    isLoading: contractLoading,
    isError: contractError,
  } = useQuery({
    queryKey: [
      "contract",
      contractId,
    ],
    queryFn: () =>
      getContractRequest(
        contractId
      ),
    enabled:
      Number.isFinite(
        contractId
      ),
  });

  const {
    data: milestonesData,
    isLoading: milestonesLoading,
    isError: milestonesError,
  } = useQuery({
    queryKey: [
      "milestones",
      contractId,
    ],
    queryFn: () =>
      getMilestonesRequest(
        contractId
      ),
    enabled:
      Number.isFinite(
        contractId
      ),
  });

  const {
    data: escrowsData,
    isLoading: escrowLoading,
  } = useQuery({
    queryKey: ["escrows"],
    queryFn: getEscrowsRequest,
  });

  const completeMutation =
    useMutation({
      mutationFn: () =>
        completeContractRequest(
          contractId
        ),

      onSuccess: () => {
        message.success(
          "Contract completed"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "contract",
            contractId,
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "contracts",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "projects",
          ],
        });
      },

      onError: () => {
        message.error(
          "Не удалось завершить контракт"
        );
      },
    });

  const createMilestoneMutation =
    useMutation({
      mutationFn: (
        values: MilestoneFormValues
      ) =>
        createMilestoneRequest({
          contract:
            contractId,
          title:
            values.title,
          description:
            values.description,
          amount: String(
            values.amount
          ),
          deadline:
            dayjs(
              values.deadline
            ).toISOString(),
        }),

      onSuccess: () => {
        message.success(
          "Milestone created"
        );

        milestoneForm.resetFields();

        setMilestoneModalOpen(
          false
        );

        queryClient.invalidateQueries({
          queryKey: [
            "milestones",
            contractId,
          ],
        });
      },

      onError: () => {
        message.error(
          "Не удалось создать milestone"
        );
      },
    });

  const startMutation =
    useMutation({
      mutationFn: (
        milestoneId: number
      ) =>
        startMilestoneRequest(
          milestoneId
        ),

      onSuccess: () => {
        message.success(
          "Milestone started"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "milestones",
            contractId,
          ],
        });
      },

      onError: () => {
        message.error(
          "Не удалось начать milestone"
        );
      },
    });

  const submitMutation =
    useMutation({
      mutationFn: (
        milestoneId: number
      ) =>
        submitMilestoneRequest(
          milestoneId
        ),

      onSuccess: () => {
        message.success(
          "Milestone submitted"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "milestones",
            contractId,
          ],
        });
      },

      onError: () => {
        message.error(
          "Не удалось отправить milestone"
        );
      },
    });

  const approveMutation =
    useMutation({
      mutationFn: (
        milestoneId: number
      ) =>
        approveMilestoneRequest(
          milestoneId
        ),

      onSuccess: () => {
        message.success(
          "Milestone approved"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "milestones",
            contractId,
          ],
        });
      },

      onError: () => {
        message.error(
          "Не удалось подтвердить milestone"
        );
      },
    });

  const rejectMutation =
    useMutation({
      mutationFn: (
        milestoneId: number
      ) =>
        rejectMilestoneRequest(
          milestoneId
        ),

      onSuccess: () => {
        message.success(
          "Milestone rejected"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "milestones",
            contractId,
          ],
        });
      },

      onError: () => {
        message.error(
          "Не удалось отклонить milestone"
        );
      },
    });

  const deleteMutation =
    useMutation({
      mutationFn: (
        milestoneId: number
      ) =>
        deleteMilestoneRequest(
          milestoneId
        ),

      onSuccess: () => {
        message.success(
          "Milestone deleted"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "milestones",
            contractId,
          ],
        });
      },

      onError: () => {
        message.error(
          "Не удалось удалить milestone"
        );
      },
    });

  const fundMutation =
    useMutation({
      mutationFn: (
        escrowId: number
      ) =>
        fundEscrowRequest(
          escrowId
        ),

      onSuccess: () => {
        message.success(
          "Escrow funded"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "escrows",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "transactions",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "my-wallet",
          ],
        });
      },

      onError: () => {
        message.error(
          "Не удалось пополнить escrow"
        );
      },
    });

  const releaseMutation =
    useMutation({
      mutationFn: (
        escrowId: number
      ) =>
        releaseEscrowRequest(
          escrowId
        ),

      onSuccess: () => {
        message.success(
          "Payment released"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "escrows",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "transactions",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "my-wallet",
          ],
        });
      },

      onError: () => {
        message.error(
          "Не удалось освободить payment"
        );
      },
    });

  const refundMutation =
    useMutation({
      mutationFn: (
        escrowId: number
      ) =>
        refundEscrowRequest(
          escrowId
        ),

      onSuccess: () => {
        message.success(
          "Escrow refunded"
        );

        queryClient.invalidateQueries({
          queryKey: [
            "escrows",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "transactions",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "my-wallet",
          ],
        });
      },

      onError: () => {
        message.error(
          "Не удалось вернуть escrow"
        );
      },
    });

  if (contractLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent:
            "center",
          padding: 80,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (
    contractError ||
    !contract
  ) {
    return (
      <Alert
        type="error"
        message="Contract not found"
      />
    );
  }

  const milestones =
    milestonesData?.results ??
    [];

  const escrows =
    escrowsData?.results ??
    [];

  const escrow =
    escrows.find(
      (item) =>
        item.contract ===
        contract.id
    );

  const status =
    contractStatusConfig[
      contract.status
    ];

  const isClient =
    user?.id ===
    contract.client;

  const isFreelancer =
    user?.id ===
    contract.freelancer;

  const isAdmin =
    user?.role === "ADMIN";

  const canManageMilestones =
    isClient || isAdmin;

  const canWorkOnMilestones =
    isFreelancer || isAdmin;

  const approvedAmount =
    milestones
      .filter(
        (item) =>
          item.status ===
          "APPROVED"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount
          ),
        0
      );

  const milestoneTotal =
    milestones.reduce(
      (sum, item) =>
        sum +
        Number(
          item.amount
        ),
      0
    );

  const openCreateMilestone =
    () => {
      milestoneForm.resetFields();

      milestoneForm.setFieldsValue({
        amount: 0,
        deadline:
          dayjs()
            .add(
              7,
              "day"
            )
            .format(
              "YYYY-MM-DDTHH:mm"
            ),
      });

      setMilestoneModalOpen(
        true
      );
    };

  const submitMilestoneForm =
    async () => {
      try {
        const values =
          await milestoneForm.validateFields();

        createMilestoneMutation.mutate(
          values
        );
      } catch {
        // Validation handled by Ant Design.
      }
    };

  const renderMilestoneActions =
    (
      milestone: Milestone
    ) => {
      if (
        milestone.status ===
        "PENDING"
      ) {
        return (
          <Space wrap>
            {canWorkOnMilestones && (
              <Button
                type="primary"
                icon={
                  <ClockCircleOutlined />
                }
                loading={
                  startMutation.isPending
                }
                onClick={() =>
                  startMutation.mutate(
                    milestone.id
                  )
                }
              >
                Start
              </Button>
            )}

            {canManageMilestones && (
              <Popconfirm
                title="Delete milestone?"
                okText="Delete"
                cancelText="Cancel"
                onConfirm={() =>
                  deleteMutation.mutate(
                    milestone.id
                  )
                }
              >
                <Button
                  danger
                  icon={
                    <DeleteOutlined />
                  }
                >
                  Delete
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      }

      if (
        milestone.status ===
        "IN_PROGRESS"
      ) {
        return (
          canWorkOnMilestones && (
            <Button
              type="primary"
              icon={
                <SendOutlined />
              }
              loading={
                submitMutation.isPending
              }
              onClick={() =>
                submitMutation.mutate(
                  milestone.id
                )
              }
            >
              Submit
            </Button>
          )
        );
      }

      if (
        milestone.status ===
        "SUBMITTED"
      ) {
        return (
          canManageMilestones && (
            <Space wrap>
              <Popconfirm
                title="Approve milestone?"
                okText="Approve"
                cancelText="Cancel"
                onConfirm={() =>
                  approveMutation.mutate(
                    milestone.id
                  )
                }
              >
                <Button
                  type="primary"
                  icon={
                    <CheckOutlined />
                  }
                  loading={
                    approveMutation.isPending
                  }
                >
                  Approve
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Reject milestone?"
                okText="Reject"
                cancelText="Cancel"
                onConfirm={() =>
                  rejectMutation.mutate(
                    milestone.id
                  )
                }
              >
                <Button
                  danger
                  icon={
                    <CloseOutlined />
                  }
                  loading={
                    rejectMutation.isPending
                  }
                >
                  Reject
                </Button>
              </Popconfirm>
            </Space>
          )
        );
      }

      if (
        milestone.status ===
        "REJECTED"
      ) {
        return (
          canWorkOnMilestones && (
            <Button
              type="primary"
              onClick={() =>
                startMutation.mutate(
                  milestone.id
                )
              }
            >
              Start Again
            </Button>
          )
        );
      }

      return null;
    };

  return (
    <div>
      <Button
        icon={
          <ArrowLeftOutlined />
        }
        onClick={() =>
          navigate(
            "/contracts"
          )
        }
        style={{
          marginBottom: 20,
        }}
      >
        Back
      </Button>

      <Card>
        <Space
          direction="vertical"
          size="large"
          style={{
            width: "100%",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-start",
              gap: 16,
              flexWrap:
                "wrap",
            }}
          >
            <div>
              <Title
                level={2}
                style={{
                  margin: 0,
                }}
              >
                Contract #
                {contract.id}
              </Title>

              <Text type="secondary">
                Project #
                {
                  contract.project
                }
              </Text>
            </div>

            <Tag
              color={
                status.color
              }
            >
              {status.label}
            </Tag>
          </div>

          <Divider />

          <Row
            gutter={[
              16,
              16,
            ]}
          >
            <Col
              xs={24}
              md={8}
            >
              <Card>
                <Statistic
                  title="Contract Value"
                  prefix="$"
                  value={Number(
                    contract.total_amount
                  )}
                  precision={2}
                />
              </Card>
            </Col>

            <Col
              xs={24}
              md={8}
            >
              <Card>
                <Statistic
                  title="Milestones"
                  value={
                    milestones.length
                  }
                />
              </Card>
            </Col>

            <Col
              xs={24}
              md={8}
            >
              <Card>
                <Statistic
                  title="Approved"
                  prefix="$"
                  value={
                    approvedAmount
                  }
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          <Descriptions
            bordered
            column={1}
          >
            <Descriptions.Item label="Client">
              #{contract.client}
            </Descriptions.Item>

            <Descriptions.Item label="Freelancer">
              #{contract.freelancer}
            </Descriptions.Item>

            <Descriptions.Item label="Proposal">
              #{contract.proposal}
            </Descriptions.Item>

            <Descriptions.Item label="Deadline">
              {dayjs(
                contract.deadline
              ).format(
                "DD.MM.YYYY HH:mm"
              )}
            </Descriptions.Item>
          </Descriptions>

          {escrowLoading ? (
            <Spin />
          ) : escrow ? (
            <Card
              title={
                <Space>
                  <WalletOutlined />
                  Escrow
                </Space>
              }
            >
              <Space
                direction="vertical"
                size="middle"
                style={{
                  width:
                    "100%",
                }}
              >
                <Descriptions
                  bordered
                  column={{
                    xs: 1,
                    sm: 3,
                  }}
                >
                  <Descriptions.Item label="Amount">
                    <Text strong>
                      $
                      {
                        escrow.amount
                      }
                    </Text>
                  </Descriptions.Item>

                  <Descriptions.Item label="Status">
                    <Tag
                      color={
                        escrowStatusConfig[
                          escrow.status
                        ].color
                      }
                    >
                      {
                        escrowStatusConfig[
                          escrow.status
                        ].label
                      }
                    </Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Client">
                    #
                    {
                      escrow.client
                    }
                  </Descriptions.Item>
                </Descriptions>

                <Space wrap>
                  {isClient &&
                    escrow.status ===
                      "PENDING" && (
                      <Popconfirm
                        title="Fund escrow?"
                        description={`$${escrow.amount} will be taken from your wallet.`}
                        okText="Fund"
                        cancelText="Cancel"
                        onConfirm={() =>
                          fundMutation.mutate(
                            escrow.id
                          )
                        }
                      >
                        <Button
                          type="primary"
                          icon={
                            <DollarOutlined />
                          }
                          loading={
                            fundMutation.isPending
                          }
                        >
                          Fund Escrow
                        </Button>
                      </Popconfirm>
                    )}

                  {isClient &&
                    escrow.status ===
                      "FUNDED" && (
                      <Popconfirm
                        title="Release payment?"
                        description="The freelancer will receive the payment minus commission."
                        okText="Release"
                        cancelText="Cancel"
                        onConfirm={() =>
                          releaseMutation.mutate(
                            escrow.id
                          )
                        }
                      >
                        <Button
                          type="primary"
                          icon={
                            <CheckOutlined />
                          }
                          loading={
                            releaseMutation.isPending
                          }
                        >
                          Release Payment
                        </Button>
                      </Popconfirm>
                    )}

                  {isAdmin &&
                    escrow.status ===
                      "FUNDED" && (
                      <Popconfirm
                        title="Refund escrow?"
                        description="The escrow amount will be returned to the client."
                        okText="Refund"
                        cancelText="Cancel"
                        onConfirm={() =>
                          refundMutation.mutate(
                            escrow.id
                          )
                        }
                      >
                        <Button
                          danger
                          loading={
                            refundMutation.isPending
                          }
                        >
                          Refund
                        </Button>
                      </Popconfirm>
                    )}
                </Space>
              </Space>
            </Card>
          ) : (
            <Alert
              type="info"
              message="Escrow has not been created yet"
              description="Escrow is created by the backend when the proposal is accepted."
            />
          )}

          {contract.status ===
            "ACTIVE" &&
            isClient && (
              <Popconfirm
                title="Complete contract?"
                description="Make sure all work has been completed."
                okText="Complete"
                cancelText="Cancel"
                onConfirm={() =>
                  completeMutation.mutate()
                }
              >
                <Button
                  type="primary"
                  icon={
                    <CheckOutlined />
                  }
                  loading={
                    completeMutation.isPending
                  }
                >
                  Complete Contract
                </Button>
              </Popconfirm>
            )}
        </Space>
      </Card>

      <Card
        title="Milestones"
        extra={
          canManageMilestones &&
          contract.status ===
            "ACTIVE" ? (
            <Button
              type="primary"
              icon={
                <PlusOutlined />
              }
              onClick={
                openCreateMilestone
              }
            >
              Add Milestone
            </Button>
          ) : null
        }
        style={{
          marginTop: 24,
        }}
      >
        <div
          style={{
            marginBottom: 20,
          }}
        >
          <Text>
            Total:
            {" "}
            <strong>
              $
              {milestoneTotal.toFixed(
                2
              )}
            </strong>
          </Text>
        </div>

        {milestonesLoading ? (
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "center",
              padding: 40,
            }}
          >
            <Spin />
          </div>
        ) : milestonesError ? (
          <Alert
            type="error"
            message="Не удалось загрузить milestones"
          />
        ) : milestones.length ===
          0 ? (
          <Empty
            description="Milestones пока нет"
          />
        ) : (
          <Space
            direction="vertical"
            size="middle"
            style={{
              width:
                "100%",
            }}
          >
            {milestones.map(
              (milestone) => {
                const config =
                  milestoneStatusConfig[
                    milestone.status
                  ];

                return (
                  <Card
                    key={
                      milestone.id
                    }
                    type="inner"
                  >
                    <Space
                      direction="vertical"
                      style={{
                        width:
                          "100%",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap: 16,
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <div>
                          <Title
                            level={4}
                            style={{
                              margin: 0,
                            }}
                          >
                            {
                              milestone.title
                            }
                          </Title>

                          <Text type="secondary">
                            #
                            {
                              milestone.id
                            }
                          </Text>
                        </div>

                        <Tag
                          color={
                            config.color
                          }
                        >
                          {
                            config.label
                          }
                        </Tag>
                      </div>

                      <Paragraph>
                        {
                          milestone.description
                        }
                      </Paragraph>

                      <Descriptions
                        bordered
                        size="small"
                        column={{
                          xs: 1,
                          sm: 2,
                        }}
                      >
                        <Descriptions.Item label="Amount">
                          $
                          {
                            milestone.amount
                          }
                        </Descriptions.Item>

                        <Descriptions.Item label="Deadline">
                          {dayjs(
                            milestone.deadline
                          ).format(
                            "DD.MM.YYYY HH:mm"
                          )}
                        </Descriptions.Item>
                      </Descriptions>

                      {renderMilestoneActions(
                        milestone
                      )}
                    </Space>
                  </Card>
                );
              }
            )}
          </Space>
        )}
      </Card>

      <Modal
        title="Create Milestone"
        open={
          milestoneModalOpen
        }
        onCancel={() =>
          setMilestoneModalOpen(
            false
          )
        }
        onOk={
          submitMilestoneForm
        }
        okText="Create"
        cancelText="Cancel"
        confirmLoading={
          createMilestoneMutation.isPending
        }
        destroyOnClose
      >
        <Form
          form={
            milestoneForm
          }
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                message:
                  "Введите название",
              },
            ]}
          >
            <Input
              placeholder="Landing page"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              {
                required: true,
                message:
                  "Введите описание",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Describe the work..."
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              {
                required: true,
                message:
                  "Введите сумму",
              },
              {
                type: "number",
                min: 0,
                message:
                  "Сумма не может быть отрицательной",
              },
            ]}
          >
            <InputNumber
              style={{
                width:
                  "100%",
              }}
              min={0}
              precision={2}
              addonAfter="$"
            />
          </Form.Item>

          <Form.Item
            name="deadline"
            label="Deadline"
            rules={[
              {
                required: true,
                message:
                  "Выберите deadline",
              },
            ]}
          >
            <Input
              type="datetime-local"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
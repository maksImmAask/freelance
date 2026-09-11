import React from "react";

import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Input,
  List,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message as antMessage,
} from "antd";

import {
  SendOutlined,
  UserOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from "@ant-design/icons";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getChatsRequest,
  getMessagesRequest,
  createMessageRequest,
  markMessageReadRequest,
} from "../../api/chat";

import type {
  Chat as ChatType,
  Message,
} from "../../types/chat";

import {
  useAuthStore,
} from "../../store/authStore";

import useWebSocket from "../../hooks/useWebSocket";

const {
  Title,
  Text,
} = Typography;

export default function Chat() {
  const user =
    useAuthStore(
      (state) => state.user
    );

  const queryClient =
    useQueryClient();

  const [
    selectedChat,
    setSelectedChat,
  ] =
    React.useState<ChatType | null>(
      null
    );

  const [
    text,
    setText,
  ] = React.useState("");

  const messagesEndRef =
    React.useRef<HTMLDivElement | null>(
      null
    );

  const {
    data: chatsData,
    isLoading: chatsLoading,
    isError: chatsError,
  } = useQuery({
    queryKey: ["chats"],
    queryFn:
      getChatsRequest,
  });

  const {
    data: messagesData,
    isLoading: messagesLoading,
    isError: messagesError,
  } = useQuery({
    queryKey: [
      "messages",
      selectedChat?.id,
    ],
    queryFn: () =>
      getMessagesRequest(
        selectedChat!.id
      ),
    enabled:
      !!selectedChat,
  });

  const sendMutation =
    useMutation({
      mutationFn:
        createMessageRequest,

      onSuccess: () => {
        setText("");

        queryClient.invalidateQueries({
          queryKey: [
            "messages",
            selectedChat?.id,
          ],
        });

        queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
      },

      onError: () => {
        antMessage.error(
          "Не удалось отправить сообщение"
        );
      },
    });

  const readMutation =
    useMutation({
      mutationFn:
        markMessageReadRequest,

      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "messages",
            selectedChat?.id,
          ],
        });
      },
    });

  const handleWebSocketMessage =
    React.useCallback(
      (data: unknown) => {
        console.log(
          "WebSocket message:",
          data
        );

        queryClient.invalidateQueries({
          queryKey: [
            "messages",
            selectedChat?.id,
          ],
        });

        queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
      },
      [
        queryClient,
        selectedChat?.id,
      ]
    );

  const {
    isConnected,
    sendMessage,
  } =
    useWebSocket({
      chatId:
        selectedChat?.id ??
        null,
      enabled:
        !!selectedChat,
      onMessage:
        handleWebSocketMessage,
    });

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messagesData?.results,
  ]);

  const chats =
    chatsData?.results ?? [];

  const messages =
    messagesData?.results ?? [];

  const handleSelectChat =
    (chat: ChatType) => {
      setSelectedChat(chat);
    };

  const handleSend =
    () => {
      const trimmed =
        text.trim();

      if (!trimmed) {
        return;
      }

      if (!selectedChat) {
        return;
      }

      if (isConnected) {
        sendMessage({
          type: "chat.message",
          message: trimmed,
        });

        setText("");
        return;
      }

      sendMutation.mutate({
        chat:
          selectedChat.id,
        text: trimmed,
      });
    };

  const handleKeyDown =
    (
      event: React.KeyboardEvent<HTMLTextAreaElement>
    ) => {
      if (
        event.key ===
          "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        handleSend();
      }
    };

  if (chatsLoading) {
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

  if (chatsError) {
    return (
      <Alert
        type="error"
        message="Не удалось загрузить чаты"
        description="Проверьте Chat API на Django."
      />
    );
  }

  return (
    <div>
      <Title level={2}>
        Chat
      </Title>

      <Text type="secondary">
        Общение с клиентами и
        фрилансерами.
      </Text>

      <Row
        gutter={16}
        style={{
          marginTop: 24,
        }}
      >
        <Col
          xs={24}
          md={8}
          lg={7}
        >
          <Card
            title={
              <Space>
                <UserOutlined />
                Chats
              </Space>
            }
            bodyStyle={{
              padding: 0,
            }}
          >
            {chats.length ===
            0 ? (
              <div
                style={{
                  padding: 40,
                }}
              >
                <Empty
                  description="Чатов пока нет"
                />
              </div>
            ) : (
              <List
                dataSource={
                  chats
                }
                renderItem={(
                  chat
                ) => {
                  const otherUserId =
                    user?.id ===
                    chat.client
                      ? chat.freelancer
                      : chat.client;

                  const active =
                    selectedChat?.id ===
                    chat.id;

                  return (
                    <List.Item
                      onClick={() =>
                        handleSelectChat(
                          chat
                        )
                      }
                      style={{
                        cursor:
                          "pointer",
                        padding:
                          "16px",
                        background:
                          active
                            ? "#e6f4ff"
                            : undefined,
                      }}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge
                            dot={
                              active &&
                              isConnected
                            }
                            status={
                              isConnected
                                ? "success"
                                : "default"
                            }
                          >
                            <Avatar
                              icon={
                                <UserOutlined />
                              }
                            />
                          </Badge>
                        }
                        title={
                          <Text strong>
                            User #
                            {
                              otherUserId
                            }
                          </Text>
                        }
                        description={
                          <>
                            {chat.contract
                              ? `Contract #${chat.contract}`
                              : "No contract"}
                          </>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>

        <Col
          xs={24}
          md={16}
          lg={17}
        >
          <Card
            style={{
              minHeight: 600,
              display: "flex",
              flexDirection:
                "column",
            }}
            styles={{
              body: {
                display:
                  "flex",
                flexDirection:
                  "column",
                flex: 1,
                padding: 0,
              },
            }}
          >
            {!selectedChat ? (
              <div
                style={{
                  minHeight: 560,
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <Empty
                  description="Выберите чат"
                />
              </div>
            ) : (
              <>
                <div
                  style={{
                    padding:
                      "16px 20px",
                    borderBottom:
                      "1px solid #f0f0f0",
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "center",
                  }}
                >
                  <div>
                    <Text strong>
                      Chat #
                      {
                        selectedChat.id
                      }
                    </Text>

                    <br />

                    <Text type="secondary">
                      Contract{" "}
                      {selectedChat.contract
                        ? `#${selectedChat.contract}`
                        : "not linked"}
                    </Text>
                  </div>

                  <Tag
                    icon={
                      isConnected ? (
                        <WifiOutlined />
                      ) : (
                        <DisconnectOutlined />
                      )
                    }
                    color={
                      isConnected
                        ? "green"
                        : "default"
                    }
                  >
                    {isConnected
                      ? "Connected"
                      : "Offline"}
                  </Tag>
                </div>

                <div
                  style={{
                    flex: 1,
                    padding: 20,
                    overflowY:
                      "auto",
                    minHeight: 430,
                    maxHeight: 500,
                  }}
                >
                  {messagesLoading ? (
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "center",
                        padding: 60,
                      }}
                    >
                      <Spin />
                    </div>
                  ) : messagesError ? (
                    <Alert
                      type="error"
                      message="Не удалось загрузить сообщения"
                    />
                  ) : messages.length ===
                    0 ? (
                    <Empty
                      description="Сообщений пока нет"
                    />
                  ) : (
                    messages.map(
                      (
                        item: Message
                      ) => {
                        const mine =
                          item.sender ===
                          user?.id;

                        return (
                          <div
                            key={
                              item.id
                            }
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                mine
                                  ? "flex-end"
                                  : "flex-start",
                              marginBottom:
                                12,
                            }}
                          >
                            <div
                              style={{
                                maxWidth:
                                  "75%",
                                padding:
                                  "10px 14px",
                                borderRadius:
                                  12,
                                background:
                                  mine
                                    ? "#1677ff"
                                    : "#f0f0f0",
                                color:
                                  mine
                                    ? "#fff"
                                    : "#000",
                              }}
                              onMouseEnter={() => {
                                if (
                                  !mine &&
                                  !item.is_read
                                ) {
                                  readMutation.mutate(
                                    item.id
                                  );
                                }
                              }}
                            >
                              <div
                                style={{
                                  whiteSpace:
                                    "pre-wrap",
                                  wordBreak:
                                    "break-word",
                                }}
                              >
                                {
                                  item.text
                                }
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    6,
                                  fontSize:
                                    11,
                                  opacity:
                                    0.7,
                                }}
                              >
                                {new Date(
                                  item.created_at
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour:
                                      "2-digit",
                                    minute:
                                      "2-digit",
                                  }
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )
                  )}

                  <div
                    ref={
                      messagesEndRef
                    }
                  />
                </div>

                <div
                  style={{
                    padding: 16,
                    borderTop:
                      "1px solid #f0f0f0",
                  }}
                >
                  <Space.Compact
                    style={{
                      width:
                        "100%",
                    }}
                  >
                    <Input.TextArea
                      value={text}
                      onChange={(event) =>
                        setText(
                          event
                            .target
                            .value
                        )
                      }
                      onKeyDown={
                        handleKeyDown
                      }
                      autoSize={{
                        minRows: 1,
                        maxRows: 4,
                      }}
                      placeholder="Введите сообщение..."
                      style={{
                        resize:
                          "none",
                      }}
                    />

                    <Button
                      type="primary"
                      icon={
                        <SendOutlined />
                      }
                      loading={
                        sendMutation.isPending
                      }
                      onClick={
                        handleSend
                      }
                    >
                      Send
                    </Button>
                  </Space.Compact>

                  <Text
                    type="secondary"
                    style={{
                      fontSize: 12,
                    }}
                  >
                    Enter — отправить,
                    Shift + Enter —
                    новая строка
                  </Text>
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
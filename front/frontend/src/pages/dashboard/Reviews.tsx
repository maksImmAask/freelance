import {
  Alert,
  Card,
  Col,
  Empty,
  Rate,
  Row,
  Spin,
  Tag,
  Typography,
} from "antd";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getReviewsRequest,
} from "../../api/reviews";

const {
  Title,
  Text,
  Paragraph,
} = Typography;

export default function Reviews() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn:
      getReviewsRequest,
  });

  if (isLoading) {
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

  if (isError) {
    return (
      <Alert
        type="error"
        message="Не удалось загрузить отзывы"
      />
    );
  }

  const reviews =
    data?.results ?? [];

  return (
    <div>
      <Title level={2}>
        Reviews
      </Title>

      <Text type="secondary">
        Reviews from completed contracts.
      </Text>

      <div
        style={{
          marginTop: 24,
        }}
      >
        {reviews.length === 0 ? (
          <Card>
            <Empty description="Отзывов пока нет" />
          </Card>
        ) : (
          <Row
            gutter={[
              16,
              16,
            ]}
          >
            {reviews.map(
              (review) => (
                <Col
                  xs={24}
                  sm={12}
                  lg={8}
                  key={
                    review.id
                  }
                >
                  <Card>
                    <div
                      style={{
                        display:
                          "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <Text strong>
                        Review #
                        {
                          review.id
                        }
                      </Text>

                      <Tag>
                        Contract #
                        {
                          review.contract
                        }
                      </Tag>
                    </div>

                    <Rate
                      disabled
                      value={
                        review.rating
                      }
                    />

                    <Paragraph
                      style={{
                        marginTop: 12,
                      }}
                    >
                      {review.comment ||
                        "No comment"}
                    </Paragraph>

                    <Text type="secondary">
                      Author #
                      {
                        review.author
                      }
                      {" → "}
                      Recipient #
                      {
                        review.recipient
                      }
                    </Text>

                    <br />

                    <Text type="secondary">
                      {new Date(
                        review.created_at
                      ).toLocaleString()}
                    </Text>
                  </Card>
                </Col>
              )
            )}
          </Row>
        )}
      </div>
    </div>
  );
}
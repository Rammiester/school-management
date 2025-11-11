import { Modal, List, Button, Tooltip, Tag, Avatar, Row, Col,  } from "antd";
import { UserOutlined } from "@ant-design/icons";
import "./NotificationModal.css";
import Loading from "../LoadingComponent/Loading";

// Util functions for color and amount as before
const getAmount = (notif) => {
  if (notif.type === "earning") return notif.earnings;
  if (notif.type === "expense") return notif.expenses;
  return notif.earnings > 0 ? notif.earnings : notif.expenses;
};

const getAmountColor = (notif) => {
  if (notif.type === "earning" || notif.earnings > 0) return "#1BC47D";  // green
  if (notif.type === "expense" || notif.expenses > 0) return "#f43f5e";  // red
  return "#666";
};

const getTag = (notif) => {
  if (notif.type === "earning" || notif.earnings > 0)
    return <Tag color="green">Earning</Tag>;
  if (notif.type === "expense" || notif.expenses > 0)
    return <Tag color="red">Expense</Tag>;
  return null;
};
const statusColor = {
    approved: "green",
    declined: "crimson",
    pending: "#888",
  };
  
  const statusLabel = {
    approved: "Approved",
    declined: "Declined",
    pending: "Pending Approval",
  };
const NotificationModal = ({
  visible,
  onClose,
  notifications,
  isChairman,
  loading,
  onApprove,
  onDecline,
  onMarkRead,
  supportsRead,
}) => (
  <Modal
    className="notification-modal"
    title={isChairman ? "Pending Approvals" : "My Requests"}
    open={visible}
    onCancel={onClose}
    footer={null}
    width={510}
    destroyOnClose
  >
    {loading ? (
      <div className="loading-spinner">
        <Loading size="large" />
      </div>
    ) : (
      <List
        dataSource={notifications}
        renderItem={(notif) => (
          <div className="notification-item">
            <Row align="middle" style={{ marginBottom: 10 }}>
              <Col flex="none">
                <Avatar
                  className="notification-avatar"
                  icon={<UserOutlined />}
                  size={40}
                />
              </Col>
              <Col flex="auto" style={{ marginLeft: 18 }}>
                <span className="notification-description">
                  {notif.description || <i>No description</i>}
                </span>
                {getTag(notif)}
              </Col>
            </Row>
            <Row gutter={14} style={{ fontSize: 16, marginBottom: 6 }}>
              <Col>
                <span>
                  Amount:{" "}
                  <b
                    className="notification-amount"
                    style={{ color: getAmountColor(notif) }}
                  >
                    ₹{getAmount(notif).toLocaleString()}
                  </b>
                </span>
              </Col>
              <Col>
                <span className="notification-date">
                  • {notif.date && new Date(notif.date).toLocaleDateString()}
                </span>
              </Col>
            </Row>
            {notif.studentUniqueId && (
              <div className="notification-student">
                <b>Student:</b> {notif.studentUniqueId}
              </div>
            )}
            <div className="notification-raised-by">
              Raised by: <span>{notif.createdBy}</span>
            </div>
            {notif.extra && (
              <div className="notification-extra">{notif.extra}</div>
            )}
            <Row
              gutter={14}
              align="middle"
              style={{ marginTop: 14, marginBottom: 2 }}
              wrap={false}
            >
              <Col>
                {supportsRead && (
                  <Tooltip
                    title={notif.read ? "Mark as Unread" : "Mark as Read"}
                  >
                    <Button
                      size="small"
                      type="link"
                      onClick={() => onMarkRead(notif._id, !notif.read)}
                      className="notification-read-marker"
                    >
                      {notif.read ? "✓" : <b>●</b>}
                    </Button>
                  </Tooltip>
                )}
              </Col>
              <Col>
                {isChairman && notif.status === "pending" && (
                  <>
                    <Button
                      size="small"
                      className="notification-approve-button"
                      ghost
                      onClick={() => onApprove(notif._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      className="notification-decline-button"
                      ghost
                      onClick={() => onDecline(notif._id)}
                    >
                      Decline
                    </Button>
                  </>
                )}
              </Col>
              <Col flex="auto" />
              <Col>
                <span
                  className="notification-status"
                  style={{ color: statusColor[notif.status] }}
                >
                  {statusLabel[notif.status]}
                </span>
              </Col>
            </Row>
          </div>
        )}
        locale={{
          emptyText: (
            <div className="no-notifications">
              No notifications.
            </div>
          ),
        }}
      />
    )}
  </Modal>
);
export default NotificationModal;

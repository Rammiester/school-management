import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ className = '', text = 'Back', onClick, to }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      window.history.back();
    }
  };

  return (
    <Button
      type="primary"
      onClick={handleBack}
      className={`back-button ${className}`}
      icon={<ArrowLeftOutlined />}
    >
      {text}
    </Button>
  );
};

export default BackButton;

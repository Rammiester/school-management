import styled from 'styled-components';
import { Card } from 'antd';

export const ChartCard = styled(Card)`
  background: #0a406a;
  border-radius: 10px;
  max-width: 600px;
  width: 100%;
  margin-top: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 0px solid #f0f0f0;
  .ant-card-body {
    padding: 1.5rem;
    text-align: center;
  }
`;

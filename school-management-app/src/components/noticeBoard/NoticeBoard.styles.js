import styled from 'styled-components';
import { Card } from 'antd';

export const NoticeBoardCard = styled(Card)`
  background: #0a406a;
  border-radius: 12px;
  margin-top: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 0px solid #444;
  
  .ant-card-head {
    background: #0a406a;
    border-bottom: 1px solid #444;
    padding: 0 1.5rem;
    
  }

  .ant-card-body {
    padding: 1.5rem;
  }

  .scrollable {
    margin-top: 1rem;
    max-height: 330px;
    overflow-y: auto;
    padding-right: 5px;
    
    /* Custom scrollbar styling */
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: var(--secondary-color);
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--primary-color);
      border-radius: 3px;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      max-height: 250px;
      padding-right: 0;
    }
  }
`;

export const NoticeCard = styled.div`
  padding: 1.25rem;
  border: 1px solid #34343433 ;
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .title {
    font-size: 1rem;
    font-weight: 600;
    color: #000000;
    margin: 0 0 0.75rem 0;
    line-height: 1.4;
    word-break: break-word;
  }

  .author {
    font-size: 0.85rem;
    color: #cccccc;
    margin: 0;
    font-style: italic;
    display: flex;
    align-items: center;
  }
  
  .author::before {
    content: "—";
    margin-right: 5px;
  }
  
  /* Add subtle animation for appearing notices */
  animation: fadeIn 0.3s ease-in;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const DateBadge = styled.span`
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ffffff;
  display: inline-block;
  margin-bottom: 0.75rem;
  background-color: #8c2a1e;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 3px 8px;
  }
`;

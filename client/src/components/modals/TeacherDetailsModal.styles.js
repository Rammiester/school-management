import styled from "styled-components";

export const ModalHeader = styled.div`
  background: linear-gradient(135deg, #476b6b, #dea08f);
  padding: 10px 15px;
  border-radius: 4px;
  color: #fff;
  text-align: center;
`;

export const ModalContent = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #ffffff, #f7f7f7);
  border-radius: 10px;
`;

export const DetailsColumn = styled.div`
  border-left: 4px solid #476b6b;
  padding-left: 12px;
`;

export const StyledCard = styled.div`
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 15px;
  background: #fff;
`;

export const ListItem = styled.div`
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

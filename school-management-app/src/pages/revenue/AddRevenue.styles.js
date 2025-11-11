import styled from 'styled-components';

const COLORS = {
  PRIMARY:    '#f5ae3f',
  SECONDARY:  '#0a406a',
  ACCENT:     '#8c2a1e',
  TEXT_LIGHT: '#ffffff',
  BACKGROUND: '#002247',
};

export const Container = styled.div`
  padding: 30px;
  max-width: 800px;
  margin: 80px auto;
  background: ${COLORS.SECONDARY};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: ${COLORS.TEXT_LIGHT};
`;

export const HeaderBox = styled.div`
  background: ${COLORS.ACCENT};
  padding: 10px 18px;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

  h2 {
    color: ${COLORS.TEXT_LIGHT};
    margin: 0;
  }
`;

export const FormContainer = styled.div`
  background: transparent;
  overflow-y: auto;
  padding-bottom: 20px;
`;

export const SaveButton = styled.button`
  background-color: ${COLORS.PRIMARY};
  border: none;
  padding: 10px 30px;
  color: ${COLORS.TEXT_LIGHT};
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: ${COLORS.ACCENT};
  }
`;

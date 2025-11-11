export const Container = styled.div`
  padding: 30px 24px;
  max-width: 1100px;
  margin: 62px auto;
  background: var(--card-primary);
  border-radius: 12px;
  box-shadow: var(--box-shadow);
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
`;

export const HeaderBox = styled.div`
  background: var(--accent-color);
  padding: 10px 18px;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
`;

export const FormContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 12px;
  padding-bottom: 20px;
`;

export const SaveButton = styled.button`
  background-color: var(--modal-secondary-color);
  border: none;
  padding: 10px 30px;
  height: 38px;
  color: var(--text-light-color);
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: var(--accent-color-hover);
  }
`;

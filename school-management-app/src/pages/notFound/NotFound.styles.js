import styled from 'styled-components';
export const NotFoundContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--background-color);
  color: var(--text-light-color);
  padding: 20px;
  width: 100%;
`;

export const NotFoundContent = styled.div`
  text-align: center;
  max-width: 600px;
  padding: 40px;
  border-radius: 10px;
  background: var(--card-background-color);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  width: 100%;
`;

export const NotFoundTitle = styled.h1`
  font-size: 6rem;
  margin: 0 0 20px 0;
  color: var(--primary-color);
  font-weight: bold;
`;

export const NotFoundHeading = styled.h2`
  font-size: 2.5rem;
  margin: 0 0 20px 0;
  color: var(--text-light-color);
`;

export const NotFoundMessage = styled.p`
  font-size: 1.2rem;
  margin-bottom: 30px;
  color: var(--subtext-light);
`;

export const HomeButton = styled.button`
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(71, 107, 107, 0.3);

  &:hover {
    background: var(--secondary-color);
    transform: translateY(-2px);
  }
`;

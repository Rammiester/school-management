import styled from 'styled-components';

// Full Page Container
// export const LoginContainer = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   height: 100vh;
//   background: white
// `;
export const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: radial-gradient(
    circle at center,
    #006080 0%,
    #003060 40%,
    #002247 80%,
    #001030 100%
    // var(--card-primary) 0%,
    // var(--card-background-color) 40%,
    // var(--light-card) 80%,
    // var(--background-color) 100%
  );
  animation: fadeIn 1s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.98);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;


// Login Card Box
export const LoginBox = styled.div`
  background: var(--background-color);
  padding: 3rem;
  border-radius: 10px;
  box-shadow: var(--box-shadow-light);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

// Logo
export const Logo = styled.img`
  width: 180px;
  margin-bottom: 1.2rem;
`;

// Input Fields
export const InputField = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  margin: 0.8rem 0;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  font-size: 1rem;
  line-height: 1.4;
  outline: none;
  transition: 0.3s;
  color: var(--active-text);
  overflow: visible;
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 5px rgba(71, 107, 107, 0.5);
  }
`;

// Button
export const LoginButton = styled.button`
  width: 100%;
  padding: 10px;
  background: var(--accent-color);
  border: none;
  color: var(--text-light-color);
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 5px;
  transition: 0.3s;
  margin-top: 1rem;

  &:hover {
    background: var(--accent-color-hover);
  }
`;

// Error Message
export const ErrorMessage = styled.p`
  color: red;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

import styled, { keyframes } from "styled-components";

// Simple hover animation for a subtle lift effect
const hoverAnimation = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(-5px); }
`;

// Card container with a dynamic gradient background and hover animation
export const CardContainer = styled.div`
  background: ${({ gradient }) => gradient};
  border-radius: 20px;
  padding: 20px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 250px;
  height: 150px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    animation: ${hoverAnimation} 0.3s forwards;
  }
`;

export const IconWrapper = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
`;

export const Amount = styled.h2`
  margin: 10px 0 0;
  font-size: 28px;
  font-weight: bold;
`;

export const Label = styled.p`
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
`;

// Wave pattern at the bottom of the card for additional graphic detail
export const WavePattern = styled.div`
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 50px;
  background: url('wave-pattern.svg') no-repeat;
  background-size: cover;
  opacity: 0.3;
`;

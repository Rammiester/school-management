import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  NotFoundContainer,
  NotFoundContent,
  NotFoundTitle,
  NotFoundHeading,
  NotFoundMessage,
  HomeButton
} from './NotFound.styles';
import { useSelector } from 'react-redux';
import { getThemeSwitchValue } from '../../store/h1Slice';

const NotFound = () => {
  const navigate = useNavigate();
  const togglevalue = useSelector(getThemeSwitchValue);
  
  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <NotFoundContainer>
      <NotFoundContent>
        <NotFoundTitle>404</NotFoundTitle>
        <NotFoundHeading>Page Not Found</NotFoundHeading>
        <NotFoundMessage>
          The page you're looking for doesn't exist or has been moved. This could be due to an API error or invalid route.
        </NotFoundMessage>
        <HomeButton onClick={handleGoHome}>
          Go Back Home
        </HomeButton>
      </NotFoundContent>
    </NotFoundContainer>
  );
};

export default NotFound;

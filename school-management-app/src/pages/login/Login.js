import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LoginContainer,
  LoginBox,
  Logo,
  InputField,
  LoginButton,
  ErrorMessage,
} from './Login.styles';
import LOGO from '../../assets/logo.png';
import { motion } from 'framer-motion';
import EnhancedLoadingComponent from '../../components/LoadingComponent/EnhancedLoading';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Trying to login:", username, password);
    if (!username || !password) {
      setError('Username and Password are required.');
      return;
    }
    
    setIsLoading(true);
    try {
      await login(username, password, navigate);
    } catch (err) {
      setIsLoading(false);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <LoginContainer>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <LoginBox>
          <Logo src={LOGO} alt="School Logo" />
          <h2 style={{ color: 'white' }}>Login</h2>
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <EnhancedLoadingComponent message="Authenticating..." />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <InputField
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <div style={{ position: 'relative' }}>
                <InputField
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: 'var(--active-text)'
                  }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ?  <EyeTwoTone />: <EyeInvisibleOutlined /> }
                </span>
              </div>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <LoginButton type="submit">Login</LoginButton>
            </form>
          )}
          <p style={{ color: 'var(--text)', marginTop: '15px' }}>
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/signup')}
              style={{ color: '#8c2a1e', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Sign up here
            </span>
          </p>

        </LoginBox>
      </motion.div>
    </LoginContainer>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LoginContainer,
  LoginBox,
  Logo,
  InputField,
  LoginButton,
  ErrorMessage,
} from '../login/Login.styles';
import LOGO from '../../assets/logo.png';
import { registerUser } from '../../services/dashboardService';
import { message } from 'antd';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '', // default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password, role } = formData;

    if (!name || !email || !password) {
      return setError('All fields are required.');
    }

    setLoading(true);
    try {
      const response = await registerUser({ name, email, password, role });

      // Show success message and redirect to login
      messageApi.open({
        type: 'success',
        content: 'Registration request submitted successfully! Please wait for approval by the chairman.',
        duration: 10,
      });
      setTimeout(() => {
        navigate('/login'); // redirect to login after 10 seconds
      }, 10000);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        <Logo src={LOGO} alt="School Logo" />
        <h2 style={{ color: 'white' }}>Sign Up</h2>
        <form onSubmit={handleSignup}>
          <InputField
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />
          <InputField
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && <ErrorMessage>{error}</ErrorMessage>}
          <LoginButton type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </LoginButton>
        </form>
        <p style={{ color: 'var(--text)', marginTop: '15px' }}>
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: '#8c2a1e', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Login here
            </span>
          </p>
        {contextHolder}
      </LoginBox>
    </LoginContainer>
  );
};

export default SignUp;

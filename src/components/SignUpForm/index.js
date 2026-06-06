import { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router';
import { signUp } from '../../helpers/api';

export default function SignUpForm(props) {
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({
    username: '',
    password: '',
    email: '',
    passwordRepeat: '',
    usernameError: '',
    emailError: '',
    passwordError: '',
    passwordRepeatError: '',
  });
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const onEmailChange = (e) => {
    setFields({ ...fields, email: e.target.value });
  };

  const onPasswordChange = (e) => {
    setFields({ ...fields, password: e.target.value });
  };

  const onPasswordRepeatChange = (e) => {
    setFields({ ...fields, passwordRepeat: e.target.value });
  };

  const onUsernameChange = (e) => {
    setFields({ ...fields, username: e.target.value });
  };

  const submitForm = async (e) => {
    let newFields = { ...fields };
    setFields({
      ...fields,
      usernameError: '',
      emailError: '',
      passwordError: '',
      passwordRepeatError: '',
    });

    if (!fields.username) {
      newFields.usernameError = 'Username is a required field';
    }

    if (!fields.email) {
      newFields.emailError = 'Email is a required field';
    }

    if (!fields.password || !fields.passwordRepeat) {
      newFields.passwordError = 'Password is a required field';
      newFields.passwordRepeatError = 'Password is a required field';
    } else if (fields.password !== fields.passwordRepeat) {
      newFields.passwordError = 'Passwords must match';
      newFields.passwordRepeatError = 'Passwords must match';
    }

    if (
      newFields.usernameError ||
      newFields.emailError ||
      newFields.passwordError ||
      newFields.passwordRepeatError
    ) {
      setFields(newFields);
      setLoading(false);
      return;
    }

    setLoading(true);

    let res = await signUp({
      username: fields.username,
      password: fields.password,
      password_verify: fields.passwordRepeat,
      email: fields.email,
    });

    if (!res.ok) {
      let body = await res.json();
      console.error(body);
      setAlert('Registration failed');
      setLoading(false);
      return;
    }
    setLoading(false);
    navigate('/success');
  };

  return (
    <Card elevation={4} sx={{ borderRadius: 3, mt: 4 }}>
      <CardContent sx={{ pt: 4 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold" color="primary.main">
          Sign Up
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Create your account to get started.
        </Typography>
        <Box>
          {alert ? (
            <FormControl fullWidth margin="normal">
              <Alert severity="error">Error: {alert}</Alert>
            </FormControl>
          ) : null}
          <FormControl fullWidth margin="normal" error={!!fields.usernameError}>
            <InputLabel htmlFor="outlined-adornment-username">Username</InputLabel>
            <OutlinedInput
              id="outlined-adornment-username"
              label="Username"
              value={fields.username}
              onChange={onUsernameChange}
            />
          </FormControl>
          <FormControl fullWidth margin="normal" error={!!fields.emailError}>
            <InputLabel htmlFor="outlined-adornment-email">Email</InputLabel>
            <OutlinedInput
              id="outlined-adornment-email"
              label="Email"
              value={fields.email}
              onChange={onEmailChange}
            />
          </FormControl>
          <FormControl fullWidth margin="normal" error={!!fields.passwordError}>
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              value={fields.password}
              onChange={onPasswordChange}
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>
          <FormControl fullWidth margin="normal" error={!!fields.passwordRepeatError}>
            <InputLabel htmlFor="outlined-adornment-password">Repeat Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password-repeat"
              type={showPassword ? 'text' : 'password'}
              value={fields.passwordRepeat}
              onChange={onPasswordRepeatChange}
              label="Repeat Password"
            />
          </FormControl>
          <FormControl fullWidth margin="normal" disabled={loading}>
            <Button
              variant="contained"
              disableElevation
              onClick={submitForm}
              sx={{ py: 1.2, fontWeight: 'bold', borderRadius: 2 }}
            >
              Sign Up
            </Button>
            {loading ? (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            ) : null}
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );
}

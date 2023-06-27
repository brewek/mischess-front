import { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Button,
  Divider,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router';
import { useCookies } from "react-cookie";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { signIn } from '../../helpers/api';


export default function SignInForm(props) {
  const [alert, setAlert] = useState('');
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState({
    username: '',
    usernameError: '',
    password: '',
    passwordError: '',
  });
  const [cookies, setCookies] = useCookies();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate()
  const { apiUrl } = props;

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const submitSignIn = async () => {
    if (!fields.username || !fields.password) {
      setFields({
        ...fields, 
        usernameError: 'Required field',
        passwordError: 'Required field'
      });
      setAlert('Please enter a value for the required fields.')
      return
    }

    setLoading(true);

    let response = await signIn({
      username: fields.username,
      password: fields.password
    });

    setFields({
      ...fields,
      usernameError: '',
      passwordError: ''
    });

    setLoading(false);

    if (!response.ok) {
      let error = await response.json();
      console.log(error.detail);
      setAlert(error.detail);
      return
    }
    
    let body = await response.json();
    let type = `${body.token_type}`.charAt(0).toUpperCase() + `${body.token_type}`.substring(1);

    setCookies('token', `${type} ${body.access_token}`, {path: '/'});
    navigate('/');
  }

  return (
    <Box>
      {alert ? <FormControl fullWidth margin='normal'>
        <Alert severity="error">Error: {alert}</Alert>
      </FormControl> : null}
      <FormControl fullWidth margin='normal' error={!!fields.usernameError}>
        <InputLabel htmlFor="outlined-adornment-username">Username</InputLabel>
        <OutlinedInput
          id="outlined-adornment-amount"
          label="Amount"
          value={fields.username}
          onChange={(e) => setFields({...fields, username: e.target.value})}
        />
      </FormControl>
      <FormControl fullWidth margin='normal' error={!!fields.passwordError}>
        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
        <OutlinedInput
          id="outlined-adornment-password"
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
          value={fields.password}
          onChange={(e) => setFields({...fields, password: e.target.value})}
        />
      </FormControl>
      <FormControl fullWidth margin='normal'>
        <Button 
          variant="contained" 
          disableElevation 
          onClick={submitSignIn} 
          disabled={loading}  
        >
          Sign In
        </Button>
        {loading ? <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        /> : null }
      </FormControl>
      <FormControl fullWidth margin='normal'>
        <Divider>
          <Chip label="OR" />
        </Divider>
      </FormControl>
      <FormControl fullWidth margin='normal'>
        <Button variant="outlined" disableElevation onClick={() => navigate("/sign-up")}>
          Sign Up
        </Button>
      </FormControl>
    </Box>
  )
}
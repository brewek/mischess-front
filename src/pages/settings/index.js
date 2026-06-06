import * as React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCookies } from 'react-cookie';
import { getUser, updateUser, changePassword } from '../../helpers/api';

const ACCOUNT_TYPES = {
  1: 'Lichess',
  2: 'Chess.com',
};

export default function SettingsPage() {
  const [cookies] = useCookies();
  const [loading, setLoading] = React.useState(true);

  // Password change state
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [verifyPassword, setVerifyPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);

  // Account state
  const [accounts, setAccounts] = React.useState([]);
  const [newAccountType, setNewAccountType] = React.useState(1);
  const [newAccountValue, setNewAccountValue] = React.useState('');
  const [accountError, setAccountError] = React.useState('');
  const [accountSuccess, setAccountSuccess] = React.useState(false);
  const [savingAccounts, setSavingAccounts] = React.useState(false);

  // Dark mode state
  const [darkMode, setDarkMode] = React.useState(() => {
    try {
      const stored = localStorage.getItem('darkMode');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const res = await getUser(cookies.token);
        if (res.ok) {
          const data = await res.json();
          setAccounts(data.accounts || []);
          if (typeof data.dark_mode === 'boolean') {
            setDarkMode(data.dark_mode);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    }
    if (cookies.token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [cookies.token]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== verifyPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 9) {
      setPasswordError('New password must be at least 9 characters.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await changePassword(cookies.token, {
        old_password: oldPassword,
        new_password: newPassword,
        verify_password: verifyPassword,
      });
      if (res.ok) {
        setPasswordSuccess(true);
        setOldPassword('');
        setNewPassword('');
        setVerifyPassword('');
      } else {
        const errData = await res.json();
        setPasswordError(errData.detail || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAddAccount = async () => {
    setAccountError('');
    setAccountSuccess(false);

    if (!newAccountValue.trim()) {
      setAccountError('Username is required.');
      return;
    }

    const newAccount = {
      account_type: newAccountType,
      value: newAccountValue.trim(),
    };

    const updatedAccounts = [...accounts, newAccount];
    setSavingAccounts(true);
    try {
      const res = await updateUser(cookies.token, { accounts: updatedAccounts });
      if (res.ok) {
        setAccounts(updatedAccounts);
        setNewAccountValue('');
        setAccountSuccess(true);
      } else {
        const errData = await res.json();
        setAccountError(errData.detail || 'Failed to add account.');
      }
    } catch (err) {
      setAccountError('An error occurred. Please try again.');
    } finally {
      setSavingAccounts(false);
    }
  };

  const handleRemoveAccount = async (index) => {
    const updatedAccounts = accounts.filter((_, i) => i !== index);
    setSavingAccounts(true);
    try {
      const res = await updateUser(cookies.token, { accounts: updatedAccounts });
      if (res.ok) {
        setAccounts(updatedAccounts);
      } else {
        const errData = await res.json();
        setAccountError(errData.detail || 'Failed to remove account.');
      }
    } catch (err) {
      setAccountError('An error occurred. Please try again.');
    } finally {
      setSavingAccounts(false);
    }
  };

  const handleToggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    try {
      await updateUser(cookies.token, { dark_mode: newDarkMode });
    } catch (err) {
      console.error('Failed to save theme preference:', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      {/* Password Change */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <Box
            component="form"
            onSubmit={handleChangePassword}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}
          >
            <TextField
              label="Current Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              fullWidth
              size="small"
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              fullWidth
              size="small"
              helperText="At least 9 characters"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={verifyPassword}
              onChange={(e) => setVerifyPassword(e.target.value)}
              required
              fullWidth
              size="small"
            />
            {passwordError && <Alert severity="error">{passwordError}</Alert>}
            {passwordSuccess && <Alert severity="success">Password changed successfully.</Alert>}
            <Button
              type="submit"
              variant="contained"
              disabled={changingPassword}
              sx={{ alignSelf: 'flex-start' }}
            >
              {changingPassword ? <CircularProgress size={24} /> : 'Change Password'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Accounts */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Configured Accounts
          </Typography>
          {accounts.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No accounts configured. Add a Lichess or Chess.com account to analyze your games.
            </Typography>
          ) : (
            <List dense>
              {accounts.map((account, index) => (
                <ListItem
                  key={index}
                  divider
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveAccount(index)}
                      disabled={savingAccounts}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={account.value}
                    secondary={ACCOUNT_TYPES[account.account_type] || 'Unknown'}
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Add Account
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Platform</InputLabel>
              <Select
                value={newAccountType}
                label="Platform"
                onChange={(e) => setNewAccountType(e.target.value)}
              >
                <MenuItem value={1}>Lichess</MenuItem>
                <MenuItem value={2}>Chess.com</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Username"
              value={newAccountValue}
              onChange={(e) => setNewAccountValue(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <Button variant="contained" onClick={handleAddAccount} disabled={savingAccounts}>
              Add
            </Button>
          </Box>
          {accountError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {accountError}
            </Alert>
          )}
          {accountSuccess && (
            <Alert severity="success" sx={{ mt: 1 }}>
              Account added successfully.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Other Options */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Preferences
          </Typography>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={handleToggleDarkMode} />}
            label="Dark Mode"
          />
        </CardContent>
      </Card>
    </Container>
  );
}

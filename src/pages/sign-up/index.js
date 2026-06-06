import { Container } from '@mui/material';
import SignUpForm from '../../components/SignUpForm';

export default function SignUpPage(props) {
  return (
    <Container maxWidth="sm">
      <SignUpForm apiUrl={props.apiUrl} />
    </Container>
  );
}

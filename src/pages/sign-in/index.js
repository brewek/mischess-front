import {
  Container
} from '@mui/material';

import SignInForm from '../../components/SignInForm';

export default function SignInPage(props) {
  const { apiUrl } = props;

  return (
    <Container maxWidth="sm">
      <SignInForm apiUrl={apiUrl}/>
    </Container>
  );
}

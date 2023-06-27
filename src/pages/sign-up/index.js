import { Container } from "@mui/system";
import SignUpForm from "../../components/SignUpForm";

export default function SignUpPage(props) {
  return (
    <>
      <Container maxWidth="sm">
        <SignUpForm apiUrl={props.apiUrl} />
      </Container>
    </>
  );
}

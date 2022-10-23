import { useState } from 'react';
// @mui
import { Alert, Tooltip, Stack, Typography, Link, Box } from '@mui/material';
// hooks
import { useAuthContext } from '../../auth/useAuthContext';
// layouts
import LoginLayout from '../../layouts/login';
//
import AuthLoginForm from './AuthLoginForm';
import AuthSignUpForm from './AuthSignUpForm';

// ----------------------------------------------------------------------

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { method } = useAuthContext();

  return (
    <LoginLayout>
      <Stack spacing={2} sx={{ mb: 5, position: 'relative' }}>
        <Typography variant='h4'>Sign in to TS Service Desk</Typography>

        {isSignUp ? (
          <Stack direction='row' spacing={0.5}>
            <Typography variant='body2'>Have an account?</Typography>

            <Link variant='subtitle2' onClick={() => setIsSignUp(false)}>
              Proceed to login
            </Link>
          </Stack>
        ) : (
          <Stack direction='row' spacing={0.5}>
            <Typography variant='body2'>New user?</Typography>

            <Link variant='subtitle2' onClick={() => setIsSignUp(true)}>
              Create an account
            </Link>
          </Stack>
        )}

        <Tooltip title={method} placement='left'>
          <Box
            component='img'
            alt={method}
            src={`/assets/icons/auth/ic_${method}.png`}
            sx={{ width: 32, height: 32, position: 'absolute', right: 0 }}
          />
        </Tooltip>
      </Stack>

      {/* <Alert severity="info" sx={{ mb: 3 }}>
        Use email : <strong>demo@minimals.cc</strong> / password :<strong> demo1234</strong>
      </Alert> */}

      {isSignUp ? <AuthSignUpForm /> : <AuthLoginForm />}

      {/* <AuthWithSocial /> */}
    </LoginLayout>
  );
}

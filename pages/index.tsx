import Link from 'next/link';
import { SpeechmaticsLogo } from '../components/icons-library';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { RedirectRequest } from '@azure/msal-browser';


export default function Index() {
  const router = useRouter();

  const { instance, accounts, inProgress } = useMsal();

  let authority = process.env.SIGNIN_POLICY;

  const loginRequest = {
    scopes: [process.env.DEFAULT_B2C_SCOPE],
    authority,
  } as RedirectRequest;

  useEffect(() => {
    if (inProgress == 'none' && (!accounts || accounts.length == 0)) {
      instance.loginRedirect(loginRequest).catch((error) => {
        console.log(error);
      });
    }
  }, [inProgress, accounts, accounts?.length]);


  useEffect(() => {
    let st: number;
    if (inProgress == 'none' && accounts.length > 0) {
      st = window.setTimeout(() => router.push('/home/'), 1000);
    }
    return () => { if (st) window.clearTimeout(st) };
  }, [inProgress, accounts, accounts?.length]);

  console.log({ inProgress, accountsLen: accounts?.length })

  return (
    <div className='login_container'>
      <SpeechmaticsLogo />
      {inProgress} {accounts?.length}
    </div>
  );
}

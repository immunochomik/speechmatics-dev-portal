import { SpeechmaticsLogo } from '../components/icons-library';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { storeUtmData } from '../utils/analytics';


export default function Index() {
  const router = useRouter();

  useEffect(() => {
    storeUtmData();

    let st: number;
    st = window.setTimeout(() => router.push('/login/'), 0);
    return () => window.clearTimeout(st);
  }, []);

  return (
    <div className='login_container'>
      <SpeechmaticsLogo />
    </div>
  );
}

import type { NextPage } from 'next'
import useSWR from 'swr';
import styles from './[...link].module.css'
import { CredentialCard } from 'components/CredentialCard/CredentialCard';
import { Container } from 'components/Container/Container';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useVerification } from 'lib/useVerification';
import { VerifiableCredential } from 'types/credential';
import { VerificationContext } from 'lib/verificationContext';
import { VerificationCard } from 'components/VerificationCard/VerificationCard';
import { TopBar } from 'components/TopBar/TopBar';
import { BottomBar } from 'components/BottomBar/BottomBar';
import { extractCredentialsFrom, VerifiableObject } from 'lib/verifiableObject';
import { LoadingError } from 'components/LoadingError/LoadingError';

const fetcher = (input: RequestInfo, init: RequestInit, ...args: any[]) => fetch(input, init).then((res) => res.json());

const CredentialPage: NextPage = () => {
  const [credential, setCredential] = useState<VerifiableCredential | undefined>(undefined);
  const [isDark, setIsDark] = useState(false);

  const credentialContext = useVerification(credential as VerifiableCredential);

  const router = useRouter();
  const link = router.query && router.query.link && (router.query.link as Array<string>).join('/') || ''
  console.log({link})

  const extract = (data: VerifiableObject) => {
    console.log("extract")
    console.log({data})
    if (data !== undefined) {
      const vp = data;
      const creds = extractCredentialsFrom(vp);
      console.log({creds})
      setCredential(creds![0])
    }
  }

  const { error } = useSWR(`${link}`, fetcher, {onSuccess: extract});
  if (error) {
    return (
    <div className={styles.container}>
      <TopBar hasLogo={true} isDark={isDark} setIsDark={setIsDark} />
        <LoadingError/>
      <BottomBar isDark={isDark}/>
    </div>);
  }
  if (!credential) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <TopBar hasLogo={true} isDark={isDark} setIsDark={setIsDark} />
      <div className={styles.verifyContainer}>
        <VerificationContext.Provider value={credentialContext}>
          <Container>
            <CredentialCard credential={credential} />
            <VerificationCard />
          </Container>
        </VerificationContext.Provider>
      </div>
      <BottomBar isDark={isDark}/>
    </div>
  )
}

export default CredentialPage

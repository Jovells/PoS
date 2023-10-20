import { Helmet } from 'react-helmet-async';

import { LandingView } from 'src/sections/landing/view';

// ----------------------------------------------------------------------

export default function AppPage() {
  return (
    <>
      <Helmet>
        <title> Home | DPoS </title>
      </Helmet>

      <LandingView />
    </>
  );
}

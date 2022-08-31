import React, { useCallback, useContext } from 'react';
import Dashboard from '../components/dashboard';
import { Box, Grid, GridItem, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import accountContext from '../utils/account-store-context';
import { observer } from 'mobx-react-lite';
import {
  DescriptionLabel,
  ErrorBanner,
  HeaderLabel,
  PageHeader,
  UsageInfoBanner,
  ViewPricingBar
} from '../components/common';
import {
  ModelDescriptionBox,
  UsageBreakdown,
  GetInTouchCalendlyBox,
  UsageSummary,
  AddPaymentCardBox
} from '../components/usage-elements';
import { BaloonIcon, CallSupportIcon, RocketIcon } from '../components/icons-library';
import { trackEvent } from '../utils/analytics';
import { useMsal } from '@azure/msal-react';

export default observer(function Usage() {
  const { accountStore } = useContext(accountContext);
  const paymentMethodAdded = !!accountStore.getPaymentMethod();

  const tabsOnChange = useCallback((index) => {
    trackEvent(`usage_tab_${['limits', 'summary', 'details'][index]}`, 'Navigation');
  }, []);

  const { instance } = useMsal();
  const account = instance.getActiveAccount();

  return (
    <Dashboard>
      <PageHeader headerLabel='Track Usage' introduction='Review Usage of the API.' />
      <Tabs size='lg' variant='speechmatics' width='100%' maxWidth='900px' onChange={tabsOnChange}>
        <TabList marginBottom='-1px'>
          <Tab data-qa='tab-limits'>Limits</Tab>
          <Tab data-qa='tab-summary'>Summary</Tab>
          <Tab data-qa='tab-details'>Details</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <HeaderLabel>Usage Limits</HeaderLabel>
            <DescriptionLabel>Hours of Audio Per Month.</DescriptionLabel>
            <Grid gridTemplateColumns='1fr 1fr' gap='1.5em'>
              {accountStore.responseError ? (
                <GridItem colSpan={2}>
                  <ErrorBanner mt='0' content={`Unable to get usage limits information`} />
                </GridItem>
              ) : (
                <>
                  <ModelDescriptionBox
                    mainColor='smGreen'
                    icon={<RocketIcon />}
                    title='ENHANCED'
                    usageLimitType='enhanced'
                    description='Enhanced provides the highest transcription accuracy.'
                  />
                  <ModelDescriptionBox
                    mainColor='smBlue'
                    icon={<BaloonIcon />}
                    title='STANDARD'
                    usageLimitType='standard'
                    description='Standard provides faster transcription with high accuracy.'
                  />
                </>
              )}
              <GridItem colSpan={2}>
                {accountStore.isLoading ? (
                  <Box bg='smNavy.500' width='100%' />
                ) : paymentMethodAdded ? (
                  <>
                    <GetInTouchCalendlyBox
                      icon={<CallSupportIcon />}
                      title='Need More Usage?'
                      ctaText='Contact our sales team for custom pricing.'
                      url={process.env.CALENDLY_GENERAL_FORM_URL}
                      buttonLabel='Get in Touch'
                      utm={{
                        utm_contract_id: accountStore.getContractId(),
                        utm_source: 'direct',
                        utm_medium: 'portal'
                      }}
                      email={(account?.idTokenClaims as any).email}
                    />
                    <AddPaymentCardBox
                      icon={<CallSupportIcon />}
                      title='Increase Usage Limits'
                      ctaText='Add a payment card to increase these limits.'
                      hrefLink='/subscribe/'
                      buttonLabel='Add Card'
                    />
                  </>
                ) : (
                  <AddPaymentCardBox
                    icon={<CallSupportIcon />}
                    title='Increase Usage Limits'
                    ctaText='Add a payment card to increase these limits.'
                    hrefLink='/subscribe/'
                    buttonLabel='Add Card'
                  />
                )}
              </GridItem>
              <GridItem colSpan={2}>
                <ViewPricingBar />
              </GridItem>
            </Grid>
          </TabPanel>
          <TabPanel>
            <UsageSummary />
          </TabPanel>
          <TabPanel>
            <HeaderLabel>Usage Metrics</HeaderLabel>

            <UsageBreakdown />

            <UsageInfoBanner
              text='Usage is reported on a UTC calendar-day basis and is updated every 5 minutes.'
              mt='2em'
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Dashboard>
  );
});

import { test, expect, Page } from '@playwright/test';
import console from 'console';


test('Home on-mount test', async ({ request,page,baseURL }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto('/home');
  let bearer = null;
  let token = null;
  await Promise.all([
    page.waitForTimeout(3000),
    page.on('request', request => {

      if(request.resourceType()==="xhr" || request.resourceType()==="fetch")
      {
        request.allHeaders().then(h=>{
          bearer = h['authorization']

          const get_response1 = await request.get(`https://speechmaticsb2c.b2clogin.com/speechmaticsb2c.onmicrosoft.com/b2c_1a_signin_only/v2.0/.well-known/openid-configuration`)
  expect(get_response1.status()).toBe(200)
  expect(get_response1.ok()).toBeTruthy()

  const get_response2 = await request.get(`https://mp.speechmatics.com/v1/accounts`,{
    params:{
      "Authorization":bearer
    }
  })
  expect(get_response2.status()).toBe(200)
  expect(get_response2.ok()).toBeTruthy()
         
        })
      }
      
    })
  ])

  



//   const post_response = await request.post(`https://speechmaticsb2c.b2clogin.com/speechmaticsb2c.onmicrosoft.com/b2c_1a_signin_only/oauth2/v2.0/token`,{
//     data:{
//       //client_id:`75a2952e-954e-4975-8a14-ef862a8e5a39&scope=openid%20profile%20offline_access&grant_type=refresh_token&client_info=1&x-client-SKU=msal.js.browser&x-client-VER=2.26.0&x-ms-lib-capability=retry-after, h429&x-client-current-telemetry=5|61,0,,,|@azure/msal-react,1.4.2&x-client-last-telemetry=5|0|||0,0&client-request-id=3b5044b0-20c1-4077-b781-f0b121c1eea1&refresh_token=eyJraWQiOiI5NGVNNWRLX3NPNUJiMVVJT1hCU3U4WWJrNGh4LUUtbEEtWjJodU9KekZNIiwidmVyIjoiMS4wIiwiemlwIjoiRGVmbGF0ZSIsInNlciI6IjEuMCJ9.fBVMTzgmkBdIK-0SKCtbYPnLLFHrv4PmoGve1z9c29iAcZeKS9lptnzGI7kf955iU0zdDMTT_gfxXTUYk76_rC1xz0KZF22PjW2gcRIxz4cODPD5oqhE1YDljYqbHgoFhJKOG_JQpjaQI56bBQWdGPI1a0S6MXc02tEThYhuHHcp3102Kn9KKGVBZNxGSBfeW_DciGz4OsnEnVw7cNydEHDzvfUk4NvsMsmcyCcyDARtpW-p27elNE2wBjqJyl3J39U4w4RfogLZHreEnapDDIugtKnoExnN7kOgDYochhawBpSjom_m8UmI9hjzvrgdIopM7o039jK8owIvaYZOyQ.rI-XmZ4FTZPRTLc-.rXBtgVd-O11e7ElZ8rw7xFfm0SAR5IXURQWNZlH0qQGenJnjxqaKF1HSlb7WwQ2jELB322utuyciGR7gHku8GOUxSpYJrPLTQeZafXUCrqj4IPt7Hr1nvIAaMb8_Khze3kKsMo5GUIMbcOI2ocyhQDcUyT9fK4IrDopdZvbZvkcNCoNQEtYF101fypp11HU6XUp6pDloIAybMmQzqBC5Yf-bCZVu67H34UpPjDPjl-lFeDZU00ZqyZGi6aEm8tFQHlvjNojnh4HJIvfj_DZaLSrGqFHSeJ7T8pggmmDbWYpBQKLWrDUTaZn2IWUZdfqDU2-xRbpZN-OU-lkvk28zzPv65SkuEtrCOD3QzFca7GfZ_S1fe_6mzkNmrr5fqCviKPcymFQIih4EH9wHu5rh-KXnC1aUEEXq8mxt5Gg9ke4Ol3BoqXDG2A3cx-jswiG5o-fT9zARtEENQ20N5lXryl7rMR8rqFxziQC4J9JAGekHSSA8Wh2iq9MruPfzkOsbvFaMRsOUrk8OsWVC0u_rNb24TfC4xZIfrVdhJu7qwCPR1BS5Sw2bcMTMLo52I9Vtyjw5mQ_akcIRAcS57YA5KKijLw1cPHbQv5MCgXd80Dpt0qXxAtT5aCesrow7ICP4EuHS3QCLRa3Yh_DTWJr7LEmQ6vtxBzNAsg.MYCtO86aOzQkNn8usW8r8w&X-AnchorMailbox=Oid%3Afb63be2d-1691-4d15-9297-b4f6c0a6c111-b2c_1a_signin_only%4058cc5aac-9471-4b8e-bca0-c416eb678093`
//     },
//     headers: {
//       authorization: bearer
//   }
// })
//   expect(post_response.status()).toBe(200)
//   expect(post_response.ok()).toBeTruthy()

  
});




  test('view-jobs on-mount test', async ({ request,page,baseURL }) => {
    // Go to https://portal.speechmatics.com/home/
    await page.goto('/view-jobs');
    

    
  });
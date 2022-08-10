import { test, expect, Page } from '@playwright/test';
import console from 'console';


test('Home on-mount test', async ({ request,page,baseURL }) => {
  // Go to https://portal.speechmatics.com/home/
  await page.goto('/home');

  await Promise.all([
    page.waitForTimeout(5000),
    page.on('response',async response => {
    
    expect(await response.status()==200 ||await response.status()==304 || await response.status()==201 ).toBe(true)

      
    })
  ])


  

});




  test('Transcribe api key on-mount test', async ({ request,page,baseURL }) => {
    // Go to https://portal.speechmatics.com/home/
    await page.goto('/transcribe');

    await Promise.all([
      page.waitForTimeout(5000),
      page.on('response',async response => {
      
      expect(await response.status()==200 ||await response.status()==304 || await response.status()==201 ).toBe(true)
   
        
      })
    ])

    

    
  });

  test('View jobs on-mount test', async ({ request,page,baseURL }) => {
    // Go to https://portal.speechmatics.com/home/
    await page.goto('/view-jobs');

  

    await Promise.all([
      page.waitForTimeout(5000),
      page.on('response', async response => {
      
      expect(await response.status()==200 ||await response.status()==304 || await response.status()==201 ).toBe(true)

      })
    ])


    
  });

  test('usage on-mount test', async ({ request,page,baseURL }) => {
    // Go to https://portal.speechmatics.com/home/
    await page.goto('/usage');

  

    await Promise.all([
      page.waitForTimeout(5000),
      page.on('response', async response => {
      
      expect(await response.status()==200 ||await response.status()==304 || await response.status()==201 ).toBe(true)

      })
    ])


    
  });

  test('manage-billing on mount api test', async ({ request,page,baseURL }) => {
    // Go to https://portal.speechmatics.com/home/
    await page.goto('/manage-billing');

  

    await Promise.all([
      page.waitForTimeout(5000),
      page.on('response', async response => {
       
      expect(await response.status()==200 ||await response.status()==304 || await response.status()==201 ).toBe(true)

      })
    ])


    
  });

  test('manage-access on mount api test', async ({ request,page,baseURL }) => {
    // Go to https://portal.speechmatics.com/home/
    await page.goto('/manage-access');

  

    await Promise.all([
      page.waitForTimeout(5000),
      page.on('response', async response => {
       
      expect(await response.status()==200 ||await response.status()==304 || await response.status()==201 ).toBe(true)

      })
    ])


    
  });
import { test, expect } from '@playwright/test'

test.describe('Workout Logging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Assume login is handled or use test user
  })

  test('complete workout logging flow', async ({ page }) => {
    // Navigate to Workout Logger
    await page.click('text=Workout Logger')

    // Select Structured mode
    await page.click('text=Structured')

    // Select a template (if available)
    // For now, skip template selection
    await page.click('text=Skip and Build from Scratch')

    // Add a strength exercise
    await page.click('text=Bench Press')
    await page.click('text=Add')

    // Configure parameters
    await page.fill('[aria-label="Sets"]', '3')
    await page.fill('[aria-label="Reps"]', '10')
    await page.fill('[aria-label="Weight (lbs)"]', '135')

    // Add a cardio exercise
    await page.fill('[placeholder="Search exercises..."]', 'Running')
    await page.click('text=Running')
    await page.click('text=Add')

    // Configure cardio parameters
    await page.fill('[aria-label="Duration (sec)"]', '1800')
    await page.fill('[aria-label="Distance (km)"]', '5')
    await page.fill('[aria-label="Calories"]', '300')

    // Fill workout name
    await page.fill('[placeholder="e.g., Upper Body Strength"]', 'Test Workout')

    // Save workout
    await page.click('text=Save Workout')

    // Verify workout appears in history
    await expect(page.locator('text=Test Workout')).toBeVisible()
  })
})
// Chrome!
const puppeteer = require('puppeteer')

// table to json
const tabletojson = require('tabletojson')

const fs = require('fs')

// main
;(async () => {
  // 1. open the browser
  const browser = await puppeteer.launch({ ignoreHTTPSErrors: true })

  // 2. open a new page
  const page = await browser.newPage()

  // 3. set the screen size (a webpage may look different in different sizes)
  page.setViewport({ width: 1080, height: 768 })

  // 5. goto 12306, wait for load
  await page.goto('https://kyfw.12306.cn/otn/index/init', { waitUntil: 'load' })

  // 6. select the stations
  await page.click('#fromStationText')
  await page.click('#ul_list1 > li:nth-child(1)') // 北京
  await page.click('#toStationText')
  await page.click('#ul_list1 > li:nth-child(2)') // 上海

  // 7. select the date
  await page.click('#train_date')
  await page.click(
    'body > div.cal-wrap > div:nth-child(1) > div.cal-cm > div:nth-child(30) > div'
  ) // 11.30

  // 8. click the "search" button
  await page.click('#a_search_ticket')

  // 9. (it takes seconds to authorize) wait for page change
  await page.waitForNavigation()

  // 10. Get the JSON, save it
  const table = await page.$eval('#t-list > table', e => e.outerHTML)
  const json = tabletojson.convert(table)
  fs.writeFileSync('data.json', JSON.stringify(json, null, 2))

  // 11. close the browser
  await browser.close()
})()

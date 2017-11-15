// Chrome!
const puppeteer = require('puppeteer')

// file system
const fs = require('fs')

async function queryDate(browser, date) {
  console.log('start ', date, new Date())

  // open a new page
  const page = await browser.newPage()

  // set the screen size (a webpage may look different in different sizes)
  page.setViewport({ width: 1080, height: 768 })

  // goto 12306, wait for load
  await page.goto('https://kyfw.12306.cn/otn/index/init', { waitUntil: 'load' })

  // select the stations
  await page.click('#fromStationText')
  await page.click('#ul_list1 > li:nth-child(1)') // 北京
  await page.click('#toStationText')
  await page.click('#ul_list1 > li:nth-child(2)') // 上海

  // select the nth date button
  await page.click('#train_date')
  const dates = await page.$$(
    'body > div.cal-wrap > div:nth-child(1) > div.cal-cm > div > div'
  )
  await dates[date - 1].click()

  // click the "search" button
  await page.click('#a_search_ticket')

  // (it takes seconds to authorize) wait for page change
  await page.waitForNavigation()

  // Get the JSON, parse it
  const table = await page.$$eval('#t-list > table > tbody > tr', trs =>
    trs
      .map(e => e.innerText.replace(/\n/g, '\t'))
      .filter(t => t.length)
      .map(row => row.split('\t'))
  )

  console.log('finish', date, new Date())
  return table
}

// main
;(async () => {
  // open the browser (note the 12306 site needs ignoreHTTPSErrors...)
  const browser = await puppeteer.launch({ ignoreHTTPSErrors: true })

  // add tasks (query dates from 16 to 20)
  const tasks = []
  for (let i = 16; i <= 20; ++i) {
    // no blocking since there's no `await`
    tasks.push(queryDate(browser, i))
  }

  // start in parallel
  const data = await Promise.all(tasks)

  // save as JSON
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2))

  // close the browser
  await browser.close()
})()

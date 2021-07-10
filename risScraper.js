const puppeteer = require('puppeteer')
const { writeFile } = require('fs');
const writeRis = require('./JSONtoRIS')


let opts
let selectors
const defaultSelectorTimeout = 5000
module.exports = function risScraper(options) {
    opts = options
    selectors = opts.selectors
    setupBrowser(opts);
}


async function setupBrowser(opts) {
    const browser = await puppeteer.launch({ 
        headless: false, // false: enables one to view the Chrome instance in action
        defaultViewport: null, // (optional) useful only in non-headless mode
    });
    const page = await browser.newPage();

    addLoggingToPage(page)

    // go to the page
    await page.goto(opts.url, { waitUntil: 'networkidle2' });

    const results = await getSearchResults(page)


    await addSpecificPageInfo(page, results)

    addTypeToResults(results, opts.risType)

    if (opts.jsonFileName) {
        writeFile(`./${opts.jsonFileName}`, JSON.stringify(results), () => console.log("Done!"))
    }
    if (opts.risFileName) {
        writeRis(results, opts.risFileName, {
            date: 'DA',
            seriesName: 'LB',
            title: 'T1',
            link: 'UR',
            abstract: 'AB',
            country: 'CY',
            author: 'AU'
        })
    }

    browser.close()
}

let indexPagesVisited = 1
async function getSearchResults(page) {
    let results = await getResultList(page)

    while (await hasNextPage()) {
        await page.click(selectors.nextPage)
        await page.waitForTimeout(1000)
        console.log("pages visited", ++indexPagesVisited)
        const newPageResults = await getResultList(page)
        results = [...results, ...newPageResults]
    }

    async function hasNextPage() {
        return await page.evaluate((selectors) => {
            if (selectors.noNextPage) {
                console.log("has next page", document.querySelector(selectors.noNextPage) === null)
                return document.querySelector(selectors.noNextPage) === null
            }
            else {
                console.log("has next page", document.querySelector(selectors.nextPage) !== null)
                return document.querySelector(selectors.nextPage) !== null
            }
        }, selectors)
    }

    return results
}



async function getResultList(page) {

    const waitFor = [
        selectors.searchResultContainer,
        selectors.searchResultDate,
        selectors.searchResultSeriesName,
        selectors.searchResultTitle,
        selectors.searchResultAuthor,
        selectors.searchResultLink
    ].filter(val => !!val)
    for (const selector of waitFor) {
        await page.waitForSelector(selector, {timeout: opts.waitForSelectorTimeout || defaultSelectorTimeout})
    }

    return await page.evaluate((selectors) => {
        // contains the final results list
        let results = []

        // get a list of all the divs containing requisite information for a given entry
        let parentEles = Array.from(document.querySelectorAll(selectors.searchResultContainer))

        for (const parentEle of parentEles) {
            // get the info for each entry
            const entry = {}

            if (selectors.searchResultDate) {
                entry.date = parentEle.querySelector(selectors.searchResultDate).innerText
            }
            if (selectors.searchResultSeriesName) {
                entry.seriesName = parentEle.querySelector(selectors.searchResultSeriesName).innerText
            }
            if (selectors.searchResultTitle) {
                entry.title = parentEle.querySelector(selectors.searchResultTitle).innerText
            }
            if (selectors.searchResultAuthor) {
                entry.author = parentEle.querySelector(selectors.searchResultAuthor).innerText
            }
            if (selectors.searchResultLink) {
                entry.link = parentEle.querySelector(selectors.searchResultLink).href
            }

            results.push(entry)
        }

        return results;
    }, selectors);
}

let pagesVisited = 0
async function addSpecificPageInfo(page, results) {

    for (const result of results) {
        const waitForSelectors = [selectors.resultAbstract, selectors.resultCountry].filter(val => !!val)

        if (!result.link || waitForSelectors.length === 0) {
            continue
        }

        await page.goto(result.link, { waitUntil: 'networkidle2' })
        console.log("pages visited", ++pagesVisited)

        for (const selector of waitForSelectors) {
            await page.waitForSelector(selector, {timeout: opts.waitForSelectorTimeout || defaultSelectorTimeout})
        }

        const extraFields = await page.evaluate((selectors) => {
            const result = {}
            if (selectors.resultAbstract) {
                result.abstract = document.querySelector(selectors.resultAbstract).innerText
            }
            if (selectors.resultCountry) {
                result.country = document.querySelector(selectors.resultCountry).innerText
            }

            return result
        }, selectors)

        for (const [key, value] of Object.entries(extraFields)) { result[key] = value }
    }
}

function addTypeToResults(results, type) {
    for (const result of results) {
        result.TY = type
    }
}

function addLoggingToPage(page) {
    page.on('console', message => console.log(message.text()))
}


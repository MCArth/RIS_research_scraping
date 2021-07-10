const { risScraper } = require("./risScraper"); // don't edit

const options = {

	url: 'http://transport-links.com/archive/',

	risType: 'CPAPER',

	risFileName: 'transportLinksResults.ris',

	jsonFileName: null,

	selectors: {
		nextPage: ".wpv-filter-next-link.js-wpv-pagination-next-link.page-link",
		noNextPage: null,

		searchResultContainer: 'tbody.wpv-loop.js-wpv-loop tr',

		searchResultTitle: 'a[href]',
		searchResultDate: null,
		searchResultSeriesName: null,
		searchResultLink: 'a[href]',
		searchResultAuthor: 'td:not(:first-of-type)',

		resultAbstract: null,
		resultCountry: null,
	},

	waitForSelectorTimeout: 30000,
}

risScraper(options) // don't edit

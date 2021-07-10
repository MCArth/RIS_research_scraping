const risScraper = require("./risScraper");

const opts = {

	// The URL of the search page from which to start searching
	url: 'https://www.adb.org/search?page=1&facet_query=ola_collection_name%3Aevaluation_document%7CEvaluation%20Document&facet_query=sm_field_countries%24name%3APhilippines',

	risType: 'CPAPER', // The value to use in the TY field for all results. See possible values here https://en.wikipedia.org/wiki/RIS_(file_format) under "Type of reference"

	risFileName: 'adbResults.ris', // The name of the file to write the RIS to. Should include the .ris

	jsonFileName: 'adbResults.json', // You can pass the name of a JSON file to write to, if you would also like a JSON. Should include the .json

	// These selectors are how results are obtained from the web page
	// Some knowledge of html and css will be helpful in writing these
	// You should go to your search page and use your browser's developer tools to find a good selector for each thing below
	// This can be obtained by pressing f12 in most browsers (and then using the Elements tab in the subsequent window)
	//
	// Useful tips if you haven't used this browser feature before:
	// - Hovering over a html element will highlight (in blue) the actual area on the webpage the html element represents
	// - You can right click on an area of the actual webpage that you want to see the html for and click "Inspect" or "Inspect Element"
	//      - This is great as you can avoid expanding loads of elements trying to find the element representing your relevant part of the page
	//
	// You should then read both https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors and https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
	// to learn how to write a selector for your given element
	// It may be helpful to visit the adb site linked above, using the developer tools and seeing how the adb selectors work
	//
	// All selectors, unless otherwise noted, should only select a single html element, so you should be as specific as possible to make that happen.
	selectors: {
		// Used to go to the next page of search results
		nextPage: "button.ola-page-next",

		// Used to determine whether there is another search page to look at
		// can be null, in which case we check for the existence of nextPage to determine whether there is a next page
		noNextPage: '.ola-page-next.ola-page-disabled',

		// A selector that selects the container of a single entry in the search list
		// This is the only selector that can select more than one element (and it is expected to!)
		// It's required so as to select and get information from each individual entry in the list
		searchResultContainer: 'div[class~="ola-snippet-collection-evaluation_document"]',

		// Selectors for fields that could exist on the search page. Set to null if the field does not exist on the search page
		// All apart from searchResultLink should select elements that are the direct parent of the text you wish to read (aka the html element that wraps the text)
		// searchResultLink must select an element which has a href attribute (this is what contains the link)
		searchResultDate: 'div[class~="ola-field-date"] span',
		searchResultSeriesName: 'div[class~="ola-field-sm_field_series_names"] div[class~="ola-field-value"]',
		searchResultTitle: 'a[href] span',
		searchResultLink: 'a[href]', // you must be selecting an element with a href attribute
		searchResultAuthor: null,

		// These selectors obtain values from the actual page for each search result
		// Leave all of these null if you do not wish to go to the actual page for each entry in the search results
		// An example of an actual page for an entry is https://www.adb.org/documents/philippines-agrarian-reform-communities-project-ii
		// The pages that are visited will be the values obtained by using the searchResultLink selector (so searchResultLink should be the correct value)
		resultAbstract: 'article[typeof] p',
		resultCountry: 'div[class~="article-tags"] a[href*="countries"]',
	},

	waitForSelectorTimeout: 5000, // If you are getting an error because the page is taking too long to load, you can increase this value (it is in milliseconds)
}

risScraper(opts)

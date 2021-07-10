const {removeDuplicates} = require("./risScraper");
const assert = require('assert')

const results = [{a: 2, b: "hey"}, {a: 2, b: "hey"}]
removeDuplicates(results)
assert(results.length === 1)

console.log("Passed")
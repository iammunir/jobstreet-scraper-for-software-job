const index = require('../index');
const path = require('path');
const fs = require('fs');

let html;
let indivPage;
let listings;

beforeAll(() => {
  html = fs.readFileSync(path.resolve(__dirname, '../test.html'));
  indivPage = fs.readFileSync(path.resolve(__dirname, '../test2.html'));
  // listings = index.listings(html);
});

test('should get correct pagination details', () => {
  expect(index.paginationHandler(html)).toEqual({
    'numberOfJobs': 867, 
    'jobPerPage': 20, 
    'numberOfPages': 44
  });
})

test('should get correct', () => {
  expect(index.scrapeJobDescriptionHandler(indivPage))
    .toEqual({desription: 'a'})
})


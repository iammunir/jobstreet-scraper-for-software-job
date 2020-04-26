const request = require('request-promise');
const cheerio = require('cheerio');
const ObjectToCsv = require('objects-to-csv');

const URL = 'https://www.jobstreet.co.id/id/job-search/job-vacancy.php?key=&location=&specialization=191&area=&salary=&ojs=3&src=12';

const getHTML = async (url) => {
  const html = await request.get(url);
  return html;
}

const paginationHandler = (html) => {

  const $ = cheerio.load(html);
  
  // get the pagination count
  const pageInfoText = $('.pagination-result-count').text();
  const pageInfoArr = pageInfoText.split(' ');

  // extract details
  const numberOfJobs = Number.parseInt(pageInfoArr[4]);
  const jobPerPage = Number.parseInt(pageInfoArr[2]);
  const numberOfPages = Math.ceil(numberOfJobs/jobPerPage);

  return { numberOfJobs, jobPerPage, numberOfPages };
}

const scrapeJobListingHandler = async (page) => {
  const { numberOfPages } = page;
  const list = [];

  for (let pg = 1; pg <= numberOfPages; pg++) {
    const html = await request.get(`https://www.jobstreet.co.id/id/job-search/job-vacancy.php?area=1&option=1&specialization=191%2C192%2C193&job-source=1%2C64&classified=0&job-posted=0&sort=1&order=0&pg=${pg}&src=16&srcr=12&ojs=3`);
    const $ = cheerio.load(html);

    $('.panel-body').each((index, element) => {
      const title = $(element).find('.position-title-link h2').text();
      const company = $(element).find('h3 a.company-name span').text();
      const url = $(element).find('.position-title-link').attr('href');
      
      if (title || company || url) {  
        list.push({title, company, url, location});
      }
    });

    sleep(1000)
  }

  return list;
}

const scrapeJobDescriptionHandler = async (jobHeaders) => {
  return await Promise.all(
    jobHeaders.map ( async job => {
      const loadedPage = await request.get(job.url);
      const $ = cheerio.load(loadedPage);
    
      job.post_date = $('#posting_date span').text();
      job.close_date = $('#closing_date').text().trim().split(' ')[2];
      job.industry = $('#company_industry').text();
      // job.location = $(
      job.description = $('#job_description').text();

      sleep(1000);
    })
  )
}

const createCsvFile = async (data) => {
  // convert to csv
  let csv = new ObjectToCsv(data);
  
  // save to file
  await csv.toDisk('./jobslisting.csv');
};

async function sleep(miliseconds) {
  return new Promise(resolve => setTimeout(resolve, miliseconds));
}

async function main() {

  // get initial HTML using request
  const initialHtml = await getHTML(URL);
  
  // get pagination details - number of jobs available, number of jobs per page and number of paginations
  const pageDetails = paginationHandler(initialHtml);
  
  // scrape the HTML and get job listings
  const jobListing = await scrapeJobListingHandler(pageDetails);

  // scrape jobDescription >>> need to fix this function
  // const fullJobListings = await scrapeJobDescriptionHandler(jobListing);

  // save to CSV
  await createCsvFile(jobListing);
}

main();

module.exports = {
  paginationHandler,
  scrapeJobListingHandler,
  scrapeJobDescriptionHandler
}

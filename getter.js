const request = require('request-promise');
const fs = require('fs');

const URL = 'https://www.jobstreet.co.id/id/job/frontend-web-developer-3278988?fr=J&src=12&searchRequestToken=9a6324e4-05e7-48ab-c090-bf15bd331f7a&sectionRank=1';

const getHTML = async (url) => {
  const html = request.get(url);
  return html;
}

const saveHtmlToFile = (html) => {
  fs.writeFileSync('./test2.html', html);
}

async function main() {
  const html = await getHTML(URL);
  saveHtmlToFile(html);
}

main();

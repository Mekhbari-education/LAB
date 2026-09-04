const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('dist/index.html', 'utf-8');
const dom = new JSDOM(html);
const el = dom.window.document.querySelector("div#root:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > button:nth-of-type(2)");
console.log(el ? el.outerHTML : "Not found");

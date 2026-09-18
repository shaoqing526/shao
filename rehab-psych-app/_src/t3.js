const { PDF } = require('./pdftext.js');
const pdf = new PDF(process.argv[2]);
console.log('objects:', pdf.objs.size);
const pages = pdf.pages();
console.log('pages:', pages.length);
if (pages.length) {
  const p = pages[0];
  console.log('page0 keys:', Object.keys(p).join(','));
  console.log('page0:', JSON.stringify(p).slice(0, 600));
  const p100 = pages[100];
  console.log('page100:', JSON.stringify(p100).slice(0, 400));
}

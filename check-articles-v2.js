console.log('Starting...');

const {createClient} = require('@sanity/client');

console.log('Creating client...');

const client = createClient({
  projectId: '4b3ap7pf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false
});

console.log('Fetching articles...');

// Timeout after 10 seconds
const timeout = setTimeout(() => {
  console.log('❌ Timeout! Check your internet connection.');
  process.exit(1);
}, 10000);

client.fetch(`*[_type == "article"]`)
  .then(articles => {
    clearTimeout(timeout);
    console.log('\n✅ Found ' + articles.length + ' articles:\n');
    console.log(JSON.stringify(articles, null, 2));
    process.exit(0);
  })
  .catch(err => {
    clearTimeout(timeout);
    console.log('❌ Error:', err.message);
    process.exit(1);
  });

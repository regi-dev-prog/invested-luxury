const TOKEN = 'pina_AEAVJDAXADRZMBIAGDAA6D7RNERGRHIBACGSP7VJ6FNCDOUFKUY73Z6VWOAFSKY5NSUCWC254SDBVMAWLH7YX2CTPOOP55IA';
const SITE = 'https://www.investedluxury.com';

const BOARD_MAP = {
  'Bags': '1085297278892981622',
  'Watches': '1085297278892981632',
  'Shoes': '1085297278892981626',
  'Jewelry': '1085297278892981628',
  'Sneakers': '1085297278892981623',
  'Travel': '1085297278892981630',
  'Hotels': '1085297278892981630',
  'Art & Photography': '1085297278892983433',
  'Biohacking': '1085297278892981617',
  'Longevity': '1085297278892981617',
  'Retreats': '1085297278892981617',
  'Shopping': '1085297278892981626',
  'Retailers': '1085297278892981626',
  'Investment Guides': '1085297278892986966',
  'Beginner Guides': '1085297278892986966',
  'Seasonal Guides': '1085297278892986966',
  'Gift Guides': '1085297278892986966',
};

const query = encodeURIComponent(`*[_type=="article" && !(_id in path("drafts.**"))]{"slug":slug.current,"title":title,"excerpt":excerpt,"categories":categories[]->name,"mainImage":mainImage.asset->url,"categorySlug":categories[0]->slug.current,"parentCategory":categories[0]->parentCategory}`);

const res = await fetch(`https://4b3ap7pf.api.sanity.io/v2021-06-07/data/query/production?query=${query}`);
const {result} = await res.json();

console.log(`Found ${result.length} articles`);

for (const article of result) {
  const category = article.categories?.[0] || '';
  const boardId = BOARD_MAP[category] || '1085297278892986966';
  
  const articleUrl = article.parentCategory && article.categorySlug
    ? `${SITE}/${article.parentCategory}/${article.categorySlug}/${article.slug}`
    : `${SITE}/${article.slug}`;

  const imageUrl = article.mainImage
    ? `${article.mainImage}?w=1000&h=1500&fit=crop&crop=center`
    : `${SITE}/og-image.jpg`;

  const pin = await fetch('https://api.pinterest.com/v5/pins', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      board_id: boardId,
      title: article.title,
      description: article.excerpt || article.title,
      link: articleUrl,
      media_source: { source_type: 'image_url', url: imageUrl },
    }),
  });

  const data = await pin.json();
  console.log(`${data.id ? '✅' : '❌'} ${article.title}`);
  
  await new Promise(r => setTimeout(r, 1500));
}

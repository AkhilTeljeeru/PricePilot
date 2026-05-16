export const PLATFORMS = [
  { id: 'amazon', name: 'Amazon India', color: '#FF9900', domain: 'amazon.in', logo: 'https://www.google.com/s2/favicons?sz=64&domain=amazon.in', categories: ['all'] },
  { id: 'flipkart', name: 'Flipkart', color: '#2874F0', domain: 'flipkart.com', logo: 'https://www.google.com/s2/favicons?sz=64&domain=flipkart.com', categories: ['all'] },
  { id: 'myntra', name: 'Myntra', color: '#FF3F6C', domain: 'myntra.com', logo: 'https://www.google.com/s2/favicons?sz=64&domain=myntra.com', categories: ['fashion', 'clothing', 'apparel', 'shoes', 'accessories'] },
  { id: 'meesho', name: 'Meesho', color: '#8A2BE2', domain: 'meesho.com', logo: 'https://www.google.com/s2/favicons?sz=64&domain=meesho.com', categories: ['fashion', 'home', 'beauty', 'clothing'] },
  { id: 'ajio', name: 'Ajio', color: '#3D3D3D', domain: 'ajio.com', logo: 'https://www.google.com/s2/favicons?sz=64&domain=ajio.com', categories: ['fashion', 'clothing', 'apparel', 'shoes'] },
  { id: 'snapdeal', name: 'Snapdeal', color: '#E40046', domain: 'snapdeal.com', logo: 'https://www.google.com/s2/favicons?sz=64&domain=snapdeal.com', categories: ['all'] },
  { id: 'nykaa', name: 'Nykaa', color: '#FC2779', domain: 'nykaa.com', logo: 'https://www.google.com/s2/favicons?sz=64&domain=nykaa.com', categories: ['beauty', 'makeup', 'cosmetics', 'personal care', 'skincare'] },
  { id: 'croma', name: 'Croma', color: '#00843D', domain: 'croma.com', logo: 'https://www.google.com/s2/favicons?sz=64&domain=croma.com', categories: ['electronics', 'appliances', 'mobiles', 'laptops', 'gadgets'] },
  { id: 'reliance_digital', name: 'Reliance Digital', color: '#0065A3', domain: 'reliancedigital.in', logo: 'https://www.google.com/s2/favicons?sz=64&domain=reliancedigital.in', categories: ['electronics', 'appliances', 'mobiles', 'laptops', 'gadgets'] },
  { id: 'jiomart', name: 'JioMart', color: '#0078AD', domain: 'jiomart.com', logo: 'https://www.google.com/s2/favicons?sz=64&domain=jiomart.com', categories: ['groceries', 'electronics', 'fashion', 'all'] },
];

export function getPlatform(id) {
  return PLATFORMS.find(p => p.id === id) || { id, name: id, color: '#6B7280', domain: '' };
}
import { apiRequest, handleApiResponse } from './apiClient.js';

/**
 * Product service communicating with /api/v1/products routes
 */
export const productService = {
  /**
   * Track a product via e-commerce URL (Amazon, Flipkart) with optional target price
   * @param {Object} params
   * @param {string} params.url Product URL
   * @param {number|null} [params.target_price] Optional target drop price
   */
  async trackProduct({ url, target_price = null }) {
    const payload = { url };
    if (target_price !== null && target_price !== undefined && target_price !== '') {
      payload.target_price = Number(target_price);
    }
    const response = await apiRequest('/products/track', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return handleApiResponse(response);
  },

  /**
   * List tracked products with optional platform, category, pagination
   * @param {Object} [params]
   * @param {string} [params.platform] 'amazon' | 'flipkart' | null
   * @param {string} [params.category] category name | null
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   */
  async getProducts({ platform = null, category = null, page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (platform && platform !== 'all') params.append('platform', platform);
    if (category && category !== 'all') params.append('category', category);
    if (page) params.append('page', String(page));
    if (limit) params.append('limit', String(limit));

    const qs = params.toString();
    const endpoint = `/products${qs ? `?${qs}` : ''}`;
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });
    return handleApiResponse(response);
  },

  /**
   * Get full details of a single tracked product by ID
   * @param {string} id
   */
  async getProductById(id) {
    const response = await apiRequest(`/products/${id}`, {
      method: 'GET',
    });
    return handleApiResponse(response);
  },

  /**
   * Get price statistical baselines, current price, extrema, and rolling averages
   * @param {string} id
   */
  async getProductStats(id) {
    const response = await apiRequest(`/products/${id}/stats`, {
      method: 'GET',
    });
    return handleApiResponse(response);
  },

  /**
   * Evaluate and retrieve latest BUY / WAIT recommendation and confidence score
   * @param {string} id
   */
  async getProductRecommendation(id) {
    const response = await apiRequest(`/products/${id}/recommendation`, {
      method: 'GET',
    });
    return handleApiResponse(response);
  },

  /**
   * Retrieve historical price observations for charts
   * @param {string} id
   * @param {Object} [options]
   * @param {'7d'|'30d'|'90d'|'1y'|'all'} [options.range='30d']
   * @param {'raw'|'hourly'|'daily'} [options.granularity='raw']
   */
  async getProductPrices(id, { range = '30d', granularity = 'raw' } = {}) {
    const params = new URLSearchParams();
    if (range) params.append('range', range);
    if (granularity) params.append('granularity', granularity);

    const qs = params.toString();
    const endpoint = `/products/${id}/prices${qs ? `?${qs}` : ''}`;
    const response = await apiRequest(endpoint, {
      method: 'GET',
    });
    return handleApiResponse(response);
  },
};

/**
 * Normalizes backend ProductResponse to consistent UI schema
 */
export function normalizeApiProduct(p) {
  if (!p) return null;
  const isUSD = p.currency === 'USD';
  const price = p.last_price || 0;
  const low = p.all_time_low || price;
  const high = p.all_time_high || (price > 0 ? price : 1000);
  const isAmazon = p.platform === 'amazon';
  const isFlipkart = p.platform === 'flipkart';

  const priceINR = isUSD ? Math.round(price * 84) : price;
  const priceUSD = isUSD ? Math.round(price) : Math.round(price / 85);
  const lowINR = isUSD ? Math.round(low * 84) : low;
  const lowUSD = isUSD ? Math.round(low) : Math.round(low / 85);
  const highINR = isUSD ? Math.round(high * 84) : high;
  const highUSD = isUSD ? Math.round(high) : Math.round(high / 85);
  const origINR = highINR > priceINR ? highINR : Math.round(priceINR * 1.15);
  const origUSD = highUSD > priceUSD ? highUSD : Math.round(priceUSD * 1.15);

  return {
    id: p.id,
    canonicalKey: p.canonical_key,
    name: p.title || 'Tracked Product',
    slug: p.id,
    currency: p.currency || (isUSD ? 'USD' : 'INR'),
    image: p.image_url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    category: p.category ? p.category.toLowerCase() : 'tech',
    categoryName: p.category ? p.category.toUpperCase() : (p.platform ? p.platform.toUpperCase() : 'ELECTRONICS'),
    platform: p.platform,
    url: p.url,
    rating: 4.6,
    reviewCount: 840,
    currentPriceINR: priceINR,
    currentPriceUSD: priceUSD,
    originalPriceINR: origINR,
    originalPriceUSD: origUSD,
    lowestHistoricalPriceINR: lowINR,
    lowestHistoricalPriceUSD: lowUSD,
    averageHistoricalPriceINR: Math.round((lowINR + highINR) / 2),
    averageHistoricalPriceUSD: Math.round((lowUSD + highUSD) / 2),
    highestHistoricalPriceINR: highINR,
    highestHistoricalPriceUSD: highUSD,
    discountPercent: origINR > priceINR ? Math.round(((origINR - priceINR) / origINR) * 100) : 5,
    savingsAmountINR: origINR > priceINR ? origINR - priceINR : Math.round(priceINR * 0.05),
    savingsAmountUSD: origUSD > priceUSD ? origUSD - priceUSD : Math.round(priceUSD * 0.05),
    recommendation: price <= low ? 'BUY NOW' : 'WAIT',
    aiScore: price <= low ? 94 : 65,
    aiReasoning: `Historical Floor: ${isUSD ? '$' : '₹'}${low.toLocaleString()}. Vendor: ${p.platform || 'Store'}. Last checked: ${p.last_observed_at ? new Date(p.last_observed_at).toLocaleTimeString() : 'recently'}.`,
    specs: `${p.platform ? p.platform.toUpperCase() : 'Store'} • Key: ${p.canonical_key}`,
    isLiveApi: true,
    retailers: [
      {
        name: isAmazon ? 'Amazon' : (isFlipkart ? 'Flipkart' : 'Amazon'),
        logo: isAmazon ? 'amazon' : 'flipkart',
        priceINR: priceINR,
        priceUSD: priceUSD,
        inStock: true,
        delivery: 'Free Fast Delivery',
        url: p.url,
      },
      {
        name: isAmazon ? 'Flipkart' : 'Amazon',
        logo: isAmazon ? 'flipkart' : 'amazon',
        priceINR: Math.round(priceINR * 1.02),
        priceUSD: Math.round(priceUSD * 1.02),
        inStock: true,
        delivery: 'Standard Shipping',
        url: p.url,
      }
    ],
  };
}

export default productService;

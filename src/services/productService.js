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
  const price = p.last_price || 0;
  const low = p.all_time_low || price;
  const high = p.all_time_high || (price > 0 ? price : 1000);
  const isAmazon = p.platform === 'amazon';
  const isFlipkart = p.platform === 'flipkart';

  return {
    id: p.id,
    canonicalKey: p.canonical_key,
    name: p.title || 'Tracked Product',
    slug: p.id,
    image: p.image_url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
    category: p.category ? p.category.toLowerCase() : 'tech',
    categoryName: p.category ? p.category.toUpperCase() : (p.platform ? p.platform.toUpperCase() : 'ELECTRONICS'),
    platform: p.platform,
    url: p.url,
    rating: 4.6,
    reviewCount: 840,
    currentPriceINR: price,
    currentPriceUSD: Math.round(price / 85),
    originalPriceINR: high > price ? high : Math.round(price * 1.15),
    originalPriceUSD: Math.round((high > price ? high : price * 1.15) / 85),
    lowestHistoricalPriceINR: low,
    lowestHistoricalPriceUSD: Math.round(low / 85),
    averageHistoricalPriceINR: Math.round((low + high) / 2),
    averageHistoricalPriceUSD: Math.round((low + high) / 170),
    highestHistoricalPriceINR: high,
    highestHistoricalPriceUSD: Math.round(high / 85),
    discountPercent: high > price ? Math.round(((high - price) / high) * 100) : 5,
    savingsAmountINR: high > price ? high - price : Math.round(price * 0.05),
    savingsAmountUSD: Math.round((high > price ? high - price : price * 0.05) / 85),
    recommendation: price <= low ? 'BUY NOW' : 'WAIT',
    aiScore: price <= low ? 94 : 65,
    aiReasoning: `Historical Floor: ₹${low.toLocaleString()}. Vendor: ${p.platform || 'Store'}. Last checked: ${p.last_observed_at ? new Date(p.last_observed_at).toLocaleTimeString() : 'recently'}.`,
    specs: `${p.platform ? p.platform.toUpperCase() : 'Store'} • Key: ${p.canonical_key}`,
    isLiveApi: true,
    retailers: [
      {
        name: isAmazon ? 'Amazon' : (isFlipkart ? 'Flipkart' : 'Amazon'),
        logo: isAmazon ? 'amazon' : 'flipkart',
        priceINR: price,
        priceUSD: Math.round(price / 85),
        inStock: true,
        delivery: 'Free Fast Delivery',
        url: p.url,
      },
      {
        name: isAmazon ? 'Flipkart' : 'Amazon',
        logo: isAmazon ? 'flipkart' : 'amazon',
        priceINR: Math.round(price * 1.02),
        priceUSD: Math.round((price * 1.02) / 85),
        inStock: true,
        delivery: 'Standard Shipping',
        url: p.url,
      }
    ],
  };
}

export default productService;

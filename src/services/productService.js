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

  /**
   * Permanently delete/destroy a tracked product
   * @param {string} id
   */
  async deleteProduct(id) {
    const response = await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
    return handleApiResponse(response);
  },

  /**
   * Trigger immediate live re-scrape to fetch latest price
   * @param {string} id
   */
  async refreshProductPrice(id) {
    const response = await apiRequest(`/products/${id}/refresh`, {
      method: 'POST',
    });
    return handleApiResponse(response);
  },

  /**
   * Update and re-verify a product's URL
   * @param {string} id
   * @param {string} url
   */
  async updateProductUrl(id, url) {
    const response = await apiRequest(`/products/${id}/url`, {
      method: 'PUT',
      body: JSON.stringify({ url }),
    });
    return handleApiResponse(response);
  },
};

function extractProductTokens(titleStr) {
  if (!titleStr) return [];
  const normalized = titleStr
    .toLowerCase()
    .replace(/(\d+)\s*(gb|tb|mb)\b/gi, '$1$2')
    .replace(/[^a-z0-9\s-]/g, ' ');

  const stopWords = new Set([
    'with', 'wireless', 'noise', 'cancelling', 'cancellation', 
    'bluetooth', 'edition', 'black', 'silver', 'white', 'gray', 'grey',
    'the', 'and', 'for', 'from', 'brand', 'original', 'official'
  ]);

  return normalized
    .split(/\s+/)
    .filter(t => t.length >= 2 && !stopWords.has(t));
}

/**
 * Normalizes backend ProductResponse to consistent UI schema
 * with automatic cross-store counterpart price resolution (Amazon <-> Flipkart)
 */
export function normalizeApiProduct(p, allProducts = []) {
  if (!p) return null;
  const isUSD = p.currency === 'USD';
  const price = p.last_price || 0;
  const low = p.all_time_low || price;
  const high = p.all_time_high || (price > 0 ? price : 1000);
  const isAmazon = (p.platform || '').toLowerCase() === 'amazon';
  const isFlipkart = (p.platform || '').toLowerCase() === 'flipkart';

  const priceINR = isUSD ? Math.round(price * 84) : Math.round(price);
  const priceUSD = isUSD ? Math.round(price) : Math.round(price / 85);
  const lowINR = isUSD ? Math.round(low * 84) : Math.round(low);
  const lowUSD = isUSD ? Math.round(low) : Math.round(low / 85);
  const highINR = isUSD ? Math.round(high * 84) : Math.round(high);
  const highUSD = isUSD ? Math.round(high) : Math.round(high / 85);
  const origINR = highINR > priceINR ? highINR : Math.round(priceINR * 1.15);
  const origUSD = highUSD > priceUSD ? highUSD : Math.round(priceUSD * 1.15);

  // Look up real counterpart product from the other store across all tracked items
  let counterpartPriceINR = priceINR;
  let counterpartPriceUSD = priceUSD;
  let counterpartUrl = p.url;
  let hasRealCounterpart = false;

  let candidates = allProducts && allProducts.length > 0 ? allProducts : [];
  if (candidates.length === 0 && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('pricepulse_api_products');
      if (cached) {
        candidates = JSON.parse(cached) || [];
      }
    } catch {
      // ignore
    }
  }

  let bestCand = null;
  if (candidates.length > 0) {
    const targetPlat = isAmazon ? 'flipkart' : (isFlipkart ? 'amazon' : null);
    if (targetPlat) {
      const myTokens = extractProductTokens(p.title || p.name || '');
      let bestScore = 0;

      for (const cand of candidates) {
        if (cand.id === p.id) continue;
        if ((cand.platform || '').toLowerCase() !== targetPlat) continue;
        const candTokens = extractProductTokens(cand.title || cand.name || '');
        const matches = myTokens.filter(t => candTokens.includes(t));
        const score = matches.length;
        if (score >= 2 && score > bestScore) {
          bestScore = score;
          bestCand = cand;
        }
      }

      if (bestCand) {
        const candIsUSD = bestCand.currency === 'USD';
        const candPrice = bestCand.last_price || bestCand.currentPriceINR || 0;
        if (candPrice > 0) {
          counterpartPriceINR = candIsUSD ? Math.round(candPrice * 84) : Math.round(candPrice);
          counterpartPriceUSD = candIsUSD ? Math.round(candPrice) : Math.round(candPrice / 85);
          counterpartUrl = bestCand.url || counterpartUrl;
          hasRealCounterpart = true;
        }
      }
    }
  }

  // If no verified counterpart exists, keep equal to live market price (no artificial markup)
  if (!hasRealCounterpart) {
    counterpartPriceINR = priceINR;
    counterpartPriceUSD = priceUSD;
  }

  const amazonPriceINR = isAmazon ? priceINR : counterpartPriceINR;
  const amazonPriceUSD = isAmazon ? priceUSD : counterpartPriceUSD;
  const flipkartPriceINR = isFlipkart ? priceINR : counterpartPriceINR;
  const flipkartPriceUSD = isFlipkart ? priceUSD : counterpartPriceUSD;

  const titleClean = (p.title || 'Tracked Product').split(' | ')[0].trim();
  const amazonSearchFallback = `https://www.amazon.in/s?k=${encodeURIComponent(titleClean)}`;
  const flipkartSearchFallback = `https://www.flipkart.com/search?q=${encodeURIComponent(titleClean)}`;

  const azInStock = isAmazon ? (p.is_available ?? true) : (hasRealCounterpart ? (bestCand?.is_available ?? true) : false);
  const fkInStock = isFlipkart ? (p.is_available ?? true) : (hasRealCounterpart ? (bestCand?.is_available ?? true) : false);

  const azStatus = isAmazon 
    ? (p.listing_status || (p.is_available === false ? 'out_of_stock' : 'active')) 
    : (hasRealCounterpart ? (bestCand?.listing_status || (bestCand?.is_available === false ? 'out_of_stock' : 'active')) : 'not_linked');

  const fkStatus = isFlipkart 
    ? (p.listing_status || (p.is_available === false ? 'out_of_stock' : 'active')) 
    : (hasRealCounterpart ? (bestCand?.listing_status || (bestCand?.is_available === false ? 'out_of_stock' : 'active')) : 'not_linked');

  return {
    id: p.id,
    counterpartId: bestCand ? bestCand.id : null,
    hasRealCounterpart: hasRealCounterpart,
    canonicalKey: p.canonical_key,
    name: p.title || 'Tracked Product',
    slug: p.id,
    currency: p.currency || (isUSD ? 'USD' : 'INR'),
    image: p.image_url || (bestCand?.image_url) || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
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
    specs: `${hasRealCounterpart ? 'Amazon & Flipkart Synchronized' : (p.platform ? p.platform.toUpperCase() : 'Store')} • Key: ${p.canonical_key}`,
    isLiveApi: true,
    isAvailable: hasRealCounterpart ? (azInStock || fkInStock) : (p.is_available ?? true),
    listingStatus: p.listing_status || (p.is_available === false ? 'out_of_stock' : 'active'),
    amazon: {
      name: 'Amazon',
      logo: 'amazon',
      priceINR: amazonPriceINR,
      priceUSD: amazonPriceUSD,
      inStock: azInStock,
      status: azStatus,
      delivery: 'Prime Fast Free Delivery',
      url: isAmazon ? p.url : (hasRealCounterpart ? counterpartUrl : null),
      fallbackUrl: amazonSearchFallback,
      isLinked: isAmazon ? true : hasRealCounterpart,
      id: isAmazon ? p.id : (bestCand ? bestCand.id : null),
    },
    flipkart: {
      name: 'Flipkart',
      logo: 'flipkart',
      priceINR: flipkartPriceINR,
      priceUSD: flipkartPriceUSD,
      inStock: fkInStock,
      status: fkStatus,
      delivery: 'Next-Day Delivery Available',
      url: isFlipkart ? p.url : (hasRealCounterpart ? counterpartUrl : null),
      fallbackUrl: flipkartSearchFallback,
      isLinked: isFlipkart ? true : hasRealCounterpart,
      id: isFlipkart ? p.id : (bestCand ? bestCand.id : null),
    },
    retailers: [
      {
        name: 'Amazon',
        logo: 'amazon',
        priceINR: amazonPriceINR,
        priceUSD: amazonPriceUSD,
        inStock: azInStock,
        status: azStatus,
        delivery: 'Prime Fast Free Delivery',
        url: isAmazon ? p.url : (hasRealCounterpart ? counterpartUrl : null),
        fallbackUrl: amazonSearchFallback,
        isLinked: isAmazon ? true : hasRealCounterpart,
        id: isAmazon ? p.id : (bestCand ? bestCand.id : null),
      },
      {
        name: 'Flipkart',
        logo: 'flipkart',
        priceINR: flipkartPriceINR,
        priceUSD: flipkartPriceUSD,
        inStock: fkInStock,
        status: fkStatus,
        delivery: 'Next-Day Delivery Available',
        url: isFlipkart ? p.url : (hasRealCounterpart ? counterpartUrl : null),
        fallbackUrl: flipkartSearchFallback,
        isLinked: isFlipkart ? true : hasRealCounterpart,
        id: isFlipkart ? p.id : (bestCand ? bestCand.id : null),
      }
    ],
  };
}

/**
 * Deduplicates and merges dual-platform counterparts into single unified product cards
 * so that tracking both Amazon and Flipkart links does not display duplicate product cards.
 */
export function dedupeAndMergeProducts(apiProducts = [], deletedProductIds = []) {
  if (!apiProducts || apiProducts.length === 0) return [];
  const deletedSet = new Set(deletedProductIds || []);

  const claimedIds = new Set();
  const mergedList = [];

  for (const p of apiProducts) {
    if (!p || claimedIds.has(p.id)) continue;
    if (deletedSet.has(p.id) || deletedSet.has(p.canonical_key) || deletedSet.has(p.slug)) continue;

    const norm = normalizeApiProduct(p, apiProducts);
    if (!norm) continue;

    claimedIds.add(p.id);
    if (norm.hasRealCounterpart && norm.counterpartId) {
      claimedIds.add(norm.counterpartId);
    }

    mergedList.push(norm);
  }

  return mergedList;
}

export default productService;

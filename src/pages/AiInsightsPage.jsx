import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BrainCircuit, 
  ArrowRight,
  Send,
  Bot,
  User as UserIcon,
  RotateCcw,
  ExternalLink,
  Zap,
  BarChart2,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { TRENDING_PRODUCTS } from '../data/electronicsData';
import { useApp } from '../context/AppContext';

export default function AiInsightsPage() {
  const { 
    user,
    formatPrice, 
    currency, 
    chatMessages, 
    currentConversationId, 
    isChatSending, 
    sendChatMessage, 
    clearChat,
    getProductRecommendation,
    apiProducts,
    showToast
  } = useApp();

  const [activeMainTab, setActiveMainTab] = useState('chat'); // 'chat' | 'inspector' | 'signals'
  const [filterType, setFilterType] = useState('all'); // 'all', 'buy', 'wait', 'deal'
  
  // Chat input state
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef(null);

  // Recommendation Inspector State
  const [selectedProductId, setSelectedProductId] = useState(() => {
    return apiProducts?.[0]?.id || TRENDING_PRODUCTS?.[0]?.id || '';
  });
  const [inspectorResult, setInspectorResult] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectorError, setInspectorError] = useState(null);

  // Keep selectedProductId in sync with real API products
  useEffect(() => {
    if (apiProducts.length > 0 && (!selectedProductId || selectedProductId.startsWith('prod-'))) {
      setSelectedProductId(apiProducts[0].id);
    }
  }, [apiProducts, selectedProductId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeMainTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatSending, activeMainTab]);

  const handleSendChat = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isChatSending) return;

    if (!user?.isLoggedIn) {
      showToast('Please sign in to chat with the AI Price Intelligence engine', 'warning');
      return;
    }

    const text = inputMessage.trim();
    setInputMessage('');
    try {
      await sendChatMessage(text);
    } catch (err) {
      showToast(err.message || 'Failed to send message', 'error');
    }
  };

  const handlePromptChipClick = (promptText) => {
    setInputMessage(promptText);
  };

  const handleRunInspector = async (productId) => {
    const targetId = productId || selectedProductId || (apiProducts?.[0]?.id);
    if (!targetId) return;

    setIsInspecting(true);
    setInspectorError(null);
    try {
      // If it is a real backend UUID, call /api/v1/recommendations/{id}
      if (targetId.length > 20 && targetId.includes('-')) {
        const res = await getProductRecommendation(targetId);
        setInspectorResult(res);
      } else {
        // Fallback for catalog mock items: calculate instant deterministic heuristic
        const catalogProd = TRENDING_PRODUCTS.find(p => p.id === targetId) || TRENDING_PRODUCTS[0];
        const isBuy = catalogProd.recommendation === 'BUY NOW';
        setInspectorResult({
          product_id: catalogProd.id,
          signal: isBuy ? 'BUY' : 'WAIT',
          confidence: (catalogProd.aiScore || 85) / 100,
          phase: 'heuristic',
          reasoning: catalogProd.aiVerdictReason || `Calculated based on proximity to 90-day floor and festive markdown rules.`,
          features_summary: {
            current_price: catalogProd.currentPriceINR,
            all_time_low: catalogProd.lowestHistoricalPriceINR,
            mean_price: catalogProd.averageHistoricalPriceINR,
            deal_score: catalogProd.aiScore || 85,
          },
          evaluated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      setInspectorError(err.message || 'Failed to evaluate product recommendation');
      setInspectorResult(null);
    } finally {
      setIsInspecting(false);
    }
  };

  // Partition products for signals
  const buyNowList = TRENDING_PRODUCTS.filter(p => p.recommendation === 'BUY NOW');
  const waitList = TRENDING_PRODUCTS.filter(p => p.recommendation === 'WAIT');
  const goodDealList = TRENDING_PRODUCTS.filter(p => p.recommendation === 'GOOD DEAL');

  const displayedList = filterType === 'buy' 
    ? buyNowList 
    : filterType === 'wait' 
    ? waitList 
    : filterType === 'deal' 
    ? goodDealList 
    : TRENDING_PRODUCTS;

  const quickPrompts = [
    'Is iPhone 15 at ₹64,999 a good deal or should I wait for festive sales?',
    'What are the current historical lows for electronics in my portfolio?',
    'Explain how the PricePulse ML recommendation model determines Buy vs Wait signals.',
    'Should I buy Sony WH-1000XM5 headphones today or wait for next month?',
  ];

  return (
    <div className="py-8 bg-slate-50 dark:bg-[#0b0f19] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Grounded RAG Chatbot & Real-Time Recommendation Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              AI Price <span className="text-blue-600">Intelligence</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              "Don't just find the price. Find the right time to buy." Powered by historical telemetry, dual-platform scrapers, and grounded LLM reasoning.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              FastAPI: <strong className="text-emerald-700">/api/v1/chat</strong> & <strong className="text-blue-700">/recommendations</strong>
            </span>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-200 dark:border-slate-700/60 overflow-x-auto">
          <button
            onClick={() => setActiveMainTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeMainTab === 'chat'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Shopping Advisor (RAG Chat)</span>
            {chatMessages.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </button>

          <button
            onClick={() => {
              setActiveMainTab('inspector');
              const targetId = selectedProductId || (apiProducts?.[0]?.id);
              if (targetId) {
                handleRunInspector(targetId);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeMainTab === 'inspector'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>AI Recommendation Inspector (/recommendations/{'{id}'})</span>
          </button>

          <button
            onClick={() => setActiveMainTab('signals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeMainTab === 'signals'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Algorithmic Signals Matrix</span>
          </button>
        </div>

        {/* TAB 1: Grounded RAG Chat Interface (/api/v1/chat, /api/v1/chat/history) */}
        {activeMainTab === 'chat' && (
          <div className="bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-700/60 rounded-2xl shadow-2xs overflow-hidden flex flex-col h-[650px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-[#0e1525] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>PricePulse AI Recommender Bot</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 uppercase">
                      Live RAG
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {currentConversationId ? `Convo: ${currentConversationId.slice(0, 16)}...` : 'Fresh Session'}
                  </p>
                </div>
              </div>

              {chatMessages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Chat</span>
                </button>
              )}
            </div>

            {/* Chat Transcript Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60 dark:bg-[#0b0f19]">
              {chatMessages.length === 0 ? (
                <div className="max-w-lg mx-auto py-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mb-1">
                    Ask Anything About Live Electronics Prices
                  </h4>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                    Our AI is grounded in PricePulse's real-time scraping database, historical lows, and ML buy/wait models.
                  </p>

                  <div className="space-y-2 text-left">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Suggested Inquiries:
                    </p>
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePromptChipClick(prompt)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50/70 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-slate-700 hover:border-blue-300 text-slate-700 dark:text-slate-300 text-xs font-medium transition-all text-left flex items-center justify-between group cursor-pointer shadow-2xs"
                      >
                        <span className="line-clamp-1">{prompt}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isUser 
                          ? 'bg-blue-600 text-white shadow-2xs' 
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-600" />}
                      </div>

                      <div className={`rounded-2xl p-4 text-xs leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 shadow-2xs'
                      }`}>
                        <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                        {/* Grounded Sources / Citations */}
                        {!isUser && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                              Grounded Telemetry Sources:
                            </span>
                            <div className="grid grid-cols-1 gap-1.5">
                              {msg.sources.map((src, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]"
                                >
                                  <div>
                                    <strong className="text-slate-900 block font-semibold">{src.product_title}</strong>
                                    <span className="text-slate-500 font-mono text-[10px]">{src.data_type}: {src.detail || 'Verified DB Telemetry'}</span>
                                  </div>
                                  <Link
                                    to={`/products/${src.product_id}`}
                                    className="p-1 text-blue-600 hover:text-blue-800 font-bold"
                                    title="View Product"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <span className={`text-[10px] block mt-1.5 ${isUser ? 'text-blue-100 text-right' : 'text-slate-400'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              {isChatSending && (
                <div className="flex gap-3 max-w-md mr-auto">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="rounded-2xl p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 shadow-2xs">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                    </div>
                    <span>Querying vector store & ML model...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-[#0e1525]">
              <form onSubmit={handleSendChat} className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about price timing, festive discounts, or historical lows..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium"
                  disabled={isChatSending}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isChatSending}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: AI Recommendation Inspector (/api/v1/recommendations/{product_id}) */}
        {activeMainTab === 'inspector' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Selector */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-blue-600" />
                <span>Evaluate Product Recommendation</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Execute live deterministic heuristic / learned ML inference for any tracked device ID.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Select Tracked Product:
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => {
                      setSelectedProductId(e.target.value);
                      handleRunInspector(e.target.value);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {apiProducts.length > 0 ? (
                      apiProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title || p.name || p.id} ({p.id.slice(0, 8)}...)
                        </option>
                      ))
                    ) : (
                      TRENDING_PRODUCTS.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Endpoint:</span>
                    <span className="font-mono font-bold text-blue-600">GET /api/v1/recommendations/{'{id}'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Evaluation Mode:</span>
                    <span className="font-bold text-slate-800">Heuristic + Learned Phase</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunInspector(selectedProductId)}
                  disabled={isInspecting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isInspecting ? 'Evaluating Recommendation...' : 'Run Real-Time AI Inference'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Inspector Output Display */}
            <div className="lg:col-span-7">
              {inspectorError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{inspectorError}</span>
                </div>
              )}

              {inspectorResult ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
                  {/* Verdict Banner */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Recommendation Signal
                      </span>
                      <h4 className="text-2xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
                        <span className={inspectorResult.signal === 'BUY' ? 'text-emerald-600' : 'text-amber-600'}>
                          {inspectorResult.signal}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 font-mono">
                          (Phase: {inspectorResult.phase})
                        </span>
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Confidence Score
                      </span>
                      <span className="text-2xl font-black text-blue-600 font-mono">
                        {Math.round((inspectorResult.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Reasoning Callout */}
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                    <span className="text-xs font-bold text-blue-900 block mb-1 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-600" />
                      Detailed Telemetry Reasoning:
                    </span>
                    <p className="text-xs text-blue-950 font-medium leading-relaxed">
                      {inspectorResult.reasoning}
                    </p>
                  </div>

                  {/* Features Summary Grid */}
                  {inspectorResult.features_summary && (
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                        Model Features & Telemetry Summary
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(inspectorResult.features_summary).map(([key, val]) => (
                          <div key={key} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                              {key.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs font-extrabold text-slate-900 font-mono mt-0.5 block truncate">
                              {typeof val === 'number' && key.includes('price') 
                                ? formatPrice(val) 
                                : typeof val === 'number' 
                                ? val.toFixed(2) 
                                : String(val)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Product: {inspectorResult.product_id}</span>
                    <span>Evaluated: {new Date(inspectorResult.evaluated_at).toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                  <BrainCircuit className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">No recommendation loaded</h4>
                  <p className="text-xs text-slate-500 mt-1">Select a tracked product to request live ML inference.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Algorithmic Signals Matrix */}
        {activeMainTab === 'signals' && (
          <div>
            {/* 3 Metric Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Strong Buy Signals</span>
                  <span className="badge-buy text-xs font-bold px-2 py-0.5 rounded">
                    BUY NOW
                  </span>
                </div>
                <span className="text-3xl font-black text-slate-900">{buyNowList.length}</span>
                <p className="text-xs text-slate-500 mt-1">
                  Gadgets currently within 2% of all-time historical lows.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Drop Watch Signals</span>
                  <span className="badge-wait text-xs font-bold px-2 py-0.5 rounded">
                    WAIT
                  </span>
                </div>
                <span className="text-3xl font-black text-slate-900">{waitList.length}</span>
                <p className="text-xs text-slate-500 mt-1">
                  Devices expected to drop during upcoming monthly/quarterly sales.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Active Flash Deals</span>
                  <span className="badge-deal text-xs font-bold px-2 py-0.5 rounded">
                    GOOD DEAL
                  </span>
                </div>
                <span className="text-3xl font-black text-slate-900">{goodDealList.length}</span>
                <p className="text-xs text-slate-500 mt-1">
                  Prices currently 10%+ below their 90-day moving average.
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-slate-500">Filter Insights:</span>
              {[
                { id: 'all', label: 'All Recommendations' },
                { id: 'buy', label: 'BUY NOW Only' },
                { id: 'wait', label: 'WAIT Signals Only' },
                { id: 'deal', label: 'GOOD DEAL Only' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    filterType === f.id
                      ? 'bg-blue-600 text-white shadow-2xs font-bold'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Intelligence Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedList.map((product) => {
                const az = product.retailers.find(r => r.name.toLowerCase().includes('amazon')) || product.retailers[0];
                const fk = product.retailers.find(r => r.name.toLowerCase().includes('flipkart')) || product.retailers[1] || product.retailers[0];
                const azPrice = currency === 'USD' ? az.priceUSD : az.priceINR;
                const fkPrice = currency === 'USD' ? fk.priceUSD : fk.priceINR;
                const lowest = Math.min(azPrice, fkPrice);
                const floor = currency === 'USD' ? product.lowestHistoricalPriceUSD : product.lowestHistoricalPriceINR;

                return (
                  <div 
                    key={product.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Name, Category, Signal Badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.2 rounded">
                              {product.categoryName}
                            </span>
                            <Link
                              to={`/products/${product.slug || product.id}`}
                              className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 block mt-0.5"
                            >
                              {product.name}
                            </Link>
                          </div>
                        </div>

                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 ${
                          product.recommendation === 'BUY NOW'
                            ? 'badge-buy'
                            : product.recommendation === 'WAIT'
                            ? 'badge-wait'
                            : 'badge-deal'
                        }`}>
                          {product.recommendation}
                        </span>
                      </div>

                      {/* AI Explanation Callout */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 mb-4">
                        <span className="text-[11px] font-bold text-slate-900 block mb-1">
                          Reasoning & Timing Recommendation:
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {product.aiVerdictReason}
                        </p>
                      </div>

                      {/* Pricing Comparison Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center mb-4">
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Lowest Price</span>
                          <span className="text-xs font-black text-slate-900 font-mono">{formatPrice(lowest)}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Historical Floor</span>
                          <span className="text-xs font-black text-emerald-700 font-mono">{formatPrice(floor)}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-400 block">Buy Score</span>
                          <span className="text-xs font-black text-blue-700 font-mono">{product.aiScore}/100</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Cheapest on <strong className="text-slate-800">{product.bestStore}</strong>
                      </span>

                      <Link
                        to={`/products/${product.slug || product.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs"
                      >
                        <span>View Product Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

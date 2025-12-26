// ============================================
// FILE 6: src/pages/Stylist.jsx
// ============================================
import React, { useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Upload, Search, Loader2, Sparkles, Image as ImageIcon, Zap } from 'lucide-react';

const Stylist = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setRecommendations([]);
      setError(null);
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedImage);

    try {
      const response = await axiosClient.post('/api/recommend/visual-search', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRecommendations(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to backend. Is uvicorn running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-12 text-center animate-fade-in">
        <div className="inline-block mb-4">
          <span className="text-xs font-semibold text-fashion-rose bg-fashion-rose/10 px-3 py-1 rounded-full border border-fashion-rose/30">
            CLIP Neural Embeddings
          </span>
        </div>
        <h1 className="text-6xl font-display font-bold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fashion-rose via-fashion-gold to-fashion-sage">
            Visual Intelligence
          </span>
        </h1>
        <p className="text-fashion-cream/60 text-lg font-light max-w-2xl mx-auto">
          Upload any fashion image to discover visually similar items through contrastive learning
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Upload Section */}
        <div className="lg:col-span-1 animate-slide-up">
          <div className="glass-card p-8 sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-fashion-rose/10 rounded-lg">
                <ImageIcon className="text-fashion-rose" size={24} />
              </div>
              <h2 className="text-xl font-display font-bold text-fashion-cream">
                Query Image
              </h2>
            </div>

            <div className="relative group mb-6">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 overflow-hidden ${previewUrl ? 'border-fashion-rose bg-fashion-charcoal/30' : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-fashion-rose/50'}`}>
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-fashion-obsidian/80 via-transparent to-transparent flex items-end p-4">
                      <span className="text-xs text-fashion-cream/70 font-semibold">Query Loaded</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    {/* Fixed the cut-off part here */}
                    <div className="bg-white/5 p-5 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={36} className="text-fashion-cream/40" />
                    </div>
                    <p className="text-fashion-cream/70 font-medium mb-2">Drop image here</p>
                    <p className="text-fashion-cream/40 text-xs">or click to browse</p>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleSearch} 
              disabled={!selectedImage || loading} 
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all duration-300 ${!selectedImage ? 'bg-white/5 text-fashion-cream/30 cursor-not-allowed border border-white/10' : 'btn-premium'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Zap size={20} />
                  <span>Find Similar</span>
                </>
              )}
            </button>

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Tech Info */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs text-fashion-cream/40 mb-3 uppercase tracking-wider font-semibold">Technology Stack</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-fashion-cream/50">Model</span>
                  <span className="text-fashion-gold font-mono text-xs">CLIP ViT-B/32</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-fashion-cream/50">Embeddings</span>
                  <span className="text-fashion-gold font-mono text-xs">512-D</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-fashion-cream/50">Index</span>
                  <span className="text-fashion-gold font-mono text-xs">FAISS</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Results Section */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold text-fashion-cream flex items-center gap-3">
              <Sparkles className="text-fashion-rose" size={28} />
              Similar Items
            </h2>
            {recommendations.length > 0 && (
              <span className="text-sm text-fashion-cream/50 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                {recommendations.length} matches found
              </span>
            )}
          </div>

          {recommendations.length === 0 && !loading && (
            <div className="glass-card p-16 text-center">
              <div className="bg-white/5 p-6 rounded-full inline-block mb-6">
                <Search size={48} className="text-fashion-cream/20" />
              </div>
              <p className="text-fashion-cream/40 text-lg font-light">
                Upload an image to discover similar fashion items
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {recommendations.map((item) => (
              <div 
                key={item.article_id} 
                className="group glass-card overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-[3/4] bg-fashion-charcoal/30 overflow-hidden">
                  <img 
                    src={item.image_url} 
                    alt={item.article_id} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = `https://placehold.co/400x600/2c2c2c/f5f1e8?text=Item+${item.article_id}&font=playfair-display`;
                    }} 
                  />
                  {/* Match Score Badge */}
                  <div className="absolute top-3 right-3 bg-fashion-obsidian/90 backdrop-blur-sm text-fashion-gold text-xs font-bold px-3 py-1.5 rounded-full border border-fashion-gold/30">
                    {(item.score * 100).toFixed(0)}%
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-fashion-obsidian via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <button className="w-full bg-fashion-gold/90 text-fashion-obsidian font-semibold py-2 rounded-lg text-sm hover:bg-fashion-gold transition-colors">
                      View Details
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-fashion-cream font-semibold mb-1 font-mono text-sm">
                    #{item.article_id}
                  </p>
                  <p className="text-fashion-cream/40 text-xs uppercase tracking-wide">
                    H&M Collection
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stylist;
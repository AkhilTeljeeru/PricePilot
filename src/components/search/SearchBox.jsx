import React, { useState, useRef } from 'react';
import { Search, Upload, Link2, Type, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function SearchBox({ onSearch, isLoading }) {
  const [activeTab, setActiveTab] = useState('text');
  const [textQuery, setTextQuery] = useState('');
  const [urlQuery, setUrlQuery] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedFileUrl(file_url);
    setUploading(false);
  };

  const handleSubmit = () => {
    if (activeTab === 'text' && textQuery.trim()) onSearch(textQuery.trim(), 'text');
    else if (activeTab === 'url' && urlQuery.trim()) onSearch(urlQuery.trim(), 'url');
    else if (activeTab === 'image' && uploadedFileUrl) onSearch('image search', 'image', uploadedFileUrl);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit(); };

  const clearImage = () => {
    setImagePreview(null);
    setUploadedFileUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isDisabled = isLoading || uploading ||
    (activeTab === 'text' && !textQuery.trim()) ||
    (activeTab === 'url' && !urlQuery.trim()) ||
    (activeTab === 'image' && !uploadedFileUrl);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl h-12">
          <TabsTrigger value="text" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Type className="w-4 h-4" /><span className="hidden sm:inline">Product Name</span><span className="sm:hidden">Name</span>
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <Link2 className="w-4 h-4" /><span className="hidden sm:inline">Product URL</span><span className="sm:hidden">URL</span>
          </TabsTrigger>
          <TabsTrigger value="image" className="gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
            <ImageIcon className="w-4 h-4" /><span className="hidden sm:inline">Image Search</span><span className="sm:hidden">Image</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="text" className="mt-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="e.g. Samsung Galaxy S24 Ultra 256GB Titanium Black"
                value={textQuery}
                onChange={e => setTextQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-14 pl-12 pr-4 text-base rounded-xl bg-card border-border/50 shadow-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-0">
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Paste product URL from Amazon, Flipkart, Myntra..."
                value={urlQuery}
                onChange={e => setUrlQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-14 pl-12 pr-4 text-base rounded-xl bg-card border-border/50 shadow-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="image" className="mt-0">
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden bg-card border border-border/50 p-4">
                <button onClick={clearImage} className="absolute top-2 right-2 z-10 bg-foreground/80 text-background rounded-full p-1.5">
                  <X className="w-4 h-4" />
                </button>
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                {uploading && (
                  <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-card/50 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Upload product image</p>
                  <p className="text-xs text-muted-foreground mt-1">AI will identify the product automatically</p>
                </div>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </TabsContent>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isDisabled}
          className="w-full mt-4 h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
        >
          {isLoading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Searching across platforms...</>
          ) : (
            <><Search className="w-5 h-5 mr-2" />Compare Prices Across 10 Platforms</>
          )}
        </Button>
      </Tabs>
    </motion.div>
  );
}
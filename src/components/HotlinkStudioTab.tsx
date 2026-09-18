import React, { useState, useRef } from 'react';
import { 
  Link2, 
  Upload, 
  Copy, 
  Check, 
  ExternalLink, 
  Image as ImageIcon, 
  Code, 
  Sparkles, 
  FileText, 
  Download, 
  Eye, 
  RefreshCw,
  Layers,
  HelpCircle,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { CURATED_HOTLINKS, SAMPLE_HTML_TEMPLATES } from '../data/mockData';
import { ParsedImageHotlink, ImageHotlinkItem } from '../types';

export const HotlinkStudioTab: React.FC = () => {
  const [subTab, setSubTab] = useState<'extract' | 'build' | 'sandbox'>('extract');
  
  // Extract state
  const [htmlInput, setHtmlInput] = useState<string>(SAMPLE_HTML_TEMPLATES[0].html);
  const [parsedImages, setParsedImages] = useState<ParsedImageHotlink[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Builder state
  const [selectedAsset, setSelectedAsset] = useState<ImageHotlinkItem>(CURATED_HOTLINKS[0]);
  const [customUrl, setCustomUrl] = useState<string>(CURATED_HOTLINKS[0].url);
  const [altText, setAltText] = useState<string>(CURATED_HOTLINKS[0].altText);
  const [imgWidth, setImgWidth] = useState<string>('300');
  const [imgHeight, setImgHeight] = useState<string>('auto');
  const [withLink, setWithLink] = useState<boolean>(true);
  const [targetHref, setTargetHref] = useState<string>('https://www.ln.edu.hk');
  const [lazyLoad, setLazyLoad] = useState<boolean>(true);
  const [noReferrer, setNoReferrer] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<'html' | 'markdown' | 'bbcode' | 'url'>('html');

  // Sandbox state
  const [sandboxCode, setSandboxCode] = useState<string>(`<!-- Lingnan Image Hotlink Sandbox Preview -->
<div style="font-family: sans-serif; padding: 16px; text-align: center; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
  <a href="https://www.ln.edu.hk" target="_blank" rel="noopener noreferrer">
    <img 
      src="https://upload.wikimedia.org/wikipedia/en/a/a9/LingnanUniversity_logo.svg" 
      alt="Lingnan University Official Emblem" 
      width="140" 
      height="140"
      style="display: inline-block; margin-bottom: 8px;"
    />
  </a>
  <h3 style="color: #c41230; margin: 4px 0; font-size: 16px; font-weight: bold;">
    Lingnan University Student Society
  </h3>
  <p style="color: #475569; font-size: 13px; margin-bottom: 12px;">
    Hotlinked image loaded directly from source repository without hosting.
  </p>
  <img 
    src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=600&q=80" 
    alt="Campus Archway" 
    style="width: 100%; max-width: 480px; border-radius: 8px; border: 1px solid #cbd5e1;" 
  />
</div>`);

  // Parse HTML string to extract hotlinks
  const handleParseHtml = (rawHtml: string) => {
    setIsParsing(true);
    const results: ParsedImageHotlink[] = [];

    // 1. Extract <img> tags: src and alt
    const imgRegex = /<img\s+[^>]*?src=["']([^"']+)["'][^>]*?>/gi;
    let match: RegExpExecArray | null;

    while ((match = imgRegex.exec(rawHtml)) !== null) {
      const fullTag = match[0];
      const src = match[1];
      const altMatch = fullTag.match(/alt=["']([^"']*)["']/i);
      const widthMatch = fullTag.match(/width=["']([^"']*)["']/i);
      const heightMatch = fullTag.match(/height=["']([^"']*)["']/i);

      results.push({
        src,
        alt: altMatch ? altMatch[1] : 'Image',
        tag: fullTag,
        width: widthMatch ? widthMatch[1] : undefined,
        height: heightMatch ? heightMatch[1] : undefined,
        isValid: true,
      });
    }

    // 2. Extract CSS url() patterns
    const cssUrlRegex = /url\(["']?([^"')]+?\.(?:png|jpg|jpeg|svg|webp|gif))["']?\)/gi;
    while ((match = cssUrlRegex.exec(rawHtml)) !== null) {
      const src = match[1];
      if (!results.some(r => r.src === src)) {
        results.push({
          src,
          alt: 'CSS Background Image',
          tag: `background-image: url('${src}')`,
          isValid: true,
        });
      }
    }

    setParsedImages(results);
    setIsParsing(false);
  };

  // Initial parse on mount
  React.useEffect(() => {
    handleParseHtml(htmlInput);
  }, []);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setHtmlInput(content);
        handleParseHtml(content);
      }
    };
    reader.readAsText(file);
  };

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Generated code string based on builder options
  const generateCodeSnippet = () => {
    if (outputFormat === 'url') {
      return customUrl;
    }

    if (outputFormat === 'markdown') {
      if (withLink) {
        return `[![${altText}](${customUrl})](${targetHref})`;
      }
      return `![${altText}](${customUrl})`;
    }

    if (outputFormat === 'bbcode') {
      if (withLink) {
        return `[url=${targetHref}][img]${customUrl}[/img][/url]`;
      }
      return `[img]${customUrl}[/img]`;
    }

    // Standard HTML
    let imgTag = `<img src="${customUrl}" alt="${altText}"`;
    if (imgWidth && imgWidth !== 'auto') imgTag += ` width="${imgWidth}"`;
    if (imgHeight && imgHeight !== 'auto') imgTag += ` height="${imgHeight}"`;
    if (lazyLoad) imgTag += ` loading="lazy"`;
    if (noReferrer) imgTag += ` referrerpolicy="no-referrer"`;
    imgTag += ` />`;

    if (withLink) {
      return `<a href="${targetHref}" target="_blank" rel="noopener noreferrer">\n  ${imgTag}\n</a>`;
    }
    return imgTag;
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([sandboxCode], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lingnan-hotlink-preview.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-24 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 tracking-wider uppercase">
              Hotlink Studio
            </span>
            <span className="text-xs font-semibold text-slate-500">
              HTML Utility
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">
            Create Image Hotlinks from HTML
          </h2>
        </div>
      </div>

      {/* Segmented Sub-Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs text-xs font-semibold">
        <button
          type="button"
          onClick={() => setSubTab('extract')}
          className={`py-2 rounded-xl flex items-center justify-center space-x-1.5 transition ${
            subTab === 'extract'
              ? 'bg-red-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Extract HTML</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('build')}
          className={`py-2 rounded-xl flex items-center justify-center space-x-1.5 transition ${
            subTab === 'build'
              ? 'bg-red-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Build Hotlink</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('sandbox')}
          className={`py-2 rounded-xl flex items-center justify-center space-x-1.5 transition ${
            subTab === 'sandbox'
              ? 'bg-red-600 text-white shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Sandbox</span>
        </button>
      </div>

      {/* ================= SUB-TAB 1: EXTRACT FROM HTML ================= */}
      {subTab === 'extract' && (
        <div className="space-y-4">
          {/* File Upload & Paste Area */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                1. Upload HTML File or Paste Source Markup
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".html,.htm,.txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center space-x-1 border border-red-200 transition"
                >
                  <Upload className="w-3 h-3" />
                  <span>Choose .html</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-red-200 hover:border-red-400 bg-red-50/30 rounded-xl p-4 text-center cursor-pointer transition"
            >
              <FileText className="w-6 h-6 mx-auto text-red-600 mb-1" />
              <p className="text-xs font-semibold text-slate-800">
                Tap or drag & drop an HTML file to extract all image hotlinks
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Automatically scans for &lt;img src=""&gt;, &lt;picture&gt;, and CSS background-image
              </p>
            </div>

            {/* Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-500">
                <span>HTML Code Input:</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHtmlInput(SAMPLE_HTML_TEMPLATES[0].html);
                      handleParseHtml(SAMPLE_HTML_TEMPLATES[0].html);
                    }}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Sample Template 1
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setHtmlInput(SAMPLE_HTML_TEMPLATES[1].html);
                      handleParseHtml(SAMPLE_HTML_TEMPLATES[1].html);
                    }}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Sample Template 2
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={htmlInput}
                onChange={(e) => {
                  setHtmlInput(e.target.value);
                  handleParseHtml(e.target.value);
                }}
                placeholder="Paste raw HTML code here..."
                className="w-full bg-slate-50 text-xs font-mono text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={() => handleParseHtml(htmlInput)}
              disabled={isParsing}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isParsing ? 'animate-spin' : ''}`} />
              <span>Parse & Extract Hotlinks ({parsedImages.length} found)</span>
            </button>
          </div>

          {/* Extraction Results List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Extracted Image Hotlinks ({parsedImages.length})
              </h3>
              {parsedImages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const allUrls = parsedImages.map(img => img.src).join('\n');
                    copyToClipboard(allUrls, 'all-urls');
                  }}
                  className="text-xs text-red-600 hover:underline font-bold flex items-center space-x-1"
                >
                  {copiedKey === 'all-urls' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'all-urls' ? 'Copied All!' : 'Copy All URLs'}</span>
                </button>
              )}
            </div>

            {parsedImages.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-500 shadow-xs">
                <ImageIcon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  No image hotlinks detected in HTML
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Ensure the HTML snippet contains &lt;img src="..."&gt; or CSS url(...)
                </p>
              </div>
            ) : (
              parsedImages.map((img, index) => (
                <div
                  key={`${img.src}-${index}`}
                  className="rounded-2xl bg-white border border-slate-200 p-3.5 shadow-xs space-y-3 hover:border-slate-300 transition"
                >
                  <div className="flex items-start space-x-3">
                    {/* Image Preview Box */}
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 p-1">
                      <img
                        src={img.src}
                        alt={img.alt}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          #{index + 1} Hotlink
                        </span>
                        {img.width && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {img.width} × {img.height || 'auto'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-800 break-all line-clamp-1">
                        {img.src}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        Alt: "{img.alt || 'None'}"
                      </p>
                    </div>
                  </div>

                  {/* Actions for each extracted item */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(img.src, `url-${index}`)}
                      className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center justify-center space-x-1 transition"
                    >
                      {copiedKey === `url-${index}` ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedKey === `url-${index}` ? 'Copied' : 'Copy URL'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const snippet = `<img src="${img.src}" alt="${img.alt}" loading="lazy" referrerpolicy="no-referrer" />`;
                        copyToClipboard(snippet, `tag-${index}`);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold flex items-center justify-center space-x-1 transition"
                    >
                      {copiedKey === `tag-${index}` ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Code className="w-3 h-3" />
                      )}
                      <span>{copiedKey === `tag-${index}` ? 'Copied' : 'Copy <img>'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCustomUrl(img.src);
                        setAltText(img.alt);
                        setSubTab('build');
                      }}
                      className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center justify-center space-x-1 transition"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Customize</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 2: BUILD HOTLINK ================= */}
      {subTab === 'build' && (
        <div className="space-y-4">
          {/* Quick presets from University Official Assets */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
            <span className="text-xs font-bold text-slate-800 block">
              Choose Pre-Configured Campus Hotlink Asset
            </span>

            <div className="grid grid-cols-2 gap-2">
              {CURATED_HOTLINKS.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setCustomUrl(asset.url);
                      setAltText(asset.altText);
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex items-start space-x-2 ${
                      isSelected
                        ? 'bg-red-50 border-red-500 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 p-0.5 overflow-hidden shrink-0 flex items-center justify-center">
                      <img
                        src={asset.url}
                        alt={asset.altText}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-slate-900 truncate">
                        {asset.title}
                      </h4>
                      <span className="text-[9px] text-red-600 uppercase font-semibold">
                        {asset.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Builder Form */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs text-xs">
            <h3 className="font-bold text-slate-900 flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-red-600" />
              <span>Hotlink Parameters & Security Options</span>
            </h3>

            {/* Image URL input */}
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Image Source URL (Direct Hotlink Address)
              </label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Alt Text input */}
            <div>
              <label className="text-slate-600 font-semibold block mb-1">
                Alternative Text (Accessibility & SEO Alt)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Description of the image..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 font-semibold block mb-1">
                  Width (px or %)
                </label>
                <input
                  type="text"
                  value={imgWidth}
                  onChange={(e) => setImgWidth(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-slate-600 font-semibold block mb-1">
                  Height
                </label>
                <input
                  type="text"
                  value={imgHeight}
                  onChange={(e) => setImgHeight(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withLink}
                  onChange={(e) => setWithLink(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-slate-700 font-medium">
                  Wrap in Clickable Hyperlink (&lt;a href="..."&gt;)
                </span>
              </label>

              {withLink && (
                <input
                  type="text"
                  value={targetHref}
                  onChange={(e) => setTargetHref(e.target.value)}
                  placeholder="Target URL..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-red-500 mt-1"
                />
              )}

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lazyLoad}
                  onChange={(e) => setLazyLoad(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-slate-700 font-medium">
                  Add <code className="text-red-600">loading="lazy"</code> (Improves student mobile data usage)
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noReferrer}
                  onChange={(e) => setNoReferrer(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className="text-slate-700 font-medium">
                  Add <code className="text-red-600">referrerpolicy="no-referrer"</code> (Prevents hotlink blocking)
                </span>
              </label>
            </div>
          </div>

          {/* Generated Code Output Box */}
          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900">
                Generated Hotlink Code Snippet
              </h4>

              {/* Format selection */}
              <div className="flex space-x-1 text-[10px] font-bold">
                {(['html', 'markdown', 'bbcode', 'url'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setOutputFormat(fmt)}
                    className={`px-2 py-0.5 rounded transition ${
                      outputFormat === fmt
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Code container */}
            <div className="relative">
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
                {generateCodeSnippet()}
              </pre>

              <button
                type="button"
                onClick={() => copyToClipboard(generateCodeSnippet(), 'builder-code')}
                className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold shadow-xs flex items-center space-x-1 transition"
              >
                {copiedKey === 'builder-code' ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span>{copiedKey === 'builder-code' ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setSandboxCode(generateCodeSnippet());
                setSubTab('sandbox');
              }}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition flex items-center justify-center space-x-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview in Sandbox</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 3: LIVE SANDBOX ================= */}
      {subTab === 'sandbox' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-red-600" />
                <span className="text-xs font-bold text-slate-900">
                  Real-time HTML Hotlink Rendering Sandbox
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadHtml}
                className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center space-x-1 border border-red-200 transition"
              >
                <Download className="w-3 h-3" />
                <span>Export .html</span>
              </button>
            </div>

            {/* Editable HTML code for sandbox */}
            <textarea
              rows={6}
              value={sandboxCode}
              onChange={(e) => setSandboxCode(e.target.value)}
              className="w-full bg-slate-50 text-xs font-mono text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-red-500 leading-relaxed"
            />

            {/* Live Render Container */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Rendered Output:
              </span>
              <div
                className="p-4 rounded-xl bg-slate-50 border border-slate-300 min-h-[140px] flex items-center justify-center overflow-hidden"
                dangerouslySetInnerHTML={{ __html: sandboxCode }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

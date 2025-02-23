"use client";
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

interface UrlMetadata {
    title?: string;
    image?: string;
    domain: string;
}

interface UrlPreviewProps {
    url: string;
    index: number;
}

export default function UrlPreview({ url, index }: UrlPreviewProps) {
    const [metadata, setMetadata] = useState<UrlMetadata | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const domain = new URL(url).hostname;
                const response = await fetch(`/api/url-metadata?url=${encodeURIComponent(url)}`);
                const data = await response.json();
                setMetadata({
                    title: data.title,
                    image: data.image,
                    domain
                });
            } catch (error) {
                // If metadata fetch fails, at least show the domain
                setMetadata({
                    domain: new URL(url).hostname
                });
            } finally {
                setLoading(false);
            }
        };

        fetchMetadata();
    }, [url]);

    if (loading) {
        return (
            <div className="animate-pulse bg-white/5 p-4 rounded-lg w-48 h-32 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 hover:bg-white/20 transition-all duration-300 p-4 rounded-lg text-white w-48 group"
        >
            <div className="flex flex-col gap-2">
                {metadata?.image ? (
                    <div className="w-full h-20 rounded overflow-hidden">
                        <img 
                            src={metadata.image} 
                            alt={metadata.title || 'Preview'} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-full h-20 bg-white/5 rounded flex items-center justify-center">
                        <Globe className="w-8 h-8 text-white/50" />
                    </div>
                )}
                <div className="space-y-1">
                    <p className="text-sm font-medium truncate">
                        {metadata?.title || `Source ${index + 1}`}
                    </p>
                    <p className="text-xs text-white/70 truncate">
                        {metadata?.domain}
                    </p>
                </div>
            </div>
        </a>
    );
}

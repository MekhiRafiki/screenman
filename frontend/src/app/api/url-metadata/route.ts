import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Get metadata
        const metadata = {
            title: $('meta[property="og:title"]').attr('content') || 
                   $('title').text() || 
                   $('meta[name="title"]').attr('content'),
            image: $('meta[property="og:image"]').attr('content') || 
                   $('meta[name="image"]').attr('content'),
            description: $('meta[property="og:description"]').attr('content') || 
                        $('meta[name="description"]').attr('content')
        };

        return NextResponse.json(metadata);
    } catch (error) {
        console.error('Error fetching URL metadata:', error);
        return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
    }
}

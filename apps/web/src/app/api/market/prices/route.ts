import { NextRequest, NextResponse } from 'next/server';
import { getMarketPrices } from '@/lib/marketData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_SYMBOLS = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP'];

export async function GET(req: NextRequest) {
  try {
    const symbolsParam = req.nextUrl.searchParams.get('symbols');
    const symbols = symbolsParam
      ? symbolsParam.split(',').map((s) => s.trim()).filter(Boolean)
      : DEFAULT_SYMBOLS;

    if (symbols.length === 0 || symbols.length > 50) {
      return NextResponse.json(
        { error: 'Tham số symbols không hợp lệ (1-50 mã).' },
        { status: 400 }
      );
    }

    const prices = await getMarketPrices(symbols);
    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Market prices API error:', error);
    return NextResponse.json(
      { error: 'Không thể lấy dữ liệu thị trường.' },
      { status: 500 }
    );
  }
}

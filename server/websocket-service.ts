import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { bitcoinPriceService } from './bitcoin-price-service';
import { marketDataService } from './market-data-service';
import { log } from './vite';

interface PriceMessage {
  type: 'price_update';
  data: {
    price: number;
    change24h: number;
    timestamp: string;
    source: string;
  };
}

interface PongMessage { type: 'pong' }

type OutboundMessage = PriceMessage | PongMessage;

// Extend WebSocket để track trạng thái alive cho heartbeat
interface ExtendedWs extends WebSocket {
  isAlive: boolean;
}

class BitcoinWebSocketService {
  private wss: WebSocketServer | null = null;
  private broadcastInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private readonly BROADCAST_INTERVAL_MS = 30_000;  // push giá mỗi 30s
  private readonly HEARTBEAT_INTERVAL_MS = 25_000;  // ping mỗi 25s (< 30s)

  attach(httpServer: Server): void {
    // noServer + tự xử lý upgrade: KHÔNG dùng { server, path } vì ws sẽ abort
    // mọi upgrade không khớp path — phá luôn WebSocket HMR của Vite (dev)
    this.wss = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', (req, socket, head) => {
      const url = req.url ?? '';
      if (url === '/ws/bitcoin-price' || url.startsWith('/ws/bitcoin-price?')) {
        this.wss!.handleUpgrade(req, socket, head, (ws) => {
          this.wss!.emit('connection', ws, req);
        });
      }
      // Không khớp → bỏ qua, để Vite HMR / handler khác xử lý
    });

    this.wss.on('connection', (rawWs: WebSocket) => {
      const ws = rawWs as ExtendedWs;
      ws.isAlive = true;

      log('[WS] Client connected');

      // Gửi giá ngay khi kết nối
      this.sendCurrentPrice(ws);

      ws.on('pong', () => { ws.isAlive = true; });

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.type === 'ping') {
            const pong: PongMessage = { type: 'pong' };
            ws.send(JSON.stringify(pong));
          }
        } catch { /* ignore malformed */ }
      });

      ws.on('close', () => log('[WS] Client disconnected'));
      ws.on('error', (err) => log(`[WS] Error: ${err.message}`));
    });

    this.startHeartbeat();
    this.startBroadcastLoop();
    log('[WS] Bitcoin price WebSocket service started → /ws/bitcoin-price');
  }

  private async sendCurrentPrice(ws: ExtendedWs): Promise<void> {
    if (ws.readyState !== WebSocket.OPEN) return;
    try {
      const priceData = await bitcoinPriceService.getCurrentPrice();
      const msg: PriceMessage = {
        type: 'price_update',
        data: {
          price: priceData.price,
          change24h: priceData.change24h,
          timestamp: priceData.timestamp.toISOString(),
          source: priceData.source,
        },
      };
      ws.send(JSON.stringify(msg));
    } catch (err: any) {
      log(`[WS] Failed to send price: ${err.message}`);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((rawWs) => {
        const ws = rawWs as ExtendedWs;
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, this.HEARTBEAT_INTERVAL_MS);
  }

  private startBroadcastLoop(): void {
    this.broadcastInterval = setInterval(async () => {
      if (!this.wss || this.wss.clients.size === 0) return;
      try {
        // Lấy song song: giá BTC (tương thích ngược) + toàn bộ thị trường
        const [priceData, allAssets] = await Promise.all([
          bitcoinPriceService.getCurrentPrice(true),
          marketDataService.getAllPrices(true),
        ]);

        const btcMsg = JSON.stringify({
          type: 'price_update',
          data: {
            price: priceData.price,
            change24h: priceData.change24h,
            timestamp: priceData.timestamp.toISOString(),
            source: priceData.source,
          },
        });

        const marketMsg = JSON.stringify({
          type: 'market_update',
          data: allAssets.map(a => ({
            symbol: a.symbol,
            name: a.name,
            type: a.type,
            price: a.price,
            change24h: a.change24h,
            source: a.source,
          })),
          timestamp: new Date().toISOString(),
        });

        let sent = 0;
        this.wss.clients.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(btcMsg);
            ws.send(marketMsg);
            sent++;
          }
        });
        log(`[WS] Broadcast BTC $${priceData.price} + ${allAssets.length} assets → ${sent} client(s)`);
      } catch (err: any) {
        log(`[WS] Broadcast error: ${err.message}`);
      }
    }, this.BROADCAST_INTERVAL_MS);
  }

  stop(): void {
    if (this.heartbeatInterval) { clearInterval(this.heartbeatInterval); this.heartbeatInterval = null; }
    if (this.broadcastInterval) { clearInterval(this.broadcastInterval); this.broadcastInterval = null; }
    this.wss?.close();
  }

  /** Trả về số client đang kết nối (cho health endpoint) */
  get clientCount(): number {
    return this.wss?.clients.size ?? 0;
  }
}

export const bitcoinWsService = new BitcoinWebSocketService();

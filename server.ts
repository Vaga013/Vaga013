import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import webpush from "web-push";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("vaga013.db");

// VAPID keys should be generated once and kept secret
// For this demo, we'll generate them if not present in env
const vapidKeys = webpush.generateVAPIDKeys();
const publicKey = process.env.VAPID_PUBLIC_KEY || vapidKeys.publicKey;
const privateKey = process.env.VAPID_PRIVATE_KEY || vapidKeys.privateKey;

webpush.setVapidDetails(
  "mailto:ivoxorreia390@gmail.com",
  publicKey,
  privateKey
);

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS spaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    address TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    price_daily REAL,
    price_monthly REAL,
    rules TEXT,
    status TEXT DEFAULT 'pending',
    is_covered INTEGER DEFAULT 1, -- 1 for true, 0 for false
    num_spaces INTEGER DEFAULT 1,
    vehicle_type TEXT DEFAULT 'médio',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_name TEXT NOT NULL,
    driver_phone TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    period TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    space_id INTEGER,
    driver_name TEXT NOT NULL,
    amount REAL NOT NULL,
    commission REAL NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (space_id) REFERENCES spaces(id)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_type TEXT NOT NULL, -- 'driver' or 'owner'
    neighborhood TEXT, -- for drivers
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/vapid-public-key", (req, res) => {
    res.json({ publicKey });
  });

  app.post("/api/subscribe", (req, res) => {
    const { subscription, user_type, neighborhood } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO subscriptions (endpoint, p256dh, auth, user_type, neighborhood)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        subscription.endpoint,
        subscription.keys.p256dh,
        subscription.keys.auth,
        user_type,
        neighborhood
      );
      res.status(201).json({});
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // API Routes
  app.post("/api/spaces", async (req, res) => {
    const { owner_name, owner_phone, address, neighborhood, price_daily, price_monthly, rules, is_covered, num_spaces, vehicle_type } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO spaces (owner_name, owner_phone, address, neighborhood, price_daily, price_monthly, rules, is_covered, num_spaces, vehicle_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(
        owner_name, 
        owner_phone, 
        address, 
        neighborhood, 
        price_daily, 
        price_monthly, 
        rules, 
        is_covered ? 1 : 0, 
        num_spaces, 
        vehicle_type
      );
      
      // Notify drivers interested in this neighborhood
      const drivers = db.prepare("SELECT * FROM subscriptions WHERE user_type = 'driver' AND neighborhood = ?").all() as any[];
      const notificationPayload = JSON.stringify({
        title: "Nova Vaga Disponível!",
        body: `Uma nova vaga foi cadastrada no bairro ${neighborhood}. Confira agora!`,
        url: "/motorista"
      });

      drivers.forEach(sub => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        webpush.sendNotification(pushSubscription, notificationPayload).catch(err => console.error("Error sending notification", err));
      });

      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/spaces", (req, res) => {
    try {
      const spaces = db.prepare("SELECT * FROM spaces ORDER BY created_at DESC").all();
      res.json(spaces);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/requests", (req, res) => {
    const { driver_name, driver_phone, neighborhood, period } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO requests (driver_name, driver_phone, neighborhood, period)
        VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(driver_name, driver_phone, neighborhood, period);

      // Notify owners (or admin) about new request
      const owners = db.prepare("SELECT * FROM subscriptions WHERE user_type = 'owner'").all() as any[];
      const notificationPayload = JSON.stringify({
        title: "Nova Solicitação de Vaga",
        body: `Um motorista está procurando vaga no bairro ${neighborhood}.`,
        url: "/admin"
      });

      owners.forEach(sub => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        webpush.sendNotification(pushSubscription, notificationPayload).catch(err => console.error("Error sending notification", err));
      });

      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/requests", (req, res) => {
    try {
      const requests = db.prepare("SELECT * FROM requests ORDER BY created_at DESC").all();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/transactions", (req, res) => {
    const { space_id, driver_name, amount, commission } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO transactions (space_id, driver_name, amount, commission)
        VALUES (?, ?, ?, ?)
      `);
      const result = stmt.run(space_id, driver_name, amount, commission);
      res.json({ id: result.lastInsertRowid });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/stats", (req, res) => {
    try {
      const totalSpaces = db.prepare("SELECT COUNT(*) as count FROM spaces").get() as { count: number };
      const totalRequests = db.prepare("SELECT COUNT(*) as count FROM requests").get() as { count: number };
      const totalRevenue = db.prepare("SELECT SUM(commission) as total FROM transactions").get() as { total: number };
      res.json({
        spaces: totalSpaces.count,
        requests: totalRequests.count,
        revenue: totalRevenue.total || 0
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

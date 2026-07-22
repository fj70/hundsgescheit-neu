-- Barzahlung/PayPal: Zahlart je Kauf
ALTER TABLE "Purchase" ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'STRIPE';

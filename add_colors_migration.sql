-- Migration: Add Colors to Items
-- Created: 2025-10-23

-- Create colors table
CREATE TABLE IF NOT EXISTS "colors" (
    "id" SERIAL PRIMARY KEY,
    "code" VARCHAR(255) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "hexCode" VARCHAR(7), -- #RRGGBB
    "description" TEXT,
    "active" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create item_colors junction table (many-to-many)
CREATE TABLE IF NOT EXISTS "item_colors" (
    "id" SERIAL PRIMARY KEY,
    "itemId" INTEGER NOT NULL REFERENCES "items"("id") ON DELETE CASCADE,
    "colorId" INTEGER NOT NULL REFERENCES "colors"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE("itemId", "colorId")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "item_colors_itemId_idx" ON "item_colors"("itemId");
CREATE INDEX IF NOT EXISTS "item_colors_colorId_idx" ON "item_colors"("colorId");
CREATE INDEX IF NOT EXISTS "colors_active_idx" ON "colors"("active");

-- Insert some default colors
INSERT INTO "colors" ("code", "name", "hexCode", "description", "active", "updatedAt")
VALUES 
    ('NAT', 'Natural', '#F5F5DC', 'Cor natural do material', true, NOW()),
    ('BRA', 'Branco', '#FFFFFF', 'Branco', true, NOW()),
    ('PRE', 'Preto', '#000000', 'Preto', true, NOW()),
    ('VER', 'Vermelho', '#FF0000', 'Vermelho', true, NOW()),
    ('AZU', 'Azul', '#0000FF', 'Azul', true, NOW()),
    ('VER2', 'Verde', '#00FF00', 'Verde', true, NOW()),
    ('AMA', 'Amarelo', '#FFFF00', 'Amarelo', true, NOW()),
    ('LAR', 'Laranja', '#FFA500', 'Laranja', true, NOW()),
    ('ROX', 'Roxo', '#800080', 'Roxo', true, NOW()),
    ('CIN', 'Cinza', '#808080', 'Cinza', true, NOW())
ON CONFLICT ("code") DO NOTHING;


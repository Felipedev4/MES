-- Adicionar campos de custo ao cadastro de itens
-- Conforme ABNT: valores monetários com 2 casas decimais

ALTER TABLE "items" ADD COLUMN "material_cost" DECIMAL(10,2);
ALTER TABLE "items" ADD COLUMN "labor_cost" DECIMAL(10,2);
ALTER TABLE "items" ADD COLUMN "scrap_cost" DECIMAL(10,2);

-- Comentários para documentação
COMMENT ON COLUMN "items"."material_cost" IS 'Custo de material por unidade (R$)';
COMMENT ON COLUMN "items"."labor_cost" IS 'Custo de mão-de-obra por unidade (R$)';
COMMENT ON COLUMN "items"."scrap_cost" IS 'Custo de refugo/desperdício por unidade (R$)';


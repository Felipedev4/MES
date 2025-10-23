-- AddEmailNotificationsToActivityTypes
-- Adiciona campos de e-mail e notificações ao modelo ActivityType

-- Adicionar coluna de e-mail do setor
ALTER TABLE "activity_types" ADD COLUMN "sector_email" VARCHAR(255);

-- Adicionar coluna para controle de notificações
ALTER TABLE "activity_types" ADD COLUMN "email_notifications_enabled" BOOLEAN NOT NULL DEFAULT false;

-- Criar índice para buscar tipos de atividade com notificações habilitadas
CREATE INDEX "activity_types_email_notifications_enabled_idx" ON "activity_types"("email_notifications_enabled");


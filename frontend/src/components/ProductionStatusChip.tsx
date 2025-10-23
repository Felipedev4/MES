/**
 * Componente para exibir o status de uma ordem de produção
 */

import { Chip, Tooltip } from '@mui/material';
import {
  ProductionStatus,
  getStatusLabel,
  getStatusColor,
  getStatusDescription,
  getStatusIcon,
} from '../utils/productionStatus';

interface ProductionStatusChipProps {
  status: ProductionStatus;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
  showIcon?: boolean;
  showTooltip?: boolean;
}

export default function ProductionStatusChip({
  status,
  size = 'small',
  variant = 'filled',
  showIcon = true,
  showTooltip = true,
}: ProductionStatusChipProps) {
  const chip = (
    <Chip
      label={`${showIcon ? getStatusIcon(status) + ' ' : ''}${getStatusLabel(status)}`}
      color={getStatusColor(status)}
      size={size}
      variant={variant}
    />
  );

  if (showTooltip) {
    return (
      <Tooltip title={getStatusDescription(status)} arrow>
        {chip}
      </Tooltip>
    );
  }

  return chip;
}


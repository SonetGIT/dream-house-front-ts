import React from 'react';
import { Box, Button, Collapse } from '@mui/material';
import { Add } from '@mui/icons-material';
import { ChevronDown, ChevronRight, MinusCircle, Pencil, Phone } from 'lucide-react';
import { StyledTooltip } from '@/components/ui/StyledTooltip';
import type { ReferenceResult } from '@/features/reference/referenceSlice';
import { formatPhoneDisplay } from '@/utils/formatPhoneNumber';
import type { Warehouse } from './warehousesSlice';
import WarehouseTabs from './WarehouseTabs';
import WarehouseMaterialsTab from './tabs/WarehouseMaterialsTab';
import WarehouseMovementsTab from './tabs/WarehouseMovementsTab';
import WarehouseWriteOffAvrTab from './tabs/WarehouseWriteOffAvrTab';
import WarehouseWriteOffMpbTab from './tabs/WarehouseWriteOffMpbTab';

export type WarehouseTabType = 'materials' | 'movements' | 'writeOffAVR' | 'writeOffMPB';

interface WarehouseRowProps {
    warehouse: Warehouse;
    refs: Record<string, ReferenceResult>;
    isOpen: boolean;
    activeTab: WarehouseTabType;
    onToggle: () => void;
    onTabChange: (tab: WarehouseTabType) => void;
    onEdit: (warehouse: Warehouse) => void;
    onOpenReceive: (warehouse: Warehouse) => void;
}

export default function WarehouseRow({
    warehouse,
    refs,
    isOpen,
    activeTab,
    onToggle,
    onTabChange,
    onEdit,
    onOpenReceive,
}: WarehouseRowProps) {
    return (
        <React.Fragment>
            <tr className="transition-colors border-b hover:bg-gray-50" onClick={onToggle}>
                <td className="px-2 py-2">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggle();
                        }}
                        className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                        {isOpen ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        )}
                    </button>
                </td>

                <td className="px-3 py-2">
                    <div className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                        {warehouse.name}
                    </div>
                </td>

                <td className="px-3 py-2 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold text-sky-700 bg-sky-100 border border-sky-200 rounded">
                        {warehouse.code}
                    </span>
                </td>

                <td className="px-3 py-2 text-sm text-center">{warehouse.address}</td>

                <td className="px-3 py-2 text-center">
                    {warehouse.manager_id ? (
                        <span className="text-sm">{refs.users.lookup(warehouse.manager_id)}</span>
                    ) : (
                        '_'
                    )}
                </td>

                <td className="px-3 py-2 text-center">
                    <div className="space-y-1 text-sm">
                        {warehouse.phone && (
                            <div className="flex items-center gap-1.5 text-gray-700 text-sm">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                {formatPhoneDisplay(warehouse.phone)}
                            </div>
                        )}
                    </div>
                </td>

                <td
                    className="px-3 py-2 font-medium text-center border-gray-200 text-violet-800"
                    onClick={(e) => e.stopPropagation()}
                >
                    {warehouse.items?.length || 0} поз.
                </td>

                <td className="px-3 py-2 border-l">
                    <div className="flex items-center justify-center gap-1.5">
                        <StyledTooltip title="Редактировать">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(warehouse);
                                }}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        </StyledTooltip>
                    </div>
                </td>
            </tr>

            <tr className="border-b bg-gradient-to-r to-blue-50/50">
                <td colSpan={8} className="px-3 py-2">
                    <Collapse in={isOpen} unmountOnExit>
                        <div className="px-3 py-2 ml-8">
                            <div className="flex items-center justify-between gap-2 mb-4 border-b">
                                <WarehouseTabs activeTab={activeTab} onChange={onTabChange} />

                                <Box sx={{ mb: 1 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<Add />}
                                        onClick={() => onOpenReceive(warehouse)}
                                        sx={{
                                            color: 'green',
                                            borderColor: 'green',
                                            '&:hover': {
                                                borderColor: 'darkgreen',
                                                backgroundColor: 'rgba(76, 100, 68, 0.1)',
                                            },
                                        }}
                                    >
                                        Принять товар
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<MinusCircle />}
                                        onClick={() => onChangeSafe(onTabChange, 'writeOffAVR')}
                                        sx={{
                                            marginLeft: 1,
                                            color: 'violet',
                                            borderColor: 'violet',
                                            '&:hover': {
                                                borderColor: 'darkviolet',
                                                backgroundColor: 'rgba(208, 124, 247, 0.1)',
                                            },
                                        }}
                                    >
                                        Списание по АВР
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<MinusCircle />}
                                        onClick={() => onChangeSafe(onTabChange, 'writeOffMPB')}
                                        sx={{
                                            marginLeft: 1,
                                            color: 'orange',
                                            borderColor: 'orange',
                                            '&:hover': {
                                                borderColor: 'darkorange',
                                                backgroundColor: 'rgba(206, 154, 59, 0.1)',
                                            },
                                        }}
                                    >
                                        Списание МПБ
                                    </Button>
                                </Box>
                            </div>

                            {activeTab === 'materials' && (
                                <WarehouseMaterialsTab warehouse={warehouse} refs={refs} />
                            )}

                            {activeTab === 'movements' && (
                                <WarehouseMovementsTab warehouseId={warehouse.id} />
                            )}

                            {activeTab === 'writeOffAVR' && (
                                <WarehouseWriteOffAvrTab warehouseId={warehouse.id} refs={refs} />
                            )}

                            {activeTab === 'writeOffMPB' && (
                                <WarehouseWriteOffMpbTab warehouseId={warehouse.id} refs={refs} />
                            )}
                        </div>
                    </Collapse>
                </td>
            </tr>
        </React.Fragment>
    );
}

function onChangeSafe(onChange: (tab: WarehouseTabType) => void, tab: WarehouseTabType) {
    onChange(tab);
}

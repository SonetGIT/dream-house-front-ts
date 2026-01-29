import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Collapse,
    Box,
    Typography,
    Paper,
    Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { signMaterialRequest, type MaterialRequest } from './materialRequestsSlice';
import { formatDateTime } from '@/utils/formatDateTime';
import type { Users } from '@/features/users/userSlice';

interface PropsType {
    data: MaterialRequest[];
    getRefName: {
        materialType: (id: number) => string;
        materialName: (id: number) => string;
        unitName: (id: number) => string;
        userName: (id: number) => string;
        statusName: (id: number) => string;
        statusItemName: (id: number) => string;
    };
}

/*************************************************************************************************************************/
export default function MaterialRequestsTable(props: PropsType) {
    const dispatch = useAppDispatch();
    const [openRows, setOpenRows] = useState<Record<number, boolean>>({});
    const currentUser = useAppSelector((state) => state.auth.user);

    const toggleRow = (id: number) => {
        setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const ApprovalDot = ({ value }: { value: boolean | null }) => (
        <Box
            sx={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                bgcolor: value === true ? '#16a34a' : value === false ? '#ef4444' : '#e6d64f',
            }}
        />
    );

    // Проверка, может ли текущий пользователь подписать заявку
    const canSign = (req: MaterialRequest, user?: Users) => {
        if (!user) return false;

        const userId = Number(user.id);
        const roleId = Number(user.role_id);

        // Временная проверка для admin (например, роль = 1)
        if (roleId === 1) {
            // 1 = admin
            return true; // admin может подписывать всё
        }
        switch (roleId) {
            case 4: // Прораб
                return (
                    req.approved_by_foreman !== true &&
                    (!req.foreman_user_id || Number(req.foreman_user_id) === userId)
                );

            case 7: // Снабженец
                return (
                    req.approved_by_purchasing_agent !== true &&
                    (!req.purchasing_agent_user_id ||
                        Number(req.purchasing_agent_user_id) === userId)
                );

            case 9: // Нач. участка
                return (
                    req.approved_by_site_manager !== true &&
                    (!req.site_manager_user_id || Number(req.site_manager_user_id) === userId)
                );

            case 10: // Инженер ПТО
                return (
                    req.approved_by_planning_engineer !== true &&
                    (!req.planning_engineer_user_id ||
                        Number(req.planning_engineer_user_id) === userId)
                );

            case 11: // Гл. инженер
                return (
                    req.approved_by_main_engineer !== true &&
                    (!req.main_engineer_user_id || Number(req.main_engineer_user_id) === userId)
                );

            default:
                return false;
        }
    };

    const handleSign = (req: MaterialRequest) => {
        if (!currentUser || !canSign(req, currentUser)) return;

        dispatch(
            signMaterialRequest({
                id: req.id,
                role_id: currentUser.role_id,
                userId: currentUser.id,
            }),
        );
    };

    /********************************************************************************************************************************/
    return (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table className="table">
                <TableBody>
                    {props.data?.map((req) => {
                        const signatures = [
                            {
                                label: 'Прораб',
                                approved: req.approved_by_foreman,
                                userId: req.foreman_user_id,
                                approvedTime: req.approved_by_foreman_time,
                            },
                            {
                                label: 'Нач. участка',
                                approved: req.approved_by_site_manager,
                                userId: req.site_manager_user_id,
                                approvedTime: req.approved_by_site_manager_time,
                            },
                            {
                                label: 'Снабженец',
                                approved: req.approved_by_purchasing_agent,
                                userId: req.purchasing_agent_user_id,
                                approvedTime: req.approved_by_purchasing_agent_time,
                            },
                            {
                                label: 'Инженер ПТО',
                                approved: req.approved_by_planning_engineer,
                                userId: req.planning_engineer_user_id,
                                approvedTime: req.approved_by_planning_engineer_time,
                            },
                            {
                                label: 'Гл. инженер',
                                approved: req.approved_by_main_engineer,
                                userId: req.main_engineer_user_id,
                                approvedTime: req.approved_by_main_engineer_time,
                            },
                        ];

                        return (
                            <React.Fragment key={req.id}>
                                {/* HEADER */}
                                <TableRow
                                    hover
                                    onClick={() => toggleRow(req.id)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell padding="checkbox">
                                        <IconButton
                                            // size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleRow(req.id);
                                            }}
                                        >
                                            {openRows[req.id] ? (
                                                <KeyboardArrowUpIcon />
                                            ) : (
                                                <KeyboardArrowDownIcon />
                                            )}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        № заявки: <strong>{req.id}</strong>
                                    </TableCell>
                                    <TableCell>
                                        Статус заявки:{' '}
                                        <strong>{props.getRefName.statusName(req.status)}</strong>
                                    </TableCell>
                                    <TableCell>
                                        Дата создание:{' '}
                                        <strong>{formatDateTime(req.created_at)}</strong>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" gap={0.5} alignItems={'center'}>
                                            Этап согласования:
                                            {signatures.map((s) => (
                                                <ApprovalDot key={s.label} value={s.approved} />
                                            ))}
                                        </Box>
                                    </TableCell>
                                </TableRow>

                                {/* DETAILS */}
                                <TableRow>
                                    <TableCell colSpan={8} sx={{ p: 1 }}>
                                        <Collapse in={openRows[req.id]} unmountOnExit>
                                            <Box>
                                                <Typography
                                                    fontWeight={600}
                                                    color="#2c7ecb"
                                                    sx={{ p: 1 }}
                                                >
                                                    Список материалов
                                                </Typography>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Тип</TableCell>
                                                            <TableCell>Материал</TableCell>
                                                            <TableCell>Ед.</TableCell>
                                                            <TableCell>Кол-во</TableCell>
                                                            <TableCell>Примечание</TableCell>
                                                            <TableCell>Статус</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {req.items?.map((item) => (
                                                            <TableRow
                                                                key={item.id}
                                                                hover
                                                                sx={{
                                                                    '& td': {
                                                                        textAlign: 'center',
                                                                    },
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    {props.getRefName.materialType(
                                                                        item.material_type,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {props.getRefName.materialName(
                                                                        item.material_id,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {props.getRefName.unitName(
                                                                        item.unit_of_measure,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.quantity}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.comment ?? '—'}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {props.getRefName.statusItemName(
                                                                        req.status,
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>

                                                {/* SIGNATURES */}
                                                <Box
                                                    display="flex"
                                                    // gap={2}
                                                    mt={5}
                                                    mb={2}
                                                    flexWrap="wrap"
                                                    justifyContent="space-between"
                                                    sx={{ backgroundColor: '#fff' }}
                                                >
                                                    {signatures.map((s) => (
                                                        <Box
                                                            key={s.label}
                                                            sx={{
                                                                // border: '1px solid #d9eff6',
                                                                textAlign: 'center',
                                                                minWidth: 200,
                                                            }}
                                                        >
                                                            <Typography fontWeight={600}>
                                                                {s.label}
                                                            </Typography>
                                                            <Typography
                                                                fontSize="0.85rem"
                                                                color="text.secondary"
                                                                fontStyle="italic"
                                                            >
                                                                {s.userId
                                                                    ? props.getRefName.userName(
                                                                          s.userId,
                                                                      )
                                                                    : '—'}
                                                            </Typography>
                                                            <Typography
                                                                fontSize="0.85rem"
                                                                mt={0.5}
                                                                color={
                                                                    s.approved
                                                                        ? 'success.main'
                                                                        : 'text.disabled'
                                                                }
                                                            >
                                                                {s.approved === true
                                                                    ? `Подписано (${formatDateTime(
                                                                          s.approvedTime,
                                                                      )})`
                                                                    : s.approved === false
                                                                      ? `Отклонено (${formatDateTime(
                                                                            s.approvedTime,
                                                                        )})`
                                                                      : 'Ожидает'}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>

                                                {/* UNIVERSAL SIGN BUTTON */}
                                                {currentUser && canSign(req, currentUser) && (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        sx={{ mt: 2, mx: 'auto', display: 'block' }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSign(req);
                                                        }}
                                                    >
                                                        Подписать
                                                    </Button>
                                                )}
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

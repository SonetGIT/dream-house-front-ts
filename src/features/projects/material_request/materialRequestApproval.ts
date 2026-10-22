import type { User } from '@/features/users/userSlice';
import type { MaterialRequest } from './materialRequestsSlice';

// Temporary switch: restore this stage in the UI and signing flow together.
export const SITE_MANAGER_APPROVAL_ENABLED = false;

// Preserve the existing administrator signing order.
const approvalStages = [
    { stage: 'foreman', roleId: 4, approvedField: 'approved_by_foreman', userField: 'foreman_user_id' },
    { stage: 'planning_engineer', roleId: 10, approvedField: 'approved_by_planning_engineer', userField: 'planning_engineer_user_id' },
    { stage: 'main_engineer', roleId: 11, approvedField: 'approved_by_main_engineer', userField: 'main_engineer_user_id' },
    { stage: 'purchasing_agent', roleId: 7, approvedField: 'approved_by_purchasing_agent', userField: 'purchasing_agent_user_id' },
    { stage: 'site_manager', roleId: 9, approvedField: 'approved_by_site_manager', userField: 'site_manager_user_id' },
] as const;

const activeStages = approvalStages.filter(({ stage }) =>
    stage !== 'site_manager' || SITE_MANAGER_APPROVAL_ENABLED,
);

export function getMaterialRequestSignStage(user?: User | null) {
    return activeStages.find((stage) => stage.roleId === Number(user?.role_id))?.stage ?? null;
}

export function canSignMaterialRequest(req: MaterialRequest, user?: User | null): boolean {
    if (!user) return false;
    if (Number(user.role_id) === 1) return true;
    const stage = activeStages.find((stage) => stage.roleId === Number(user.role_id));
    if (!stage) return false;
    const assignedUserId = req[stage.userField];
    return !req[stage.approvedField] && (!assignedUserId || Number(assignedUserId) === Number(user.id));
}

export function getPendingMaterialRequestSignStages(req: MaterialRequest) {
    return activeStages.filter((stage) => !req[stage.approvedField]).map((stage) => stage.stage);
}

export function isMaterialRequestFullyApproved(req: MaterialRequest): boolean {
    return activeStages.every((stage) => !!req[stage.approvedField]);
}

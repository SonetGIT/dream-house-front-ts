import type { Notification } from './notificationSlice';

const buildPathWithFocus = (pathname: string, entityId: number) =>
    `${pathname}?focus=${entityId}`;

const getProjectId = (notification: Notification) =>
    Number(notification.route_params?.project_id || 0);

const getProjectBlockId = (notification: Notification) =>
    Number(
        notification.route_params?.prjBlockId ||
            notification.route_params?.prj_block_id ||
            notification.route_params?.block_id ||
            0,
    );

export function resolveNotificationRoute(notification: Notification) {
    const entityType = notification.entity_type;
    const entityId = Number(notification.entity_id || 0);
    const projectId = getProjectId(notification);
    const projectBlockId = getProjectBlockId(notification);

    if (!entityType || !entityId) return null;

    if (entityType === 'task' && projectId) {
        return buildPathWithFocus(`/projects/${projectId}/tasks`, entityId);
    }

    if (entityType === 'payment' && projectId) {
        return buildPathWithFocus(`/projects/${projectId}/payments`, entityId);
    }

    if (entityType === 'material_request' && projectId && projectBlockId) {
        return buildPathWithFocus(
            `/projects/${projectId}/prjBlocks/${projectBlockId}/materialRequests`,
            entityId,
        );
    }

    if (entityType === 'purchase_order' && projectId && projectBlockId) {
        return buildPathWithFocus(
            `/projects/${projectId}/prjBlocks/${projectBlockId}/purchaseOrders`,
            entityId,
        );
    }

    if (entityType === 'work_performed' && projectId && projectBlockId) {
        return buildPathWithFocus(
            `/projects/${projectId}/prjBlocks/${projectBlockId}/workPerformed`,
            entityId,
        );
    }

    return null;
}

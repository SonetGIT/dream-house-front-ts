export const ENUMS_CONFIG = {
    userRoles: {
        apiName: '/userRoles/gets',
        data: {
            id: 'id',
            name: ['description'],
        },
    },

    projectTypes: {
        apiName: '/projectTypes/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    projectStatuses: {
        apiName: '/projectStatuses/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    unitsOfMeasure: {
        apiName: '/unitsOfMeasure/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    materials: {
        apiName: '/materials/gets',
        data: {
            id: 'id',
            name: ['name'],
            type: 'type',
            unit_of_measure: 'unit_of_measure',
        },
    },

    materialTypes: {
        apiName: '/materialTypes/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    users: {
        apiName: '/users/gets',
        data: {
            id: 'id',
            name: ['username'],
            userFIO: ['last_name', ' ', 'first_name'],
            role_id: 'role_id',
        },
    },

    materialRequestStatuses: {
        apiName: '/materialRequestStatuses/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    materialRequestItemStatuses: {
        apiName: '/materialRequestItemStatuses/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    currencies: {
        apiName: '/currencies/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    suppliers: {
        apiName: '/suppliers/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    warehouses: {
        apiName: '/warehouses/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    purchaseOrderStatuses: {
        apiName: '/purchaseOrderStatuses/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    purchaseOrderItemStatuses: {
        apiName: '/purchaseOrderItemStatuses/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    materialMovementStatuses: {
        apiName: '/materialMovementStatuses/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    documentStages: {
        apiName: '/documentStages/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },

    documentStatuses: {
        apiName: '/documentStatuses/gets',
        data: {
            id: 'id',
            name: ['name'],
        },
    },
} as const;

# Socket.IO notifications

`SocketProvider` is mounted inside the Redux provider. It connects only after a
user profile has been checked and a token is present. Logout or an account/token
change closes the previous connection, removes listeners and clears notifications.

Defaults:

- Server: the origin of `VITE_BASE_URL` (without `/api`).
- Socket.IO path: `/socket.io`.
- Namespace: `/`.
- Token: `socket.handshake.auth.token`; the polling handshake also includes
  `Authorization: Bearer <token>`.
- Incoming event: `notifications:new`, with `{ notification: Notification }`.

If the backend uses another server/namespace, configure `VITE_SOCKET_URL`.
For another transport path, configure `VITE_SOCKET_PATH`.

The backend must validate the token, determine the user from it and deliver the
event to that user's connection/room. No client-side room join event is assumed:
if the backend requires one, its documented contract must be added here first.

On every connection/reconnection, the frontend reloads the unread count and the
latest 20 notifications via REST. On a new event, it adds the full notification
(including routing fields) to Redux, deduplicates by ID and synchronizes the count.

Required routing fields for a task notification:

```json
{
  "notification": {
    "id": 1,
    "title": "New task",
    "is_read": false,
    "created_at": "2026-09-14T10:00:00Z",
    "entity_type": "task",
    "entity_id": 42,
    "route_params": { "project_id": 7 }
  }
}
```

This opens `/projects/7/tasks?focus=42`. The existing tasks page handles loading,
expanding, highlighting and scrolling to the task; that module is not changed.

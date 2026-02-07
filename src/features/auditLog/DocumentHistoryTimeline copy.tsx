




dispatch(fetchAuditLog({
    entity_type: 'document',
    entity_id: doc.id,
}));

<Dialog open={open} maxWidth="md" fullWidth>
    <DialogTitle>Документ</DialogTitle>

    <DialogContent dividers>
        <DocumentForm ... />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
            История изменений
        </Typography>

        <AuditLogTimeline />
    </DialogContent>
</Dialog>

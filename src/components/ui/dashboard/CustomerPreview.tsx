import CircularProgress from '@mui/material/CircularProgress';

export function CustomerPreview() {
    return (
        <div className="customer-card">
            <h4>Customer Preview</h4>

            <div className="circle-wrap">
                <CircularProgress
                    variant="determinate"
                    value={25}
                    size={120}
                    thickness={4}
                    color="primary"
                />
                <span className="circle-text">25%</span>
            </div>

            <div className="customer-growth">
                <span>Active Customer</span>
                <strong>↑ 11.28%</strong>
            </div>
        </div>
    );
}

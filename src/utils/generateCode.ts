export const generateCode = () => {
    const date = new Date();

    const year = String(date.getFullYear()).slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `OBJ-${day}${month}${year}`;
};

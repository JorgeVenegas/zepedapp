export function entitiesToCSV(entities: any[]) {
    // Helper function to format date
    const formatDate = (date: string | Date) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    };

    // Helper function to escape CSV values
    const escapeCSV = (value: any, cleanText: boolean) => {
        if (value === null || value === undefined) return '';
        let stringValue = String(value);

        // Clean text if requested (for contenido column)
        if (cleanText) {
            // Keep alphanumeric (including accented Spanish characters), spaces, and ñ/Ñ
            // This regex keeps: a-z, A-Z, 0-9, spaces, and Unicode letters (á, é, í, ó, ú, ñ, etc.)
            stringValue = stringValue.replace(/[^\p{L}\p{N}\s]/gu, '');
            // Remove multiple consecutive spaces
            stringValue = stringValue.replace(/\s+/g, ' ').trim();
        }

        // CSV escaping: wrap in quotes if contains comma, quote, or newline
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    // Create CSV header
    const headers = 'asunto,contenido,fecha\n';

    // Create CSV rows
    const rows = entities.map(entity => {
        const asunto = escapeCSV('x-tweet', false);
        const contenido = escapeCSV(entity.text, true);
        const fecha = escapeCSV(formatDate(entity.createdAt), false);

        return `${asunto},${contenido},${fecha}`;
    }).join('\n');

    return headers + rows;
}
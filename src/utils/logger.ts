export const logger = {
    info: (message: string, meta?: any) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? meta : '');
    },
    warn: (message: string, meta?: any) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? meta : '');
    },
    error: (message: string, error?: any) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error ? error : '');
    },
    debug: (message: string, meta?: any) => {
        // Force debug on for now to trace products
        console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta ? meta : '');
    }
};

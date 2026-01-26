/**
 * 환경에 따라 로그를 출력하는 유틸리티
 * - development: 모든 로그 출력
 * - production: 에러만 출력 (선택적)
 */

const isDev = process.env.NODE_ENV === "development";

export const logger = {
    /**
     * 디버그 로그 - 개발 모드에서만 출력
     */
    debug: (...args: unknown[]) => {
        if (isDev) {
            console.log("[DEBUG]", ...args);
        }
    },

    /**
     * 정보 로그 - 개발 모드에서만 출력
     */
    info: (...args: unknown[]) => {
        if (isDev) {
            console.info("[INFO]", ...args);
        }
    },

    /**
     * 경고 로그 - 개발 모드에서만 출력
     */
    warn: (...args: unknown[]) => {
        if (isDev) {
            console.warn("[WARN]", ...args);
        }
    },

    /**
     * 에러 로그 - 항상 출력 (프로덕션에서도 에러는 확인 필요)
     */
    error: (...args: unknown[]) => {
        console.error("[ERROR]", ...args);
    },

    /**
     * 에러 로그 - 개발 모드에서만 출력 (민감한 에러 정보)
     */
    devError: (...args: unknown[]) => {
        if (isDev) {
            console.error("[DEV ERROR]", ...args);
        }
    },
};

export default logger;

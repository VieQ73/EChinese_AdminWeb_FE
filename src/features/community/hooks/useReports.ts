/**
 * useReports Hook - Placeholder for future Reports module
 * 
 * Reports functionality sẽ được phát triển trong module riêng
 * sau khi có yêu cầu cụ thể về quản lý báo cáo và thông báo
 */

export const useReports = () => {
  console.warn('Reports functionality chưa được phát triển - sẽ có module riêng');
  
  return {
    reports: [],
    loading: false,
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    loadReports: () => Promise.resolve(),
    resolveReport: () => Promise.resolve(),
    assignReport: () => Promise.resolve(),
    goToPage: () => {},
    changePageSize: () => {},
    reload: () => Promise.resolve()
  };
};

export default useReports;
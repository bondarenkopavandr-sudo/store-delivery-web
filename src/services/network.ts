export const hasInternetConnection = async (): Promise<boolean> => {
  if (!navigator.onLine) {
    return false;
  }
  // Browser-level online flag is more reliable here than cross-origin ping checks,
  // which are often blocked by CORS and can produce false "no internet" errors.
  return true;
};

export const hasInternetConnection = async (): Promise<boolean> => {
  if (!navigator.onLine) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch("https://clients3.google.com/generate_204", {
      method: "GET",
      signal: controller.signal
    });
    clearTimeout(timeout);
    return response.status === 204 || response.ok;
  } catch {
    return false;
  }
};

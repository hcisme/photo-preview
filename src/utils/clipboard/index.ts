export const copyToClipboard = async (
  text: string,
  onSuccess?: () => void,
  onFail?: (err: unknown) => void
) => {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.();
  } catch (err) {
    onFail?.(err);
  }
};

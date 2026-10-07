// A timeout cannot cancel a Firebase request that is already being committed.
// Keep the underlying request locked until it settles to prevent duplicate writes.
export function createPendingWrite(timeoutMs = 30000) {
  let pending = false;
  return async (operation: () => Promise<void>) => {
    if (pending)
      throw new Error(
        "The previous save is still awaiting Firebase. Check My Reports before submitting again, and check your internet connection.",
      );
    pending = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const request = Promise.resolve().then(operation);
    void request.then(
      () => {
        pending = false;
      },
      () => {
        pending = false;
      },
    );
    try {
      await Promise.race([
        request,
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () =>
              reject(
                new Error(
                  "Firebase has not confirmed the save within 30 seconds. The result is unconfirmed; check your internet connection and My Reports before trying again.",
                ),
              ),
            timeoutMs,
          );
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  };
}

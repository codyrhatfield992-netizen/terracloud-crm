import { useEffect, useState } from "react";

export function useTrainingQuery<T>(loader: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    loader()
      .then((value) => { if (mounted) setData(value); })
      .catch((err) => { if (mounted) setError(err instanceof Error ? err : new Error("Unable to load data")); })
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, isLoading, error };
}

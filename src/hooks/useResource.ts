import { useState, useEffect } from "react";
import { api, ApiError } from "../config/api";

export function useResource<T>(path: string, initial: T) {
  const [data, setData] = useState<T>(initial),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .request<T>(path)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) {
          if (e instanceof ApiError && e.status === 404) {
            setError("");
          } else {
            setError(e.message);
          }
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, revision]);

  return {
    data,
    setData,
    loading,
    error,
    reload: () => setRevision((v) => v + 1),
  };
}

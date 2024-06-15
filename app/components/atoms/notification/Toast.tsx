import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export default function Toast({ children }: { children?: ReactNode | ReactNode[] }) {
  return (
    <div className="w-screen fixed bottom-0 left-0 p-4 md:p-8">
      <div className="max-w-3xl mx-auto px-4 py-2 md:px-6 py-4 bg-neutral-700 text-white rounded-lg shadow-xl">
        {children}
      </div>
    </div>
  );
}

export function useToast({ children }: { children?: JSX.Element }): [JSX.Element, () => void] {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (show) {
      const timeout = setTimeout(() => { setShow(false); }, 5000);
      return () => { clearTimeout(timeout) };
    }
  }, [show]);

  const toast = (
    <div className={show ? "" : "hidden"}>
      <Toast>
        {children}
      </Toast>
    </div>
  );

  return [toast, () => { setShow(true) }];
}

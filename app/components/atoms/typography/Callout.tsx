import { ReactNode } from "react";

type CalloutProps = {
  children: ReactNode | ReactNode[];
  className?: string;
};

export default function Callout({ className, children }: CalloutProps) {
  return (
    <div className={`${className ?? ""} p-4 bg-neutral-100 rounded-lg`}>
      {children}
    </div>
  )
}

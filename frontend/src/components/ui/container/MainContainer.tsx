import type { ReactNode } from "react";

const MainContainer = ({ children }: { children: ReactNode }) => {
  return <div className="mx-auto w-full max-w-[1560px]">{children}</div>;
};

export default MainContainer;

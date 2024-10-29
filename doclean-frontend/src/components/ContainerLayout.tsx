import { ReactNode } from "react";

type ContainerLayoutProps = {
  children: ReactNode;
  className?: string;
};

const ContainerLayout: React.FC<ContainerLayoutProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>{children}</div>
  );
};

export default ContainerLayout;

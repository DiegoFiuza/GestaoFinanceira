import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-w-full min-h-full bg-white">{children}</div>;
};

export default Layout;

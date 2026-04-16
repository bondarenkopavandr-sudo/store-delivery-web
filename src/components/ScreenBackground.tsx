import React, { PropsWithChildren } from "react";

export const ScreenBackground: React.FC<PropsWithChildren> = ({ children }) => (
  <div className="screen-background">{children}</div>
);

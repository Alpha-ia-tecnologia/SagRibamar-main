declare module "sagCorretor/CorretorApp" {
  import { ComponentType } from "react";

  interface CorretorAppProps {
    token: string;
    user: any;
  }

  const CorretorApp: ComponentType<CorretorAppProps>;
  export default CorretorApp;
}
import { WorkspaceShell } from "@/features/safesport/workspace/shell";
import { AuthGuard } from "@/features/auth/components";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGuard><WorkspaceShell>{children}</WorkspaceShell></AuthGuard>;
}

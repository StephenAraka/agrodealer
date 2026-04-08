import type { ReactNode } from "react";

type AuthSplitLayoutProps = {
  leftPanel: ReactNode;
  children: ReactNode;
};

export function AuthSplitLayout({ leftPanel, children }: AuthSplitLayoutProps) {
  return (
    <main className="min-h-screen bg-bg p-4 md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-[1280px] overflow-hidden rounded-2xl border border-borderGray bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] md:min-h-[calc(100vh-4rem)]">
        <section className="relative hidden w-[52%] overflow-hidden bg-[#dce6d4] lg:block">
          {leftPanel}
        </section>
        <section className="relative flex w-full items-center justify-center bg-bg px-5 py-10 lg:w-[48%] lg:px-14">
          {children}
        </section>
      </div>
    </main>
  );
}

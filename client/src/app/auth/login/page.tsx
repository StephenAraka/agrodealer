import Image from "next/image";
import Link from "next/link";
import { AuthSplitLayout } from "@/components/global";
import { Button, TextInput } from "@/components/shared";

export default function LoginPage() {
  return (
    <AuthSplitLayout
      leftPanel={
        <>
          <Image
            src="/images/bg.png"
            alt="Farmer in field"
            fill
            priority
            className="object-cover"
          />

          <div className="absolute left-8 top-8">
            <Image src="/images/logo.svg" alt="Bank logo" width={116} height={104} priority />
          </div>

          <div className="absolute bottom-0 right-0 h-[44%] w-[46%] overflow-hidden rounded-tl-[42px] bg-white">
            <div className="relative h-full w-full">
              <Image
                src="/images/logo.png"
                alt="Farmer emblem"
                width={120}
                height={108}
                className="absolute bottom-8 right-8"
              />
            </div>
          </div>
        </>
      }
    >
      <div className="relative w-full max-w-[470px] rounded-2xl border border-borderGray bg-white px-7 py-10 shadow-[0_10px_26px_rgba(0,0,0,0.08)] sm:px-12 sm:py-14">
            <Image
              src="/images/green-leaves-white-background.png"
              alt="Decorative leaves"
              width={275}
              height={180}
              className="pointer-events-none absolute -right-1 -top-1 h-auto w-[190px]"
            />

            <p className="text-[17px] font-semibold uppercase tracking-wide text-textGray">
              Welcome to
            </p>
            <h1 className="mt-1 max-w-[290px] text-[52px] font-semibold leading-[0.95] text-textGreen">
              Agro dealer Portal
            </h1>

            <p className="mt-8 text-2xl font-medium text-textGray">Enter your username to continue</p>

            <form className="mt-8" action="#">
              <TextInput
                id="username"
                name="username"
                label="Username"
                defaultValue="Emily"
              />

              <Button
                type="submit"
                className="mt-12"
                endIcon={<span aria-hidden="true">›</span>}
              >
                Continue
              </Button>
            </form>

            <p className="mt-12 text-center text-lg text-textGray">
              Having trouble logging in?{" "}
              <Link href="#" className="font-semibold text-primaryYellow">
                Get Help
              </Link>
            </p>
      </div>
    </AuthSplitLayout>
  );
}

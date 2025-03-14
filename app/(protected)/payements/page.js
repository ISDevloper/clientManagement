import { Suspense } from "react";
import Loading from "@/components/Loading";
import { Payement } from "./Payements";

export default function PayementPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Suspense fallback={<Loading />}>
        <Payement />
      </Suspense>
    </div>
  );
}

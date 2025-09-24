"use client";

import { testPrinter } from "@/actions/print";

export default function TestPrinter() {
  return (
    <main>
      <form action={testPrinter}>
        <button type="submit">Test Print</button>
      </form>
    </main>
  );
}

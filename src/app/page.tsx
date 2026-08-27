import { Calculator } from "@/components/Calculator";
import { LocaleProvider } from "@/components/LocaleProvider";
import { PageHeader } from "@/components/PageHeader";
import { DEFAULT_LOCALE } from "@/lib/i18n";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[464px] flex-1 flex-col px-5 pb-20 pt-10 sm:pt-16 lg:pt-24">
      {/* The locale is a prop, so a localized route (e.g. /hi) can seed it
          later without any consumer changing. */}
      <LocaleProvider initialLocale={DEFAULT_LOCALE}>
        <PageHeader />
        <Calculator />
      </LocaleProvider>
    </main>
  );
}

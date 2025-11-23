import { InternalPatternsPage } from "@/components/pages/internal-patterns-page"
import { MainLayout } from "@/components/layout/main-layout"

export const metadata = {
  title: "Internal Patterns | MAIA",
  description: "View top patterns from internal data sources",
}

export default function Page() {
  return (
    <MainLayout>
      <InternalPatternsPage />
    </MainLayout>
  )
}

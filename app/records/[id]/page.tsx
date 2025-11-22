import { MainLayout } from "@/components/layout/main-layout"
import { RecordDetailPage } from "@/components/pages/record-detail-page"

export default function RecordDetail({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <RecordDetailPage recordId={params.id} />
    </MainLayout>
  )
}

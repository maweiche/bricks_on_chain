import PropertyDetails from '@/components/properties/PropertyDetails'

export default async function PropertyPage({
  params,
}: {
  params: { id: string }
}) {
  return <PropertyDetails id={params.id} />
}
